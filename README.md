# Jahid Riad Portfolio

An editorial portfolio built with Next.js App Router, strict TypeScript, Mantine, CSS Modules, Prisma, PostgreSQL, and Cloudinary. The protected `/admin` area is a form-based CMS for one owner.

Normalized PostgreSQL tables hold the working draft. Public pages read only the immutable snapshot selected by `publish_state.active_revision_id`. If PostgreSQL is unavailable or not configured, public pages safely use bundled content.

## Local development

```bash
npm ci
npm run db:deploy
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

Quality commands:

```bash
npm run lint
npm run typecheck
npm run test
npm run format:check
npm run build
```

`npm run check` runs format, lint, typecheck, unit tests, and build. End-to-end smoke tests: `npm run test:e2e` (requires a production build and Playwright browsers).

## Environment

Copy `.env.example` to `.env.local`.

Admin and database:

- `DATABASE_URL`: PostgreSQL connection URL
- `ADMIN_EMAIL`: only account allowed to enter the CMS
- `ADMIN_PASSWORD`: used only by the initial seed; at least 12 characters

Cloudinary:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`: server-only signing secret; never expose it to the browser

Contact delivery (Resend):

- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- `RECAPTCHA_SECRET_KEY`
- `RECAPTCHA_HOSTNAME`
- `RESEND_API_KEY`
- `CONTACT_FROM_EMAIL` (for example `Jahid Riad Website <contact@jahidriad.com>`)
- `CONTACT_TO_EMAIL`
- `GA_TRACKING_ID` is optional (loaded only after analytics consent)

One-time Resend domain setup:

1. Add `jahidriad.com` in the Resend dashboard.
2. Add the SPF, DKIM, and MX records Resend lists, then wait for verification.
3. Add a DMARC record such as `v=DMARC1; p=none;`.
4. Create an API key with only Sending access.

## Database setup and migration

For a new database:

```bash
npm run db:deploy
npm run db:seed
```

`db:deploy` must run first; seeding cannot write to tables that do not exist. The seed is idempotent: it creates the configured administrator only when absent and initializes CMS content only when no draft exists.

This release uses a fresh `init` migration (pre-launch). Draft models, media relations, topics, learning, work stories, contact messages, and `publish_state` replace the earlier Better Auth / `site_content` layout.

## Admin workflow

1. Open `/admin` and sign in with `ADMIN_EMAIL` and the seeded password.
2. Edit Profile, About, Experience, Publications, Capabilities, Education, Learning, Work stories, Contact, Messages, Media, or SEO.
3. Use **Save draft**. Saved drafts are not public.
4. Open **Preview** to render the current draft through the real public components.
5. Use **Publish** to validate the entire draft, create an immutable revision, activate it, and revalidate public content.
6. Use **Revisions** to preview history or roll back. Rollback creates a new revision and synchronizes the working draft to the selected snapshot.
7. Use **Account** to change the password or revoke all sessions.

## Media

Images and PDFs upload to Cloudinary with a signed request, then register in `media_assets`. Archive is soft-delete and refuses assets still referenced by drafts. Bundled `LOCAL` portraits cannot be archived.

## Security notes

- Login and contact rate limiting use PostgreSQL (`rate_limit_buckets`) and fail closed when the database is unavailable.
- Session cookies are httpOnly, SameSite=Lax, and Secure in production.
- Public link fields accept only safe href schemes (`https`, `http`, `mailto`, paths, anchors).
- Contact submissions are stored in `contact_messages` before Resend delivery; `emailDelivered` tracks send success.
