<script lang="ts">
    import { useSeries } from "$lib/resources";

    const series = useSeries();

    $inspect(series.trending?.current);
</script>
