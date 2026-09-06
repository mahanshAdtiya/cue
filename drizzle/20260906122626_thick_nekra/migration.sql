ALTER TABLE "media" ADD COLUMN "episode_count" integer;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "chk_media_episode_count" CHECK ("episode_count" IS NULL OR "episode_count" >= 0);