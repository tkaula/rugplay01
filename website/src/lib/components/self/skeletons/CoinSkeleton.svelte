<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Skeleton } from '$lib/components/ui/skeleton';
</script>

<header class="mb-8">
	<div class="mb-6 flex items-start justify-between">
		<div class="flex items-center gap-4">
			<Skeleton class="h-16 w-16 rounded-lg" />
			<div>
				<Skeleton class="mb-2 h-10 w-48" />
				<div class="mt-1 flex items-center gap-2">
					<Skeleton class="h-6 w-16" />
					<Skeleton class="h-6 w-20" />
				</div>
			</div>
		</div>
		<div class="text-right">
			<Skeleton class="mb-2 h-8 w-32" />
			<div class="mt-2 flex items-center gap-2">
				<Skeleton class="h-4 w-4" />
				<Skeleton class="h-6 w-16" />
			</div>
		</div>
	</div>

	<!-- Creator Info Skeleton -->
	<div class="text-muted-foreground flex items-center gap-2 text-sm">
		<Skeleton class="h-4 w-20" />
		<Skeleton class="h-4 w-4 rounded-full" />
		<Skeleton class="h-4 w-40" />
	</div>
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
							<Skeleton class="h-5 w-5" />
							<Skeleton class="h-6 w-32" />
						</Card.Title>
						<div class="flex gap-1">
							{#each Array(6) as _}
								<Skeleton class="h-8 w-12" />
							{/each}
						</div>
					</div>
				</Card.Header>
				<Card.Content class="pt-0">
					<Skeleton class="h-[500px] w-full" />
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Right side - Trading Actions + Liquidity Pool (1/3 width) -->
		<div class="space-y-6 lg:col-span-1">
			<!-- Trading Actions Skeleton -->
			<Card.Root>
				<Card.Header class="pb-4">
					<Card.Title>
						<Skeleton class="h-6 w-24" />
					</Card.Title>
					<Skeleton class="h-4 w-32" />
				</Card.Header>
				<Card.Content class="pt-0">
					<div class="space-y-3">
						<Skeleton class="h-11 w-full" />
						<Skeleton class="h-11 w-full" />
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Liquidity Pool Skeleton -->
			<Card.Root>
				<Card.Header class="pb-4">
					<Card.Title>
						<Skeleton class="h-6 w-28" />
					</Card.Title>
				</Card.Header>
				<Card.Content class="pt-0">
					<div class="space-y-4">
						<div>
							<Skeleton class="mb-3 h-5 w-32" />
							<div class="space-y-2">
								<div class="flex justify-between">
									<Skeleton class="h-4 w-16" />
									<Skeleton class="h-4 w-20" />
								</div>
								<div class="flex justify-between">
									<Skeleton class="h-4 w-24" />
									<Skeleton class="h-4 w-20" />
								</div>
							</div>
						</div>
						<div>
							<Skeleton class="mb-3 h-5 w-20" />
							<div class="space-y-2">
								<div class="flex justify-between">
									<Skeleton class="h-4 w-24" />
									<Skeleton class="h-4 w-20" />
								</div>
								<div class="flex justify-between">
									<Skeleton class="h-4 w-20" />
									<Skeleton class="h-4 w-20" />
								</div>
							</div>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</div>

	<!-- Statistics Grid Skeleton -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
		{#each Array(4) as _}
			<Card.Root>
				<Card.Header class="pb-2">
					<Card.Title class="flex items-center gap-2 text-sm font-medium">
						<Skeleton class="h-4 w-4" />
						<Skeleton class="h-4 w-20" />
					</Card.Title>
				</Card.Header>
				<Card.Content class="pt-0">
					<Skeleton class="mb-1 h-6 w-24" />
					<Skeleton class="h-3 w-16" />
				</Card.Content>
			</Card.Root>
		{/each}
	</div>

	<!-- Comments Section Skeleton -->
	<Card.Root>
		<Card.Header class="pb-4">
			<Card.Title class="flex items-center gap-2">
				<Skeleton class="h-5 w-5" />
				<Skeleton class="h-6 w-20" />
			</Card.Title>
		</Card.Header>
		<Card.Content class="pt-0">
			<div class="space-y-4">
				{#each Array(3) as _}
					<div class="flex gap-3 border-b pb-4 last:border-b-0">
						<Skeleton class="h-8 w-8 rounded-full" />
						<div class="flex-1">
							<div class="mb-2 flex items-center gap-2">
								<Skeleton class="h-4 w-24" />
								<Skeleton class="h-3 w-16" />
							</div>
							<Skeleton class="h-4 w-full" />
							<Skeleton class="mt-1 h-4 w-3/4" />
						</div>
					</div>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>
</div>
