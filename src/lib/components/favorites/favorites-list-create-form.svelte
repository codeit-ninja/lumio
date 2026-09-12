<script lang="ts">
    import { eq } from "drizzle-orm";
    import { isEmpty } from "lodash-es";
    import { Button } from "../ui/button";
    import { Input } from "../ui/input";
    import { db } from "$lib/database";
    import { favoritesLists } from "$lib/database/schema";
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

        const [exists] = await db
            .select()
            .from(favoritesLists)
            .where(eq(favoritesLists.name, name))
            .limit(1);

        if (exists) {
            error = "List name already exists";
            return;
        }

        if (onsubmit) {
            onsubmit(name);
        }
    })}
>
    <Input label="List Name" autocomplete="off" bind:value={name} {error} />
    <Button variant="ghost" class="mt-4 ms-auto" type="submit">Create</Button>
</form>
