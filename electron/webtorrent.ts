import type { ChildProcess } from "node:child_process";
import type { Server } from "node:http";
import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { BrowserWindow, ipcMain } from "electron";
import ffmpegPath from "ffmpeg-static";
import WebTorrent from "webtorrent";

let client: WebTorrent.Instance | null = null;
let server: WebTorrent.NodeServer | null = null;
let serverPort: number | null = null;
let serverReady: Promise<void> | null = null;

let transcodeServer: http.Server | null = null;
let transcodePort: number | null = null;
let transcodeReady: Promise<void> | null = null;

interface TranscodeSession {
    id: string;
    process: ChildProcess;
    tempDir: string;
    tempFile: string;
    done: boolean;
    ready: Promise<void>;
}

const transcodeSessions = new Map<string, TranscodeSession>();

interface SubtitleTrack {
    /** Zero-based index among subtitle streams only (for ffmpeg `-map 0:s:N`). */
    index: number;
    language: string;
    title: string;
    codec: string;
}

interface SubtitleSession {
    id: string;
    tempDir: string;
    tempFile: string;
    done: boolean;
    ready: Promise<void>;
}

// keyed by `${streamUrl}::${trackIndex}`
const subtitleSessions = new Map<string, SubtitleSession>();

function cleanupSession(session: TranscodeSession) {
    session.process.kill("SIGKILL");
    fs.rm(session.tempDir, { recursive: true, force: true }, () => {});
}

function cleanupSubtitleSession(session: SubtitleSession) {
    fs.rm(session.tempDir, { recursive: true, force: true }, () => {});
}

async function waitForByte(
    session: TranscodeSession,
    offset: number,
): Promise<boolean> {
    while (true) {
        try {
            if (fs.statSync(session.tempFile).size > offset) return true;
        } catch {
            /* not yet */
        }
        if (session.done) return false;
        await new Promise((r) => setTimeout(r, 50));
    }
}

async function pipeGrowingFile(
    res: http.ServerResponse,
    session: TranscodeSession,
    fromByte: number,
) {
    let offset = fromByte;
    while (!res.destroyed) {
        let size = 0;
        try {
            size = fs.statSync(session.tempFile).size;
        } catch {
            /* still initialising */
        }
        if (size > offset) {
            const toRead = size - offset;
            const buf = Buffer.allocUnsafe(toRead);
            const fd = fs.openSync(session.tempFile, "r");
            fs.readSync(fd, buf, 0, toRead, offset);
            fs.closeSync(fd);
            offset += toRead;
            if (!res.write(buf))
                await new Promise<void>((r) => res.once("drain", r));
        } else if (session.done) {
            break;
        } else {
            await new Promise<void>((r) => setTimeout(r, 50));
        }
    }
    if (!res.destroyed) res.end();
}

function startTranscode(src: string, seekTime = 0): TranscodeSession {
    const id = Math.random().toString(36).slice(2, 10);
    const tempDir = path.join(os.tmpdir(), `lumio-${id}`);
    fs.mkdirSync(tempDir, { recursive: true });
    const tempFile = path.join(tempDir, "out.mp4");

    const args = [
        ...(seekTime > 0 ? ["-ss", String(seekTime)] : []),
        "-i",
        src,
        "-map",
        "0:v:0",
        "-map",
        "0:a:0?",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-tune",
        "zerolatency",
        "-crf",
        "23",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        ...(seekTime > 0 ? ["-output_ts_offset", String(seekTime)] : []),
        "-movflags",
        "frag_keyframe+empty_moov+default_base_moof",
        "-f",
        "mp4",
        tempFile,
    ];

    const ff = spawn(ffmpegPath!, args);

    ff.stderr.on("data", (d: Buffer) =>
        console.log("[ffmpeg]", d.toString().trimEnd()),
    );

    const session: TranscodeSession = {
        id,
        process: ff,
        tempDir,
        tempFile,
        done: false,
        ready: null!,
    };
    ff.on("close", () => {
        session.done = true;
    });
    ff.on("error", () => {
        session.done = true;
    });

    // Resolve when at least 64 KB is written — enough for the browser to start
    session.ready = new Promise<void>((resolve) => {
        const check = setInterval(() => {
            try {
                if (fs.statSync(tempFile).size >= 65536) {
                    clearInterval(check);
                    resolve();
                }
            } catch {
                /* file not yet created */
            }
        }, 100);
        ff.on("close", () => {
            clearInterval(check);
            resolve();
        });
        ff.on("error", () => {
            clearInterval(check);
            resolve();
        });
    });

    transcodeSessions.set(src, session);
    return session;
}

