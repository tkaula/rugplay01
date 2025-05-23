<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import { TrendingUp, TrendingDown, Loader2 } from 'lucide-svelte';
	import { USER_DATA } from '$lib/stores/user-data';
	import { toast } from 'svelte-sonner';

	let { 
		open = $bindable(false),
		type,
		coin,
		userHolding = 0,
		onSuccess
	} = $props<{
		open?: boolean;
		type: 'BUY' | 'SELL';
		coin: any;
		userHolding?: number;
		onSuccess?: () => void;
	}>();

	let amount = $state('');
	let loading = $state(false);

	let numericAmount = $derived(parseFloat(amount) || 0);
	let estimatedCost = $derived(numericAmount * coin.currentPrice);
	let hasValidAmount = $derived(numericAmount > 0);
	let userBalance = $derived($USER_DATA ? Number($USER_DATA.baseCurrencyBalance) : 0);
	let hasEnoughFunds = $derived(
		type === 'BUY' 
			? estimatedCost <= userBalance
			: numericAmount <= userHolding
	);
	let canTrade = $derived(hasValidAmount && hasEnoughFunds && !loading);

	function handleClose() {
		open = false;
		amount = '';
		loading = false;
	}

	async function handleTrade() {
		if (!canTrade) return;

		loading = true;
		try {
			const response = await fetch(`/api/coin/${coin.symbol}/trade`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					type,
					amount: numericAmount
				})
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.message || 'Trade failed');
			}

			toast.success(`${type === 'BUY' ? 'Bought' : 'Sold'} successfully!`, {
				description: type === 'BUY' 
					? `Purchased ${result.coinsBought.toFixed(2)} ${coin.symbol} for $${result.totalCost.toFixed(2)}`
					: `Sold ${result.coinsSold.toFixed(2)} ${coin.symbol} for $${result.totalReceived.toFixed(2)}`
			});

			onSuccess?.();
			handleClose();
		} catch (e) {
			toast.error('Trade failed', {
				description: (e as Error).message
			});
		} finally {
			loading = false;
		}
	}

	function setMaxAmount() {
		if (type === 'SELL') {
			amount = userHolding.toString();
		} else if ($USER_DATA) {
			const maxCoins = Math.floor(userBalance / coin.currentPrice * 100) / 100;
			amount = maxCoins.toString();
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				{#if type === 'BUY'}
					<TrendingUp class="h-5 w-5 text-green-500" />
					Buy {coin.symbol}
				{:else}
					<TrendingDown class="h-5 w-5 text-red-500" />
					Sell {coin.symbol}
				{/if}
			</Dialog.Title>
			<Dialog.Description>
				Current price: ${coin.currentPrice.toFixed(6)} per {coin.symbol}
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4">
			<!-- Amount Input -->
			<div class="space-y-2">
				<Label for="amount">Amount ({coin.symbol})</Label>
				<div class="flex gap-2">
					<Input
						id="amount"
						type="number"
						step="0.01"
						min="0"
						bind:value={amount}
						placeholder="0.00"
						class="flex-1"
					/>
					<Button variant="outline" size="sm" onclick={setMaxAmount}>
						Max
					</Button>
				</div>
				{#if type === 'SELL'}
					<p class="text-muted-foreground text-xs">
						Available: {userHolding.toFixed(2)} {coin.symbol}
					</p>
				{:else if $USER_DATA}
					<p class="text-muted-foreground text-xs">
						Balance: ${userBalance.toFixed(2)}
					</p>
				{/if}
			</div>

			<!-- Estimated Cost/Return -->
			{#if hasValidAmount}
				<div class="bg-muted/50 rounded-lg p-3">
					<div class="flex justify-between items-center">
						<span class="text-sm font-medium">
							{type === 'BUY' ? 'Total Cost:' : 'You\'ll Receive:'}
						</span>
						<span class="font-bold">
							${estimatedCost.toFixed(2)}
						</span>
					</div>
					{#if !hasEnoughFunds}
						<Badge variant="destructive" class="mt-2 text-xs">
							{type === 'BUY' ? 'Insufficient funds' : 'Insufficient coins'}
						</Badge>
					{/if}
				</div>
			{/if}
		</div>

		<Dialog.Footer class="flex gap-2">
			<Button variant="outline" onclick={handleClose} disabled={loading}>
				Cancel
			</Button>
			<Button 
				onclick={handleTrade} 
				disabled={!canTrade}
				variant={type === 'BUY' ? 'default' : 'destructive'}
			>
				{#if loading}
					<Loader2 class="h-4 w-4 animate-spin" />
					Processing...
				{:else}
					{type === 'BUY' ? 'Buy' : 'Sell'} {coin.symbol}
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
