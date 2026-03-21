<script lang="ts">
    import { resolve } from '$app/paths';
    import * as Nav from '$lib/components/ui/nav';
    import { getGenres, genre } from "$lib/resources";

    let genres = $derived(await getGenres());
</script>

<Nav.Root>
    <Nav.Section title="Genres">
        {#if genres.current}
            {#each genres.current as current (current.id)}
                <Nav.Link href={resolve(`/genres/[type]/[id]`, { type: genre.current, id: current.id.toString() })}>
                    {current.name}
                </Nav.Link>
            {/each}
        {/if}
    </Nav.Section>
</Nav.Root>