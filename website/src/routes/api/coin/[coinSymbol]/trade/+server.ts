import { auth } from '$lib/auth';
import { error, json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { coin, userPortfolio, user, transaction, priceHistory } from '$lib/server/db/schema';
import { eq, and, gte } from 'drizzle-orm';

async function calculate24hMetrics(coinId: number, currentPrice: number) {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get price from 24h ago
    const [priceData] = await db
        .select({ price: priceHistory.price })
        .from(priceHistory)
        .where(and(
            eq(priceHistory.coinId, coinId),
            gte(priceHistory.timestamp, twentyFourHoursAgo)
        ))
        .orderBy(priceHistory.timestamp)
        .limit(1);

    // Calculate 24h change
    let change24h = 0;
    if (priceData) {
        const priceFrom24hAgo = Number(priceData.price);
        if (priceFrom24hAgo > 0) {
            change24h = ((currentPrice - priceFrom24hAgo) / priceFrom24hAgo) * 100;
        }
    }

    // Calculate 24h volume
    const volumeData = await db
        .select({ totalBaseCurrencyAmount: transaction.totalBaseCurrencyAmount })
        .from(transaction)
        .where(and(
            eq(transaction.coinId, coinId),
            gte(transaction.timestamp, twentyFourHoursAgo)
        ));

    const volume24h = volumeData.reduce((sum, tx) => sum + Number(tx.totalBaseCurrencyAmount), 0);

    return { change24h: Number(change24h.toFixed(4)), volume24h: Number(volume24h.toFixed(4)) };
}

export async function POST({ params, request }) {
    const session = await auth.api.getSession({
        headers: request.headers
    });

    if (!session?.user) {
        throw error(401, 'Not authenticated');
    }

    const { coinSymbol } = params;
    const { type, amount } = await request.json();

    if (!['BUY', 'SELL'].includes(type)) {
        throw error(400, 'Invalid transaction type');
    }

    if (!amount || amount <= 0) {
        throw error(400, 'Invalid amount');
    }

    const userId = Number(session.user.id);
    const normalizedSymbol = coinSymbol.toUpperCase();

    const [coinData] = await db.select().from(coin).where(eq(coin.symbol, normalizedSymbol)).limit(1);

    if (!coinData) {
        throw error(404, 'Coin not found');
    }

    if (!coinData.isListed) {
        throw error(400, 'This coin is delisted and cannot be traded');
    }

    const [userData] = await db.select({ baseCurrencyBalance: user.baseCurrencyBalance }).from(user).where(eq(user.id, userId)).limit(1);

    if (!userData) {
        throw error(404, 'User not found');
    }

    const userBalance = Number(userData.baseCurrencyBalance);
    const poolCoinAmount = Number(coinData.poolCoinAmount);
    const poolBaseCurrencyAmount = Number(coinData.poolBaseCurrencyAmount);
    const currentPrice = Number(coinData.currentPrice);

    let newPrice: number;
    let totalCost: number;

    if (type === 'BUY') {
        // Calculate price impact for buying
        const k = poolCoinAmount * poolBaseCurrencyAmount;
        const newPoolBaseCurrency = poolBaseCurrencyAmount + (amount * currentPrice);
        const newPoolCoin = k / newPoolBaseCurrency;
        const coinsBought = poolCoinAmount - newPoolCoin;

        totalCost = amount * currentPrice;
        newPrice = newPoolBaseCurrency / newPoolCoin;

        if (userBalance < totalCost) {
            throw error(400, `Insufficient funds. You need $${totalCost.toFixed(2)} but only have $${userBalance.toFixed(2)}`);
        }

        await db.transaction(async (tx) => {
            // Update user balance
            await tx.update(user)
                .set({
                    baseCurrencyBalance: (userBalance - totalCost).toString(),
                    updatedAt: new Date()
                })
                .where(eq(user.id, userId));

            // Update user portfolio
            const [existingHolding] = await tx
                .select({ quantity: userPortfolio.quantity })
                .from(userPortfolio)
                .where(and(
                    eq(userPortfolio.userId, userId),
                    eq(userPortfolio.coinId, coinData.id)
                ))
                .limit(1);

            if (existingHolding) {
                const newQuantity = Number(existingHolding.quantity) + coinsBought;
                await tx.update(userPortfolio)
                    .set({
                        quantity: newQuantity.toString(),
                        updatedAt: new Date()
                    })
                    .where(and(
                        eq(userPortfolio.userId, userId),
                        eq(userPortfolio.coinId, coinData.id)
                    ));
            } else {
                await tx.insert(userPortfolio).values({
                    userId,
                    coinId: coinData.id,
                    quantity: coinsBought.toString()
                });
            }

            // Record transaction
            await tx.insert(transaction).values({
                userId,
                coinId: coinData.id,
                type: 'BUY',
                quantity: coinsBought.toString(),
                pricePerCoin: currentPrice.toString(),
                totalBaseCurrencyAmount: totalCost.toString()
            });

            // Record price history
            await tx.insert(priceHistory).values({
                coinId: coinData.id,
                price: newPrice.toString()
            });

            // Calculate and update 24h metrics
            const metrics = await calculate24hMetrics(coinData.id, newPrice);

            await tx.update(coin)
                .set({
                    currentPrice: newPrice.toString(),
                    marketCap: (Number(coinData.circulatingSupply) * newPrice).toString(),
                    poolCoinAmount: newPoolCoin.toString(),
                    poolBaseCurrencyAmount: newPoolBaseCurrency.toString(),
                    change24h: metrics.change24h.toString(),
                    volume24h: metrics.volume24h.toString(),
                    updatedAt: new Date()
                })
                .where(eq(coin.id, coinData.id));
        });

        return json({
            success: true,
            type: 'BUY',
            coinsBought,
            totalCost,
            newPrice,
            newBalance: userBalance - totalCost
        });

    } else {
        // SELL logic
        const [userHolding] = await db
            .select({ quantity: userPortfolio.quantity })
            .from(userPortfolio)
            .where(and(
                eq(userPortfolio.userId, userId),
                eq(userPortfolio.coinId, coinData.id)
            ))
            .limit(1);

        if (!userHolding || Number(userHolding.quantity) < amount) {
            throw error(400, `Insufficient coins. You have ${userHolding ? Number(userHolding.quantity) : 0} but trying to sell ${amount}`);
        }

        // Calculate price impact for selling
        const k = poolCoinAmount * poolBaseCurrencyAmount;
        const newPoolCoin = poolCoinAmount + amount;
        const newPoolBaseCurrency = k / newPoolCoin;
        const baseCurrencyReceived = poolBaseCurrencyAmount - newPoolBaseCurrency;

        totalCost = baseCurrencyReceived;
        newPrice = newPoolBaseCurrency / newPoolCoin;

        // Execute sell transaction
        await db.transaction(async (tx) => {
            // Update user balance
            await tx.update(user)
                .set({
                    baseCurrencyBalance: (userBalance + totalCost).toString(),
                    updatedAt: new Date()
                })
                .where(eq(user.id, userId));

            // Update user portfolio
            const newQuantity = Number(userHolding.quantity) - amount;
            if (newQuantity > 0) {
                await tx.update(userPortfolio)
                    .set({
                        quantity: newQuantity.toString(),
                        updatedAt: new Date()
                    })
                    .where(and(
                        eq(userPortfolio.userId, userId),
                        eq(userPortfolio.coinId, coinData.id)
                    ));
            } else {
                await tx.delete(userPortfolio)
                    .where(and(
                        eq(userPortfolio.userId, userId),
                        eq(userPortfolio.coinId, coinData.id)
                    ));
            }

            // Record transaction
            await tx.insert(transaction).values({
                userId,
                coinId: coinData.id,
                type: 'SELL',
                quantity: amount.toString(),
                pricePerCoin: currentPrice.toString(),
                totalBaseCurrencyAmount: totalCost.toString()
            });

            // Record price history
            await tx.insert(priceHistory).values({
                coinId: coinData.id,
                price: newPrice.toString()
            });

            // Calculate and update 24h metrics - SINGLE coin table update
            const metrics = await calculate24hMetrics(coinData.id, newPrice);

            await tx.update(coin)
                .set({
                    currentPrice: newPrice.toString(),
                    marketCap: (Number(coinData.circulatingSupply) * newPrice).toString(),
                    poolCoinAmount: newPoolCoin.toString(),
                    poolBaseCurrencyAmount: newPoolBaseCurrency.toString(),
                    change24h: metrics.change24h.toString(),
                    volume24h: metrics.volume24h.toString(),
                    updatedAt: new Date()
                })
                .where(eq(coin.id, coinData.id));
        });

        return json({
            success: true,
            type: 'SELL',
            coinsSold: amount,
            totalReceived: totalCost,
            newPrice,
            newBalance: userBalance + totalCost
        });
    }
}
