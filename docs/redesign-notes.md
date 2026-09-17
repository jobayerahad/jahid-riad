# Portfolio redesign notes

## Audit

The repository already contained an in-progress CMS refactor. Public content is read from a published snapshot, with repository defaults in `src/data` and `src/data/cms-defaults.ts` when the database is unavailable. The CMS draft, active revision, and admin preview are separate states. The live revision still contained the earlier hero slogan and winter selfie; editing fallback defaults alone did not change the published page.

The public presentation mixed a slogan-first hero, overlapping highlight cards, a dark decorative timeline, research cards, skill pills, and education cards. The same facts appeared in several visual treatments. The hero copy repeated the name and role; about copy repeated the summary. The header tracked scroll and section visibility with client-side listeners despite the site needing only straightforward navigation. Disabled social links were not filtered by the shared links component. Publication structured data had a hardcoded site URL and IEEE publisher for every future CMS record.

The contact submission and reCAPTCHA path, CMS publication workflow, admin preview, responsive drawer, and dynamic metadata were working and remain in place. There is no `framer-motion` or `motion` dependency in this checkout; the existing reveal component uses an IntersectionObserver and CSS transitions with reduced-motion support.

## Design read and references

Reading this as an editorial professional portfolio for recruiters, research collaborators, and senior technology professionals. Typography, an evidence-led research list, and precise chronology carry the visual hierarchy. The palette is warm paper, dark forest, and restrained green accents.

- [Slack executive biography](https://mobbin.com/sites/sections/1bafeb86-728a-425b-aa78-c5e680e7f640): a rectangular portrait beside factual identity and biography informed the name-first hero.
- [Waabi publications](https://mobbin.com/sites/sections/9aaa2fb5-80ec-483f-98b3-e3dcf5217ffb) and [OpenAI index](https://mobbin.com/sites/sections/1e4d6891-db02-4b62-8ae8-8addb56aa87e): paper titles, dates, author/venue metadata, and rules informed the research rows and dedicated index.
- [Webflow careers](https://mobbin.com/sites/sections/cd3b84b1-6a90-4caf-a6a7-82c1a1522786): aligned role, location, and category information informed the experience and education records.
- [Analogue Agency capabilities](https://mobbin.com/sites/sections/7063e124-d7b5-4fe4-9797-b318a5be20d1): typographic capability groups informed the skills section.
- [Trawelt contact](https://mobbin.com/sites/sections/e471ecd9-0f95-42a4-b93f-a2a9ae0c991b) and [Shupatto footer](https://mobbin.com/sites/sections/471f17eb-e5b3-4785-8cd9-333119653eac): concise invitation and quiet footer hierarchy informed the closing sections.
- [Open mobile menu](https://mobbin.com/screens/c59ad58b-6c05-4fae-a3ec-18897e0fbae1): large, plain menu targets informed the navigation drawer.

These references guided hierarchy and density. Layout, palette, copy, and behavior were adapted to the repository content.

## Content and implementation choices

The narrative is identity, profile, professional record, selected research, education, capabilities, professional learning, contact. The dedicated publications page retains all enabled records, including nonfeatured papers. Public section components remain server components. Client JavaScript is confined to navigation, reveal behavior, and the lazy contact form.

A presentation helper recognizes the exact old published hero copy and local winter portrait, replacing the slogan with the published profile positioning and using the already published conference photograph. Other CMS-authored hero text and media remain authoritative. The about photograph appears only when the CMS supplies an image different from the effective hero photograph. Disabled social links are filtered. The removed highlights component duplicated facts already visible in the hero. Local Inter and Space Grotesk subsets make builds independent of Google Fonts connectivity.

## Follow-up

The older committed `src/config/data.ts` listed four courses/reviewing items and language proficiency. Those are now held in one `src/data/professional-learning.ts` source and shown as professional learning, with no dates or additional achievement claims. The same old source listed three conference names, a public phone/email, C/C++ skills, and a 2025 year for the AI-tweets paper. Conference participation, direct contact details, and older skill claims need current verification before they are advertised; the newer publication record supplies 2024 for that paper.

The archived conference names are Third International Conference on Artificial Intelligence and Machine Learning Applications (AIMLA); First International Conference on Emerging Technologies and Computing Innovations (ICETCI-2025); and IEEE Authorship and Open Access Symposium: Tips and Best Practices to Get Published from IEEE Editors. The old public contact details were +1 202-528-0333 and jahidalamriad@gmail.com. They remain recoverable in the previous commit and are not printed on the live site, which uses the newer secure contact workflow. The older skill list also contained C, C++, and quantitative/qualitative analysis; these were not promoted into the current capability claims without verification.

The CMS editor still has fields inherited from the earlier visual system. Its copy can be revised at the next content publish. Professional learning is repository-backed rather than CMS-managed and could be moved into the CMS if it needs frequent editing. The public CV asset is not configured in the current CMS snapshot, so there is no download CTA.
