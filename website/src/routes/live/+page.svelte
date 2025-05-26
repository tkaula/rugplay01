<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as HoverCard from '$lib/components/ui/hover-card';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Activity, TrendingUp, TrendingDown, Clock } from 'lucide-svelte';
	import { allTradesStore, isLoadingTrades } from '$lib/stores/websocket';
	import { goto } from '$app/navigation';
	import { formatQuantity, formatRelativeTime, formatValue, getPublicUrl } from '$lib/utils';
	import CoinIcon from '$lib/components/self/CoinIcon.svelte';
	import UserProfilePreview from '$lib/components/self/UserProfilePreview.svelte';

	function handleUserClick(username: string) {
		goto(`/user/${username}`);
	}

	function handleCoinClick(coinSymbol: string) {
		goto(`/coin/${coinSymbol.toLowerCase()}`);
	}
</script>

<svelte:head>
	<title>Live Trades - Rugplay</title>
	<meta name="description" content="Real-time cryptocurrency trading activity on Rugplay" />
</svelte:head>

<div class="container mx-auto max-w-7xl p-6">
	<header class="mb-8">
		<div>
			<h1 class="text-3xl font-bold">Live Trades</h1>
			<p class="text-muted-foreground">Real-time trading activity for all trades</p>
		</div>
	</header>

	<Card>
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<Activity class="h-5 w-5" />
				Stream
				{#if $allTradesStore.length > 0}
					<Badge variant="secondary" class="ml-auto">
						{$allTradesStore.length} trade{$allTradesStore.length !== 1 ? 's' : ''}
					</Badge>
				{/if}
			</CardTitle>
		</CardHeader>
		<CardContent>
			{#if $isLoadingTrades}
				<div class="space-y-3">
					{#each Array(8) as _, i}
						<div class="flex items-center justify-between rounded-lg border p-4">
							<div class="flex items-center gap-4">
								<div class="flex items-center gap-2">
									<Skeleton class="h-8 w-8 rounded-full" />
									<Skeleton class="h-6 w-12" />
								</div>

								<div class="flex flex-col gap-2">
									<div class="flex items-center gap-2">
										<Skeleton class="h-6 w-6 rounded-full" />
										<Skeleton class="h-4 w-24" />
										<Skeleton class="h-4 w-16" />
										<Skeleton class="h-5 w-5 rounded-full" />
										<Skeleton class="h-4 w-20" />
									</div>
									<Skeleton class="h-3 w-32" />
								</div>
							</div>

							<div class="flex items-center gap-2">
								<Skeleton class="h-4 w-4" />
								<Skeleton class="h-4 w-16" />
							</div>
						</div>
					{/each}
				</div>
			{:else if $allTradesStore.length === 0}
				<div class="flex flex-col items-center justify-center py-16 text-center">
					<Activity class="text-muted-foreground/50 mb-4 h-16 w-16" />
					<h3 class="mb-2 text-lg font-semibold">Waiting for trades...</h3>
					<p class="text-muted-foreground">All trades will appear here in real-time.</p>
				</div>
			{:else}
				<div class="space-y-3">
					{#each $allTradesStore as trade (trade.timestamp)}
						<div
							class="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
						>
							<div class="flex items-center gap-4">
								<div class="flex items-center gap-2">
									{#if trade.type === 'BUY'}
										<div
											class="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10"
										>
											<TrendingUp class="h-4 w-4 text-green-500" />
										</div>
										<Badge variant="outline" class="border-green-500 text-green-500">BUY</Badge>
									{:else}
										<div
											class="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10"
										>
											<TrendingDown class="h-4 w-4 text-red-500" />
										</div>
										<Badge variant="outline" class="border-red-500 text-red-500">SELL</Badge>
									{/if}
								</div>

								<div class="flex flex-col">
									<div class="flex items-center gap-2">
										<button
											onclick={() => handleCoinClick(trade.coinSymbol)}
											class="flex cursor-pointer items-center gap-2 transition-opacity hover:underline hover:opacity-80"
										>
											<CoinIcon
												icon={trade.coinIcon}
												symbol={trade.coinSymbol}
												name={trade.coinName || trade.coinSymbol}
												size={6}
											/>
											<span class="font-mono font-medium">
												{formatQuantity(trade.amount)} *{trade.coinSymbol}
											</span>
										</button>
										<span class="text-muted-foreground">
											{trade.type === 'BUY' ? 'bought by' : 'sold by'}
										</span>
										<HoverCard.Root>
											<HoverCard.Trigger
												class="cursor-pointer font-medium underline-offset-4 hover:underline"
												onclick={() => handleUserClick(trade.username)}
											>
												<div class="flex items-center gap-1">
													<Avatar.Root class="h-5 w-5">
														<Avatar.Image
															src={getPublicUrl(trade.userImage ?? null)}
															alt={trade.username}
														/>
														<Avatar.Fallback class="text-xs"
															>{trade.username.charAt(0).toUpperCase()}</Avatar.Fallback
														>
													</Avatar.Root>
													<span>@{trade.username}</span>
												</div>
											</HoverCard.Trigger>
											<HoverCard.Content class="w-80" side="top" sideOffset={3}>
												<UserProfilePreview userId={parseInt(trade.userId)} />
											</HoverCard.Content>
										</HoverCard.Root>
									</div>
									<div class="text-muted-foreground text-sm">
										Trade value: {formatValue(trade.totalValue)}
									</div>
								</div>
							</div>

							<div class="text-muted-foreground flex items-center gap-2 text-sm">
								<Clock class="h-4 w-4" />
								<span class="font-mono">{formatRelativeTime(new Date(trade.timestamp))}</span>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</CardContent>
	</Card>
</div>
