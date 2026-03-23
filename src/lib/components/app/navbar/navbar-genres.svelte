<script lang="ts">
    import { resolve } from "$app/paths";
    import * as Nav from "$lib/components/ui/nav";
    import { useMovies } from "$lib/resources";

    const { genres } = useMovies();
</script>

<Nav.Root>
    <Nav.Section title="Genres">
        {#if genres.current}
            {#each genres.current as current (current.id)}
                <Nav.Link
                    href={resolve(`/genres/[type]/[id]`, {
                        type: current.name,
                        id: current.id.toString(),
                    })}
                >
                    {current.name}
                </Nav.Link>
            {/each}
        {/if}
    </Nav.Section>
</Nav.Root>
