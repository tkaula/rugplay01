<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Moon,
		Sun,
		ShieldAlert,
		Home,
		Store,
		BriefcaseBusiness,
		Coins,
		ChevronsUpDownIcon,
		SparklesIcon,
		BadgeCheckIcon,
		CreditCardIcon,
		BellIcon,
		LogOutIcon,
		Wallet
	} from 'lucide-svelte';
	import { mode, setMode } from 'mode-watcher';
	import type { HTMLAttributes } from 'svelte/elements';
	import { USER_DATA } from '$lib/stores/user-data';
	import { PORTFOLIO_DATA, fetchPortfolioData } from '$lib/stores/portfolio-data';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';

	import SignInConfirmDialog from './SignInConfirmDialog.svelte';
	import { signOut } from '$lib/auth-client';
	import { getPublicUrl } from '$lib/utils';
	import { goto } from '$app/navigation';

	const data = {
		navMain: [
			{ title: 'Home', url: '/', icon: Home },
			{ title: 'Market', url: '/market', icon: Store },
			{ title: 'Portfolio', url: '/portfolio', icon: BriefcaseBusiness },
			{ title: 'Create coin', url: '/coin/create', icon: Coins }
		],
		navAdmin: [{ title: 'Admin', url: '/admin', icon: ShieldAlert }]
	};
	type MenuButtonProps = HTMLAttributes<HTMLAnchorElement | HTMLButtonElement>;

	const { setOpenMobile, isMobile } = useSidebar();
	let shouldSignIn = $state(false);

	// Fetch portfolio data when user is authenticated
	$effect(() => {
		if ($USER_DATA) {
			fetchPortfolioData();
		} else {
			PORTFOLIO_DATA.set(null);
		}
	});

	function handleNavClick(title: string) {
		setOpenMobile(false);
	}

	function handleModeToggle() {
		setMode(mode.current === 'light' ? 'dark' : 'light');
		setOpenMobile(false);
	}

	function formatCurrency(value: number): string {
		return value.toLocaleString('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
	}
</script>

<SignInConfirmDialog bind:open={shouldSignIn} />
<Sidebar.Root collapsible="offcanvas">
	<Sidebar.Header>
		<div class="flex items-center gap-1 px-2 py-2">
			<img src="/placeholder_logo.png" class="h-5 w-5" alt="twoblade" />
			<div class="flex items-center gap-2">
				<span class="text-base font-semibold">Rugplay</span>
				{#if $USER_DATA?.isAdmin}
					<span class="text-muted-foreground text-xs">| Admin</span>
				{/if}
			</div>
		</div>
	</Sidebar.Header>

	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each data.navMain as item}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton>
								{#snippet child({ props }: { props: MenuButtonProps })}
									<a
										href={item.url || '/'}
										onclick={() => handleNavClick(item.title)}
										class={`${props.class}`}
									>
										<item.icon />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}

					{#if $USER_DATA?.isAdmin}
						{#each data.navAdmin as item}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton>
									{#snippet child({ props }: { props: MenuButtonProps })}
										<a
											href={item.url}
											onclick={() => handleNavClick(item.title)}
											class={`${props.class}`}
										>
											<item.icon />
											<span>{item.title}</span>
										</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					{/if}

					<Sidebar.MenuItem>
						<Sidebar.MenuButton>
							{#snippet child({ props }: { props: MenuButtonProps })}
								<button onclick={handleModeToggle} {...props}>
									{#if mode.current === 'light'}
										<Moon class="h-5 w-5" />
										<span>Dark Mode</span>
									{:else}
										<Sun class="h-5 w-5" />
										<span>Light Mode</span>
									{/if}
								</button>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>

		<!-- Portfolio Summary -->
		{#if $USER_DATA && $PORTFOLIO_DATA}
			<Sidebar.Group>
				<Sidebar.GroupLabel>Portfolio</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<div class="px-2 py-1 space-y-2">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<Wallet class="h-4 w-4 text-muted-foreground" />
								<span class="text-sm font-medium">Total Value</span>
							</div>
							<Badge variant="secondary" class="font-mono">
								${formatCurrency($PORTFOLIO_DATA.totalValue)}
							</Badge>
						</div>
						<div class="space-y-1 text-xs text-muted-foreground">
							<div class="flex justify-between">
								<span>Cash:</span>
								<span class="font-mono">${formatCurrency($PORTFOLIO_DATA.baseCurrencyBalance)}</span>
							</div>
							<div class="flex justify-between">
								<span>Coins:</span>
								<span class="font-mono">${formatCurrency($PORTFOLIO_DATA.totalCoinValue)}</span>
							</div>
						</div>
					</div>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		{/if}
	</Sidebar.Content>

	{#if $USER_DATA}
		<Sidebar.Footer>
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							{#snippet child({ props })}
								<Sidebar.MenuButton
									size="lg"
									class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
									{...props}
								>
									<Avatar.Root class="size-8 rounded-lg">
										<Avatar.Image src={getPublicUrl($USER_DATA.image)} alt={$USER_DATA.name} />
										<Avatar.Fallback class="rounded-lg">?</Avatar.Fallback>
									</Avatar.Root>
									<div class="grid flex-1 text-left text-sm leading-tight">
										<span class="truncate font-medium">{$USER_DATA.name}</span>
										<span class="truncate text-xs">@{$USER_DATA.username}</span>
									</div>
									<ChevronsUpDownIcon class="ml-auto size-4" />
								</Sidebar.MenuButton>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content
							class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg p-2"
							side={isMobile ? 'bottom' : 'right'}
							align="end"
							sideOffset={4}
						>
							<DropdownMenu.Label class="p-0 font-normal">
								<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
									<Avatar.Root class="size-8 rounded-lg">
										<Avatar.Image src={getPublicUrl($USER_DATA.image)} alt={$USER_DATA.name} />
										<Avatar.Fallback class="rounded-lg">?</Avatar.Fallback>
									</Avatar.Root>
									<div class="grid flex-1 text-left text-sm leading-tight">
										<span class="truncate font-medium">{$USER_DATA.name}</span>
										<span class="truncate text-xs">@{$USER_DATA.username}</span>
									</div>
								</div>
							</DropdownMenu.Label>
							<DropdownMenu.Separator />
							<DropdownMenu.Group>
								<DropdownMenu.Item disabled={true}>
									<SparklesIcon />
									Upgrade to Pro
								</DropdownMenu.Item>
							</DropdownMenu.Group>
							<DropdownMenu.Separator />
							<DropdownMenu.Group>
								<DropdownMenu.Item onclick={() => goto('/settings')}>
									<BadgeCheckIcon />
									Account
								</DropdownMenu.Item>
								<DropdownMenu.Item disabled={true}>
									<CreditCardIcon />
									Billing
								</DropdownMenu.Item>
								<DropdownMenu.Item disabled={true}>
									<BellIcon />
									Notifications
								</DropdownMenu.Item>
							</DropdownMenu.Group>
							<DropdownMenu.Separator />
							<DropdownMenu.Item
								onclick={() => {
									signOut().then(() => {
										USER_DATA.set(null);
										window.location.reload();
									});
								}}
							>
								<LogOutIcon />
								Log out
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Footer>
	{/if}
</Sidebar.Root>
