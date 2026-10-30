CREATE TYPE "public"."petpulse_account_role" AS ENUM('owner', 'provider');--> statement-breakpoint
CREATE TYPE "public"."petpulse_pet_status" AS ENUM('home', 'walking', 'lost');--> statement-breakpoint
CREATE TYPE "public"."petpulse_provider_approval_status" AS ENUM('pending', 'approved', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."petpulse_provider_category" AS ENUM('veterinary', 'daycare', 'walker', 'shelter', 'store', 'other');--> statement-breakpoint
CREATE TABLE "petpulse_user_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"display_name" text NOT NULL,
	"role" "petpulse_account_role" DEFAULT 'owner' NOT NULL,
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "petpulse_user_profiles_clerk_user_id_unique" UNIQUE("clerk_user_id")
);
--> statement-breakpoint
CREATE TABLE "petpulse_pets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" text NOT NULL,
	"species" text NOT NULL,
	"breed" text,
	"age" text,
	"emergency_contact" text,
	"status" "petpulse_pet_status" DEFAULT 'home' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "petpulse_provider_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"category" "petpulse_provider_category" NOT NULL,
	"neighborhood" text NOT NULL,
	"description" text,
	"approval_status" "petpulse_provider_approval_status" DEFAULT 'pending' NOT NULL,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "petpulse_provider_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "petpulse_pets" ADD CONSTRAINT "petpulse_pets_owner_id_petpulse_user_profiles_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."petpulse_user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "petpulse_provider_profiles" ADD CONSTRAINT "petpulse_provider_profiles_user_id_petpulse_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."petpulse_user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "petpulse_pets_owner_id_idx" ON "petpulse_pets" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "petpulse_provider_profiles_status_idx" ON "petpulse_provider_profiles" USING btree ("approval_status");