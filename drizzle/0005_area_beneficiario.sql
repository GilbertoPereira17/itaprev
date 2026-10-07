CREATE TABLE "beneficiaries" (
	"id" serial PRIMARY KEY NOT NULL,
	"cpf_hash" text NOT NULL,
	"cpf_enc" text NOT NULL,
	"name" text NOT NULL,
	"birth_date" text DEFAULT '' NOT NULL,
	"registration" text DEFAULT '' NOT NULL,
	"kind" text DEFAULT '' NOT NULL,
	"benefit" text DEFAULT '' NOT NULL,
	"benefit_start" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'ativo' NOT NULL,
	"origin" text DEFAULT 'planilha' NOT NULL,
	"password_hash" text DEFAULT '' NOT NULL,
	"password_changed_at" timestamp with time zone,
	"totp_secret" text DEFAULT '' NOT NULL,
	"totp_enabled" boolean DEFAULT false NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "beneficiary_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"beneficiary_id" integer NOT NULL,
	"request_id" integer,
	"doc_type" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"mime_type" text NOT NULL,
	"file_size" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'enviado' NOT NULL,
	"review_note" text DEFAULT '' NOT NULL,
	"reviewed_by" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "beneficiary_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"beneficiary_id" integer NOT NULL,
	"actor" text DEFAULT 'beneficiário' NOT NULL,
	"action" text NOT NULL,
	"ip" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "beneficiary_id" integer;--> statement-breakpoint
ALTER TABLE "beneficiary_documents" ADD CONSTRAINT "beneficiary_documents_beneficiary_id_beneficiaries_id_fk" FOREIGN KEY ("beneficiary_id") REFERENCES "public"."beneficiaries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "beneficiaries_cpf_idx" ON "beneficiaries" USING btree ("cpf_hash");