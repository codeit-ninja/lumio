<script lang="ts">
    import { eq } from "@type32/tauri-sqlite-orm";
    import { toast } from "svelte-sonner";
    import { cn } from "tailwind-variants";
    import { Button } from "../ui/button";
    import { ToastSuccess, ToastError } from "../ui/toasts";
    import { useMovie } from "./context.svelte";
    import { orm } from "$lib/database";
    import { favoriteListItems } from "$lib/database/favorites";
    import { HeartIcon } from "$lib/icons";

    let isLoading = $state(false);
    let movie = useMovie();
    let isFavorite = $state(false);
    let didAddToFavorites = $state(false);

    $effect(() => {
        orm.select(favoriteListItems)
            .where(eq(favoriteListItems._.columns.imdbId, movie.id))
            .exists()
            .then((val) => {
                isFavorite = val;
            });
    });

    let addToFavorites = () => {
        isLoading = true;

        if (isFavorite) {
            return orm
                .delete(favoriteListItems)
                .where(eq(favoriteListItems._.columns.imdbId, movie.id))
                .execute()
                .then(() => {
                    toast.custom(ToastSuccess, {
                        componentProps: {
                            title: "Removed from Favorites",
                            message: `${movie.title} has been removed from your favorites list.`,
                        },
                    });
                    isFavorite = false;
                })
                .catch((error) => {
                    toast.custom(ToastError, {
                        componentProps: {
                            title: "Error",
                            message: `An error occurred while removing ${movie.title} from your favorites list. Please try again.`,
                        },
                    });
                    console.error("Error removing from favorites:", error);
                })
                .finally(() => {
                    isLoading = false;
                });
        }

        return orm
            .insert(favoriteListItems)
            .values({
                favoriteListId: 1,
                imdbId: movie.id,
                movie: movie,
            })
            .execute()
            .then(() => {
                toast.custom(ToastSuccess, {
                    componentProps: {
                        title: "Added to Favorites",
                        message: `${movie.title} has been added to your favorites list.`,
                    },
                });
                isFavorite = true;
                didAddToFavorites = true;
            })
            .catch((error) => {
                toast.custom(ToastError, {
                    componentProps: {
                        title: "Error",
                        message: `An error occurred while adding ${movie.title} to your favorites list. Please try again.`,
                    },
                });
                console.error("Error adding to favorites:", error);
            })
            .finally(() => {
                isLoading = false;

                setTimeout(() => {
                    didAddToFavorites = false;
                }, 300);
            });
    };
</script>

<Button
    class={cn("corner-none!", isFavorite && "[&>svg]:text-destructive-400")}
    size="icon-lg"
    variant="ghost"
    onclick={addToFavorites}
    loading={isLoading}
>
    <HeartIcon animate={didAddToFavorites || isFavorite} />
</Button>
