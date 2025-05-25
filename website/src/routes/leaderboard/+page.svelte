<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import DataTable from '$lib/components/self/DataTable.svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { Trophy, TrendingDown, Crown, Skull, Target, RefreshCw } from 'lucide-svelte';
	import { getPublicUrl, formatValue } from '$lib/utils';

	let leaderboardData = $state<any>(null);
	let loading = $state(true);

	onMount(async () => {
		await fetchLeaderboardData();
	});

	async function fetchLeaderboardData() {
		loading = true;
		try {
			const response = await fetch('/api/leaderboard');
			if (response.ok) {
				leaderboardData = await response.json();
			} else {
				toast.error('Failed to load leaderboard data');
			}
		} catch (e) {
			console.error('Failed to fetch leaderboard data:', e);
			toast.error('Failed to load leaderboard data');
		} finally {
			loading = false;
		}
	}

	function getRankIcon(index: number) {
		switch (index) {
			case 0:
				return { icon: Crown, color: 'text-yellow-500' };
			case 1:
				return { icon: Trophy, color: 'text-gray-400' };
			case 2:
				return { icon: Trophy, color: 'text-orange-600' };
			default:
				return { icon: Target, color: 'text-muted-foreground' };
		}
	}

	function getLiquidityWarning(liquidityRatio: number) {
		if (liquidityRatio < 0.1) return { text: '90%+ illiquid', color: 'text-destructive' };
		if (liquidityRatio < 0.3) return { text: '70%+ illiquid', color: 'text-orange-600' };
		if (liquidityRatio < 0.5) return { text: '50%+ illiquid', color: 'text-yellow-600' };
		return { text: 'Mostly liquid', color: 'text-success' };
	}

	const rugpullersColumns = [
		{
			key: 'rank',
			label: 'Rank',
			render: (value: any, row: any, index: number) => {
				const rankInfo = getRankIcon(index);
				return {
					component: 'rank',
					icon: rankInfo.icon,
					color: rankInfo.color,
					number: index + 1
				};
			}
		},
		{
			key: 'user',
			label: 'User',
			render: (value: any, row: any) => ({
				component: 'user',
				image: row.image,
				name: row.name,
				username: row.username
			})
		},
		{
			key: 'totalExtracted',
			label: 'Profit',
			class: 'text-success font-mono text-sm font-bold',
			render: (value: any) => formatValue(value)
		}
	];

	const losersColumns = [
		{
			key: 'rank',
			label: 'Rank',
			render: (value: any, row: any, index: number) => {
				const rankInfo = getRankIcon(index);
				return {
					component: 'rank',
					icon: rankInfo.icon,
					color: rankInfo.color,
					number: index + 1
				};
			}
		},
		{
			key: 'user',
			label: 'User',
			render: (value: any, row: any) => ({
				component: 'user',
				image: row.image,
				name: row.name,
				username: row.username
			})
		},
		{
			key: 'totalLoss',
			label: 'Loss',
			class: 'text-destructive font-mono text-sm font-bold',
			render: (value: any) => `-${formatValue(value)}`
		}
	];

	const cashKingsColumns = [
		{
			key: 'rank',
			label: 'Rank',
			render: (value: any, row: any, index: number) => {
				const rankInfo = getRankIcon(index);
				return {
					component: 'rank',
					icon: rankInfo.icon,
					color: rankInfo.color,
					number: index + 1
				};
			}
		},
		{
			key: 'user',
			label: 'User',
			render: (value: any, row: any) => ({
				component: 'user',
				image: row.image,
				name: row.name,
				username: row.username
			})
		},
		{
			key: 'baseCurrencyBalance',
			label: 'Cash',
			class: 'text-success font-mono text-sm font-bold',
			render: (value: any) => formatValue(value)
		}
	];

	const millionairesColumns = [
		{
			key: 'rank',
			label: 'Rank',
			render: (value: any, row: any, index: number) => {
				const rankInfo = getRankIcon(index);
				return {
					component: 'rank',
					icon: rankInfo.icon,
					color: rankInfo.color,
					number: index + 1
				};
			}
		},
		{
			key: 'user',
			label: 'User',
			render: (value: any, row: any) => ({
				component: 'user',
				image: row.image,
				name: row.name,
				username: row.username
			})
		},
		{
			key: 'totalPortfolioValue',
			label: 'Portfolio',
			class: 'text-success font-mono text-sm font-bold',
			render: (value: any) => formatValue(value)
		},
		{
			key: 'liquidityRatio',
			label: 'Liquidity',
			render: (value: any) => {
				const info = getLiquidityWarning(value);
				return {
					component: 'badge',
					variant: 'secondary',
					class: `text-xs ${info.color}`,
					text: info.text
				};
			}
		}
	];
