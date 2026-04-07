<script lang="ts">
    import ArrowLeftIcon from "phosphor-svelte/lib/ArrowLeftIcon";
    import { Button } from "$lib/components/ui/button";
</script>

<a
    href="javascript:history.back()"
    class="inline-flex items-center gap-4 hover:-translate-x-0.5 transition-transform"
>
    <Button variant="secondary" size="icon-lg" class="corner-none!">
        <ArrowLeftIcon />
    </Button>
    <span class="text-gray-200">Go back</span>
</a>
