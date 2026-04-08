<script lang="ts">
    import type { HTMLButtonAttributes } from "svelte/elements";
    import { eq } from "@type32/tauri-sqlite-orm";
    import { toast } from "svelte-sonner";
    import { cn } from "tailwind-variants";
    import { ToastError, ToastSuccess } from "../ui/toasts";
    import { useFavoriteList } from "./context.svelte";
    import { invalidateAll } from "$app/navigation";
    import { orm } from "$lib/database";
    import { favoriteLists } from "$lib/database/favorites";
    import { TrashIcon } from "$lib/icons";

    type Props = {} & HTMLButtonAttributes;

    const { ...restProps }: Props = $props();
    const list = useFavoriteList();
</script>

{#if list.current.name !== "default"}
    <button
        {...restProps}
        class={cn(
            "text-destructive-200 transition-all hover:text-destructive-500 cursor-pointer",
            restProps.class,
        )}
        onclick={() => {
            orm.delete(favoriteLists)
                .where(eq(favoriteLists._.columns.id, list.current.id))
                .execute()
                .then(() => {
                    toast.custom(ToastSuccess, {
                        componentProps: {
                            title: "List Deleted",
                            message: `The list "${list.current.name}" has been successfully deleted.`,
                        },
                    });
                    invalidateAll();
                })
                .catch((err) => {
                    toast.custom(ToastError, {
                        componentProps: {
                            title: "Error Deleting List",
                            message: `An error occurred while deleting the list "${list.current.name}". Please try again.`,
                        },
                    });
                    console.error("Error deleting favorite list:", err);
                });
        }}
    >
        <TrashIcon />
    </button>
{/if}
