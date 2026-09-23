-- CreateEnum
CREATE TYPE "MediaSource" AS ENUM ('LOCAL', 'CLOUDINARY');

-- CreateEnum
CREATE TYPE "MediaKind" AS ENUM ('IMAGE', 'PDF');

-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('LINKEDIN', 'SCHOLAR', 'GITHUB', 'ORCID', 'RESEARCHGATE', 'X', 'EMAIL', 'WEBSITE');

-- CreateEnum
CREATE TYPE "SiteSection" AS ENUM ('ABOUT', 'EXPERIENCE', 'PUBLICATIONS', 'CAPABILITIES', 'EDUCATION', 'LEARNING', 'CONTACT', 'WORK');

-- CreateEnum
CREATE TYPE "ContactMessageStatus" AS ENUM ('NEW', 'READ', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PublicationType" AS ENUM ('JOURNAL_ARTICLE', 'CONFERENCE_PAPER', 'WORKSHOP_PAPER', 'BOOK_CHAPTER', 'PREPRINT', 'THESIS', 'OTHER');

-- CreateEnum
CREATE TYPE "PublicationStatus" AS ENUM ('PUBLISHED', 'ACCEPTED', 'UNDER_REVIEW', 'PREPRINT');

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "last_login_at" TIMESTAMP(3),
    "password_changed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_sessions" (
    "id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capability_group_drafts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "capability_group_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capability_item_drafts" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "capability_item_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experience_drafts" (
    "id" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "organization_url" TEXT,
    "role" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "summary" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "experience_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experience_highlight_drafts" (
    "id" TEXT NOT NULL,
    "experience_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "experience_highlight_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education_drafts" (
    "id" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "start_year" INTEGER NOT NULL,
    "end_year" INTEGER,
    "detail" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "education_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL,
    "source" "MediaSource" NOT NULL,
    "kind" "MediaKind" NOT NULL,
    "public_id" TEXT,
    "secure_url" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "bytes" INTEGER,
    "format" TEXT,
    "original_filename" TEXT,
    "alt_text" TEXT,
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_drafts" (
    "id" TEXT NOT NULL DEFAULT 'primary',
    "name" TEXT NOT NULL,
    "short_name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "positioning" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "about_image_alt" TEXT,
    "about_caption_label" TEXT,
    "contact_panel_title" TEXT,
    "contact_privacy_copy" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "profile_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hero_copy_drafts" (
    "id" TEXT NOT NULL DEFAULT 'primary',
    "heading" TEXT NOT NULL,
    "accent" TEXT NOT NULL,
    "introduction" TEXT NOT NULL,
    "primary_label" TEXT NOT NULL,
    "primary_href" TEXT NOT NULL,
    "secondary_label" TEXT NOT NULL,
    "secondary_href" TEXT NOT NULL,
    "focus_label" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "hero_copy_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "section_copy_drafts" (
    "section" "SiteSection" NOT NULL,
    "eyebrow" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "action_label" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "section_copy_drafts_pkey" PRIMARY KEY ("section")
);

-- CreateTable
CREATE TABLE "about_principle_drafts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "about_principle_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_link_drafts" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "kind" "SocialPlatform" NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "social_link_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_story_drafts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "evidence" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "link_label" TEXT NOT NULL,
    "visual_label" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "work_story_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_drafts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "year" INTEGER,
    "credential_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "learning_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ContactMessageStatus" NOT NULL DEFAULT 'NEW',
    "email_delivered" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topics" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publication_drafts" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER,
    "type" "PublicationType" NOT NULL,
    "status" "PublicationStatus" NOT NULL DEFAULT 'PUBLISHED',
    "venue" TEXT,
    "pages" TEXT,
    "doi" TEXT,
    "paper_url" TEXT,
    "scholar_url" TEXT,
    "abstract" TEXT,
    "bibtex" TEXT,
    "cover_image_id" TEXT,
    "pdf_asset_id" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "publication_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publication_author_drafts" (
    "id" TEXT NOT NULL,
    "publication_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_self" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "publication_author_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publication_topic_drafts" (
    "id" TEXT NOT NULL,
    "publication_id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "publication_topic_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_revisions" (
    "id" TEXT NOT NULL,
    "version" SERIAL NOT NULL,
    "schema_version" INTEGER NOT NULL DEFAULT 2,
    "snapshot" JSONB NOT NULL,
    "note" TEXT,
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publish_state" (
    "id" TEXT NOT NULL DEFAULT 'primary',
    "active_revision_id" TEXT,
    "has_unpublished_changes" BOOLEAN NOT NULL DEFAULT true,
    "draft_updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "draft_updated_by" TEXT,
    "published_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "publish_state_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_limit_buckets" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_limit_buckets_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL DEFAULT 'primary',
    "site_name" TEXT NOT NULL,
    "site_url" TEXT NOT NULL,
    "default_title" TEXT NOT NULL,
    "title_template" TEXT NOT NULL,
    "meta_description" TEXT NOT NULL,
    "keywords" TEXT[],
    "open_graph_title" TEXT NOT NULL,
    "open_graph_description" TEXT NOT NULL,
    "twitter_title" TEXT NOT NULL,
    "twitter_description" TEXT NOT NULL,
    "hero_image_id" TEXT,
    "about_image_id" TEXT,
    "logo_image_id" TEXT,
    "open_graph_image_id" TEXT,
    "cv_asset_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_sessions_token_hash_key" ON "admin_sessions"("token_hash");

-- CreateIndex
CREATE INDEX "admin_sessions_admin_id_idx" ON "admin_sessions"("admin_id");

-- CreateIndex
CREATE INDEX "admin_sessions_expires_at_idx" ON "admin_sessions"("expires_at");

-- CreateIndex
CREATE INDEX "capability_group_drafts_sort_order_idx" ON "capability_group_drafts"("sort_order");

-- CreateIndex
CREATE INDEX "capability_items_parent_sort_idx" ON "capability_item_drafts"("group_id", "sort_order");

-- CreateIndex
CREATE INDEX "experience_drafts_sort_order_idx" ON "experience_drafts"("sort_order");

-- CreateIndex
CREATE INDEX "experience_highlights_parent_sort_idx" ON "experience_highlight_drafts"("experience_id", "sort_order");

-- CreateIndex
CREATE INDEX "education_drafts_sort_order_idx" ON "education_drafts"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "media_assets_public_id_key" ON "media_assets"("public_id");

-- CreateIndex
CREATE INDEX "media_assets_kind_archived_idx" ON "media_assets"("kind", "archived_at");

-- CreateIndex
CREATE INDEX "about_principle_drafts_sort_order_idx" ON "about_principle_drafts"("sort_order");

-- CreateIndex
CREATE INDEX "social_link_drafts_sort_order_idx" ON "social_link_drafts"("sort_order");

-- CreateIndex
CREATE INDEX "work_story_drafts_sort_order_idx" ON "work_story_drafts"("sort_order");

-- CreateIndex
CREATE INDEX "learning_drafts_sort_order_idx" ON "learning_drafts"("sort_order");

-- CreateIndex
CREATE INDEX "contact_messages_status_created_idx" ON "contact_messages"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "topics_name_key" ON "topics"("name");

-- CreateIndex
CREATE UNIQUE INDEX "topics_slug_key" ON "topics"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "publication_drafts_slug_key" ON "publication_drafts"("slug");

-- CreateIndex
CREATE INDEX "publication_drafts_sort_order_idx" ON "publication_drafts"("sort_order");

-- CreateIndex
CREATE INDEX "publication_drafts_year_idx" ON "publication_drafts"("year");

-- CreateIndex
CREATE INDEX "publication_authors_parent_sort_idx" ON "publication_author_drafts"("publication_id", "sort_order");

-- CreateIndex
CREATE INDEX "publication_topics_parent_sort_idx" ON "publication_topic_drafts"("publication_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "publication_topics_unique" ON "publication_topic_drafts"("publication_id", "topic_id");

-- CreateIndex
CREATE UNIQUE INDEX "content_revisions_version_key" ON "content_revisions"("version");

-- CreateIndex
CREATE UNIQUE INDEX "publish_state_active_revision_id_key" ON "publish_state"("active_revision_id");

-- CreateIndex
CREATE INDEX "rate_limit_buckets_expires_at_idx" ON "rate_limit_buckets"("expires_at");

-- AddForeignKey
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capability_item_drafts" ADD CONSTRAINT "capability_item_drafts_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "capability_group_drafts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience_highlight_drafts" ADD CONSTRAINT "experience_highlight_drafts_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "experience_drafts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publication_drafts" ADD CONSTRAINT "publication_drafts_cover_image_id_fkey" FOREIGN KEY ("cover_image_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publication_drafts" ADD CONSTRAINT "publication_drafts_pdf_asset_id_fkey" FOREIGN KEY ("pdf_asset_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publication_author_drafts" ADD CONSTRAINT "publication_author_drafts_publication_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "publication_drafts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publication_topic_drafts" ADD CONSTRAINT "publication_topic_drafts_publication_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "publication_drafts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publication_topic_drafts" ADD CONSTRAINT "publication_topic_drafts_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publish_state" ADD CONSTRAINT "publish_state_active_revision_id_fkey" FOREIGN KEY ("active_revision_id") REFERENCES "content_revisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_hero_image_id_fkey" FOREIGN KEY ("hero_image_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_about_image_id_fkey" FOREIGN KEY ("about_image_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_image_id_fkey" FOREIGN KEY ("logo_image_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_open_graph_image_id_fkey" FOREIGN KEY ("open_graph_image_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_cv_asset_id_fkey" FOREIGN KEY ("cv_asset_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