/**
 * Probes a video URL and returns all embedded subtitle stream metadata.
 */
function probeSubtitleStreams(url: string): Promise<SubtitleTrack[]> {
    return new Promise((resolve) => {
        if (!ffmpegPath) {
            resolve([]);
            return;
        }

        const ff = spawn(ffmpegPath, ["-i", url]);
        let stderr = "";
        const timer = setTimeout(() => {
            ff.kill("SIGKILL");
            resolve([]);
        }, 15000);

        ff.stderr.on("data", (d: Buffer) => {
            stderr += d.toString();
        });
        ff.on("close", () => {
            clearTimeout(timer);
            const tracks: SubtitleTrack[] = [];
            // Lines look like: Stream #0:2(eng): Subtitle: subrip (default)
            const re = /Stream #\d+:\d+(?:\((\w+)\))?: Subtitle: (\w+)(.*)/g;
            let subtitleIndex = 0;
            let match: RegExpExecArray | null;
            while ((match = re.exec(stderr)) !== null) {
                const language = match[1] ?? "";
                const codec = match[2] ?? "";
                // Some containers embed a title in the stream metadata line
                const titleMatch = match[3]?.match(/title\s*:\s*([^,\n]+)/i);
                const title = titleMatch
                    ? titleMatch[1].trim()
                    : language || `Track ${subtitleIndex + 1}`;
                tracks.push({ index: subtitleIndex++, language, title, codec });
            }
            console.log(
                `[probe-subs] found ${tracks.length} subtitle stream(s) in ${url}`,
            );
            resolve(tracks);
        });
        ff.on("error", () => {
            clearTimeout(timer);
            resolve([]);
        });
    });
}

/**
 * Extracts subtitle stream `trackIndex` (0-based among subtitle streams)
 * from `src` to a WebVTT temp file and returns a session object.
 * Re-uses an existing session for the same src + trackIndex.
 */
/**
 * Extracts all `tracks` from `src` in a single ffmpeg pass.
 * -vn -an -dn tell ffmpeg to skip video/audio/data decoding so it only
 * demuxes subtitle packets, which is dramatically faster for large files.
 * Already-extracted sessions are returned from the cache; only uncached
 * tracks trigger a new ffmpeg process.
 */
