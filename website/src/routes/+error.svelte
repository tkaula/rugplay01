<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';

	const status = page.status;
	const message = getDefaultMessage(status);

	function getDefaultMessage(status: number) {
		switch (status) {
			case 404:
				return "This page doesn't exist. Just like the original Vyntr!";
			case 403:
				return "You don't have permission to access this page. Your credentials are likely ####.";
			case 429:
				return "Too many requests! You're hitting our servers. They have feelings too :(";
			case 500:
				return "Our magic machine just imploded. Don't worry though, we're on it!";
			default:
				return 'Something went wrong. We have no idea what happened, but you can blame us for it on X!';
		}
	}
</script>

<svelte:head>
	<title>{status} | Rugplay</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="flex min-h-[70vh] items-center justify-center gap-12">
	<div class="flex max-w-lg flex-col items-center justify-center text-center">
		<h1 class="text-primary mb-4 font-bold" style="font-size: 3rem; line-height: 1;">
			{status} WRONG TURN?
		</h1>
		<p class="text-muted-foreground mb-8 text-lg">
			{message}
		</p>
		<div class="flex flex-col">
			<Button variant="link" href="https://discord.gg/cKWNV2uZUP" target="_blank">@Discord</Button>
			<Button variant="link" href="https://x.com/facedevstuff" target="_blank">@X</Button>
		</div>
	</div>

	<img
		src="/404.gif"
		alt="404 Error Illustration"
		class="hidden h-64 w-64 object-contain lg:block"
	/>
</div>
