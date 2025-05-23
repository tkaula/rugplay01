import { auth } from '$lib/auth';
import { error, json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user, userPortfolio, coin } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET({ request }) {
    const session = await auth.api.getSession({
        headers: request.headers
    });

    if (!session?.user) {
        throw error(401, 'Not authenticated');
    }

    const userId = Number(session.user.id);

    const [userData] = await db
        .select({ baseCurrencyBalance: user.baseCurrencyBalance })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

    if (!userData) {
        throw error(404, 'User not found');
    }

    const holdings = await db
        .select({
            quantity: userPortfolio.quantity,
            currentPrice: coin.currentPrice,
            symbol: coin.symbol
        })
        .from(userPortfolio)
        .innerJoin(coin, eq(userPortfolio.coinId, coin.id))
        .where(eq(userPortfolio.userId, userId));

    let totalCoinValue = 0;
    const coinHoldings = holdings.map(holding => {
        const quantity = Number(holding.quantity);
        const price = Number(holding.currentPrice);
        const value = quantity * price;
        totalCoinValue += value;

        return {
            symbol: holding.symbol,
            quantity,
            currentPrice: price,
            value
        };
    });

    const baseCurrencyBalance = Number(userData.baseCurrencyBalance);

    return json({
        baseCurrencyBalance,
        totalCoinValue,
        totalValue: baseCurrencyBalance + totalCoinValue,
        coinHoldings,
        currency: '$'
    });
}
