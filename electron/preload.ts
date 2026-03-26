import type { IpcRendererEvent } from "electron";
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("webtorrent", {
    add: (magnet: string) => ipcRenderer.invoke("webtorrent:add", { magnet }),

    remove: (infoHash: string) =>
        ipcRenderer.invoke("webtorrent:remove", { infoHash }),

    get: (infoHash: string) =>
        ipcRenderer.invoke("webtorrent:get", { infoHash }),

    probe: (streamUrl: string) =>
        ipcRenderer.invoke("webtorrent:probe", { streamUrl }),

    seek: (streamUrl: string, seekTime: number) =>
        ipcRenderer.invoke("webtorrent:seek", { streamUrl, seekTime }),

    transcode: (streamUrl: string) =>
        ipcRenderer.invoke("webtorrent:transcode", { streamUrl }),

    subtitles: (streamUrl: string) =>
        ipcRenderer.invoke("webtorrent:subtitles", { streamUrl }),

    onProgress: (callback: (data: unknown) => void) => {
        const listener = (_event: IpcRendererEvent, data: unknown) =>
            callback(data);
        ipcRenderer.on("webtorrent:progress", listener);
        return () =>
            ipcRenderer.removeListener("webtorrent:progress", listener);
    },
});
