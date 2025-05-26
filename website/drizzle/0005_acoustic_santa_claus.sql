ALTER TABLE "user" ADD COLUMN "last_reward_claim" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "total_rewards_claimed" numeric(20, 8) DEFAULT '0.00000000' NOT NULL;