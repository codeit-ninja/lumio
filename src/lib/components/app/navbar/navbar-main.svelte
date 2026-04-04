<script lang="ts">
    import FilmStripIcon from "phosphor-svelte/lib/FilmStripIcon";
    import HomeIcon from "phosphor-svelte/lib/TelevisionIcon";
    import { resolve } from "$app/paths";
    import * as Nav from "$lib/components/ui/nav";
</script>

<Nav.Root>
    <Nav.Section title="Main">
        <Nav.Link href={resolve(`/`)} icon={HomeIcon}>Home</Nav.Link>
        <Nav.Link href={resolve(`/movies`)} icon={FilmStripIcon}>
            Movies
        </Nav.Link>
    </Nav.Section>
</Nav.Root>
