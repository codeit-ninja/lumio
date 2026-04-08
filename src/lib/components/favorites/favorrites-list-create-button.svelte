<script lang="ts">
    import { toast } from "svelte-sonner";
    import { useDialog } from "../app";
    import { Button } from "../ui/button";
    import { ToastSuccess } from "../ui/toasts";
    import { CreateForm } from ".";
    import { invalidate } from "$app/navigation";
    import { orm } from "$lib/database";
    import { favoriteLists } from "$lib/database/favorites";
    import { PlusRoundedIcon } from "$lib/icons";

    const dialog = useDialog();
</script>

<Button
    variant="ghost"
    class="corner-none!"
    onclick={() => {
        dialog.create({
            component: CreateForm,
            size: "sm",
            position: "right",
            title: "Create Favorite List",
            description:
                "Create a new list to organize your favorite movies and TV shows.",
            props: {
                onsubmit(name) {
                    orm.insert(favoriteLists)
                        .values({ name })
                        .execute()
                        .then(() => {
                            toast.custom(ToastSuccess, {
                                componentProps: {
                                    title: "List Created",
                                    message: `The list "${name}" has been created successfully.`,
                                },
                            });
                            dialog.closeDialog();
                            invalidate("app:favorites");
                        });
                },
            },
        });
        dialog.openDialog();
    }}
>
    <PlusRoundedIcon />
    Create List
</Button>
