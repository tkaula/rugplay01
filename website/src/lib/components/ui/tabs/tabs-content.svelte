<script lang="ts">
	import { Tabs as TabsPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";
	import { browser } from "$app/environment";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: TabsPrimitive.ContentProps = $props();
</script>

{#if browser}
	<TabsPrimitive.Content
		bind:ref
		data-slot="tabs-content"
		class={cn("flex-1 outline-none", className)}
		{...restProps}
	/>
{:else}
	<div
		data-slot="tabs-content"
		class={cn("flex-1 outline-none", className)}
	>
		{@render children?.()}
	</div>
{/if}
