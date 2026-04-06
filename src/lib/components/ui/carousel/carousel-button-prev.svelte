<script lang="ts">
    import { cn } from "tailwind-variants";
    import { useEmblaCarousel } from "./context.svelte";
    import { CaretLeftIcon } from "$lib/icons";

    const embla = useEmblaCarousel();
</script>

<div
    class={cn(
        "group grid h-full top-0 left-0 place-items-center absolute z-20 px-4",
    )}
>
    <button
        class={cn(
            "flex items-center justify-center transition-all cursor-pointer",
            "size-14 rounded-full backdrop-blur-sm",
            "bg-linear-to-br from-primary-950/40 to-primary-950/30",
            "border border-white/10 shadow-sm",
            "active:scale-98",
            "animate-out slide-out-to-left-18 fill-mode-forwards",
            "group-hover:animate-in slide-in-from-left-18 fill-mode-forwards",
            "disabled:opacity-50 disabled:pointer-events-none",
        )}
        type="button"
        onclick={() => embla.api?.scrollPrev()}
        disabled={embla.prevButtonDisabled}
    >
        <CaretLeftIcon class="size-8" />
    </button>
</div>
