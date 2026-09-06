CREATE TABLE "user_media_episode" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"media_id" uuid NOT NULL,
	"type" "media_type" NOT NULL,
	"season_number" integer NOT NULL,
	"episode_number" integer NOT NULL,
	"watched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_user_media_episode" UNIQUE("user_id","media_id","season_number","episode_number"),
	CONSTRAINT "chk_user_media_episode_is_show" CHECK ("type" = 'TV_SHOW'),
	CONSTRAINT "chk_user_media_episode_season" CHECK ("season_number" >= 1),
	CONSTRAINT "chk_user_media_episode_episode" CHECK ("episode_number" >= 1)
);
--> statement-breakpoint
CREATE INDEX "idx_user_media_episode_user_media" ON "user_media_episode" ("user_id","media_id");--> statement-breakpoint
ALTER TABLE "user_media_episode" ADD CONSTRAINT "user_media_episode_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_media_episode" ADD CONSTRAINT "fk_user_media_episode_media" FOREIGN KEY ("media_id","type") REFERENCES "media"("id","type") ON DELETE CASCADE;