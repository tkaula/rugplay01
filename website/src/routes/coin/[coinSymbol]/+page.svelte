<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as HoverCard from '$lib/components/ui/hover-card';
	import {
		TrendingUp,
		TrendingDown,
		DollarSign,
		Coins,
		ChartColumn,
		CalendarDays
	} from 'lucide-svelte';
	import {
		createChart,
		ColorType,
		type Time,
		type IChartApi,
		CandlestickSeries
	} from 'lightweight-charts';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { getPublicUrl } from '$lib/utils';
	import { toast } from 'svelte-sonner';

	const { data } = $props();
	const coinSymbol = data.coinSymbol;

	let coin = $state<any>(null);
	let priceHistory = $state<any[]>([]);
	let loading = $state(true);
	let creatorImageUrl = $state<string | null>(null);
	let chartData = $state<any[]>([]);

	onMount(async () => {
		try {
			const response = await fetch(`/api/coin/${coinSymbol}`);

			if (!response.ok) {
				if (response.status === 404) {
					toast.error('Coin not found');
				} else {
					toast.error('Failed to load coin data');
				}
				return;
			}

			const result = await response.json();
			coin = result.coin;
			priceHistory = result.priceHistory;
			chartData = generateCandlesticksFromHistory(priceHistory);

			if (coin.creatorId) {
				try {
					const imageResponse = await fetch(`/api/user/${coin.creatorId}/image`);
					const imageResult = await imageResponse.json();
					creatorImageUrl = imageResult.url;
				} catch (e) {
					console.error('Failed to load creator image:', e);
				}
			}
		} catch (e) {
			console.error('Failed to fetch coin data:', e);
			toast.error('Failed to load coin data');
		} finally {
			loading = false;
		}
	});

	function generateCandlesticksFromHistory(history: any[]) {
		const dailyData = new Map();

		history.forEach((p) => {
			const date = new Date(p.timestamp);
			const dayKey = Math.floor(date.getTime() / (24 * 60 * 60 * 1000));

			if (!dailyData.has(dayKey)) {
				dailyData.set(dayKey, {
					time: dayKey * 24 * 60 * 60,
					open: p.price,
					high: p.price,
					low: p.price,
					close: p.price,
					prices: [p.price]
				});
			} else {
				const dayData = dailyData.get(dayKey);
				dayData.high = Math.max(dayData.high, p.price);
				dayData.low = Math.min(dayData.low, p.price);
				dayData.close = p.price;
				dayData.prices.push(p.price);
			}
		});

		return Array.from(dailyData.values())
			.map((d) => ({
				time: d.time as Time,
				open: d.open,
				high: d.high,
				low: d.low,
				close: d.close
			}))
			.sort((a, b) => (a.time as number) - (b.time as number));
	}

	let chartContainer = $state<HTMLDivElement>();
	let chart: IChartApi | null = null;

	$effect(() => {
		if (chartContainer && chartData.length > 0 && !chart) {
			chart = createChart(chartContainer, {
				layout: {
					textColor: '#666666',
					background: { type: ColorType.Solid, color: 'transparent' },
					attributionLogo: false
				},
				grid: {
					vertLines: { color: '#2B2B43' },
					horzLines: { color: '#2B2B43' }
				},
				rightPriceScale: {
					borderVisible: false
				},
				timeScale: {
					borderVisible: false,
					timeVisible: true
				},
				crosshair: {
					mode: 1
				}
			});

			const candlestickSeries = chart.addSeries(CandlestickSeries, {
				upColor: '#26a69a',
				downColor: '#ef5350',
				borderVisible: false,
				wickUpColor: '#26a69a',
				wickDownColor: '#ef5350'
			});

			candlestickSeries.setData(chartData);
			chart.timeScale().fitContent();

			const handleResize = () => {
				chart?.applyOptions({
					width: chartContainer?.clientWidth
				});
			};

			window.addEventListener('resize', handleResize);
			handleResize();

			return () => {
				window.removeEventListener('resize', handleResize);
				if (chart) {
					chart.remove();
					chart = null;
				}
			};
		}
	});

	function formatPrice(price: number): string {
		if (price < 0.01) {
			return price.toFixed(6);
		} else if (price < 1) {
			return price.toFixed(4);
		} else {
			return price.toFixed(2);
		}
	}

	function formatMarketCap(value: number): string {
		if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
		if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
		if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
		return `$${value.toFixed(2)}`;
	}

	function formatSupply(value: number): string {
		if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
		if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
		if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
		return value.toLocaleString();
	}
</script>

