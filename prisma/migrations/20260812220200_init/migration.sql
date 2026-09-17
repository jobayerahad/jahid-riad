-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "access_token_expires_at" TIMESTAMP(3),
    "refresh_token_expires_at" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verifications" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_content" (
    "id" TEXT NOT NULL DEFAULT 'primary',
    "data" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "site_content_pkey" PRIMARY KEY ("id")
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
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
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
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "profile_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_copy_drafts" (
    "id" TEXT NOT NULL DEFAULT 'primary',
    "hero_heading" TEXT NOT NULL,
    "hero_accent" TEXT NOT NULL,
    "hero_introduction" TEXT NOT NULL,
    "hero_primary_label" TEXT NOT NULL,
    "hero_primary_href" TEXT NOT NULL,
    "hero_secondary_label" TEXT NOT NULL,
    "hero_secondary_href" TEXT NOT NULL,
    "hero_focus_label" TEXT NOT NULL,
    "about_eyebrow" TEXT NOT NULL,
    "about_title" TEXT NOT NULL,
    "about_body" TEXT NOT NULL,
    "about_image_alt" TEXT NOT NULL,
    "about_caption_label" TEXT NOT NULL,
    "principle_one_title" TEXT NOT NULL,
    "principle_one_text" TEXT NOT NULL,
    "principle_two_title" TEXT NOT NULL,
    "principle_two_text" TEXT NOT NULL,
    "experience_eyebrow" TEXT NOT NULL,
    "experience_title" TEXT NOT NULL,
    "experience_description" TEXT NOT NULL,
    "publications_eyebrow" TEXT NOT NULL,
    "publications_title" TEXT NOT NULL,
    "publications_description" TEXT NOT NULL,
    "publications_action_label" TEXT NOT NULL,
    "capabilities_eyebrow" TEXT NOT NULL,
    "capabilities_title" TEXT NOT NULL,
    "capabilities_description" TEXT NOT NULL,
    "education_eyebrow" TEXT NOT NULL,
    "education_title" TEXT NOT NULL,
    "education_description" TEXT NOT NULL,
    "contact_eyebrow" TEXT NOT NULL,
    "contact_title" TEXT NOT NULL,
    "contact_description" TEXT NOT NULL,
    "contact_panel_title" TEXT NOT NULL,
    "contact_privacy_copy" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "content_copy_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_link_drafts" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_link_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experience_drafts" (
    "id" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "current" BOOLEAN NOT NULL DEFAULT false,
    "summary" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
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
    "end_year" INTEGER NOT NULL,
    "detail" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "education_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publication_drafts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "venue" TEXT,
    "pages" TEXT,
    "doi" TEXT,
    "paper_url" TEXT,
    "scholar_url" TEXT NOT NULL,
    "abstract" TEXT,
    "media_asset_id" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "publication_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publication_author_drafts" (
    "id" TEXT NOT NULL,
    "publication_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "publication_author_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publication_topic_drafts" (
    "id" TEXT NOT NULL,
    "publication_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "publication_topic_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capability_group_drafts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
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
CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "public_id" TEXT,
    "secure_url" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
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
CREATE TABLE "content_revisions" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "note" TEXT,
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_by" TEXT NOT NULL,

    CONSTRAINT "content_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publication_state" (
    "id" TEXT NOT NULL DEFAULT 'primary',
    "active_revision_id" TEXT,
    "has_unpublished_changes" BOOLEAN NOT NULL DEFAULT true,
    "draft_updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "draft_updated_by" TEXT,
    "published_at" TIMESTAMP(3),

    CONSTRAINT "publication_state_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");

-- CreateIndex
CREATE INDEX "verifications_identifier_idx" ON "verifications"("identifier");

-- CreateIndex
CREATE INDEX "social_link_drafts_sort_order_idx" ON "social_link_drafts"("sort_order");

-- CreateIndex
CREATE INDEX "experience_drafts_sort_order_idx" ON "experience_drafts"("sort_order");

-- CreateIndex
CREATE INDEX "experience_highlights_parent_sort_idx" ON "experience_highlight_drafts"("experience_id", "sort_order");

-- CreateIndex
CREATE INDEX "education_drafts_sort_order_idx" ON "education_drafts"("sort_order");

-- CreateIndex
CREATE INDEX "publication_drafts_sort_order_idx" ON "publication_drafts"("sort_order");

-- CreateIndex
CREATE INDEX "publication_authors_parent_sort_idx" ON "publication_author_drafts"("publication_id", "sort_order");

-- CreateIndex
CREATE INDEX "publication_topics_parent_sort_idx" ON "publication_topic_drafts"("publication_id", "sort_order");

-- CreateIndex
CREATE INDEX "capability_group_drafts_sort_order_idx" ON "capability_group_drafts"("sort_order");

-- CreateIndex
CREATE INDEX "capability_items_parent_sort_idx" ON "capability_item_drafts"("group_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "media_assets_public_id_key" ON "media_assets"("public_id");

-- CreateIndex
CREATE INDEX "media_assets_kind_archived_idx" ON "media_assets"("kind", "archived_at");

-- CreateIndex
CREATE UNIQUE INDEX "content_revisions_version_key" ON "content_revisions"("version");

-- CreateIndex
CREATE UNIQUE INDEX "publication_state_active_revision_id_key" ON "publication_state"("active_revision_id");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience_highlight_drafts" ADD CONSTRAINT "experience_highlight_drafts_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "experience_drafts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publication_author_drafts" ADD CONSTRAINT "publication_author_drafts_publication_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "publication_drafts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publication_topic_drafts" ADD CONSTRAINT "publication_topic_drafts_publication_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "publication_drafts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capability_item_drafts" ADD CONSTRAINT "capability_item_drafts_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "capability_group_drafts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publication_state" ADD CONSTRAINT "publication_state_active_revision_id_fkey" FOREIGN KEY ("active_revision_id") REFERENCES "content_revisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
