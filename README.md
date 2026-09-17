# Jahid Riad Portfolio

An editorial portfolio built with Next.js App Router, strict TypeScript, Mantine, CSS Modules, Prisma, PostgreSQL, Better Auth, and Cloudinary. The protected `/admin` area is a form-based CMS for one owner.

Normalized PostgreSQL tables hold the working draft. Public pages read only the immutable snapshot selected by `publication_state.active_revision_id`. If PostgreSQL is unavailable or not configured, public pages safely use bundled content.

## Local development

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

Quality commands:

```bash
npm run format:check
npm run typecheck
npm run build
```

`npm run check` runs all three. This project intentionally does not include ESLint or a test framework.

## Environment

Copy `.env.example` to `.env.local`.

Admin and database:

- `DATABASE_URL`: PostgreSQL connection URL
- `BETTER_AUTH_URL`: application origin, such as `http://localhost:3000`
- `BETTER_AUTH_SECRET`: random secret of at least 32 characters
- `ADMIN_EMAIL`: only account allowed to enter the CMS
- `ADMIN_PASSWORD`: used only by the initial seed; at least 12 characters

Cloudinary:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`: server-only signing secret; never expose it to the browser

Contact delivery:

- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- `RECAPTCHA_SECRET_KEY`
- `RECAPTCHA_HOSTNAME`
- `GMAIL_USER`
- `GMAIL_APP_PASSWORD`
- `RECEIVER_EMAIL`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `GA_TRACKING_ID` is optional

## Database setup and migration

For a new database or this normalized-CMS release, run these commands in order:

```bash
npm run db:deploy
npm run db:seed
```

`db:deploy` must run first; seeding cannot write to tables that do not exist. The seed is idempotent: it creates the configured administrator only when absent and initializes normalized content only when no draft exists.

The compatibility `site_content` document remains for this release. Initialization imports valid legacy content when present, otherwise imports bundled content, then creates and activates revision 1. Rerunning the seed does not duplicate normalized rows or revisions.

## Admin workflow

1. Open `/admin` and sign in with `ADMIN_EMAIL` and the seeded password.
2. Edit labeled fields in Profile, About, Experience, Publications, Capabilities, Education, Contact, Media, or SEO.
3. Use **Save draft**. Saved drafts are not public.
4. Open **Preview** to render the current draft through the real public components.
5. Use **Publish changes** to validate the entire draft, create an immutable revision, activate it, and revalidate public content and metadata.
6. Use **Revisions** to preview history or roll back. Rollback creates a new revision and synchronizes the working draft to the selected snapshot.

The CMS manages content and approved media only. It does not expose layout, CSS, route IDs, authentication configuration, or contact infrastructure.

## Media

Uploads are signed on the server and sent directly to Cloudinary. Images accept JPEG, PNG, or WebP up to 5 MB. CV uploads accept PDF up to 10 MB. After upload, the server retrieves Cloudinary's own asset record and independently validates its type, size, URL, and metadata before registration.

Referenced assets cannot be archived. Bundled local assets cannot be removed through the CMS. This release archives unused managed assets without permanently deleting them from Cloudinary.

## Architecture

- `prisma/schema.prisma`: Better Auth, normalized drafts, media, immutable revisions, and publication state. Prisma/application fields are camelCase; every PostgreSQL table and renamed column maps to snake_case.
- `src/lib/cms.ts`: compatibility import, draft serialization, snapshot synchronization, and active-revision reads.
- `src/actions/admin.ts`: authorized, Zod-validated draft, publishing, rollback, and media actions.
- `src/app/admin` and `src/components/admin`: responsive CMS shell, guided forms, protected preview, and revision history.
- `src/app/page.tsx` and `src/app/publications/page.tsx`: public rendering from the active snapshot only.
- `src/actions/contact.ts`: independently validated and rate-limited contact delivery.

## Deployment and backup

Before schema deployment or rollback, create a provider-level PostgreSQL backup. Cloudinary assets are external to that backup, so retain Cloudinary backups/versioning according to the account policy.

Release sequence:

1. Back up PostgreSQL.
2. Run `npm ci` and `npm run db:deploy`.
3. Run `npm run db:seed` once for the first normalized-CMS release.
4. Run `npm run check`.
5. Configure database, Better Auth, Cloudinary, contact, reCAPTCHA, and optional analytics variables at the host.
6. Verify wrong-email denial, all create/edit/delete/duplicate/reorder flows, stale edits, image/PDF upload, referenced-asset protection, draft privacy, preview, publish, revision preview, and rollback.
7. Check `/`, `/publications`, `/sitemap.xml`, `/robots.txt`, `/opengraph-image`, and contact delivery at 320, 375, 768, 1024, and 1440 px.

After the first successful seed, `ADMIN_PASSWORD` can be removed from the production environment. Keep `BETTER_AUTH_SECRET`, `ADMIN_EMAIL`, and Cloudinary credentials configured.
