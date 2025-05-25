<script lang="ts">
	import { PUBLIC_WEBSOCKET_URL } from '$env/static/public';
	import { onMount } from 'svelte';

	export interface WebSocketHandle {
		send: (data: any) => void;
		ws: WebSocket | null;
	}

	type WebSocketMessage = {
		type: string;
		data?: any;
		coinSymbol?: string;
	};

	let {
		onMessage,
		onOpen = undefined,
		onClose = undefined,
		disableReconnect = false
	} = $props<{
		onMessage: (message: WebSocketMessage) => void;
		onOpen?: () => void;
		onClose?: (event: CloseEvent) => void;
		disableReconnect?: boolean;
	}>();

	let ws = $state<WebSocket | null>(null);
	let reconnectAttempts = $state(0);
	const MAX_RECONNECT_ATTEMPTS = 5;
	const BASE_DELAY = 1000;

	async function initializeWebSocket() {
		ws = new WebSocket(PUBLIC_WEBSOCKET_URL);

		ws.addEventListener('open', () => {
			reconnectAttempts = 0;
			onOpen?.();
		});

		ws.addEventListener('message', (event) => {
			try {
				const message = JSON.parse(event.data) as WebSocketMessage;

				if (message.type === 'ping') {
					ws?.send(JSON.stringify({ type: 'pong' }));
				} else {
					onMessage(message);
				}
			} catch (e) {
				console.error('WebSocket message parse error:', e);
			}
		});

		ws.addEventListener('close', async (event) => {
			if (onClose) {
				onClose(event);
				return;
			}

			if (disableReconnect || reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
				return;
			}

			const delay = BASE_DELAY * Math.pow(2, reconnectAttempts);
			reconnectAttempts++;

			await new Promise((resolve) => setTimeout(resolve, delay));
			handleReconnect();
		});

		ws.addEventListener('error', (event) => {
			console.error('WebSocket error:', event);
		});
	}
	async function handleReconnect() {
		try {
			await initializeWebSocket();
		} catch (error) {
			console.error('Reconnect failed:', error);
		}
	}

	onMount(() => {
		initializeWebSocket().catch((error) => {
			console.error(`Connection failed: ${error.message}`);
		});

		return () => {
			ws?.close();
			ws = null;
		};
	});

	export { ws as ws };

	export const send: WebSocketHandle['send'] = (data) => {
		if (ws?.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify(data));
		}
	};
</script>
