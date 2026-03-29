ALTER TABLE "investor_positions" ALTER COLUMN "original_investment_nis" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "investor_positions" ALTER COLUMN "nav_nis" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "investor_positions" ALTER COLUMN "nav_usd" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "investor_positions" ALTER COLUMN "beginning_nav" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "investor_positions" ALTER COLUMN "ending_nav" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "investor_positions" ALTER COLUMN "monthly_perf_fee" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "investor_positions" ALTER COLUMN "cumulative_perf_fee" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "investor_positions" ALTER COLUMN "mgmt_fee_total" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "investor_positions" ALTER COLUMN "redemption_fee_payable" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "investor_positions" ALTER COLUMN "perf_fee_payable" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "investor_positions" ALTER COLUMN "volume_fee_payable" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "redemptions" ALTER COLUMN "amount_usd" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "redemptions" ALTER COLUMN "amount_nis" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "redemptions" ALTER COLUMN "investment_amount_usd" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "redemptions" ALTER COLUMN "investment_amount_nis" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "redemptions" ALTER COLUMN "distribution_usd" SET DATA TYPE bigint;