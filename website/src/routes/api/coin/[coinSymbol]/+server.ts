import { error, json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { coin, user, priceHistory } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET({ params }) {
    const { coinSymbol } = params;

    if (!coinSymbol) {
        throw error(400, 'Coin symbol is required');
    }

    const normalizedSymbol = coinSymbol.toUpperCase();

    const [coinData] = await db
        .select({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            creatorId: coin.creatorId,
            creatorName: user.name,
            creatorUsername: user.username,
            creatorBio: user.bio,
            creatorImage: user.image,
            initialSupply: coin.initialSupply,
            circulatingSupply: coin.circulatingSupply,
            currentPrice: coin.currentPrice,
            marketCap: coin.marketCap,
            icon: coin.icon,
            volume24h: coin.volume24h,
            change24h: coin.change24h,
            poolCoinAmount: coin.poolCoinAmount,
            poolBaseCurrencyAmount: coin.poolBaseCurrencyAmount,
            createdAt: coin.createdAt,
            isListed: coin.isListed
        })
        .from(coin)
        .leftJoin(user, eq(coin.creatorId, user.id))
        .where(eq(coin.symbol, normalizedSymbol))
        .limit(1);

    if (!coinData) {
        throw error(404, 'Coin not found');
    }

    const priceHistoryData = await db
        .select({
            price: priceHistory.price,
            timestamp: priceHistory.timestamp
        })
        .from(priceHistory)
        .where(eq(priceHistory.coinId, coinData.id))
        .orderBy(desc(priceHistory.timestamp))
        .limit(720);

    return json({
        coin: {
            ...coinData,
            currentPrice: Number(coinData.currentPrice),
            marketCap: Number(coinData.marketCap),
            volume24h: Number(coinData.volume24h || 0),
            change24h: Number(coinData.change24h || 0),
            initialSupply: Number(coinData.initialSupply),
            circulatingSupply: Number(coinData.circulatingSupply),
            poolCoinAmount: Number(coinData.poolCoinAmount),
            poolBaseCurrencyAmount: Number(coinData.poolBaseCurrencyAmount)
        },
        priceHistory: priceHistoryData.map(p => ({
            price: Number(p.price),
            timestamp: p.timestamp
        }))
    });
}
