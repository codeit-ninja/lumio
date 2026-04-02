import { VTT } from "js-vtt";

export type Track = {
    label: string;
    src: string;
    language: string;
};

export const attachTrack = async (
    video: HTMLVideoElement,
    track: Track,
    offset?: number,
) => {
    const vtt = await VTT.fromURL(track.src);
    const cues = vtt.getCues();
    const textTrack =
        video.textTracks[0] ??
        vtt.attachToVideo(video, "subtitles", "subtitles");

    // Array.from snapshots the live cue list so removals don't skip entries
    if (textTrack.cues) {
        Array.from(textTrack.cues).forEach((cue) => textTrack.removeCue(cue));
    }

    if (offset !== undefined) {
        const absoluteCurrentTime = offset + video.currentTime;
        const index = cues.findIndex((c) => c.startTime > absoluteCurrentTime);
        cues.splice(0, index);
    }

    cues.forEach((c) =>
        textTrack.addCue(
            new VTTCue(
                c.startTime - (offset ?? 0),
                c.endTime - (offset ?? 0),
                c.text,
            ),
        ),
    );
    textTrack.mode = "showing";

    console.log(textTrack);
};
