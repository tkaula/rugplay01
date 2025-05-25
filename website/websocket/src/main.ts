import type { ServerWebSocket } from 'bun';
import Redis from 'ioredis';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '../../.env') });

if (!process.env.REDIS_URL) {
	console.error("REDIS_URL is not defined in environment variables.");
	process.exit(1);
}

const redis = new Redis(process.env.REDIS_URL);

redis.on('error', (err) => console.error('Redis Client Error', err));
redis.on('connect', () => console.log('Connected to Redis'));

redis.psubscribe('comments:*');

redis.on('pmessage', (_pattern, channel, msg) => {
	try {
		const coinSymbol = channel.substring('comments:'.length);
		const sockets = coinSockets.get(coinSymbol);
		if (sockets) {
			for (const ws of sockets) {
				if (ws.readyState === WebSocket.OPEN) {
					ws.send(msg);
				}
			}
		}
	} catch (error) {
		console.error('Error processing Redis message:', error);
	}
});

const HEARTBEAT_INTERVAL = 30_000;

type WebSocketData = {
	coinSymbol?: string;
	lastActivity: number;
};

const coinSockets = new Map<string, Set<ServerWebSocket<WebSocketData>>>();
const pingIntervals = new WeakMap<ServerWebSocket<WebSocketData>, NodeJS.Timeout>();

function handleSetCoin(ws: ServerWebSocket<WebSocketData>, coinSymbol: string) {
	if (ws.data.coinSymbol) {
		const prev = coinSockets.get(ws.data.coinSymbol);
		if (prev) {
			prev.delete(ws);
			if (prev.size === 0) {
				coinSockets.delete(ws.data.coinSymbol);
			}
		}
	}

	ws.data.coinSymbol = coinSymbol;

	if (!coinSockets.has(coinSymbol)) {
		coinSockets.set(coinSymbol, new Set([ws]));
	} else {
		coinSockets.get(coinSymbol)!.add(ws);
	}
}

function checkConnections() {
	const now = Date.now();
	for (const [coinSymbol, sockets] of coinSockets.entries()) {
		const staleSockets = Array.from(sockets).filter(ws => now - ws.data.lastActivity > HEARTBEAT_INTERVAL * 2);
		for (const socket of staleSockets) {
			socket.terminate();
		}
	}
}

setInterval(checkConnections, HEARTBEAT_INTERVAL);

const server = Bun.serve<WebSocketData, undefined>({
	port: Number(process.env.PORT) || 8080,

	fetch(request, server) {
		const url = new URL(request.url);

		if (url.pathname === '/health') {
			return new Response(JSON.stringify({
				status: 'ok',
				timestamp: new Date().toISOString(),
				activeConnections: Array.from(coinSockets.values()).reduce((total, set) => total + set.size, 0)
			}), {
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const upgraded = server.upgrade(request, {
			data: {
				coinSymbol: undefined,
				lastActivity: Date.now()
			}
		});

		return upgraded ? undefined : new Response('Upgrade failed', { status: 500 });
	},

	websocket: {
		message(ws, msg) {
			ws.data.lastActivity = Date.now();

			if (typeof msg !== 'string') return;

			try {
				const data = JSON.parse(msg) as {
					type: string;
					coinSymbol?: string;
				};

				if (data.type === 'set_coin' && data.coinSymbol) {
					handleSetCoin(ws, data.coinSymbol);
				}
			} catch (error) {
				console.error('Message parsing error:', error);
			}
		},
		open(ws) {
			const interval = setInterval(() => {
				if (ws.readyState === 1) {
					ws.data.lastActivity = Date.now();
					ws.send(JSON.stringify({ type: 'ping' }));
				} else {
					clearInterval(interval);
				}
			}, HEARTBEAT_INTERVAL);

			pingIntervals.set(ws, interval);
		}, close(ws) {
			const interval = pingIntervals.get(ws);
			if (interval) {
				clearInterval(interval);
				pingIntervals.delete(ws);
			}

			if (ws.data.coinSymbol) {
				const sockets = coinSockets.get(ws.data.coinSymbol);
				if (sockets) {
					sockets.delete(ws);
					if (sockets.size === 0) {
						coinSockets.delete(ws.data.coinSymbol);
					}
				}
			}
		}
	}
});

console.log(`WebSocket server running on port ${server.port}`);
console.log('Server listening for connections...');
console.log('Health check available at: http://localhost:8080/health');