function extractAllSubtitles(
    src: string,
    tracks: SubtitleTrack[],
): SubtitleSession[] {
    if (tracks.length === 0) return [];

    const uncached = tracks.filter(
        (t) => !subtitleSessions.has(`${src}::${t.index}`),
    );

    if (uncached.length === 0) {
        return tracks.map((t) => subtitleSessions.get(`${src}::${t.index}`)!);
    }

    const batchDir = path.join(
        os.tmpdir(),
        `lumio-sub-${Math.random().toString(36).slice(2, 10)}`,
    );
    fs.mkdirSync(batchDir, { recursive: true });

    // -vn -an -dn: skip video, audio, and data stream processing entirely
    const args: string[] = ["-i", src, "-vn", "-an", "-dn"];

    const pending: Array<{ key: string; session: SubtitleSession }> = [];
    for (const track of uncached) {
        const id = Math.random().toString(36).slice(2, 10);
        const tempFile = path.join(batchDir, `${id}.vtt`);
        args.push("-map", `0:s:${track.index}`, "-f", "webvtt", tempFile);
        pending.push({
            key: `${src}::${track.index}`,
            session: {
                id,
                tempDir: batchDir,
                tempFile,
                done: false,
                ready: null!,
            },
        });
    }

    const ff = spawn(ffmpegPath!, args);
    ff.stderr.on("data", (d: Buffer) =>
        console.log("[ffmpeg-sub]", d.toString().trimEnd()),
    );

    // All sessions in this batch share the same ready promise
    const ready = new Promise<void>((resolve) => {
        ff.on("close", () => resolve());
        ff.on("error", () => resolve());
    });

    for (const { key, session } of pending) {
        session.ready = ready;
        ff.on("close", () => {
            session.done = true;
        });
        ff.on("error", () => {
            session.done = true;
        });
        subtitleSessions.set(key, session);
    }

    return tracks.map((t) => subtitleSessions.get(`${src}::${t.index}`)!);
}

function startTranscodeServer() {
    if (!ffmpegPath) {
        console.warn("[transcode] ffmpeg-static binary not found");
        return;
    }

    transcodeServer = http.createServer(async (req, res) => {
        if (req.method !== "GET" && req.method !== "HEAD") {
            res.writeHead(405);
            res.end();
            return;
        }

        // ── Subtitle route ───────────────────────────────────────────────────
        const subMatch = req.url?.match(/^\/subtitles\/([^/]+)$/);
        if (subMatch) {
            const session = [...subtitleSessions.values()].find(
                (s) => s.id === subMatch[1],
            );
            if (!session) {
                res.writeHead(404);
                res.end();
                return;
            }
            await session.ready;
            let content: Buffer;
            try {
                content = fs.readFileSync(session.tempFile);
            } catch {
                res.writeHead(404);
                res.end();
                return;
            }
            res.writeHead(200, {
                "Content-Type": "text/vtt; charset=utf-8",
                "Content-Length": String(content.length),
                "Cache-Control": "no-cache",
                "Access-Control-Allow-Origin": "*",
            });
            if (req.method !== "HEAD") res.write(content);
            res.end();
            return;
        }

        // ── Transcode route ──────────────────────────────────────────────────
        const match = req.url?.match(/^\/transcode\/([^/]+)$/);
        if (!match) {
            res.writeHead(404);
            res.end();
            return;
        }

        const session = [...transcodeSessions.values()].find(
            (s) => s.id === match[1],
        );
        if (!session) {
            res.writeHead(404);
            res.end();
            return;
        }

        const startByte = parseInt(
            req.headers["range"]?.match(/bytes=(\d+)-/)?.[1] ?? "0",
            10,
        );

        if (!(await waitForByte(session, startByte))) {
            res.writeHead(416);
            res.end();
            return;
        }

        const headers: Record<string, string> = {
            "Content-Type": "video/mp4",
            "Accept-Ranges": "bytes",
            "Cache-Control": "no-cache",
            "Access-Control-Allow-Origin": "*",
        };
        if (req.headers["range"]) {
            headers["Content-Range"] =
                `bytes ${startByte}-${fs.statSync(session.tempFile).size - 1}/*`;
            res.writeHead(206, headers);
        } else {
            res.writeHead(200, headers);
        }

        if (req.method === "HEAD") {
            res.end();
            return;
        }

        await pipeGrowingFile(res, session, startByte);
    });

    transcodeReady = new Promise<void>((resolve) => {
        transcodeServer!.listen(0, "127.0.0.1", () => {
            const addr = transcodeServer!.address();
            transcodePort = typeof addr === "object" && addr ? addr.port : null;
            console.log(`[transcode] HLS server on port ${transcodePort}`);
            resolve();
        });
    });
}

function encodeStreamPath(rawUrl: string): string {
    return rawUrl
        .replace(/\\/g, "/")
        .split("/")
        .map(encodeURIComponent)
        .join("/");
}

