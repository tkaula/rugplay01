<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
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
					{#if leaderboardData.topRugpullers.length === 0}
						<div class="py-8 text-center">
							<p class="text-muted-foreground">No major profits recorded today</p>
						</div>
					{:else}
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>Rank</Table.Head>
									<Table.Head>User</Table.Head>
									<Table.Head>Profit</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each leaderboardData.topRugpullers as user, index}
									{@const rankInfo = getRankIcon(index)}
									<Table.Row
										class="hover:bg-muted/50 cursor-pointer transition-colors"
										onclick={() => goto(`/user/${user.userId}`)}
									>
										<Table.Cell>
											<div class="flex items-center gap-2">
												<rankInfo.icon class="h-4 w-4 {rankInfo.color}" />
												<span class="font-mono text-sm">#{index + 1}</span>
											</div>
										</Table.Cell>
										<Table.Cell>
											<div class="flex items-center gap-2">
												<Avatar.Root class="h-6 w-6">
													<Avatar.Image src={getPublicUrl(user.image)} alt={user.name} />
													<Avatar.Fallback class="bg-muted text-muted-foreground text-xs"
														>{user.name?.charAt(0) || '?'}</Avatar.Fallback
													>
												</Avatar.Root>
												<div>
													<p class="text-sm font-medium">{user.name}</p>
													<p class="text-muted-foreground text-xs">@{user.username}</p>
												</div>
											</div>
										</Table.Cell>
										<Table.Cell class="text-success font-mono text-sm font-bold">
											{formatValue(user.totalExtracted)}
										</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					{/if}
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
					{#if leaderboardData.biggestLosers.length === 0}
						<div class="py-8 text-center">
							<p class="text-muted-foreground">
								Everyone's in profit today! 📈 (This won't last...)
							</p>
						</div>
					{:else}
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>Rank</Table.Head>
									<Table.Head>User</Table.Head>
									<Table.Head>Loss</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each leaderboardData.biggestLosers as user, index}
									{@const rankInfo = getRankIcon(index)}
									<Table.Row
										class="hover:bg-muted/50 cursor-pointer transition-colors"
										onclick={() => goto(`/user/${user.userId}`)}
									>
										<Table.Cell>
											<div class="flex items-center gap-2">
												<rankInfo.icon class="h-4 w-4 {rankInfo.color}" />
												<span class="font-mono text-sm">#{index + 1}</span>
											</div>
										</Table.Cell>
										<Table.Cell>
											<div class="flex items-center gap-2">
												<Avatar.Root class="h-6 w-6">
													<Avatar.Image src={getPublicUrl(user.image)} alt={user.name} />
													<Avatar.Fallback class="bg-muted text-muted-foreground text-xs"
														>{user.name?.charAt(0) || '?'}</Avatar.Fallback
													>
												</Avatar.Root>
												<div>
													<p class="text-sm font-medium">{user.name}</p>
													<p class="text-muted-foreground text-xs">@{user.username}</p>
												</div>
											</div>
										</Table.Cell>
										<Table.Cell class="text-destructive font-mono text-sm font-bold">
											-{formatValue(user.totalLoss)}
										</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					{/if}
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
					{#if leaderboardData.cashKings.length === 0}
						<div class="py-8 text-center">
							<p class="text-muted-foreground">Everyone's invested! 💸</p>
						</div>
					{:else}
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>Rank</Table.Head>
									<Table.Head>User</Table.Head>
									<Table.Head>Cash</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each leaderboardData.cashKings as user, index}
									{@const rankInfo = getRankIcon(index)}
									<Table.Row
										class="hover:bg-muted/50 cursor-pointer transition-colors"
										onclick={() => goto(`/user/${user.userId}`)}
									>
										<Table.Cell>
											<div class="flex items-center gap-2">
												<rankInfo.icon class="h-4 w-4 {rankInfo.color}" />
												<span class="font-mono text-sm">#{index + 1}</span>
											</div>
										</Table.Cell>
										<Table.Cell>
											<div class="flex items-center gap-2">
												<Avatar.Root class="h-6 w-6">
													<Avatar.Image src={getPublicUrl(user.image)} alt={user.name} />
													<Avatar.Fallback class="bg-muted text-muted-foreground text-xs"
														>{user.name?.charAt(0) || '?'}</Avatar.Fallback
													>
												</Avatar.Root>
												<div>
													<p class="text-sm font-medium">{user.name}</p>
													<p class="text-muted-foreground text-xs">@{user.username}</p>
												</div>
											</div>
										</Table.Cell>
										<Table.Cell class="text-success font-mono text-sm font-bold">
											{formatValue(user.baseCurrencyBalance)}
										</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					{/if}
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
					{#if leaderboardData.paperMillionaires.length === 0}
						<div class="py-8 text-center">
							<p class="text-muted-foreground">No large portfolios yet! 📉</p>
						</div>
					{:else}
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>Rank</Table.Head>
									<Table.Head>User</Table.Head>
									<Table.Head>Portfolio</Table.Head>
									<Table.Head>Liquidity</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each leaderboardData.paperMillionaires as user, index}
									{@const rankInfo = getRankIcon(index)}
									{@const liquidityInfo = getLiquidityWarning(user.liquidityRatio)}
									<Table.Row
										class="hover:bg-muted/50 cursor-pointer transition-colors"
										onclick={() => goto(`/user/${user.userId}`)}
									>
										<Table.Cell>
											<div class="flex items-center gap-2">
												<rankInfo.icon class="h-4 w-4 {rankInfo.color}" />
												<span class="font-mono text-sm">#{index + 1}</span>
											</div>
										</Table.Cell>
										<Table.Cell>
											<div class="flex items-center gap-2">
												<Avatar.Root class="h-6 w-6">
													<Avatar.Image src={getPublicUrl(user.image)} alt={user.name} />
													<Avatar.Fallback class="bg-muted text-muted-foreground text-xs"
														>{user.name?.charAt(0) || '?'}</Avatar.Fallback
													>
												</Avatar.Root>
												<div>
													<p class="text-sm font-medium">{user.name}</p>
													<p class="text-muted-foreground text-xs">@{user.username}</p>
												</div>
											</div>
										</Table.Cell>
										<Table.Cell class="text-success font-mono text-sm font-bold">
											{formatValue(user.totalPortfolioValue)}
										</Table.Cell>
										<Table.Cell>
											<Badge variant="secondary" class="text-xs {liquidityInfo.color}">
												{liquidityInfo.text}
											</Badge>
										</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					{/if}
				</Card.Content>
			</Card.Root>
		</div>
	{/if}
</div>
