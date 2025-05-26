<script lang="ts">
	import type { UserProfile } from '$lib/types/user-profile';
	import SilentBadge from './SilentBadge.svelte';
	import { Hash, Hammer, Flame } from 'lucide-svelte';

	let {
		user,
		showId = true,
		size = 'default'
	}: {
		user: UserProfile;
		showId?: boolean;
		size?: 'sm' | 'default';
	} = $props();

	let badgeClass = $derived(size === 'sm' ? 'text-xs' : '');
</script>

<div class="flex items-center gap-1">
	{#if showId}
		<SilentBadge icon={Hash} class="text-muted-foreground {badgeClass}" text="#{user.id} to join" />
	{/if}
	{#if user.loginStreak && user.loginStreak > 1}
		<SilentBadge icon={Flame} text="{user.loginStreak} day streak" class="text-orange-500 {badgeClass}" />
	{/if}
	{#if user.isAdmin}
		<SilentBadge icon={Hammer} text="Admin" class="text-primary {badgeClass}" />
	{/if}
</div>
