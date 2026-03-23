<script lang="ts">
    import HomeIcon from 'phosphor-svelte/lib/TelevisionIcon'
    import { resolve } from '$app/paths';
    import * as Nav from '$lib/components/ui/nav';
</script>

<Nav.Root>
    <Nav.Section title="Main">
        <Nav.Link href={resolve(`/`)} icon={HomeIcon}>
            Home
        </Nav.Link>
    </Nav.Section>
</Nav.Root>