<script lang="ts">
    import { cn } from "$lib/utils";

    type Props = {
        text: string;
        class?: string;
    };

    let { text, class: className }: Props = $props();

    const id = `glass-text-${Math.random().toString(36).slice(2, 9)}`;
</script>

<div class={cn("relative font-black", className)}>
    <svg
        aria-hidden="true"
        class="absolute inset-0 w-full h-full overflow-visible pointer-events-none opacity-0"
    >
        <defs>
            <clipPath {id}>
                <text
                    x="50%"
                    y="50%"
                    text-anchor="middle"
                    dominant-baseline="central"
                    style="font: inherit;"
                >
                    {text}
                </text>
            </clipPath>
        </defs>
    </svg>

    <!-- The translucent glass layer -->
    <div
        aria-hidden="true"
        class="absolute inset-0 backdrop-blur-xs bg-linear-to-br from-gray-50/30 to-gray-100/40 from-75%"
        style={`clip-path: url(#${id});`}
    ></div>

    <!-- The boundary layer (stroke and shadow) -->
    <span
        aria-hidden="true"
        class="select-none text-transparent"
        style="
            text-shadow: 2px 2px 5px rgba(0,0,0,0.1), 2px 2px 5px rgba(0,0,0,0.1);
        ">{text}</span
    >

    <span class="sr-only">{text}</span>
</div>
