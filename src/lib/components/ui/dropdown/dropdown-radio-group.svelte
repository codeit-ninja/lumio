<script lang="ts">
    import { DropdownMenu } from "bits-ui";

    type Props = {} & DropdownMenu.RadioGroupProps;

    let { value = $bindable(), children, ...restProps }: Props = $props();
</script>

<DropdownMenu.RadioGroup {...restProps} class="grid gap-1 p-1" bind:value>
    {@render children?.()}
</DropdownMenu.RadioGroup>
