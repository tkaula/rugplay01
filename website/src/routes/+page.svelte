<script lang="ts">
	import { coins } from '$lib/data/coins';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { getTimeBasedGreeting } from '$lib/utils';
	import { USER_DATA } from '$lib/stores/user-data';
	import SignInConfirmDialog from '$lib/components/self/SignInConfirmDialog.svelte';

	let shouldSignIn = $state(false);
</script>

<SignInConfirmDialog bind:open={shouldSignIn} />

<div class="container mx-auto p-6">
	<header class="mb-8">
		<h1 class="mb-2 text-3xl font-bold">
			{$USER_DATA ? getTimeBasedGreeting($USER_DATA?.name) : 'Welcome to Rugplay!'}
		</h1>
		<p class="text-muted-foreground">
			{#if $USER_DATA}
				Here's the market overview for today.
			{:else}
				You need to <button
					class="text-primary underline hover:cursor-pointer"
					onclick={() => (shouldSignIn = !shouldSignIn)}>sign in</button
				>
				or{' '}
				<button
					class="text-primary underline hover:cursor-pointer"
					onclick={() => (shouldSignIn = !shouldSignIn)}>create an account</button
				> to play.
			{/if}
		</p>
	</header>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each coins as coin}
			<a href={`/coin/${coin.symbol}`} class="block">
				<Card.Root class="h-full transition-shadow hover:shadow-md">
					<Card.Header>
						<Card.Title class="flex items-center justify-between">
							<span>{coin.name} ({coin.symbol})</span>
							<Badge variant={coin.change24h >= 0 ? 'success' : 'destructive'} class="ml-2">
								{coin.change24h >= 0 ? '+' : ''}{coin.change24h}%
							</Badge>
						</Card.Title>
						<Card.Description
							>Market Cap: ${(coin.marketCap / 1000000000).toFixed(2)}B</Card.Description
						>
					</Card.Header>
					<Card.Content>
						<div class="flex items-baseline justify-between">
							<span class="text-3xl font-bold"
								>${coin.price.toLocaleString(undefined, {
									minimumFractionDigits: coin.price < 1 ? 3 : 2,
									maximumFractionDigits: coin.price < 1 ? 3 : 2
								})}</span
							>
							<span class="text-muted-foreground text-sm"
								>24h Vol: ${(coin.volume24h / 1000000000).toFixed(2)}B</span
							>
						</div>
					</Card.Content>
				</Card.Root>
			</a>
		{/each}
	</div>

	<div class="mt-12">
		<h2 class="mb-4 text-2xl font-bold">Market Overview</h2>
		<Card.Root>
			<Card.Content class="p-0">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Name</Table.Head>
							<Table.Head>Price</Table.Head>
							<Table.Head>24h Change</Table.Head>
							<Table.Head class="hidden md:table-cell">Market Cap</Table.Head>
							<Table.Head class="hidden md:table-cell">Volume (24h)</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each coins as coin}
							<Table.Row>
								<Table.Cell class="font-medium">
									<a href={`/coin/${coin.symbol}`} class="hover:underline">
										{coin.name} <span class="text-muted-foreground">({coin.symbol})</span>
									</a>
								</Table.Cell>
								<Table.Cell
									>${coin.price.toLocaleString(undefined, {
										minimumFractionDigits: coin.price < 1 ? 3 : 2,
										maximumFractionDigits: coin.price < 1 ? 3 : 2
									})}</Table.Cell
								>
								<Table.Cell>
									<Badge variant={coin.change24h >= 0 ? 'success' : 'destructive'}>
										{coin.change24h >= 0 ? '+' : ''}{coin.change24h}%
									</Badge>
								</Table.Cell>
								<Table.Cell class="hidden md:table-cell"
									>${(coin.marketCap / 1000000000).toFixed(2)}B</Table.Cell
								>
								<Table.Cell class="hidden md:table-cell"
									>${(coin.volume24h / 1000000000).toFixed(2)}B</Table.Cell
								>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</Card.Content>
		</Card.Root>
	</div>
</div>
