export interface Coin {
  id: number;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  priceHistory: { date: string; price: number }[];
}

export const coins: Coin[] = [
  {
    id: 1,
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 67890.42,
    change24h: 2.3,
    volume24h: 28500000000,
    marketCap: 1320000000000,
    priceHistory: [
      { date: '2025-05-14', price: 66250.18 },
      { date: '2025-05-15', price: 65890.34 },
      { date: '2025-05-16', price: 66780.12 },
      { date: '2025-05-17', price: 66920.45 },
      { date: '2025-05-18', price: 67120.78 },
      { date: '2025-05-19', price: 67450.23 },
      { date: '2025-05-20', price: 67890.42 }
    ]
  },
  {
    id: 2,
    name: 'Ethereum',
    symbol: 'ETH',
    price: 3456.78,
    change24h: -1.2,
    volume24h: 15200000000,
    marketCap: 420000000000,
    priceHistory: [
      { date: '2025-05-14', price: 3520.45 },
      { date: '2025-05-15', price: 3490.23 },
      { date: '2025-05-16', price: 3475.67 },
      { date: '2025-05-17', price: 3460.12 },
      { date: '2025-05-18', price: 3470.54 },
      { date: '2025-05-19', price: 3465.89 },
      { date: '2025-05-20', price: 3456.78 }
    ]
  },
  {
    id: 3,
    name: 'Ripple',
    symbol: 'XRP',
    price: 0.54,
    change24h: 5.7,
    volume24h: 2100000000,
    marketCap: 28500000000,
    priceHistory: [
      { date: '2025-05-14', price: 0.49 },
      { date: '2025-05-15', price: 0.50 },
      { date: '2025-05-16', price: 0.51 },
      { date: '2025-05-17', price: 0.52 },
      { date: '2025-05-18', price: 0.53 },
      { date: '2025-05-19', price: 0.54 },
      { date: '2025-05-20', price: 0.54 }
    ]
  },
  {
    id: 4,
    name: 'Solana',
    symbol: 'SOL',
    price: 156.89,
    change24h: 7.2,
    volume24h: 5600000000,
    marketCap: 67800000000,
    priceHistory: [
      { date: '2025-05-14', price: 142.34 },
      { date: '2025-05-15', price: 145.67 },
      { date: '2025-05-16', price: 148.90 },
      { date: '2025-05-17', price: 150.25 },
      { date: '2025-05-18', price: 152.30 },
      { date: '2025-05-19', price: 154.75 },
      { date: '2025-05-20', price: 156.89 }
    ]
  },
  {
    id: 5,
    name: 'Dogecoin',
    symbol: 'DOGE',
    price: 0.12,
    change24h: -2.5,
    volume24h: 980000000,
    marketCap: 16500000000,
    priceHistory: [
      { date: '2025-05-14', price: 0.125 },
      { date: '2025-05-15', price: 0.124 },
      { date: '2025-05-16', price: 0.123 },
      { date: '2025-05-17', price: 0.122 },
      { date: '2025-05-18', price: 0.121 },
      { date: '2025-05-19', price: 0.120 },
      { date: '2025-05-20', price: 0.120 }
    ]
  }
];