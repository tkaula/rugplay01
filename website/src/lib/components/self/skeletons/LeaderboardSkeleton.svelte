<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Skeleton } from '$lib/components/ui/skeleton';
</script>

<div class="grid gap-6 lg:grid-cols-2">
	{#each Array(4) as _}
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<Skeleton class="h-6 w-6" />
					<Skeleton class="h-6 w-40" />
				</Card.Title>
				<Card.Description>
					<Skeleton class="h-4 w-64" />
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="space-y-4">
					{#each Array(5) as _}
						<div class="flex items-center gap-4 border-b pb-4 last:border-b-0">
							<Skeleton class="h-6 w-8" />
							<Skeleton class="h-8 w-8 rounded-full" />
							<div class="flex-1">
								<Skeleton class="h-4 w-24" />
								<Skeleton class="mt-1 h-3 w-16" />
							</div>
							<Skeleton class="h-4 w-20" />
							<Skeleton class="h-5 w-16" />
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	{/each}
</div>
