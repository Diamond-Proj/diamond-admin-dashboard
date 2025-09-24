ALTER TABLE "dataset" RENAME COLUMN "dataset_path" TO "globus_path";--> statement-breakpoint
ALTER TABLE "dataset" ADD COLUMN "system_path" varchar NOT NULL;