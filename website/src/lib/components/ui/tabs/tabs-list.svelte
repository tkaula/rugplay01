<script lang="ts">
	import { Tabs as TabsPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";
	import { browser } from "$app/environment";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: TabsPrimitive.ListProps = $props();
</script>

{#if browser}
	<TabsPrimitive.List
		bind:ref
		data-slot="tabs-list"
		class={cn(
			"bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
			className
		)}
		{...restProps}
	/>
{:else}
	<div
		data-slot="tabs-list"
		class={cn(
			"bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
			className
		)}
	>
		{@render children?.()}
	</div>
{/if}
