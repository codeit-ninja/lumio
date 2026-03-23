<script lang="ts">
    import type { HTMLIframeAttributes } from "svelte/elements";

    type Props = {
        title: string;
        videoId: string;
    } & HTMLIframeAttributes;

    const { title, videoId, ...restProps }: Props = $props();
</script>

<!-- <iframe
    {...restProps}
    {title}
    class="w-full aspect-video rounded-lg"
    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`}
    allow="autoplay; encrypted-media"
    allowfullscreen
></iframe> -->

<media-player autoplay muted={true} src={`youtube/${videoId}`} class="block!">
    <media-provider></media-provider>
    <media-controls>
        <media-play-button> PLAY </media-play-button>
    </media-controls>
</media-player>
