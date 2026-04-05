<script lang="ts">
    import type { WsrvParams } from "./wsrv";
    import type { HTMLImgAttributes } from "svelte/elements";
    import { wsrv as buildWsrvUrl } from "./wsrv";

    type Props = {
        wsrv?: WsrvParams;
    } & HTMLImgAttributes;

    let { wsrv, src, ...imgProps }: Props = $props();

    const resolvedSrc = $derived(
        wsrv && src ? buildWsrvUrl(src as string, wsrv) : src,
    );
</script>

<img src={resolvedSrc} {...imgProps} />
