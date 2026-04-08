<script lang="ts">
    import { cn } from "tailwind-variants";
    import { CrossRoundedIcon } from "$lib/icons";

    type Props = {
        title: string;
        message: string;
    };

    const { title, message }: Props = $props();
</script>

<div
    class={cn(
        "rounded-xl corner-squircle border-destructive-300",
        "flex items-start shadow-lg",
    )}
>
    <div class="p-3">
        <CrossRoundedIcon
            class="text-destructive-800 size-6 relative top-0.5"
        />
    </div>
    <div class="p-3 text-sm grow">
        <h5 class="font-heading font-base text-lg text-destructive-950">
            {title}
        </h5>
        <p class="pt-3 pb-2 text-black">{@html message}</p>
    </div>
</div>
