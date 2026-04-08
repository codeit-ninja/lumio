<script lang="ts">
    import { cn } from "tailwind-variants";
    import { CheckRoundedIcon } from "$lib/icons";

    type Props = {
        title: string;
        message: string;
    };

    const { title, message }: Props = $props();
</script>

<div
    class={cn(
        "rounded-xl corner-squircle bg-gray-900 border border-gray-700",
        "flex items-start shadow-lg",
    )}
>
    <div class="py-3 ps-3">
        <CheckRoundedIcon class="text-success-300 size-6 relative top-0.5" />
    </div>
    <div class="p-3 text-sm grow">
        <h5 class="font-heading font-base text-lg text-success-300">{title}</h5>
        <p class="pt-3 pb-2 text-success-50 min-w-xs">{@html message}</p>
    </div>
</div>
