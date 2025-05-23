ALTER TABLE "coin" ALTER COLUMN "initial_supply" SET DATA TYPE numeric(30, 8);--> statement-breakpoint
ALTER TABLE "coin" ALTER COLUMN "circulating_supply" SET DATA TYPE numeric(30, 8);--> statement-breakpoint
ALTER TABLE "coin" ALTER COLUMN "current_price" SET DATA TYPE numeric(20, 8);--> statement-breakpoint
ALTER TABLE "coin" ALTER COLUMN "market_cap" SET DATA TYPE numeric(30, 2);--> statement-breakpoint
ALTER TABLE "coin" ALTER COLUMN "volume_24h" SET DATA TYPE numeric(30, 2);--> statement-breakpoint
ALTER TABLE "coin" ALTER COLUMN "volume_24h" SET DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "coin" ALTER COLUMN "change_24h" SET DATA TYPE numeric(10, 4);--> statement-breakpoint
ALTER TABLE "coin" ALTER COLUMN "pool_coin_amount" SET DATA TYPE numeric(30, 8);--> statement-breakpoint
ALTER TABLE "coin" ALTER COLUMN "pool_base_currency_amount" SET DATA TYPE numeric(30, 8);--> statement-breakpoint
ALTER TABLE "coin" ALTER COLUMN "pool_base_currency_amount" SET DEFAULT '0.00000000';--> statement-breakpoint
ALTER TABLE "price_history" ALTER COLUMN "price" SET DATA TYPE numeric(20, 8);--> statement-breakpoint
ALTER TABLE "transaction" ALTER COLUMN "quantity" SET DATA TYPE numeric(30, 8);--> statement-breakpoint
ALTER TABLE "transaction" ALTER COLUMN "price_per_coin" SET DATA TYPE numeric(20, 8);--> statement-breakpoint
ALTER TABLE "transaction" ALTER COLUMN "total_base_currency_amount" SET DATA TYPE numeric(30, 8);--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "base_currency_balance" SET DATA TYPE numeric(20, 8);--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "base_currency_balance" SET DEFAULT '10000.00000000';--> statement-breakpoint
ALTER TABLE "user_portfolio" ALTER COLUMN "quantity" SET DATA TYPE numeric(30, 8);