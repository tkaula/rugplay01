<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as HoverCard from '$lib/components/ui/hover-card';
	import { Badge } from '$lib/components/ui/badge';
	import { MessageCircle, Send, Loader2, Heart, CalendarDays } from 'lucide-svelte';
	import { USER_DATA } from '$lib/stores/user-data';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { formatTimeAgo, getPublicUrl } from '$lib/utils';
	import SignInConfirmDialog from '$lib/components/self/SignInConfirmDialog.svelte';

	const { coinSymbol } = $props<{ coinSymbol: string }>();
	import type { Comment } from '$lib/types/comment';
	let comments = $state<Comment[]>([]);
	let newComment = $state('');
	let isSubmitting = $state(false);
	let isLoading = $state(true);
	let shouldSignIn = $state(false);

	async function loadComments() {
		try {
			const response = await fetch(`/api/coin/${coinSymbol}/comments`);
			if (response.ok) {
				const result = await response.json();
				comments = result.comments;
			}
		} catch (e) {
			console.error('Failed to load comments:', e);
		} finally {
			isLoading = false;
		}
	}

	async function submitComment() {
		if (!$USER_DATA) {
			shouldSignIn = true;
			return;
		}

		if (!newComment.trim()) return;

		isSubmitting = true;
		try {
			const response = await fetch(`/api/coin/${coinSymbol}/comments`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content: newComment.trim() })
			});

			if (response.ok) {
				const result = await response.json();
				comments = [result.comment, ...comments];
				newComment = '';
			} else {
				const error = await response.json();
				toast.error(error.message || 'Failed to post comment');
			}
		} catch (e) {
			toast.error('Failed to post comment');
		} finally {
			isSubmitting = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
			e.preventDefault();
			submitComment();
		}
	}
	async function toggleLike(commentId: number) {
		if (!$USER_DATA) {
			goto('/');
			return;
		}

		const commentIndex = comments.findIndex((c) => c.id === commentId);
		if (commentIndex === -1) return;

		const comment = comments[commentIndex];
		const wasLiked = comment.isLikedByUser;

		comments[commentIndex] = {
			...comment,
			isLikedByUser: !wasLiked,
			likesCount: wasLiked ? comment.likesCount - 1 : comment.likesCount + 1
		};

		fetch(`/api/coin/${coinSymbol}/comments/${commentId}/like`, {
			method: wasLiked ? 'DELETE' : 'POST',
			headers: { 'Content-Type': 'application/json' }
		}).catch(() => {
			comments[commentIndex] = comment;
		});
	}

	function handleLikeClick(commentId: number) {
		if (!$USER_DATA) {
			shouldSignIn = true;
			return;
		}
		toggleLike(commentId);
	}

	$effect(() => {
		loadComments();
	});
</script>

<SignInConfirmDialog bind:open={shouldSignIn} />

