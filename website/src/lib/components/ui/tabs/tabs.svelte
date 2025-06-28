<script lang="ts">
	import { Tabs as TabsPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";
	import { browser } from "$app/environment";

	let {
		ref = $bindable(null),
		value = $bindable(""),
		class: className,
		children,
		...restProps
	}: TabsPrimitive.RootProps = $props();
</script>

{#if browser}
	<TabsPrimitive.Root
		bind:ref
		bind:value
		data-slot="tabs"
		class={cn("flex flex-col gap-2", className)}
		{...restProps}
	/>
{:else}
	<div
		data-slot="tabs"
		class={cn("flex flex-col gap-2", className)}
	>
		{@render children?.()}
	</div>
{/if}
