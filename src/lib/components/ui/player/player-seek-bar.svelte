<script lang="ts">
    import { usePlayer } from "./context.svelte";
    import PlayerSeekBarNative from "./player-seek-bar-native.svelte";
    import PlayerSeekBarTranscode from "./player-seek-bar-transcode.svelte";

    const ctx = usePlayer();
</script>

{#if ctx.needTranscode}
    <PlayerSeekBarTranscode />
{:else}
    <PlayerSeekBarNative />
{/if}
