-- Add 6 investor tables to production DB
-- Safe to run: uses CREATE TABLE IF NOT EXISTS

CREATE TABLE IF NOT EXISTS "distributors" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"email_secondary" text,
	"phone_mobile" text,
	"phone_landline" text,
	"type" text,
	"contract_type" text,
	"fee_volume_bps" integer,
	"fee_redemption_bps" integer,
	"fee_success_bps" integer,
	"monday_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "investors" (
	"id" text PRIMARY KEY NOT NULL,
	"partner_id" text,
	"name_en" text NOT NULL,
	"name_he" text,
	"display_name" text NOT NULL,
	"email" text,
	"email_secondary" text,
	"phone_mobile" text,
	"phone_landline" text,
	"investor_type" text,
	"is_qualified" boolean DEFAULT false NOT NULL,
	"is_beneficiary" boolean DEFAULT false NOT NULL,
	"id_number" text,
	"address" text,
	"currency_class" text DEFAULT 'ILS' NOT NULL,
	"management_fee_class" text,
	"status" text DEFAULT 'active' NOT NULL,
	"fund_manager_approved" boolean DEFAULT false NOT NULL,
	"join_date" text,
	"interest_accrual_date" text,
	"bank_name" text,
	"bank_branch" text,
	"bank_account" text,
	"distributor_id" text,
	"referring_agent" text,
	"monday_id" text,
	"dedup_status" text DEFAULT 'clean' NOT NULL,
	"portal_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "investors_partner_id_unique" UNIQUE("partner_id")
);

CREATE TABLE IF NOT EXISTS "investor_positions" (
	"id" text PRIMARY KEY NOT NULL,
	"investor_id" text NOT NULL,
	"data_date" text NOT NULL,
	"class_name" text,
	"currency_class" text DEFAULT 'ILS' NOT NULL,
	"management_fee_class" text,
	"original_investment_nis" integer,
	"nav_nis" integer,
	"nav_usd" integer,
	"beginning_nav" integer,
	"ending_nav" integer,
	"exchange_rate" integer,
	"gross_mtd_bps" integer,
	"net_mtd_bps" integer,
	"net_ytd_bps" integer,
	"net_itd_bps" integer,
	"monthly_perf_fee" integer,
	"cumulative_perf_fee" integer,
	"mgmt_fee_total" integer,
	"redemption_fee_payable" integer,
	"perf_fee_payable" integer,
	"volume_fee_payable" integer,
	"fund_allocation_bps" integer,
	"apex_source" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "redemptions" (
	"id" text PRIMARY KEY NOT NULL,
	"investor_id" text NOT NULL,
	"distributor_id" text,
	"date" text,
	"currency" text DEFAULT 'ILS' NOT NULL,
	"amount_usd" integer,
	"amount_nis" integer,
	"investment_amount_usd" integer,
	"investment_amount_nis" integer,
	"distribution_usd" integer,
	"status" text,
	"source_board_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "email_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'general' NOT NULL,
	"subject_template" text NOT NULL,
	"body_template" text NOT NULL,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "email_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"investor_id" text NOT NULL,
	"template_id" text,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"attachments" text,
	"sent_by" text,
	"sent_at" timestamp,
	"resend_message_id" text,
	"status" text DEFAULT 'sent' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
