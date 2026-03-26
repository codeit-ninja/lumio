<script lang="ts">
    import { Dialog } from "bits-ui";
    import XIcon from "phosphor-svelte/lib/XIcon";
    import { cn } from "$lib/utils";
    import { useDialog } from ".";

    const dialog = useDialog();
</script>

<Dialog.Root bind:open={dialog.open}>
    <Dialog.Portal to=".dialog-container">
        <Dialog.Overlay class={cn("absolute inset-0 bg-gray-900 z-10")} />
        <Dialog.Content
            class={cn(
                "absolute grid place-items-center top-0 left-0 z-50 w-full h-full duration-75",
                "data-[state=open]:animate-in data-[state=open]:zoom-in",
                "data-[state=closed]:animate-out data-[state=closed]:zoom-out",
            )}
        >
            <div
                class={cn(
                    dialog.size === "sm" && "w-full max-w-md",
                    dialog.size === "md" && "w-full max-w-2xl",
                    dialog.size === "lg" && "w-full max-w-4xl",
                    dialog.size === "full" && "w-full grid place-items-center",
                )}
            >
                <Dialog.Close
                    class="absolute right-5 top-5 cursor-pointer outline-none text-gray-200 z-10"
                >
                    <XIcon class="size-10" />
                </Dialog.Close>
                {#if dialog.title}
                    <Dialog.Title class="text-xl font-bold mb-4">
                        {dialog.title}
                    </Dialog.Title>
                {/if}
                <svelte:component this={dialog.component} {...dialog.props} />
            </div>
        </Dialog.Content>
    </Dialog.Portal>
</Dialog.Root>