</script>

<svelte:head>
	<title>Leaderboard - Rugplay</title>
</svelte:head>

<div class="container mx-auto max-w-7xl p-6">
	<header class="mb-8">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold">Leaderboard</h1>
				<p class="text-muted-foreground">Top performers and market activity</p>
			</div>
			<Button variant="outline" onclick={fetchLeaderboardData} disabled={loading}>
				<RefreshCw class="h-4 w-4" />
				Refresh
			</Button>
		</div>
	</header>

	{#if loading}
		<div class="flex h-96 items-center justify-center">
			<div class="text-center">
				<div class="mb-4 text-xl">Loading leaderboard...</div>
			</div>
		</div>
	{:else if !leaderboardData}
		<div class="flex h-96 items-center justify-center">
			<div class="text-center">
				<div class="text-muted-foreground mb-4 text-xl">Failed to load leaderboard</div>
				<Button onclick={fetchLeaderboardData}>Try Again</Button>
			</div>
		</div>
	{:else}
		<div class="grid gap-6 lg:grid-cols-2">
			<!-- Top Profit Makers -->
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2 text-red-600">
						<Skull class="h-6 w-6" />
						Top Rugpullers (24h)
					</Card.Title>
					<Card.Description>
						Users who made the most profit from selling coins today
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<DataTable
						columns={rugpullersColumns}
						data={leaderboardData.topRugpullers}
						onRowClick={(user) => goto(`/user/${user.userUsername || user.username}`)}
						emptyMessage="No major profits recorded today"
						enableUserPreview={true}
					/>
				</Card.Content>
			</Card.Root>

			<!-- Biggest Losses -->
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2 text-orange-600">
						<TrendingDown class="h-6 w-6" />
						Biggest Losses (24h)
					</Card.Title>
					<Card.Description>Users who experienced the largest losses today</Card.Description>
				</Card.Header>
				<Card.Content>
					<DataTable
						columns={losersColumns}
						data={leaderboardData.biggestLosers}
						onRowClick={(user) => goto(`/user/${user.userUsername || user.username}`)}
						emptyMessage="No major losses recorded today"
						enableUserPreview={true}
					/>
				</Card.Content>
			</Card.Root>

			<!-- Top Cash Holders -->
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2 text-green-600">
						<Crown class="h-6 w-6" />
						Top Cash Holders
					</Card.Title>
					<Card.Description>Users with the highest liquid cash balances</Card.Description>
				</Card.Header>
				<Card.Content>
					<DataTable
						columns={cashKingsColumns}
						data={leaderboardData.cashKings}
						onRowClick={(user) => goto(`/user/${user.userUsername || user.username}`)}
						emptyMessage="Everyone's invested! 💸"
						enableUserPreview={true}
					/>
				</Card.Content>
			</Card.Root>

			<!-- Top Portfolio Values -->
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2 text-cyan-600">
						<Trophy class="h-6 w-6" />
						Highest Portfolio Values
					</Card.Title>
					<Card.Description
						>Users with the largest total portfolio valuations (including illiquid)</Card.Description
					>
				</Card.Header>
				<Card.Content>
					<DataTable
						columns={millionairesColumns}
						data={leaderboardData.paperMillionaires}
						onRowClick={(user) => goto(`/user/${user.userUsername || user.username}`)}
						emptyMessage="No large portfolios yet! 📉"
						enableUserPreview={true}
					/>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}
</div>
