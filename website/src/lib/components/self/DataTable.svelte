<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as HoverCard from '$lib/components/ui/hover-card';
	import { Badge } from '$lib/components/ui/badge';
	import CoinIcon from './CoinIcon.svelte';
	import UserProfilePreview from './UserProfilePreview.svelte';
	import { getPublicUrl } from '$lib/utils';

	interface Column {
		key: string;
		label: string;
		class?: string;
		sortable?: boolean;
		render?: (value: any, row: any, index: number) => any;
	}

	let {
		columns,
		data,
		onRowClick,
		emptyMessage = 'No data available',
		emptyIcon,
		emptyTitle = 'No data',
		emptyDescription = '',
		enableUserPreview = false
	}: {
		columns: Column[];
		data: any[];
		onRowClick?: (row: any) => void;
		emptyMessage?: string;
		emptyIcon?: any;
		emptyTitle?: string;
		emptyDescription?: string;
		enableUserPreview?: boolean;
	} = $props();
</script>

{#if data.length === 0}
	<div class="py-12 text-center">
		{#if emptyIcon}
			<div class="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
				<svelte:component this={emptyIcon} class="text-muted-foreground h-6 w-6" />
			</div>
		{/if}
		<h3 class="mb-2 text-lg font-semibold">{emptyTitle}</h3>
		<p class="text-muted-foreground">{emptyDescription || emptyMessage}</p>
	</div>
{:else}
	<Table.Root>
		<Table.Header>
			<Table.Row>
				{#each columns as column}
					<Table.Head class={column.class}>{column.label}</Table.Head>
				{/each}
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each data as row, index}
				<Table.Row
					class={onRowClick ? 'hover:bg-muted/50 cursor-pointer transition-colors' : ''}
					onclick={onRowClick ? () => onRowClick(row) : undefined}
				>
					{#each columns as column}
						<Table.Cell class={column.class}>
							{#if column.render}
								{@const rendered = column.render(row[column.key], row, index)}
								{#if typeof rendered === 'object' && rendered !== null}
									{#if rendered.component === 'badge'}
										<Badge variant={rendered.variant} class={rendered.class}>
											{rendered.text}
										</Badge>
									{:else if rendered.component === 'user'}
										{#if enableUserPreview}
											<HoverCard.Root>
												<HoverCard.Trigger>
													<div class="flex items-center gap-2">
														<Avatar.Root class="h-6 w-6">
															<Avatar.Image
																src={getPublicUrl(rendered.image)}
																alt={rendered.name}
															/>
															<Avatar.Fallback class="bg-muted text-muted-foreground text-xs">
																{rendered.name?.charAt(0) || '?'}
															</Avatar.Fallback>
														</Avatar.Root>
														<div>
															<p class="text-sm font-medium">{rendered.name}</p>
															<p class="text-muted-foreground text-xs">@{rendered.username}</p>
														</div>
													</div>
												</HoverCard.Trigger>
												<HoverCard.Content class="w-80" side="right" sideOffset={10}>
													<UserProfilePreview userId={row.userId || row.id} />
												</HoverCard.Content>
											</HoverCard.Root>
										{:else}
											<div class="flex items-center gap-2">
												<Avatar.Root class="h-6 w-6">
													<Avatar.Image src={getPublicUrl(rendered.image)} alt={rendered.name} />
													<Avatar.Fallback class="bg-muted text-muted-foreground text-xs">
														{rendered.name?.charAt(0) || '?'}
													</Avatar.Fallback>
												</Avatar.Root>
												<div>
													<p class="text-sm font-medium">{rendered.name}</p>
													<p class="text-muted-foreground text-xs">@{rendered.username}</p>
												</div>
											</div>
										{/if}
									{:else if rendered.component === 'rank'}
										<div class="flex items-center gap-2">
											<svelte:component this={rendered.icon} class="h-4 w-4 {rendered.color}" />
											<span class="font-mono text-sm">#{rendered.number}</span>
										</div>
									{:else if rendered.component === 'coin'}
										<div class="flex items-center gap-3">
											<CoinIcon
												icon={rendered.icon}
												symbol={rendered.symbol}
												name={rendered.name}
												size={rendered.size || 8}
											/>
											<div>
												<div class="font-medium">{rendered.name}</div>
												<div class="text-muted-foreground text-sm">*{rendered.symbol}</div>
											</div>
										</div>
									{:else if rendered.component === 'link'}
										<a href={rendered.href} class="flex items-center gap-2 hover:underline">
											<CoinIcon
												icon={rendered.content.icon}
												symbol={rendered.content.symbol}
												name={rendered.content.name}
												size={4}
											/>
											{rendered.content.name}
											<span class="text-muted-foreground">(*{rendered.content.symbol})</span>
										</a>
									{/if}
								{:else}
									{rendered}
								{/if}
							{:else}
								{row[column.key]}
							{/if}
						</Table.Cell>
					{/each}
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
{/if}
