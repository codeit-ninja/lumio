<script lang="ts">
    import { eq } from "@type32/tauri-sqlite-orm";
    import { isEmpty } from "lodash-es";
    import { Button } from "../ui/button";
    import { Input } from "../ui/input";
    import { orm } from "$lib/database";
    import { favoriteLists } from "$lib/database/favorites";
    import { preventDefault } from "$lib/utils";

    type Props = {
        onsubmit: (name: string) => void;
    };

    let { onsubmit }: Props = $props();
    let name = $state("");
    let error = $state<string>();
</script>

<form
    class="flex flex-col"
    onsubmit={preventDefault(async () => {
        error = undefined;

        if (isEmpty(name)) {
            error = "List name cannot be empty";
            return;
        }

        const exists = await orm
            .select(favoriteLists)
            .where(eq(favoriteLists._.columns.name, name))
            .exists();

        if (exists) {
            error = "List name already exists";
            return;
        }

        if (onsubmit) {
            onsubmit(name);
        }
    })}
>
    <Input label="List Name" bind:value={name} {error} />
    <Button variant="ghost" class="mt-4 ms-auto" type="submit">Create</Button>
</form>
