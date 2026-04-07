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
        "rounded-xl corner-squircle bg-destructive-950 border border-destructive-500",
        "flex items-start shadow-lg",
    )}
>
    <div class="p-2">
        <CrossRoundedIcon class="text-destructive-50 size-6 relative top-0.5" />
    </div>
    <div class="p-2 text-sm grow">
        <h5 class="font-heading font-base text-lg text-destructive-50">
            {title}
        </h5>
        <p class="pt-2 pb-2 text-destructive-100">{@html message}</p>
    </div>
</div>
