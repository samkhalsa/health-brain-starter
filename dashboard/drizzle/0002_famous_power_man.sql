CREATE TABLE IF NOT EXISTS "supplement_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"supplement_key" text NOT NULL,
	"taken_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "supplement_log_date_key_unique" ON "supplement_log" USING btree ("date","supplement_key");