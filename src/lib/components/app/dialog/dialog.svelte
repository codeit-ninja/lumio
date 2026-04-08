<script lang="ts">
    import { Dialog } from "bits-ui";
    import { useDialog } from ".";
    import { CloseIcon } from "$lib/icons";
    import { cn } from "$lib/utils";

    const dialog = useDialog();
</script>

<Dialog.Root bind:open={dialog.open}>
    <Dialog.Portal>
        <Dialog.Overlay
            class={cn("absolute inset-0 bg-gray-700/40 z-10 backdrop-blur-md")}
        />
        <Dialog.Content
            class={cn(
                "absolute text-white bg-gray-900 z-50 shadow-xl corner-squircle outline-none duration-150",
                "data-[state=open]:animate-in data-[state=closed]:animate-out",
                dialog.position === "right" &&
                    "top-0 right-0 h-screen rounded-l-4xl data-[state=closed]:slide-out-to-right",
                dialog.position === "center" &&
                    "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-4xl data-[state=open]:zoom-in data-[state=closed]:zoom-out",
                dialog.position === "left" &&
                    "top-0 left-0 h-screen rounded-r-4xl data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
                dialog.size === "sm" && "w-full max-w-md",
                dialog.size === "md" && "w-full max-w-2xl",
                dialog.size === "lg" && "w-full max-w-4xl",
                dialog.size === "full" && "w-full h-full",
            )}
        >
            <div class="p-6 border-b border-gray-800">
                <div class="flex items-start gap-4">
                    <div>
                        {#if dialog.title}
                            <Dialog.Title
                                class="mt-2 text-2xl font-medium font-heading"
                            >
                                {dialog.title}
                            </Dialog.Title>

                            {#if dialog.description}
                                <Dialog.Description
                                    class="text-gray-400 text-sm mt-4"
                                >
                                    {dialog.description}
                                </Dialog.Description>
                            {/if}
                        {/if}
                    </div>
                    <Dialog.Close
                        class="ms-auto cursor-pointer active:scale-95 transition-all"
                    >
                        <CloseIcon class="size-10" />
                    </Dialog.Close>
                </div>
            </div>
            <div class="p-6">
                <svelte:component this={dialog.component} {...dialog.props} />
            </div>
        </Dialog.Content>
    </Dialog.Portal>
</Dialog.Root>
