CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"action" text NOT NULL,
	"table_name" text NOT NULL,
	"record_id" text NOT NULL,
	"previous_value" jsonb,
	"new_value" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "two_factor_auth" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"encryptedSecret" text NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"failedAttempts" integer DEFAULT 0 NOT NULL,
	"lastFailedAttempt" timestamp,
	"lockedUntil" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "two_factor_auth_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"emailVerified" timestamp,
	"image" text,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "entities" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"owner_id" text NOT NULL,
	"is_pre_seeded" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "tax_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"owner_id" text NOT NULL,
	"is_pre_seeded" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "expense_budgets" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"category" text NOT NULL,
	"entity_id" text,
	"year" integer NOT NULL,
	"month" integer,
	"budget_amount" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "expense_budgets_category_entity_id_year_month_unique" UNIQUE("category","entity_id","year","month")
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"category" text DEFAULT 'OTHER' NOT NULL,
	"subcategory" text,
	"description" text,
	"amount" integer NOT NULL,
	"date" text NOT NULL,
	"vendor_name" text,
	"entity_id" text,
	"is_recurring" boolean DEFAULT false NOT NULL,
	"import_source" text DEFAULT 'MANUAL' NOT NULL,
	"notes" text,
	"receipt_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fund_holdings" (
	"id" text PRIMARY KEY NOT NULL,
	"platform" text NOT NULL,
	"offering_id" text NOT NULL,
	"property_address" text,
	"city" text,
	"state" text,
	"zip" text,
	"property_type" text,
	"original_investment" integer,
	"current_principal" integer,
	"cost_basis_apex" integer,
	"market_value_apex" integer DEFAULT 0,
	"accrual_date" text,
	"maturity_date" text,
	"apr" integer,
	"total_earned" integer,
	"last_payment_date" text,
	"last_payment_amount" integer,
	"status" text DEFAULT 'PERFORMING' NOT NULL,
	"sub_status" text,
	"last_update_date" text,
	"last_update_source" text,
	"last_update_text" text,
	"borrower_name" text,
	"loan_to_arv" integer,
	"arv" integer,
	"guarantee_type" text,
	"security_position" text,
	"liquidation_estimate_low" integer,
	"liquidation_estimate_high" integer,
	"liquidation_timeline_months" integer,
	"liquidation_confidence" text,
	"resolution_notes" text,
	"is_rbnf" boolean DEFAULT false NOT NULL,
	"rbnf_underlying_count" integer,
	"hurricane_damage" boolean DEFAULT false NOT NULL,
	"partial_payoff_received" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "distributors" (
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
--> statement-breakpoint
CREATE TABLE "email_logs" (
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
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'general' NOT NULL,
	"subject_template" text NOT NULL,
	"body_template" text NOT NULL,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "investor_positions" (
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
--> statement-breakpoint
CREATE TABLE "investors" (
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
--> statement-breakpoint
CREATE TABLE "redemptions" (
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
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "two_factor_auth" ADD CONSTRAINT "two_factor_auth_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entities" ADD CONSTRAINT "entities_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_categories" ADD CONSTRAINT "tax_categories_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_budgets" ADD CONSTRAINT "expense_budgets_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_budgets" ADD CONSTRAINT "expense_budgets_entity_id_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_entity_id_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE set null ON UPDATE no action;