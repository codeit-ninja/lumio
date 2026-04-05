import type { Torrent } from "apibay.org";
import type { DisplayInfo, NetworkInfo } from "tauri-plugin-device-info-api";

// Ordered from lowest to highest resolution
const RESOLUTION_LADDER = [480, 720, 1080, 2160] as const;
type Resolution = (typeof RESOLUTION_LADDER)[number];

function parseResolution(name: string): Resolution {
    if (/\b2160p\b|\b4k\b/i.test(name)) return 2160;
    if (/\b1080p\b/i.test(name)) return 1080;
    if (/\b720p\b/i.test(name)) return 720;
    if (/\b480p\b/i.test(name)) return 480;
    return 1080; // assume 1080p when unspecified
}

/**
 * Score 1–10. Order: WEB-DL > BluRay > WEBRip > WEB > HDTV > unknown >
 * Screener > TS/HDTS > CAM
 */
function parseSourceQuality(name: string): number {
    if (/web[- ]?dl/i.test(name)) return 10;
    if (/blu[- ]?ray|bdrip|remux/i.test(name)) return 9;
    if (/webrip/i.test(name)) return 8;
    if (/\bweb\b/i.test(name)) return 7;
    if (/\bhdtv\b/i.test(name)) return 5;
    if (/webscreener|screener|\bscr\b/i.test(name)) return 3;
    if (/\bhdts\b|\bts\b/i.test(name)) return 2;
    if (/\bcam(rip)?\b/i.test(name)) return 1;
    return 4;
}

/**
 * x264/h264 can be played back natively without transcoding, so they score
 * highest. x265/HEVC and AV1 require on-the-fly transcoding. Falls back
 * gracefully when x264 options are scarce.
 */
function parseFormatScore(name: string): number {
    if (/\bx264\b|h\.?264/i.test(name)) return 10;
    if (/\bx265\b|h\.?265|\bhevc\b/i.test(name)) return 6;
    if (/\bav1\b/i.test(name)) return 5;
    return 4;
}

/**
 * Blends seeder/leecher ratio (swarm health) with a log-scaled absolute
 * seeder count. Normalises against 5000 seeders so the full range stays
 * meaningful: 35 seeds ≈ 0.42, 200 ≈ 0.62, 1742 ≈ 0.88, 5000 = 1.0.
 * Returns 0–10.
 */
function healthScore(seeders: number, leechers: number): number {
    if (seeders === 0) return 0;
    const total = seeders + leechers;
    const ratio = seeders / total;
    // No hard cap — use a high normaliser so 1742 seeds scores clearly
    // above 35, instead of both hitting the same ceiling.
    const popularity = Math.log1p(seeders) / Math.log1p(5000);
    return ratio * 4 + popularity * 6; // 0–10
}

/**
 * Returns 0–30 points based on how close the torrent resolution is to the
 * target. Going above target is penalised more on Wi-Fi (file-size concern).
 */
function resolutionScore(
    torrentRes: Resolution,
    targetRes: Resolution,
    isWifi: boolean,
): number {
    if (torrentRes === targetRes) return 30;

    const torrentIdx = RESOLUTION_LADDER.indexOf(torrentRes);
    const targetIdx = RESOLUTION_LADDER.indexOf(targetRes);
    const diff = torrentIdx - targetIdx; // positive = above target

    if (diff < 0) {
        // Below target – mild penalty per step down
        return Math.max(0, 30 - Math.abs(diff) * 12);
    } else {
        // Above target – heavy penalty on Wi-Fi (bandwidth), light otherwise
        const penaltyPerStep = isWifi ? 20 : 8;
        return Math.max(0, 30 - diff * penaltyPerStep);
    }
}

/**
 * Determine the ideal resolution to target based on the user's display and
 * network connection.
 *
 * Rules:
 * - Wi-Fi → always 1080p (4K files are too large)
 * - 4K display + wired/cellular → 4K
 * - Everything else (1080p–1440p display, or display unknown) → 1080p
 */
function targetResolution(display?: DisplayInfo, isWifi?: boolean): Resolution {
    if (isWifi) return 1080;
    const h = display?.height ?? 1080;
    return h >= 2160 ? 2160 : 1080;
}

/**
 * Sort torrents from best to worst based on:
 *   1. Torrent health (seeders/leechers)        (0–40 pts)  ← highest weight
 *   2. Resolution match for the device/network  (0–30 pts)
 *   3. Source quality (WEB-DL > TS etc.)        (0–20 pts)
 *   4. Codec format (x264 preferred, no transcode)  (0–10 pts)
 */
export function sortTorrents(
    torrents: Torrent[],
    display?: DisplayInfo,
    network?: NetworkInfo,
): Torrent[] {
    const isWifi = /wi-?fi/i.test(network?.networkType ?? "");
    const target = targetResolution(display, isWifi);

    const score = (t: Torrent): number => {
        const res = parseResolution(t.name);
        return (
            healthScore(t.seeders, t.leechers) * 4 + // 0–40
            resolutionScore(res, target, isWifi) + // 0–30
            parseSourceQuality(t.name) * 2 + // 0–20
            parseFormatScore(t.name) // 0–10
        );
    };

    return [...torrents].sort((a, b) => score(b) - score(a));
}
