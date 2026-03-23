<script lang="ts">
    import { Dialog } from "bits-ui";
    import { useDialog } from ".";
    import { cn } from "$lib/utils";

    const dialog = useDialog();
</script>

<Dialog.Root bind:open={dialog.open}>
    <Dialog.Portal>
        <Dialog.Overlay
            class={cn("fixed inset-0 bg-gray-950/40 backdrop-blur-lg z-10")}
        />
        <Dialog.Content
            class={cn(
                "fixed grid place-items-center top-0 left-0 w-screen h-screen z-50",
            )}
        >
            <div
                class={cn(
                    dialog.size === "sm" && "w-full max-w-md",
                    dialog.size === "md" && "w-full max-w-2xl",
                    dialog.size === "lg" && "w-full max-w-4xl",
                    "",
                )}
            >
                <Dialog.Title class="text-xl font-bold mb-4">
                    {dialog.title}
                </Dialog.Title>
                <svelte:component this={dialog.component} {...dialog.props} />
            </div>
        </Dialog.Content>
    </Dialog.Portal>
</Dialog.Root>