<svelte:head>
	<title>{coin ? `${coin.name} (${coin.symbol})` : 'Loading...'} - Rugplay</title>
</svelte:head>

{#if loading}
	<div class="container mx-auto max-w-7xl p-6">
		<div class="flex h-96 items-center justify-center">
			<div class="text-center">
				<div class="mb-4 text-xl">Loading coin data...</div>
			</div>
		</div>
	</div>
{:else if !coin}
	<div class="container mx-auto max-w-7xl p-6">
		<div class="flex h-96 items-center justify-center">
			<div class="text-center">
				<div class="text-muted-foreground mb-4 text-xl">Coin not found</div>
				<Button onclick={() => goto('/')}>Go Home</Button>
			</div>
		</div>
	</div>
{:else}
	<div class="container mx-auto max-w-7xl p-6">
		<!-- Header Section -->
		<header class="mb-8">
			<div class="mb-4 flex items-start justify-between">
				<div class="flex items-center gap-4">
					<div
						class="bg-muted/50 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border"
					>
						{#if coin.icon}
							<img
								src={getPublicUrl(coin.icon)}
								alt={coin.name}
								class="h-full w-full object-cover"
							/>
						{:else}
							<div
								class="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xl font-bold text-white"
							>
								{coin.symbol.slice(0, 2)}
							</div>
						{/if}
					</div>
					<div>
						<h1 class="text-4xl font-bold">{coin.name}</h1>
						<div class="mt-1 flex items-center gap-2">
							<Badge variant="outline" class="text-lg">*{coin.symbol}</Badge>
							{#if !coin.isListed}
								<Badge variant="destructive">Delisted</Badge>
							{/if}
						</div>
					</div>
				</div>
				<div class="text-right">
					<p class="text-3xl font-bold">
						${formatPrice(coin.currentPrice)}
					</p>
					<div class="mt-2 flex items-center gap-2">
						{#if coin.change24h >= 0}
							<TrendingUp class="h-4 w-4 text-green-500" />
						{:else}
							<TrendingDown class="h-4 w-4 text-red-500" />
						{/if}
						<Badge variant={coin.change24h >= 0 ? 'success' : 'destructive'}>
							{coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
						</Badge>
					</div>
				</div>
			</div>

			<!-- Creator Info -->
			{#if coin.creatorName}
				<div class="text-muted-foreground flex items-center gap-2 text-sm">
					<span>Created by</span>

					<HoverCard.Root>
						<HoverCard.Trigger
							class="flex cursor-pointer items-center gap-2 rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-8"
							onclick={() => goto(`/user/${coin.creatorId}`)}
						>
							<Avatar.Root class="h-4 w-4">
								<Avatar.Image src={creatorImageUrl} alt={coin.creatorName} />
								<Avatar.Fallback>{coin.creatorName.charAt(0)}</Avatar.Fallback>
							</Avatar.Root>
							<span class="font-medium">{coin.creatorName} (@{coin.creatorUsername})</span>
						</HoverCard.Trigger>
						<HoverCard.Content class="w-80" side="bottom" sideOffset={3}>
							<div class="flex justify-between space-x-4">
								<Avatar.Root class="h-14 w-14">
									<Avatar.Image src={creatorImageUrl} alt={coin.creatorName} />
									<Avatar.Fallback>{coin.creatorName.charAt(0)}</Avatar.Fallback>
								</Avatar.Root>
								<div class="flex-1 space-y-1">
									<h4 class="text-sm font-semibold">{coin.creatorName}</h4>
									<p class="text-muted-foreground text-sm">@{coin.creatorUsername}</p>
									{#if coin.creatorBio}
										<p class="text-sm">{coin.creatorBio}</p>
									{/if}
									<div class="flex items-center pt-2">
										<CalendarDays class="mr-2 h-4 w-4 opacity-70" />
										<span class="text-muted-foreground text-xs">
											Joined {new Date(coin.createdAt).toLocaleDateString('en-US', {
												year: 'numeric',
												month: 'long'
											})}
										</span>
									</div>
								</div>
							</div>
						</HoverCard.Content>
					</HoverCard.Root>
				</div>
			{/if}
		</header>

		<div class="grid gap-6">
			<!-- Price Chart with Trading Actions -->
			<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<!-- Chart (2/3 width) -->
				<div class="lg:col-span-2">
					<Card.Root>
						<Card.Header class="pb-4">
							<Card.Title class="flex items-center gap-2">
								<ChartColumn class="h-5 w-5" />
								Price Chart
							</Card.Title>
						</Card.Header>
						<Card.Content class="pt-0">
							<div class="h-[400px] w-full" bind:this={chartContainer}></div>
						</Card.Content>
					</Card.Root>
				</div>

				<!-- Right side - Trading Actions + Liquidity Pool (1/3 width) -->
				<div class="space-y-6 lg:col-span-1">
					<!-- Trading Actions -->
					<Card.Root>
						<Card.Header class="pb-4">
							<Card.Title>Trade {coin.symbol}</Card.Title>
						</Card.Header>
						<Card.Content class="pt-0">
							<div class="space-y-3">
								<Button class="w-full" variant="default" size="lg">
									<TrendingUp class="mr-2 h-4 w-4" />
									Buy {coin.symbol}
								</Button>
								<Button class="w-full" variant="outline" size="lg">
									<TrendingDown class="mr-2 h-4 w-4" />
									Sell {coin.symbol}
								</Button>
							</div>
						</Card.Content>
					</Card.Root>

					<!-- Liquidity Pool -->
					<Card.Root>
						<Card.Header class="pb-4">
							<Card.Title>Liquidity Pool</Card.Title>
						</Card.Header>
						<Card.Content class="pt-0">
							<div class="space-y-4">
								<div>
									<h4 class="mb-3 font-medium">Pool Composition</h4>
									<div class="space-y-2">
										<div class="flex justify-between">
											<span class="text-muted-foreground text-sm">{coin.symbol}:</span>
											<span class="font-mono text-sm">{formatSupply(coin.poolCoinAmount)}</span>
										</div>
										<div class="flex justify-between">
											<span class="text-muted-foreground text-sm">Base Currency:</span>
											<span class="font-mono text-sm"
												>${coin.poolBaseCurrencyAmount.toLocaleString()}</span
											>
										</div>
									</div>
								</div>
								<div>
									<h4 class="mb-3 font-medium">Pool Stats</h4>
									<div class="space-y-2">
										<div class="flex justify-between">
											<span class="text-muted-foreground text-sm">Total Liquidity:</span>
											<span class="font-mono text-sm"
												>${(coin.poolBaseCurrencyAmount * 2).toLocaleString()}</span
											>
										</div>
										<div class="flex justify-between">
											<span class="text-muted-foreground text-sm">Price Impact:</span>
											<Badge variant="success" class="text-xs">Low</Badge>
										</div>
									</div>
								</div>
							</div>
						</Card.Content>
					</Card.Root>
				</div>
			</div>

			<!-- Statistics Grid -->
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				<!-- Market Cap -->
				<Card.Root>
					<Card.Header class="pb-2">
						<Card.Title class="flex items-center gap-2 text-sm font-medium">
							<DollarSign class="h-4 w-4" />
							Market Cap
						</Card.Title>
					</Card.Header>
					<Card.Content class="pt-0">
						<p class="text-xl font-bold">{formatMarketCap(coin.marketCap)}</p>
					</Card.Content>
				</Card.Root>

				<!-- 24h Volume -->
				<Card.Root>
					<Card.Header class="pb-2">
						<Card.Title class="flex items-center gap-2 text-sm font-medium">
							<ChartColumn class="h-4 w-4" />
							24h Volume
						</Card.Title>
					</Card.Header>
					<Card.Content class="pt-0">
						<p class="text-xl font-bold">{formatMarketCap(coin.volume24h)}</p>
					</Card.Content>
				</Card.Root>

				<!-- Circulating Supply -->
				<Card.Root>
					<Card.Header class="pb-2">
						<Card.Title class="flex items-center gap-2 text-sm font-medium">
							<Coins class="h-4 w-4" />
							Circulating Supply
						</Card.Title>
					</Card.Header>
					<Card.Content class="pt-0">
						<p class="text-xl font-bold">{formatSupply(coin.circulatingSupply)}</p>
						<p class="text-muted-foreground text-xs">
							of {formatSupply(coin.initialSupply)} total
						</p>
					</Card.Content>
				</Card.Root>

				<!-- 24h Change -->
				<Card.Root>
					<Card.Header class="pb-2">
						<Card.Title class="text-sm font-medium">24h Change</Card.Title>
					</Card.Header>
					<Card.Content class="pt-0">
						<div class="flex items-center gap-2">
							{#if coin.change24h >= 0}
								<TrendingUp class="h-4 w-4 text-green-500" />
							{:else}
								<TrendingDown class="h-4 w-4 text-red-500" />
							{/if}
							<Badge variant={coin.change24h >= 0 ? 'success' : 'destructive'} class="text-sm">
								{coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
							</Badge>
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	</div>
{/if}
