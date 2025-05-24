<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { getTimeBasedGreeting, formatPrice, formatMarketCap } from '$lib/utils';
	import { USER_DATA } from '$lib/stores/user-data';
	import SignInConfirmDialog from '$lib/components/self/SignInConfirmDialog.svelte';
	import CoinIcon from '$lib/components/self/CoinIcon.svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let shouldSignIn = $state(false);
	let coins = $state<any[]>([]);
	let loading = $state(true);

	onMount(async () => {
		try {
			const response = await fetch('/api/coins/top');
			if (response.ok) {
				const result = await response.json();
				coins = result.coins;
			} else {
				toast.error('Failed to load coins');
			}
		} catch (e) {
			console.error('Failed to fetch coins:', e);
			toast.error('Failed to load coins');
		} finally {
			loading = false;
		}
	});
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

	{#if loading}
		<div class="flex h-96 items-center justify-center">
			<div class="text-center">
				<div class="mb-4 text-xl">Loading market data...</div>
			</div>
		</div>
	{:else if coins.length === 0}
		<div class="flex h-96 items-center justify-center">
			<div class="text-center">
				<div class="text-muted-foreground mb-4 text-xl">No coins available</div>
				<p class="text-muted-foreground text-sm">Be the first to create a coin!</p>
			</div>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each coins.slice(0, 6) as coin}
				<a href={`/coin/${coin.symbol}`} class="block">
					<Card.Root class="hover:bg-card/50 h-full transition-all hover:shadow-md">
						<Card.Header>
							<Card.Title class="flex items-center justify-between">
								<div class="flex items-center gap-2">
									<CoinIcon icon={coin.icon} symbol={coin.symbol} name={coin.name} size={6} />
									<span>{coin.name} (*{coin.symbol})</span>
								</div>
								<Badge variant={coin.change24h >= 0 ? 'success' : 'destructive'} class="ml-2">
									{coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
								</Badge>
							</Card.Title>
							<Card.Description>Market Cap: {formatMarketCap(coin.marketCap)}</Card.Description>
						</Card.Header>
						<Card.Content>
							<div class="flex items-baseline justify-between">
								<span class="text-3xl font-bold">${formatPrice(coin.price)}</span>
								<span class="text-muted-foreground text-sm">
									24h Vol: {formatMarketCap(coin.volume24h)}
								</span>
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
										<a
											href={`/coin/${coin.symbol}`}
											class="flex items-center gap-2 hover:underline"
										>
											<CoinIcon icon={coin.icon} symbol={coin.symbol} name={coin.name} size={4} />
											{coin.name} <span class="text-muted-foreground">(*{coin.symbol})</span>
										</a>
									</Table.Cell>
									<Table.Cell>${formatPrice(coin.price)}</Table.Cell>
									<Table.Cell>
										<Badge variant={coin.change24h >= 0 ? 'success' : 'destructive'}>
											{coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
										</Badge>
									</Table.Cell>
									<Table.Cell class="hidden md:table-cell"
										>{formatMarketCap(coin.marketCap)}</Table.Cell
									>
									<Table.Cell class="hidden md:table-cell"
										>{formatMarketCap(coin.volume24h)}</Table.Cell
									>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}
</div>
