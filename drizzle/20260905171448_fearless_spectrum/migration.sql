CREATE TYPE "media_type" AS ENUM('MOVIE', 'TV_SHOW');--> statement-breakpoint
CREATE TYPE "user_media_status" AS ENUM('WANT_TO_WATCH', 'CURRENTLY_WATCHING', 'WATCHED');--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"media_external_id" varchar(100) NOT NULL,
	"type" "media_type" NOT NULL,
	"title" varchar(500) NOT NULL,
	"poster_path" text,
	"description" text,
	"release_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_media_media_external_id_type" UNIQUE("media_external_id","type"),
	CONSTRAINT "uq_media_id_type" UNIQUE("id","type"),
	CONSTRAINT "chk_media_media_external_id_not_blank" CHECK (btrim("media_external_id") <> ''),
	CONSTRAINT "chk_media_title_not_blank" CHECK (btrim("title") <> '')
);
--> statement-breakpoint
CREATE TABLE "people" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"owner_user_id" uuid NOT NULL,
	"user_id" uuid,
	"name" varchar(255) NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_people_name_not_blank" CHECK (btrim("name") <> ''),
	CONSTRAINT "chk_people_not_owner" CHECK ("user_id" IS NULL OR "user_id" <> "owner_user_id")
);
--> statement-breakpoint
CREATE TABLE "shared_media_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"person_id" uuid NOT NULL,
	"media_id" uuid NOT NULL,
	"watched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shared_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"person_id" uuid NOT NULL,
	"media_id" uuid NOT NULL,
	"type" "media_type" NOT NULL,
	"status" "user_media_status" NOT NULL,
	"current_season" integer,
	"current_episode" integer,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_shared_media_person_media" UNIQUE("person_id","media_id"),
	CONSTRAINT "chk_shared_media_season" CHECK ("current_season" IS NULL OR "current_season" >= 1),
	CONSTRAINT "chk_shared_media_episode" CHECK ("current_episode" IS NULL OR "current_episode" >= 1),
	CONSTRAINT "chk_shared_media_episode_requires_season" CHECK ("current_episode" IS NULL OR "current_season" IS NOT NULL),
	CONSTRAINT "chk_shared_media_movie_progress" CHECK ("type" = 'TV_SHOW' OR ("current_season" IS NULL AND "current_episode" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "user_media_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"media_id" uuid NOT NULL,
	"watched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"media_id" uuid NOT NULL,
	"type" "media_type" NOT NULL,
	"status" "user_media_status" NOT NULL,
	"current_season" integer,
	"current_episode" integer,
	"rating" smallint,
	"is_favorite" boolean DEFAULT false NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_user_media_user_media" UNIQUE("user_id","media_id"),
	CONSTRAINT "chk_user_media_rating" CHECK ("rating" IS NULL OR "rating" BETWEEN 1 AND 5),
	CONSTRAINT "chk_user_media_season" CHECK ("current_season" IS NULL OR "current_season" >= 1),
	CONSTRAINT "chk_user_media_episode" CHECK ("current_episode" IS NULL OR "current_episode" >= 1),
	CONSTRAINT "chk_user_media_episode_requires_season" CHECK ("current_episode" IS NULL OR "current_season" IS NOT NULL),
	CONSTRAINT "chk_user_media_movie_progress" CHECK ("type" = 'TV_SHOW' OR ("current_season" IS NULL AND "current_episode" IS NULL))
);
--> statement-breakpoint
CREATE UNIQUE INDEX "uq_people_owner_linked_user" ON "people" ("owner_user_id","user_id") WHERE user_id IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_people_owner_name" ON "people" ("owner_user_id",lower(btrim("name")));--> statement-breakpoint
CREATE INDEX "idx_people_owner_user_id" ON "people" ("owner_user_id");--> statement-breakpoint
CREATE INDEX "idx_people_linked_user_id" ON "people" ("user_id") WHERE user_id IS NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_people_owner_active" ON "people" ("owner_user_id","updated_at" DESC NULLS LAST) WHERE archived_at IS NULL;--> statement-breakpoint
CREATE INDEX "idx_people_owner_archived" ON "people" ("owner_user_id","updated_at" DESC NULLS LAST) WHERE archived_at IS NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_shared_media_history_person_watched_at" ON "shared_media_history" ("person_id","watched_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_shared_media_history_person_media" ON "shared_media_history" ("person_id","media_id");--> statement-breakpoint
CREATE INDEX "idx_shared_media_person_status_updated" ON "shared_media" ("person_id","status","updated_at" DESC NULLS LAST) WHERE archived_at IS NULL;--> statement-breakpoint
CREATE INDEX "idx_shared_media_person_archived" ON "shared_media" ("person_id","updated_at" DESC NULLS LAST) WHERE archived_at IS NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_user_media_history_user_watched_at" ON "user_media_history" ("user_id","watched_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_user_media_history_user_media" ON "user_media_history" ("user_id","media_id");--> statement-breakpoint
CREATE INDEX "idx_user_media_user_status_updated" ON "user_media" ("user_id","status","updated_at" DESC NULLS LAST) WHERE archived_at IS NULL;--> statement-breakpoint
CREATE INDEX "idx_user_media_user_archived" ON "user_media" ("user_id","updated_at" DESC NULLS LAST) WHERE archived_at IS NOT NULL;--> statement-breakpoint
ALTER TABLE "people" ADD CONSTRAINT "people_owner_user_id_users_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "people" ADD CONSTRAINT "people_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shared_media_history" ADD CONSTRAINT "shared_media_history_person_id_people_id_fkey" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "shared_media_history" ADD CONSTRAINT "shared_media_history_media_id_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "shared_media" ADD CONSTRAINT "shared_media_person_id_people_id_fkey" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "shared_media" ADD CONSTRAINT "fk_shared_media_media" FOREIGN KEY ("media_id","type") REFERENCES "media"("id","type") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "user_media_history" ADD CONSTRAINT "user_media_history_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_media_history" ADD CONSTRAINT "user_media_history_media_id_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "user_media" ADD CONSTRAINT "user_media_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_media" ADD CONSTRAINT "fk_user_media_media" FOREIGN KEY ("media_id","type") REFERENCES "media"("id","type") ON DELETE RESTRICT;--> statement-breakpoint
-- Hand-added: drizzle-kit has no trigger/function DSL, so these are not
-- generated and must be appended on every migration that adds a table
-- with an updated_at column. Source of truth: claude/handoff/initial.sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;
CREATE TRIGGER trg_media_updated_at
BEFORE UPDATE ON media
FOR EACH ROW
WHEN (
    OLD.media_external_id IS DISTINCT FROM NEW.media_external_id
    OR OLD.type IS DISTINCT FROM NEW.type
    OR OLD.title IS DISTINCT FROM NEW.title
    OR OLD.poster_path IS DISTINCT FROM NEW.poster_path
    OR OLD.description IS DISTINCT FROM NEW.description
    OR OLD.release_date IS DISTINCT FROM NEW.release_date
)
EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint
CREATE TRIGGER trg_user_media_updated_at
BEFORE UPDATE ON user_media
FOR EACH ROW
WHEN (
    OLD.user_id IS DISTINCT FROM NEW.user_id
    OR OLD.media_id IS DISTINCT FROM NEW.media_id
    OR OLD.type IS DISTINCT FROM NEW.type
    OR OLD.status IS DISTINCT FROM NEW.status
    OR OLD.current_season IS DISTINCT FROM NEW.current_season
    OR OLD.current_episode IS DISTINCT FROM NEW.current_episode
    OR OLD.rating IS DISTINCT FROM NEW.rating
    OR OLD.is_favorite IS DISTINCT FROM NEW.is_favorite
    OR OLD.archived_at IS DISTINCT FROM NEW.archived_at
)
EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint
CREATE TRIGGER trg_people_updated_at
BEFORE UPDATE ON people
FOR EACH ROW
WHEN (
    OLD.owner_user_id IS DISTINCT FROM NEW.owner_user_id
    OR OLD.user_id IS DISTINCT FROM NEW.user_id
    OR OLD.name IS DISTINCT FROM NEW.name
    OR OLD.archived_at IS DISTINCT FROM NEW.archived_at
)
EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint
CREATE TRIGGER trg_shared_media_updated_at
BEFORE UPDATE ON shared_media
FOR EACH ROW
WHEN (
    OLD.person_id IS DISTINCT FROM NEW.person_id
    OR OLD.media_id IS DISTINCT FROM NEW.media_id
    OR OLD.type IS DISTINCT FROM NEW.type
    OR OLD.status IS DISTINCT FROM NEW.status
    OR OLD.current_season IS DISTINCT FROM NEW.current_season
    OR OLD.current_episode IS DISTINCT FROM NEW.current_episode
    OR OLD.archived_at IS DISTINCT FROM NEW.archived_at
)
EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
WHEN (
    OLD.name IS DISTINCT FROM NEW.name
    OR OLD.email IS DISTINCT FROM NEW.email
    OR OLD.email_verified_at IS DISTINCT FROM NEW.email_verified_at
)
EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint
CREATE TRIGGER trg_authentications_updated_at
BEFORE UPDATE ON authentications
FOR EACH ROW
WHEN (
    OLD.user_id IS DISTINCT FROM NEW.user_id
    OR OLD.provider IS DISTINCT FROM NEW.provider
    OR OLD.provider_account_id IS DISTINCT FROM NEW.provider_account_id
    OR OLD.password_hash IS DISTINCT FROM NEW.password_hash
)
EXECUTE FUNCTION set_updated_at();

