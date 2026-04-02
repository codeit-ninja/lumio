export function parseVTTTime(timeString: string): number {
    const parts = timeString.trim().split(":");

    // Format: HH:MM:SS.mmm
    if (parts.length === 3) {
        return (
            parseInt(parts[0], 10) * 3600 +
            parseInt(parts[1], 10) * 60 +
            parseFloat(parts[2])
        );
    }

    // Format: MM:SS.mmm
    return parseInt(parts[0], 10) * 60 + parseFloat(parts[1]);
}

export function parseVTTCue(block: string, offset: number): VTTCue | null {
    const lines = block
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

    const timingIdx = lines.findIndex((line) => line.includes("-->"));
    if (timingIdx === -1) return null;

    const match = lines[timingIdx].match(/^([\d:.]+)\s*-->\s*([\d:.]+)/);
    if (!match) return null;

    const start = parseVTTTime(match[1]) - offset;
    const end = parseVTTTime(match[2]) - offset;

    if (end <= 0) return null;

    const text = lines.slice(timingIdx + 1).join("\n");
    if (!text) return null;

    const cue = new VTTCue(Math.max(0, start), end, text);
    cue.line = -3; // Lift cues 2 lines up from the bottom edge
    return cue;
}

export async function streamVTT(
    url: string,
    track: TextTrack,
    signal: AbortSignal,
    offset: number,
) {
    let response: Response;
    try {
        response = await fetch(url, { signal });
    } catch {
        return;
    }

    if (!response.body) return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
        let done: boolean;
        let value: Uint8Array | undefined;

        try {
            ({ done, value } = await reader.read());
        } catch {
            break;
        }

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split(/\n\n+/);

        buffer = parts.pop()!;

        for (const block of parts) {
            const cue = parseVTTCue(block, offset);
            if (cue) {
                try {
                    track.addCue(cue);
                } catch {
                    /* Ignore duplicate errors */
                }
            }
        }
    }

    if (buffer.trim()) {
        const cue = parseVTTCue(buffer, offset);
        if (cue) {
            try {
                track.addCue(cue);
            } catch {
                /* Ignore duplicate errors */
            }
        }
    }
}
