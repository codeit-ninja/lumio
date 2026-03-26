<!-- <script lang="ts">
import PlayIcon from "phosphor-svelte/lib/PlayIcon";
import { onMount } from "svelte";
import { useDialog } from "../app/dialog";
import { Button } from "../ui/button";
import { YoutubeVideo } from "../ui/youtube-video";
import { useMovie } from "./context.svelte";

type Props = {};

const { ...restProps }: Props = $props();

const movie = useMovie();
const dialog = useDialog();

const trailer = $derived(
    movie.tmdb.videos.results.find(
        (video) =>
            video.type === "Trailer" &&
            video.site === "YouTube" &&
            video.name.toLowerCase().includes("trailer"),
    ),
);
</script>

<div class="absolute inset-0 grid place-items-center z-30 bg-gray-900">
    <YoutubeVideo videoId={trailer?.key ?? ""} />
</div> -->
<!-- <Button
    onclick={async () => {
        if (!trailer) {
            return;
        }

        dialog.create({
            title: trailer.name,
            component: YoutubeVideo,
            props: {
                videoId: trailer.key,
                title: trailer.name,
            },
        });
        dialog.openDialog();
    }}
>
    <PlayIcon weight="duotone" />
    Watch Trailer
</Button> -->
