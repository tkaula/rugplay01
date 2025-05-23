<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as HoverCard from '$lib/components/ui/hover-card';
	import TradeModal from '$lib/components/self/TradeModal.svelte';
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
		CandlestickSeries,
		HistogramSeries
	} from 'lightweight-charts';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import CoinIcon from '$lib/components/self/CoinIcon.svelte';
	import { USER_DATA } from '$lib/stores/user-data';
	import { fetchPortfolioData } from '$lib/stores/portfolio-data';

	const { data } = $props();
	const coinSymbol = data.coinSymbol;

	let coin = $state<any>(null);
	let loading = $state(true);
	let creatorImageUrl = $state<string | null>(null);
	let chartData = $state<any[]>([]);
	let volumeData = $state<any[]>([]);
	let userHolding = $state(0);
	let buyModalOpen = $state(false);
	let sellModalOpen = $state(false);
	let selectedTimeframe = $state('1m');

	onMount(async () => {
		await loadCoinData();
		await loadUserHolding();
	});

	async function loadCoinData() {
		try {
			const response = await fetch(`/api/coin/${coinSymbol}?timeframe=${selectedTimeframe}`);

			if (!response.ok) {
				toast.error(response.status === 404 ? 'Coin not found' : 'Failed to load coin data');
				return;
			}

			const result = await response.json();
			coin = result.coin;
			chartData = result.candlestickData || [];
			volumeData = result.volumeData || [];

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
	}

	async function loadUserHolding() {
		if (!$USER_DATA) return;

		try {
			const response = await fetch('/api/portfolio/total');
			if (response.ok) {
				const result = await response.json();
				const holding = result.coinHoldings.find((h: any) => h.symbol === coinSymbol.toUpperCase());
				userHolding = holding ? holding.quantity : 0;
			}
		} catch (e) {
			console.error('Failed to load user holding:', e);
		}
	}

	async function handleTradeSuccess() {
		await Promise.all([loadCoinData(), loadUserHolding(), fetchPortfolioData()]);
	}

	async function handleTimeframeChange(timeframe: string) {
		selectedTimeframe = timeframe;
		loading = true;

		if (chart) {
			chart.remove();
			chart = null;
		}

		await loadCoinData();
		loading = false;
	}

	function generateVolumeData(candlestickData: any[], volumeData: any[]) {
		return candlestickData.map((candle, index) => {
			// Find corresponding volume data for this time period
			const volumePoint = volumeData.find((v) => v.time === candle.time);
			const volume = volumePoint ? volumePoint.volume : 0;

			return {
				time: candle.time,
				value: volume,
				color: candle.close >= candle.open ? '#26a69a' : '#ef5350'
			};
		});
	}

	let chartContainer = $state<HTMLDivElement>();
	let chart: IChartApi | null = null;

	$effect(() => {
		if (chart && chartData.length > 0) {
			chart.remove();
			chart = null;
		}

		if (chartContainer && chartData.length > 0) {
			chart = createChart(chartContainer, {
				layout: {
					textColor: '#666666',
					background: { type: ColorType.Solid, color: 'transparent' },
					attributionLogo: false,
					panes: {
						separatorColor: '#2B2B43',
						separatorHoverColor: 'rgba(107, 114, 142, 0.3)',
						enableResize: true
					}
				},
				grid: {
					vertLines: { color: '#2B2B43' },
					horzLines: { color: '#2B2B43' }
				},
				rightPriceScale: {
					borderVisible: false,
					scaleMargins: { top: 0.1, bottom: 0.1 },
					alignLabels: true,
					entireTextOnly: false
				},
				timeScale: {
					borderVisible: false,
					timeVisible: true,
					barSpacing: 20,
					rightOffset: 5,
					minBarSpacing: 8
				},
				crosshair: {
					mode: 1,
					vertLine: { color: '#758696', width: 1, style: 2, visible: true, labelVisible: true },
					horzLine: { color: '#758696', width: 1, style: 2, visible: true, labelVisible: true }
				}
			});

			const candlestickSeries = chart.addSeries(CandlestickSeries, {
				upColor: '#26a69a',
				downColor: '#ef5350',
				borderVisible: true,
				borderUpColor: '#26a69a',
				borderDownColor: '#ef5350',
				wickUpColor: '#26a69a',
				wickDownColor: '#ef5350',
				priceFormat: { type: 'price', precision: 8, minMove: 0.00000001 }
			});

			const volumeSeries = chart.addSeries(
				HistogramSeries,
				{
					priceFormat: { type: 'volume' },
					priceScaleId: 'volume'
				},
				1
			);

			const processedChartData = chartData.map((candle) => {
				if (candle.open === candle.close) {
					const basePrice = candle.open;
					const variation = basePrice * 0.001;
					return {
						...candle,
						high: Math.max(candle.high, basePrice + variation),
						low: Math.min(candle.low, basePrice - variation)
					};
				}
				return candle;
			});

			candlestickSeries.setData(processedChartData);
			volumeSeries.setData(generateVolumeData(chartData, volumeData));

			const volumePane = chart.panes()[1];
			if (volumePane) volumePane.setHeight(100);

			chart.timeScale().fitContent();

			const handleResize = () => chart?.applyOptions({ width: chartContainer?.clientWidth });
			window.addEventListener('resize', handleResize);
			handleResize();

			candlestickSeries.priceScale().applyOptions({ borderColor: '#71649C' });
			volumeSeries.priceScale().applyOptions({ borderColor: '#71649C' });
			chart.timeScale().applyOptions({ borderColor: '#71649C' });

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
		if (price < 0.000001) {
			return price.toFixed(8);
		} else if (price < 0.01) {
			return price.toFixed(6);
		} else if (price < 1) {
			return price.toFixed(4);
		} else {
			return price.toFixed(2);
		}
	}

	function formatMarketCap(value: number): string {
		const num = Number(value);
		if (isNaN(num)) return '$0.00';
		if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
		if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
		if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
		return `$${num.toFixed(2)}`;
	}

	function formatSupply(value: number): string {
		const num = Number(value);
		if (isNaN(num)) return '0';
		if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
		if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
		if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
		return num.toLocaleString();
	}
</script>

<svelte:head>
	<title>{coin ? `${coin.name} (${coin.symbol})` : 'Loading...'} - Rugplay</title>
</svelte:head>

{#if coin}
	<TradeModal bind:open={buyModalOpen} type="BUY" {coin} onSuccess={handleTradeSuccess} />
	<TradeModal
		bind:open={sellModalOpen}
		type="SELL"
		{coin}
		{userHolding}
		onSuccess={handleTradeSuccess}
	/>
{/if}

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
					<CoinIcon
						icon={coin.icon}
						symbol={coin.symbol}
						name={coin.name}
						size={16}
						class="border"
					/>
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
							{coin.change24h >= 0 ? '+' : ''}{Number(coin.change24h).toFixed(2)}%
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
							class="flex cursor-pointer items-center gap-1 rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-8"
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
							<div class="flex items-center justify-between">
								<Card.Title class="flex items-center gap-2">
									<ChartColumn class="h-5 w-5" />
									Price Chart ({selectedTimeframe})
								</Card.Title>
								<div class="flex gap-1">
									{#each ['1m', '5m', '15m', '1h', '4h', '1d'] as timeframe}
										<Button
											variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
											size="sm"
											onclick={() => handleTimeframeChange(timeframe)}
											disabled={loading}
										>
											{timeframe}
										</Button>
									{/each}
								</div>
							</div>
						</Card.Header>
						<Card.Content class="pt-0">
							{#if chartData.length === 0}
								<div class="flex h-[500px] items-center justify-center">
									<p class="text-muted-foreground">No trading data available yet</p>
								</div>
							{:else}
								<div class="h-[500px] w-full" bind:this={chartContainer}></div>
							{/if}
						</Card.Content>
					</Card.Root>
				</div>

				<!-- Right side - Trading Actions + Liquidity Pool (1/3 width) -->
				<div class="space-y-6 lg:col-span-1">
					<!-- Trading Actions -->
					<Card.Root>
						<Card.Header class="pb-4">
							<Card.Title>Trade {coin.symbol}</Card.Title>
							{#if userHolding > 0}
								<p class="text-muted-foreground text-sm">
									You own: {formatSupply(userHolding)}
									{coin.symbol}
								</p>
							{/if}
						</Card.Header>
						<Card.Content class="pt-0">
							{#if $USER_DATA}
								<div class="space-y-3">
									<Button
										class="w-full"
										variant="default"
										size="lg"
										onclick={() => (buyModalOpen = true)}
										disabled={!coin.isListed}
									>
										<TrendingUp class="h-4 w-4" />
										Buy {coin.symbol}
									</Button>
									<Button
										class="w-full"
										variant="outline"
										size="lg"
										onclick={() => (sellModalOpen = true)}
										disabled={!coin.isListed || userHolding <= 0}
									>
										<TrendingDown class="h-4 w-4" />
										Sell {coin.symbol}
									</Button>
								</div>
							{:else}
								<div class="py-4 text-center">
									<p class="text-muted-foreground mb-3 text-sm">Sign in to start trading</p>
									<Button onclick={() => goto('/')}>Sign In</Button>
								</div>
							{/if}
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
											<span class="font-mono text-sm">
												${Number(coin.poolBaseCurrencyAmount).toLocaleString()}
											</span>
										</div>
									</div>
								</div>
								<div>
									<h4 class="mb-3 font-medium">Pool Stats</h4>
									<div class="space-y-2">
										<div class="flex justify-between">
											<span class="text-muted-foreground text-sm">Total Liquidity:</span>
											<span class="font-mono text-sm">
												${(Number(coin.poolBaseCurrencyAmount) * 2).toLocaleString()}
											</span>
										</div>
										<div class="flex justify-between">
											<span class="text-muted-foreground text-sm">Current Price:</span>
											<span class="font-mono text-sm">${formatPrice(coin.currentPrice)}</span>
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
								{coin.change24h >= 0 ? '+' : ''}{Number(coin.change24h).toFixed(2)}%
							</Badge>
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	</div>
{/if}
