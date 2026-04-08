<script lang="ts">
    import type { FavoriteListItem } from "$lib/database/favorites";
    import type { DragDropState } from "@thisux/sveltednd";
    import { droppable, dndState } from "@thisux/sveltednd";
    import { eq } from "@type32/tauri-sqlite-orm";
    import { fromAction } from "svelte/attachments";
    import { toast } from "svelte-sonner";
    import { cn } from "tailwind-variants";
    import { invalidate } from "$app/navigation";
    import * as Favorites from "$lib/components/favorites";
    import { H } from "$lib/components/ui/h";
    import { ToastError, ToastSuccess } from "$lib/components/ui/toasts";
    import { favoriteListItems } from "$lib/database/favorites";
    import { orm } from "$lib/database/index.js";

    let { data } = $props();

    function handleDrop(state: DragDropState<FavoriteListItem>) {
        const { draggedItem, targetContainer } =
            state as DragDropState<FavoriteListItem>;

        if (!targetContainer) {
            return;
        }

        orm.update(favoriteListItems)
            .where(eq(favoriteListItems._.columns.id, draggedItem.id))
            .set({
                favoriteListId: parseInt(targetContainer),
            })
            .execute()
            .then(() => {
                toast.custom(ToastSuccess, {
                    componentProps: {
                        title: "Movie moved!",
                        message: "The movie has been moved to the new list.",
                    },
                });
                invalidate("app:favorites");
            })
            .catch(() => {
                toast.custom(ToastError, {
                    componentProps: {
                        title: "Error moving movie",
                        message:
                            "An error occurred while moving the movie. Please try again.",
                    },
                });
            });
    }
</script>

<div class="mt-6">
    <div class="flex items-center justify-between mb-6">
        <H level="1">Favorites</H>
        <Favorites.CreateButton />
    </div>
    <div class="grid gap-12">
        {#each data.lists as list (list.id)}
            <Favorites.Root
                {list}
                class={cn(
                    "relative border-2 border-dashed border-transparent before:opacity-0 before:absolute before:-inset-6",
                    "before:bg-gray-800/30 before:rounded-4xl before:corner-squircle *:relative before:transition-all after:hidden",
                    dndState.targetContainer === list.id.toString() &&
                        "before:opacity-100",
                )}
                {@attach fromAction(droppable<FavoriteListItem>, () => ({
                    container: list.id.toString(),
                    callbacks: {
                        onDrop: handleDrop,
                    },
                }))}
            >
                <div class="flex items-center group gap-4">
                    <Favorites.Title level="2" />
                    <Favorites.Delete
                        class="group-hover:opacity-100 opacity-0"
                    />
                </div>
                <Favorites.Items
                    class="mt-4"
                    dropContainer={list.id.toString()}
                />
                <Favorites.Expand size="lg" class="mt-6" />
            </Favorites.Root>
        {/each}
    </div>
</div>
