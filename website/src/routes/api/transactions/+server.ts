import { auth } from '$lib/auth';
import { error, json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { transaction, coin } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET({ request }) {
    const session = await auth.api.getSession({
        headers: request.headers
    });

    if (!session?.user) {
        throw error(401, 'Not authenticated');
    }

    const userId = Number(session.user.id);

    const transactions = await db
        .select({
            id: transaction.id,
            type: transaction.type,
            quantity: transaction.quantity,
            pricePerCoin: transaction.pricePerCoin,
            totalBaseCurrencyAmount: transaction.totalBaseCurrencyAmount,
            timestamp: transaction.timestamp,
            coinSymbol: coin.symbol,
            coinName: coin.name,
            coinIcon: coin.icon
        })
        .from(transaction)
        .innerJoin(coin, eq(transaction.coinId, coin.id))
        .where(eq(transaction.userId, userId))
        .orderBy(desc(transaction.timestamp))
        .limit(100);

    return json({
        transactions: transactions.map(t => ({
            id: t.id,
            type: t.type,
            quantity: Number(t.quantity),
            pricePerCoin: Number(t.pricePerCoin),
            totalBaseCurrencyAmount: Number(t.totalBaseCurrencyAmount),
            timestamp: t.timestamp,
            coin: {
                symbol: t.coinSymbol,
                name: t.coinName,
                icon: t.coinIcon
            }
        }))
    });
}