function buildFileList(torrent: WebTorrent.Torrent, port: number) {
    return torrent.files.map((file) => ({
        name: file.name,
        path: file.path,
        length: file.length,
        streamUrl: `http://localhost:${port}${encodeStreamPath(file.streamURL)}`,
    }));
}

const BROWSER_VIDEO_CODECS = new Set(["h264", "vp8", "vp9", "av1", "theora"]);
const BROWSER_AUDIO_CODECS = new Set([
    "aac",
    "mp3",
    "mp2",
    "opus",
    "vorbis",
    "flac",
]);

function probeFile(
    url: string,
): Promise<{ needsTranscode: boolean; duration: number }> {
    return new Promise((resolve) => {
        if (!ffmpegPath) {
            resolve({ needsTranscode: false, duration: 0 });
            return;
        }

        const ff = spawn(ffmpegPath, ["-i", url]);
        let stderr = "";
        const timer = setTimeout(() => {
            ff.kill("SIGKILL");
            resolve({ needsTranscode: false, duration: 0 });
        }, 15000);

        ff.stderr.on("data", (d: Buffer) => {
            stderr += d.toString();
        });
        ff.on("close", () => {
            clearTimeout(timer);
            const videoCodec =
                stderr.match(/Video:\s+(\w+)/)?.[1]?.toLowerCase() ?? "";
            const audioCodec =
                stderr.match(/Audio:\s+(\w+)/)?.[1]?.toLowerCase() ?? "";
            const needsTranscode =
                (!!videoCodec && !BROWSER_VIDEO_CODECS.has(videoCodec)) ||
                (!!audioCodec && !BROWSER_AUDIO_CODECS.has(audioCodec));

            // Parse duration: "Duration: HH:MM:SS.ms"
            const dm = stderr.match(/Duration:\s+(\d+):(\d+):([\d.]+)/);
            const duration = dm
                ? parseInt(dm[1]) * 3600 +
                  parseInt(dm[2]) * 60 +
                  parseFloat(dm[3])
                : 0;

            console.log(
                `[probe] video=${videoCodec || "none"} audio=${audioCodec || "none"} duration=${duration.toFixed(1)}s needsTranscode=${needsTranscode}`,
            );
            resolve({ needsTranscode, duration });
        });
        ff.on("error", () => {
            clearTimeout(timer);
            resolve({ needsTranscode: false, duration: 0 });
        });
    });
}

function broadcastProgress(torrent: WebTorrent.Torrent) {
    const data = {
        infoHash: torrent.infoHash,
        progress: torrent.progress,
        downloadSpeed: torrent.downloadSpeed,
        uploadSpeed: torrent.uploadSpeed,
        timeRemaining: torrent.timeRemaining,
    };
    for (const win of BrowserWindow.getAllWindows()) {
        win.webContents.send("webtorrent:progress", data);
    }
}

