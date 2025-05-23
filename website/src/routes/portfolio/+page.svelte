<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import CoinIcon from '$lib/components/self/CoinIcon.svelte';
	import { getPublicUrl } from '$lib/utils';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { TrendingUp, DollarSign, Wallet, TrendingDown, Clock, Receipt } from 'lucide-svelte';
	import { goto } from '$app/navigation';

	let { data } = $props();

	let portfolioData = $state<any>(null);
	let transactions = $state<any[]>([]);
	let loading = $state(true);

	onMount(async () => {
		await Promise.all([fetchPortfolioData(), fetchRecentTransactions()]);
	});

	async function fetchPortfolioData() {
		try {
			const response = await fetch('/api/portfolio/total');
			if (response.ok) {
				portfolioData = await response.json();
			} else {
				toast.error('Failed to load portfolio data');
			}
		} catch (e) {
			console.error('Failed to fetch portfolio data:', e);
			toast.error('Failed to load portfolio data');
		}
	}

	async function fetchRecentTransactions() {
		try {
			const response = await fetch('/api/transactions');
			if (response.ok) {
				const result = await response.json();
				transactions = result.transactions.slice(0, 10); // Show last 10 transactions
			} else {
				toast.error('Failed to load transactions');
			}
		} catch (e) {
			console.error('Failed to fetch transactions:', e);
			toast.error('Failed to load transactions');
		} finally {
			loading = false;
		}
	}

	function formatPrice(price: number): string {
		if (price < 0.01) {
			return price.toFixed(6);
		} else if (price < 1) {
			return price.toFixed(4);
		} else {
			return price.toLocaleString(undefined, {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			});
		}
	}

	function formatValue(value: number): string {
		if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
		if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
		if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
		return `$${value.toFixed(2)}`;
	}

	function formatQuantity(value: number): string {
		if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
		if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
		if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
		return value.toLocaleString();
	}

	function formatDate(timestamp: string): string {
		const date = new Date(timestamp);
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	let totalPortfolioValue = $derived(portfolioData ? portfolioData.totalValue : 0);
	let hasHoldings = $derived(portfolioData && portfolioData.coinHoldings.length > 0);
	let hasTransactions = $derived(transactions.length > 0);
</script>

<svelte:head>
	<title>Portfolio - Rugplay</title>
</svelte:head>

<div class="container mx-auto max-w-7xl p-6">
	<header class="mb-8">
		<div>
			<h1 class="text-3xl font-bold">Portfolio</h1>
			<p class="text-muted-foreground">View your holdings and portfolio performance</p>
		</div>
	</header>

	{#if loading}
		<div class="flex h-96 items-center justify-center">
			<div class="text-center">
				<div class="mb-4 text-xl">Loading portfolio...</div>
			</div>
		</div>
	{:else if !portfolioData}
		<div class="flex h-96 items-center justify-center">
			<div class="text-center">
				<div class="text-muted-foreground mb-4 text-xl">Failed to load portfolio</div>
				<Button onclick={fetchPortfolioData}>Try Again</Button>
			</div>
		</div>
	{:else}
		<!-- Portfolio Summary Cards -->
		<div class="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
			<!-- Total Portfolio Value -->
			<Card.Root class="text-success gap-1">
				<Card.Header>
					<Card.Title class="flex items-center gap-2 text-sm font-medium">
						<Wallet class="h-4 w-4" />
						Total
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<p class="text-3xl font-bold">{formatValue(totalPortfolioValue)}</p>
				</Card.Content>
			</Card.Root>

			<!-- Base Currency Balance -->
			<Card.Root class="gap-1">
				<Card.Header>
					<Card.Title class="flex items-center gap-2 text-sm font-medium">
						<DollarSign class="h-4 w-4" />
						Cash Balance
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<p class="text-3xl font-bold">
						{formatValue(portfolioData.baseCurrencyBalance)}
					</p>
					<p class="text-muted-foreground text-xs">
						{totalPortfolioValue > 0
							? `${((portfolioData.baseCurrencyBalance / totalPortfolioValue) * 100).toFixed(1)}% of portfolio`
							: '100% of portfolio'}
					</p>
				</Card.Content>
			</Card.Root>

			<!-- Coin Holdings Value -->
			<Card.Root class="gap-1">
				<Card.Header>
					<Card.Title class="flex items-center gap-2 text-sm font-medium">
						<TrendingUp class="h-4 w-4" />
						Coin Holdings
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<p class="text-3xl font-bold">{formatValue(portfolioData.totalCoinValue)}</p>
					<p class="text-muted-foreground text-xs">
						{portfolioData.coinHoldings.length} positions
					</p>
				</Card.Content>
			</Card.Root>
		</div>

		{#if !hasHoldings}
			<!-- Empty State -->
			<Card.Root>
				<Card.Content class="py-16 text-center">
					<div
						class="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
					>
						<Wallet class="text-muted-foreground h-8 w-8" />
					</div>
					<h3 class="mb-2 text-lg font-semibold">No coin holdings</h3>
					<p class="text-muted-foreground mb-6">
						You haven't invested in any coins yet. Start by buying existing coins.
					</p>
					<div class="flex justify-center">
						<Button variant="outline" onclick={() => goto('/')}>Browse Coins</Button>
					</div>
				</Card.Content>
			</Card.Root>
		{:else}
			<!-- Holdings Table -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Your Holdings</Card.Title>
					<Card.Description>Current positions in your portfolio</Card.Description>
				</Card.Header>
				<Card.Content>
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Coin</Table.Head>
								<Table.Head>Quantity</Table.Head>
								<Table.Head>Price</Table.Head>
								<Table.Head>24h Change</Table.Head>
								<Table.Head>Value</Table.Head>
								<Table.Head class="hidden md:table-cell">Portfolio %</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each portfolioData.coinHoldings as holding}
								<Table.Row
									class="hover:bg-muted/50 cursor-pointer transition-colors"
									onclick={() => goto(`/coin/${holding.symbol}`)}
								>
									<Table.Cell class="font-medium">
										<div class="flex items-center gap-2">
											<CoinIcon icon={holding.icon} symbol={holding.symbol} size={6} />
											<span>*{holding.symbol}</span>
										</div>
									</Table.Cell>
									<Table.Cell class="font-mono">
										{formatQuantity(holding.quantity)}
									</Table.Cell>
									<Table.Cell class="font-mono">
										${formatPrice(holding.currentPrice)}
									</Table.Cell>
									<Table.Cell>
										<Badge variant={holding.change24h >= 0 ? 'success' : 'destructive'}>
											{holding.change24h >= 0 ? '+' : ''}{holding.change24h.toFixed(2)}%
										</Badge>
									</Table.Cell>
									<Table.Cell class="font-mono font-medium">
										{formatValue(holding.value)}
									</Table.Cell>
									<Table.Cell class="hidden md:table-cell">
										<Badge variant="outline">
											{((holding.value / totalPortfolioValue) * 100).toFixed(1)}%
										</Badge>
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</Card.Content>
			</Card.Root>
		{/if}

		<!-- Recent Transactions -->
		<Card.Root class="mt-8">
			<Card.Header>
				<div class="flex items-center justify-between">
					<div>
						<Card.Title class="flex items-center gap-2">
							<Receipt class="h-5 w-5" />
							Recent Transactions
						</Card.Title>
						<Card.Description>Your latest trading activity</Card.Description>
					</div>
					{#if hasTransactions}
						<Button variant="outline" size="sm" onclick={() => goto('/transactions')}>
							View All
						</Button>
					{/if}
				</div>
			</Card.Header>
			<Card.Content>
				{#if !hasTransactions}
					<div class="py-8 text-center">
						<div
							class="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
						>
							<Receipt class="text-muted-foreground h-6 w-6" />
						</div>
						<h3 class="mb-2 text-lg font-semibold">No transactions yet</h3>
						<p class="text-muted-foreground mb-4">
							You haven't made any trades yet. Start by buying or selling coins.
						</p>
						<Button variant="outline" onclick={() => goto('/')}>Browse Coins</Button>
					</div>
				{:else}
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Type</Table.Head>
								<Table.Head>Coin</Table.Head>
								<Table.Head>Quantity</Table.Head>
								<Table.Head>Price</Table.Head>
								<Table.Head>Total</Table.Head>
								<Table.Head class="hidden md:table-cell">Date</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each transactions as tx}
								<Table.Row
									class="hover:bg-muted/50 cursor-pointer transition-colors"
									onclick={() => goto(`/coin/${tx.coin.symbol}`)}
								>
									<Table.Cell>
										<div class="flex items-center gap-2">
											{#if tx.type === 'BUY'}
												<TrendingUp class="h-4 w-4 text-green-500" />
												<Badge variant="success" class="text-xs">Buy</Badge>
											{:else}
												<TrendingDown class="h-4 w-4 text-red-500" />
												<Badge variant="destructive" class="text-xs">Sell</Badge>
											{/if}
										</div>
									</Table.Cell>
									<Table.Cell class="font-medium">
										<div class="flex items-center gap-2">
											<CoinIcon icon={tx.coin.icon} symbol={tx.coin.symbol} size={4} />
											<span>*{tx.coin.symbol}</span>
										</div>
									</Table.Cell>
									<Table.Cell class="font-mono text-sm">
										{formatQuantity(tx.quantity)}
									</Table.Cell>
									<Table.Cell class="font-mono text-sm">
										${formatPrice(tx.pricePerCoin)}
									</Table.Cell>
									<Table.Cell class="font-mono text-sm font-medium">
										{formatValue(tx.totalBaseCurrencyAmount)}
									</Table.Cell>
									<Table.Cell class="text-muted-foreground hidden text-sm md:table-cell">
										<div class="flex items-center gap-1">
											<Clock class="h-3 w-3" />
											{formatDate(tx.timestamp)}
										</div>
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				{/if}
			</Card.Content>
		</Card.Root>
	{/if}
</div>