<Card.Root>
	<Card.Header>
		<Card.Title class="flex items-center gap-2">
			<MessageCircle class="h-5 w-5" />
			Comments ({comments.length})
		</Card.Title>
	</Card.Header>
	<Card.Content class="space-y-4">
		<!-- Comment Form -->
		{#if $USER_DATA}
			<div class="space-y-3">
				<div class="relative">
					<Textarea
						bind:value={newComment}
						placeholder="Share your thoughts about this coin..."
						class="min-h-[80px] w-full break-words pb-8 pr-20"
						style="word-break: break-word; overflow-wrap: break-word;"
						maxlength={500}
						onkeydown={handleKeydown}
					/>
					<kbd
						class="bg-muted pointer-events-none absolute bottom-2 right-2 hidden h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-70 sm:flex"
					>
						<span class="text-xs">⌘</span>Enter
					</kbd>
				</div>
				<div class="flex justify-between">
					<span class="text-muted-foreground text-xs">
						{newComment.length}/500 characters
					</span>
					<Button onclick={submitComment} disabled={!newComment.trim() || isSubmitting} size="sm">
						{#if isSubmitting}
							<Loader2 class="h-4 w-4 animate-spin" />
							Posting...
						{:else}
							<Send class="h-4 w-4" />
							Post
						{/if}
					</Button>
				</div>
			</div>
		{:else}
			<div class="text-center">
				<p class="text-muted-foreground mb-3 text-sm">Sign in to join the discussion</p>
				<Button onclick={() => goto('/')} size="sm">Sign In</Button>
			</div>
		{/if}

		<!-- Comments List -->
		{#if isLoading}
			<div class="py-8 text-center">
				<Loader2 class="mx-auto h-6 w-6 animate-spin" />
				<p class="text-muted-foreground mt-2 text-sm">Loading comments...</p>
			</div>
		{:else if comments.length === 0}
			<div class="py-8 text-center">
				<MessageCircle class="text-muted-foreground mx-auto h-12 w-12" />
				<p class="text-muted-foreground mt-2">
					No comments yet. Be the first to share your thoughts!
				</p>
			</div>
		{:else}
			<div class="space-y-4">
				{#each comments as comment (comment.id)}
					<div class="border-border border-b pb-4 last:border-b-0">
						<div class="flex items-start gap-3">
							<button onclick={() => goto(`/user/${comment.userId}`)} class="cursor-pointer">
								<Avatar.Root class="h-8 w-8">
									<Avatar.Image src={getPublicUrl(comment.userImage)} alt={comment.userName} />
									<Avatar.Fallback>{comment.userName?.charAt(0) || '?'}</Avatar.Fallback>
								</Avatar.Root>
							</button>
							<div class="flex-1 space-y-1">
								<div class="flex items-center gap-2">
									<HoverCard.Root>
										<HoverCard.Trigger
											class="cursor-pointer font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-8"
											onclick={() => goto(`/user/${comment.userId}`)}
										>
											{comment.userName}
										</HoverCard.Trigger>
										<HoverCard.Content class="w-80" side="top" sideOffset={3}>
											<div class="flex justify-between space-x-4">
												<Avatar.Root class="h-14 w-14">
													<Avatar.Image
														src={getPublicUrl(comment.userImage)}
														alt={comment.userName}
													/>
													<Avatar.Fallback>{comment.userName?.charAt(0) || '?'}</Avatar.Fallback>
												</Avatar.Root>
												<div class="flex-1 space-y-1">
													<h4 class="text-sm font-semibold">{comment.userName}</h4>
													<p class="text-muted-foreground text-sm">@{comment.userUsername}</p>
													{#if comment.userBio}
														<p class="text-sm">{comment.userBio}</p>
													{/if}
													<div class="flex items-center pt-2">
														<CalendarDays class="mr-2 h-4 w-4 opacity-70" />
														<span class="text-muted-foreground text-xs">
															Joined {new Date(comment.userCreatedAt).toLocaleDateString('en-US', {
																year: 'numeric',
																month: 'long'
															})}
														</span>
													</div>
												</div>
											</div>
										</HoverCard.Content>
									</HoverCard.Root>
									<button onclick={() => goto(`/user/${comment.userId}`)} class="cursor-pointer">
										<Badge variant="outline" class="text-xs">
											@{comment.userUsername}
										</Badge>
									</button>
									<span class="text-muted-foreground text-xs">
										{formatTimeAgo(comment.createdAt)}
									</span>
								</div>
								<p
									class="whitespace-pre-wrap break-words text-sm leading-relaxed"
									style="word-break: break-word; overflow-wrap: break-word;"
								>
									{comment.content}
								</p>
							</div>
							<div class="flex items-center">
								<Button
									variant="ghost"
									size="sm"
									onclick={() => handleLikeClick(comment.id)}
									class="flex h-auto items-center gap-1 p-2 {comment.isLikedByUser
										? 'text-red-500 hover:text-red-600'
										: 'text-muted-foreground hover:text-foreground'}"
								>
									<Heart class="h-4 w-4 {comment.isLikedByUser ? 'fill-current' : ''}" />
									{#if comment.likesCount > 0}
										<span class="text-xs">{comment.likesCount}</span>
									{/if}
								</Button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</Card.Content>
</Card.Root>
