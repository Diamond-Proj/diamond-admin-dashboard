CREATE TABLE IF NOT EXISTS "container" (
	"name" varchar PRIMARY KEY NOT NULL,
	"container_task_id" varchar,
	"container_status" varchar,
	"identity_id" varchar(255),
	"base_image" varchar,
	"location" varchar,
	"description" text,
	"dependencies" text,
	"environment" text,
	"commands" text,
	"endpoint_id" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profile" (
	"identity_id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255),
	"institution" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "task" (
	"task_id" varchar PRIMARY KEY NOT NULL,
	"task_name" varchar,
	"identity_id" varchar(255),
	"task_status" varchar,
	"task_create_time" timestamp DEFAULT now(),
	"log_path" varchar,
	"endpoint_id" varchar
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "container" ADD CONSTRAINT "container_identity_id_profile_identity_id_fk" FOREIGN KEY ("identity_id") REFERENCES "profile"("identity_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task" ADD CONSTRAINT "task_identity_id_profile_identity_id_fk" FOREIGN KEY ("identity_id") REFERENCES "profile"("identity_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