export function initWebtorrent() {
    client = new WebTorrent();

    server = client.createServer({}) as WebTorrent.NodeServer;
    // cast to the underlying http.Server to access listen()
    const httpServer = server as unknown as Server;

    serverReady = new Promise<void>((resolve) => {
        httpServer.listen(0, "127.0.0.1", () => {
            const addr = server!.address();
            serverPort = addr ? addr.port : null;
            console.log(`[webtorrent] HTTP server on port ${serverPort}`);
            resolve();
        });
    });

    startTranscodeServer();

    ipcMain.handle(
        "webtorrent:add",
        async (_, { magnet }: { magnet: string }) => {
            await Promise.all([serverReady, transcodeReady]);
            if (!client || serverPort === null)
                throw new Error("WebTorrent not ready");

            const existing = await client.get(magnet);
            if (existing) {
                return {
                    infoHash: existing.infoHash,
                    port: serverPort,
                    files: buildFileList(existing, serverPort),
                };
            }

            return new Promise((resolve, reject) => {
                const torrent = client!.add(magnet, (t) => {
                    t.on("download", () => broadcastProgress(t));
                    resolve({
                        infoHash: t.infoHash,
                        port: serverPort!,
                        files: buildFileList(t, serverPort!),
                    });
                });
                torrent.on("error", (err: Error | string) => reject(err));
            });
        },
    );

    ipcMain.handle(
        "webtorrent:probe",
        (_, { streamUrl }: { streamUrl: string }) => {
            return probeFile(streamUrl);
        },
    );

    ipcMain.handle(
        "webtorrent:seek",
        async (
            _,
            { streamUrl, seekTime }: { streamUrl: string; seekTime: number },
        ) => {
            await transcodeReady;
            if (!transcodePort) throw new Error("Transcode server not ready");
            // Kill any running session for this source and start a new one from seekTime
            const existing = transcodeSessions.get(streamUrl);
            if (existing) {
                cleanupSession(existing);
                transcodeSessions.delete(streamUrl);
            }
            const session = startTranscode(streamUrl, seekTime);
            await session.ready;
            return `http://localhost:${transcodePort}/transcode/${session.id}`;
        },
    );

    ipcMain.handle(
        "webtorrent:transcode",
        async (_, { streamUrl }: { streamUrl: string }) => {
            await transcodeReady;
            if (!transcodePort) throw new Error("Transcode server not ready");
            const session =
                transcodeSessions.get(streamUrl) ?? startTranscode(streamUrl);
            await session.ready;
            return `http://localhost:${transcodePort}/transcode/${session.id}`;
        },
    );

    ipcMain.handle(
        "webtorrent:subtitles",
        async (_, { streamUrl }: { streamUrl: string }) => {
            await Promise.all([serverReady, transcodeReady]);
            if (!transcodePort) throw new Error("Transcode server not ready");
            const tracks = await probeSubtitleStreams(streamUrl);
            const sessions = extractAllSubtitles(streamUrl, tracks);
            // Wait for the single shared ffmpeg pass to finish
            if (sessions.length > 0) await sessions[0].ready;
            return tracks.map((track, i) => ({
                ...track,
                url: `http://localhost:${transcodePort}/subtitles/${sessions[i].id}`,
            }));
        },
    );

    ipcMain.handle(
        "webtorrent:remove",
        (_, { infoHash }: { infoHash: string }) => {
            if (!client) throw new Error("WebTorrent not ready");
            return client.remove(infoHash);
        },
    );

    ipcMain.handle(
        "webtorrent:get",
        async (_, { infoHash }: { infoHash: string }) => {
            if (!client || serverPort === null) return null;
            const torrent = await client.get(infoHash);
            if (!torrent) return null;
            return {
                infoHash: torrent.infoHash,
                port: serverPort,
                progress: torrent.progress,
                downloadSpeed: torrent.downloadSpeed,
                files: buildFileList(torrent, serverPort),
            };
        },
    );
}

export function destroyWebtorrent() {
    ipcMain.removeHandler("webtorrent:add");
    ipcMain.removeHandler("webtorrent:probe");
    ipcMain.removeHandler("webtorrent:subtitles");
    ipcMain.removeHandler("webtorrent:seek");
    ipcMain.removeHandler("webtorrent:transcode");
    ipcMain.removeHandler("webtorrent:remove");
    ipcMain.removeHandler("webtorrent:get");
    for (const session of transcodeSessions.values()) cleanupSession(session);
    transcodeSessions.clear();
    for (const session of subtitleSessions.values())
        cleanupSubtitleSession(session);
    subtitleSessions.clear();
    if (transcodeServer) transcodeServer.close();
    if (server) server.close();
    if (client) client.destroy();
    client = null;
    server = null;
    transcodeServer = null;
    serverPort = null;
    transcodePort = null;
    serverReady = null;
    transcodeReady = null;
}
