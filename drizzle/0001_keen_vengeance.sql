CREATE TABLE "endpoints" (
	"endpoint_uuid" varchar PRIMARY KEY NOT NULL,
	"identity_id" varchar(255) NOT NULL,
	"endpoint_name" varchar,
	"endpoint_host" varchar,
	"partitions" json,
	"accounts" json,
	"endpoint_status" varchar,
	"diamond_dir" text
);
--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "batch_job_id" varchar;--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "stdout_path" varchar;--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "stderr_path" varchar;--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "compute_endpoint_id" varchar;--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "checkpoint_path" varchar;--> statement-breakpoint
ALTER TABLE "endpoints" ADD CONSTRAINT "endpoints_identity_id_profile_identity_id_fk" FOREIGN KEY ("identity_id") REFERENCES "public"."profile"("identity_id") ON DELETE no action ON UPDATE no action;