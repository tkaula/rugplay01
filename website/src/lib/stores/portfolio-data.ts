import { writable } from 'svelte/store';

export interface PortfolioData {
    baseCurrencyBalance: number;
    totalCoinValue: number;
    totalValue: number;
    coinHoldings: Array<{
        symbol: string;
        quantity: number;
        currentPrice: number;
        value: number;
    }>;
    currency: string;
}

export const PORTFOLIO_DATA = writable<PortfolioData | null>(null);

export async function fetchPortfolioData() {
    try {
        const response = await fetch('/api/portfolio/total');
        if (response.ok) {
            const data = await response.json();
            PORTFOLIO_DATA.set(data);
            return data;
        }
    } catch (error) {
        console.error('Failed to fetch portfolio data:', error);
    }
    return null;
}
