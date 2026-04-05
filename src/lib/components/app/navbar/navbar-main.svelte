<script lang="ts">
    import { resolve } from "$app/paths";
    import * as Nav from "$lib/components/ui/nav";
    import { HomeIcon, HeartIcon } from "$lib/icons";
</script>

<Nav.Root class="flex flex-col gap-4">
    <Nav.Link href={resolve(`/`)} icon={HomeIcon}>Home</Nav.Link>
    <Nav.Link href={resolve(`/favorites`)} icon={HeartIcon}>Favorites</Nav.Link>
</Nav.Root>
