# Portfolio redesign notes

## Audit

The previous homepage had already moved away from a chronological résumé, but it overcorrected into a large editorial experience. The hero headline reached almost 9rem, the opening filled a viewport, selected-work and research visuals approached 40rem in height, and an additional point-of-view chapter lengthened the page. Several sections repeated the same idea through an introduction, detail copy, evidence, and a link. The result was visually dramatic but slow to scan.

The content architecture does not require that presentation. Public data comes from a published Prisma revision, falls back to a validated repository snapshot, and is passed into the same `Home` component for signed-in draft and historical admin preview. Experience, education, publications, capabilities, copy, profile data, and media remain available in the snapshot. The contact action, metadata, full publication index, and reCAPTCHA provider are separate from homepage composition.

## Refined direction

The homepage is now a compact professional portfolio with controlled typography, concise copy, and photography that carries more visual weight. It keeps the warm neutral canvas, dark ink, restrained green, Inter, and Space Grotesk. Borders are used sparingly to establish rhythm; there are no skill pills, glass panels, gradients, shadows, or stacks of rounded cards.

The main type scale is capped at 4rem on desktop and 2.75rem on mobile. Section headings stay around 2–2.5rem, body copy stays around 1–1.1rem, and major section spacing is roughly 5–6.5rem. Tablet layouts remain art-directed instead of collapsing early into a single column.

## Homepage architecture

The public homepage now follows:

1. Compact point-of-view hero
2. Three selected work themes
3. Three selected research entries
4. Short about
5. Contact
6. Footer

The hero removes credentials, statistics, academic summaries, and publication counts. CMS-authored hero and about copy is authoritative (no hardcoded presentation overrides). Its two calls to action lead directly to work and research.

Selected work uses CMS `workStories` (with a seeded default set). Each item has one category line, a title, one short sentence, and a link. It does not add employers, metrics, projects, or outcomes. The full experience, education, capabilities, and professional learning record remains available on `/profile`.

Selected research shows at most three featured papers with year, venue, title, a short context line, and a link. Dense author lists and abstracts stay on `/publications`, including detail pages with BibTeX, DOI, and JSON-LD.

The navigation includes Profile and Publications plus Work, Research, About, and Contact.

The interface uses Heroicons for functional actions, section cues, metadata, location, and contact controls; LinkedIn retains its recognizable brand mark. Social links combine a compact icon container with a visible label. A restrained radius scale applies 20px image corners, 16px major surfaces, 10px controls, and 8px small icon controls.

## Motion and interaction

Framer Motion provides one shared motion system in `src/components/ui/motion-variants.ts` and `src/components/ui/reveal.tsx`. It defines fade-up, fade-in, horizontal slide, image reveal, and stagger-container variants with a consistent easing curve and 480–680ms entrance timing. The wrappers honor `prefers-reduced-motion` and leave the data-fetching homepage sections as server components.

The hero uses a short staggered load sequence and a scale/fade image entrance. Work and research items reveal in groups and are clickable across their full surface. Their hover states use transform, opacity, color, and background changes. About and Contact use offset timing between images and copy. The sticky header gains a scroll treatment and an active section indicator, while buttons, arrows, social links, and images provide restrained hover and press feedback.

## CMS and application boundaries

No schema or Prisma model changed. No draft was published and no production data was touched. `Home` still accepts an optional snapshot, so admin preview uses draft or historical content without a second fetch. The public page, profile page, and publication page each fetch the published snapshot once and pass it to their sections.

The contact workflow, lazy reCAPTCHA loading, metadata generation, social links, publication structured data, skip link, focus styles, heading hierarchy, keyboard navigation, and reduced-motion behavior remain in place. `/profile` remains in the sitemap.

## Content follow-up

The selected-work visuals are abstract compositions because the repository contains portraits and publication data but no verified project screenshots or case-study media. Approved project imagery and outcome details can replace them later without changing the page structure.
