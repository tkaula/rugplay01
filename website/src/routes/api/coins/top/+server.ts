import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { coin } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';

export async function GET() {
    const topCoins = await db
        .select({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            icon: coin.icon,
            currentPrice: coin.currentPrice,
            marketCap: coin.marketCap,
            volume24h: coin.volume24h,
            change24h: coin.change24h,
            isListed: coin.isListed
        })
        .from(coin)
        .where(eq(coin.isListed, true))
        .orderBy(desc(coin.marketCap))
        .limit(20);

    return json({
        coins: topCoins.map(c => ({
            id: c.id,
            name: c.name,
            symbol: c.symbol,
            icon: c.icon,
            price: Number(c.currentPrice),
            marketCap: Number(c.marketCap),
            volume24h: Number(c.volume24h || 0),
            change24h: Number(c.change24h || 0),
            isListed: c.isListed
        }))
    });
}
