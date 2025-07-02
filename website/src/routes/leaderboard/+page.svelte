<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import DataTable from '$lib/components/self/DataTable.svelte';
	import LeaderboardSkeleton from '$lib/components/self/skeletons/LeaderboardSkeleton.svelte';
	import SEO from '$lib/components/self/SEO.svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { TrendingDown, Crown, Skull, Target, RefreshCw, Trophy, Search, SearchX, X } from 'lucide-svelte';
	import { formatValue } from '$lib/utils';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as HoverCard from '$lib/components/ui/hover-card';
	import * as Avatar from '$lib/components/ui/avatar';
	import { getPublicUrl } from '$lib/utils';
	import UserProfilePreview from '$lib/components/self/UserProfilePreview.svelte';

	let searchQuery = $state('');
	let searchQueryValue = $state('');
	let searchQueryTimeout = $state<NodeJS.Timeout | null>(null);
	let leaderboardData = $state<any>(null);
	let loading = $state(true);

	onMount(async () => {
		const urlParams = new URLSearchParams(window.location.search);
		const search = urlParams.get('search');

		searchQuery = search || '';
		searchQueryValue = search || '';

		await fetchLeaderboardData();
	});

	function handleSearchKeydown(event: KeyboardEvent) {
		if (searchQueryTimeout) {
			clearTimeout(searchQueryTimeout);
		}

		searchQueryTimeout = setTimeout(() => {
			searchQueryValue = searchQuery;
			fetchLeaderboardData();
		}, 500);
		
		if (event.key === 'Enter') {
			clearTimeout(searchQueryTimeout);
			searchQueryValue = searchQuery;
			fetchLeaderboardData();
		}
	}

	async function fetchLeaderboardData() {
		loading = true;
		try {
			const response = await fetch(`/api/leaderboard?search=${searchQueryValue}`);
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

	const searchColumns = [
		{
			key: 'user',
			label: 'User',
			render: (value: any, row: any) => ({
				component: 'user',
				image: row.image,
				name: row.name,
				username: row.username
			})
		}
	]

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

<SEO
	title="Leaderboard - Rugplay"
	description="View top performers in the Rugplay cryptocurrency simulation game. See rankings for biggest profits, losses, cash holders, and portfolio values in our virtual trading game."
	keywords="crypto game leaderboard, trading simulation rankings, virtual portfolio rankings, crypto game winners"
/>

<div class="container mx-auto max-w-7xl p-4 md:p-6">
	<header class="mb-6 md:mb-8">
		<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h1 class="text-2xl font-bold md:text-3xl">Leaderboard</h1>
				<p class="text-muted-foreground text-sm md:text-base">Top performers and market activity</p>
			</div>
			<div class="flex items-center gap-4">
				<div class="flex items-center relative">
					<Search size={16} class="absolute left-3 pointer-events-none"></Search>
					<Input type="text" placeholder="Search" class="pl-10" bind:value={searchQuery} onkeydown={handleSearchKeydown} />
				</div>
				{#if searchQueryValue}
					<Button variant="outline" onclick={() => {
						searchQuery = '';
						searchQueryValue = '';
						fetchLeaderboardData();
					}} disabled={loading} class="w-fit">
						<X class="h-4 w-4" />
					</Button>
				{/if}
				<Button variant="outline" onclick={fetchLeaderboardData} disabled={loading} class="w-fit">
					<RefreshCw class="h-4 w-4" />
				</Button>
			</div>
		</div>
	</header>

	{#if loading}
		<LeaderboardSkeleton />
	{:else if !leaderboardData}
		<div class="flex h-96 items-center justify-center">
			<div class="text-center">
				<div class="text-muted-foreground mb-4 text-lg md:text-xl">Failed to load leaderboard</div>
				<Button onclick={fetchLeaderboardData}>Try Again</Button>
			</div>
		</div>
	{:else}
		<div class="grid gap-4 md:gap-6 xl:grid-cols-2">
			{#if searchQueryValue}
				{#if leaderboardData.results.length > 0}
				<div class="flex flex-col xl:col-span-2">
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{#each leaderboardData.results as user}
							<div class="flex flex-col bg-muted rounded-md border border-border hover:bg-muted/50 transition ease duration-200">
								<a href={`/user/${user.username}`}>
									<UserProfilePreview userId={user.userId}/>
								</a>
							</div>
						{/each}
					</div>
				</div>
				{:else}
					<div class="flex flex-col xl:col-span-2 items-center justify-center h-60">
						<h2 class="mb-4 text-xl">No users found</h2>
						<p class="text-muted-foreground text-sm md:text-base mb-4">No users match your search "{searchQueryValue}"</p>
						<Button variant="outline" onclick={() => {
							searchQuery = '';
							searchQueryValue = '';
							fetchLeaderboardData();
						}}>
							<h2 class="text-sm">Clear search</h2>
						</Button>
					</div>
				{/if}
			{:else}
				<!-- Top Profit Makers -->
				<Card.Root class="overflow-hidden">
					<Card.Header class="pb-3 md:pb-4">
						<Card.Title class="flex items-center gap-2 text-lg text-red-600 md:text-xl">
							<Skull class="h-5 w-5 md:h-6 md:w-6" />
							<span class="truncate">Top Rugpullers (24h)</span>
						</Card.Title>
						<Card.Description class="text-xs md:text-sm">
							Users who made the most profit from selling coins today
						</Card.Description>
					</Card.Header>
					<Card.Content class="p-3 pt-0 md:p-6 md:pt-0">
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
				<Card.Root class="overflow-hidden">
					<Card.Header class="pb-3 md:pb-4">
						<Card.Title class="flex items-center gap-2 text-lg text-orange-600 md:text-xl">
							<TrendingDown class="h-5 w-5 md:h-6 md:w-6" />
							<span class="truncate">Biggest Losses (24h)</span>
						</Card.Title>
						<Card.Description class="text-xs md:text-sm"
							>Users who experienced the largest losses today</Card.Description
						>
					</Card.Header>
					<Card.Content class="p-3 pt-0 md:p-6 md:pt-0">
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
				<Card.Root class="overflow-hidden">
					<Card.Header class="pb-3 md:pb-4">
						<Card.Title class="flex items-center gap-2 text-lg text-green-600 md:text-xl">
							<Crown class="h-5 w-5 md:h-6 md:w-6" />
							<span class="truncate">Top Cash Holders</span>
						</Card.Title>
						<Card.Description class="text-xs md:text-sm"
							>Users with the highest liquid cash balances</Card.Description
						>
					</Card.Header>
					<Card.Content class="p-3 pt-0 md:p-6 md:pt-0">
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
				<Card.Root class="overflow-hidden">
					<Card.Header class="pb-3 md:pb-4">
						<Card.Title class="flex items-center gap-2 text-lg text-cyan-600 md:text-xl">
							<Trophy class="h-5 w-5 md:h-6 md:w-6" />
							<span class="truncate">Highest Portfolio Values</span>
						</Card.Title>
						<Card.Description class="text-xs md:text-sm"
							>Users with the largest total portfolio valuations (including illiquid)</Card.Description
						>
					</Card.Header>
					<Card.Content class="p-3 pt-0 md:p-6 md:pt-0">
						<DataTable
							columns={millionairesColumns}
							data={leaderboardData.paperMillionaires}
							onRowClick={(user) => goto(`/user/${user.userUsername || user.username}`)}
							emptyMessage="No large portfolios yet! 📉"
							enableUserPreview={true}
						/>
					</Card.Content>
				</Card.Root>
			{/if}
		</div>
	{/if}
</div>
