<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { useMovie } from "./context.svelte";
    import { cn } from "$lib/utils";

    type Props = {
        size?: "sm" | "md" | "lg";
    } & HTMLAttributes<HTMLUListElement>;

    const { size = "md", ...restProps }: Props = $props();

    const movie = useMovie();
</script>

<ul
    {...restProps}
    class={cn(
        "flex items-start flex-wrap text-base gap-2",
        size === "sm" && "gap-0.5",
        restProps.class,
    )}
>
    {#each movie.genres as genre (genre)}
        <li
            class={cn(
                "p-px bg-linear-to-br from-gray-500/30 to-gray-500/20 shadow-sm flex backdrop-blur-sm",
                "border border-white/10 rounded-full corner-squircle",
            )}
        >
            <span
                class={cn(
                    "inline-flex items-center justify-center rounded-full",
                    size === "sm" && "text-[12px] px-2.5 pt-1 pb-0.5",
                    size === "md" && "text-sm px-4 py-1.5",
                    size === "lg" && "text-base px-6 py-2",
                )}
            >
                <span class={cn("relative", size === "sm" && "bottom-px")}>
                    {genre}
                </span>
            </span>
        </li>
    {/each}
</ul>
