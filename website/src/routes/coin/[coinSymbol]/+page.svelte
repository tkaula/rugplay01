<script lang="ts">
	import { page } from '$app/stores';
	import { coins } from '$lib/data/coins';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { createChart, CandlestickSeries, type Time, ColorType } from 'lightweight-charts';
	import { onMount } from 'svelte';

	const coin = coins.find((c) => c.symbol === $page.params.coinSymbol);

	// Generate mock candlestick data
	const candleData = Array.from({ length: 30 }, (_, i) => {
		const basePrice = coin?.price || 100;
		const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
		const open = basePrice * (1 + Math.sin(i / 5) * 0.1);
		const close = basePrice * (1 + Math.sin((i + 1) / 5) * 0.1);
		const high = Math.max(open, close) * (1 + Math.random() * 0.02);
		const low = Math.min(open, close) * (1 - Math.random() * 0.02);

		return {
			time: Math.floor(date.getTime() / 1000) as Time,
			open,
			high,
			low,
			close
		};
	});

	let chartContainer: HTMLDivElement;

	onMount(() => {
		const chart = createChart(chartContainer, {
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

		const candlesticks = chart.addSeries(CandlestickSeries, {
			upColor: '#26a69a',
			downColor: '#ef5350',
			borderVisible: false,
			wickUpColor: '#26a69a',
			wickDownColor: '#ef5350'
		});

		candlesticks.setData(candleData);
		chart.timeScale().fitContent();

		const handleResize = () => {
			chart.applyOptions({
				width: chartContainer.clientWidth
			});
		};

		window.addEventListener('resize', handleResize);
		handleResize();

		return () => {
			window.removeEventListener('resize', handleResize);
			chart.remove();
		};
	});
</script>

<div class="container mx-auto p-6">
	{#if coin}
		<header class="mb-8">
			<div class="flex items-center justify-between">
				<h1 class="text-4xl font-bold">{coin.name} ({coin.symbol})</h1>
				<Badge variant={coin.change24h >= 0 ? 'success' : 'destructive'} class="text-lg">
					{coin.change24h >= 0 ? '+' : ''}{coin.change24h}%
				</Badge>
			</div>
			<p class="mt-4 text-3xl font-semibold">
				${coin.price.toLocaleString(undefined, {
					minimumFractionDigits: coin.price < 1 ? 3 : 2,
					maximumFractionDigits: coin.price < 1 ? 3 : 2
				})}
			</p>
		</header>

		<div class="grid gap-6">
			<Card.Root>
				<Card.Header>
					<Card.Title>Price Chart</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="h-[400px] w-full" bind:this={chartContainer}></div>
				</Card.Content>
			</Card.Root>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
				<Card.Root>
					<Card.Header>
						<Card.Title>Market Cap</Card.Title>
					</Card.Header>
					<Card.Content>
						<p class="text-2xl font-semibold">${(coin.marketCap / 1000000000).toFixed(2)}B</p>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header>
						<Card.Title>24h Volume</Card.Title>
					</Card.Header>
					<Card.Content>
						<p class="text-2xl font-semibold">${(coin.volume24h / 1000000000).toFixed(2)}B</p>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header>
						<Card.Title>24h Change</Card.Title>
					</Card.Header>
					<Card.Content>
						<p class="text-2xl font-semibold">
							<Badge variant={coin.change24h >= 0 ? 'success' : 'destructive'} class="text-lg">
								{coin.change24h >= 0 ? '+' : ''}{coin.change24h}%
							</Badge>
						</p>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	{:else}
		<p>Coin not found</p>
	{/if}
</div>
