CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"protocol" text DEFAULT '' NOT NULL,
	"kind" text DEFAULT 'contato' NOT NULL,
	"category" text DEFAULT '' NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"document" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"body" text NOT NULL,
	"anonymous" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'nova' NOT NULL,
	"internal_note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
