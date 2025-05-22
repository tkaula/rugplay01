<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar';
	import {
		Moon,
		Sun,
		PenSquare,
		ShieldAlert,
		Home,
		Store,
		BriefcaseBusiness,
		Coins
	} from 'lucide-svelte';
	import { mode, setMode } from 'mode-watcher';
	import type { HTMLAttributes } from 'svelte/elements';
	import Button from '../ui/button/button.svelte';
	import { USER_DATA } from '$lib/stores/user-data';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import { signIn } from '$lib/auth-client';
	import { page } from '$app/state';
	import SignInConfirmDialog from './SignInConfirmDialog.svelte';

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

	const { setOpenMobile } = useSidebar();
	let shouldSignIn = $state(false);

	function handleNavClick(title: string) {
		setOpenMobile(false);
	}

	async function handleSignIn() {
		console.log("callbackL ", `${page.url.pathname}?signIn=1`);
		await signIn.social({
			provider: 'google',
			callbackURL: `${page.url.pathname}?signIn=1`
		});
	}

	function handleModeToggle() {
		setMode(mode.current === 'light' ? 'dark' : 'light');
		setOpenMobile(false);
	}
</script>

<SignInConfirmDialog bind:open={shouldSignIn} onConfirm={handleSignIn} />
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

					{#if !$USER_DATA}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton>
								{#snippet child()}
									<Button onclick={() => shouldSignIn = !shouldSignIn} class={`mb-4 h-[3.0rem] w-36 cursor-pointer`}>
										<PenSquare />
										<span>Sign in</span>
									</Button>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/if}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
</Sidebar.Root>
