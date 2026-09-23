import { describe, expect, it } from 'vitest'
import { contactClientSchema, contactSchema } from '@/schemas/contact'
import { externalUrl, safeHref, upgradeSnapshot } from '@/schemas/portfolio-content'
import { formatPublicationType, generateBibtex } from '@/lib/bibtex'
import { hashPassword, needsRehash, verifyPassword } from '@/lib/password'

describe('safeHref', () => {
  it('allows relative paths, anchors, and https', () => {
    expect(safeHref.safeParse('/profile').success).toBe(true)
    expect(safeHref.safeParse('#work').success).toBe(true)
    expect(safeHref.safeParse('https://example.com').success).toBe(true)
    expect(safeHref.safeParse('mailto:hi@example.com').success).toBe(true)
  })

  it('rejects javascript and data URLs', () => {
    expect(safeHref.safeParse('javascript:alert(1)').success).toBe(false)
    expect(safeHref.safeParse('data:text/html,hi').success).toBe(false)
  })
})

describe('externalUrl', () => {
  it('requires https', () => {
    expect(externalUrl.safeParse('https://example.com').success).toBe(true)
    expect(externalUrl.safeParse('http://example.com').success).toBe(false)
  })
})

describe('contact schemas', () => {
  it('omits token on the client schema', () => {
    const values = {
      name: 'Jahid',
      email: 'jahid@example.com',
      subject: 'Hello there',
      message: 'This is a long enough message.'
    }
    expect(contactClientSchema.safeParse(values).success).toBe(true)
    expect(contactSchema.safeParse(values).success).toBe(false)
    expect(contactSchema.safeParse({ ...values, token: 'abc' }).success).toBe(true)
  })
})

describe('password hashing', () => {
  it('hashes, verifies, and reports rehash needs', async () => {
    const hash = await hashPassword('super-secure-password')
    expect(await verifyPassword('super-secure-password', hash)).toBe(true)
    expect(await verifyPassword('wrong-password', hash)).toBe(false)
    expect(needsRehash(hash)).toBe(false)
    expect(needsRehash('scrypt$16384$8$1$00$00')).toBe(true)
  })
})

describe('bibtex', () => {
  it('formats types and generates citations', () => {
    expect(formatPublicationType('CONFERENCE_PAPER')).toBe('Conference paper')
    const bibtex = generateBibtex({
      id: 'p1',
      slug: 'sample-paper',
      title: 'Sample Paper',
      year: 2025,
      type: 'CONFERENCE_PAPER',
      status: 'PUBLISHED',
      authors: [{ name: 'Md Jahid Alam Riad', isSelf: true }],
      topics: ['AI'],
      featured: true,
      enabled: true,
      scholarUrl: '',
      paperUrl: 'https://doi.org/10.1000/xyz',
      doi: '10.1000/xyz',
      venue: 'Example Conference'
    })
    expect(bibtex).toContain('@inproceedings')
    expect(bibtex).toContain('Sample Paper')
  })
})

describe('upgradeSnapshot', () => {
  it('upgrades a v1-shaped payload to schemaVersion 2', () => {
    const upgraded = upgradeSnapshot({
      schemaVersion: 1,
      settings: {
        siteName: 'Test',
        siteUrl: 'https://www.jahidriad.com',
        defaultTitle: 'Test',
        titleTemplate: '%s | Test',
        metaDescription: 'A meta description that is long enough for validation rules here.',
        keywords: ['test'],
        openGraphTitle: 'Test',
        openGraphDescription: 'OG',
        twitterTitle: 'Test',
        twitterDescription: 'Twitter'
      },
      copy: {
        heroHeading: 'Hello',
        heroAccent: 'world',
        heroIntroduction: 'Intro',
        heroPrimaryLabel: 'Work',
        heroPrimaryHref: '#work',
        heroSecondaryLabel: 'Research',
        heroSecondaryHref: '#research',
        heroFocusLabel: 'Focus',
        aboutEyebrow: 'About',
        aboutTitle: 'About',
        aboutBody: 'Body',
        aboutImageAlt: 'Alt',
        aboutCaptionLabel: 'Based in',
        principleOneTitle: 'One',
        principleOneText: 'Text one',
        principleTwoTitle: 'Two',
        principleTwoText: 'Text two',
        experienceEyebrow: 'Exp',
        experienceTitle: 'Exp',
        experienceDescription: 'Exp desc',
        publicationsEyebrow: 'Pub',
        publicationsTitle: 'Pub',
        publicationsDescription: 'Pub desc',
        publicationsActionLabel: 'All',
        capabilitiesEyebrow: 'Cap',
        capabilitiesTitle: 'Cap',
        capabilitiesDescription: 'Cap desc',
        educationEyebrow: 'Edu',
        educationTitle: 'Edu',
        educationDescription: 'Edu desc',
        contactEyebrow: 'Contact',
        contactTitle: 'Contact',
        contactDescription: 'Contact desc',
        contactPanelTitle: 'Panel',
        contactPrivacyCopy: 'Privacy'
      },
      profile: {
        name: 'Jahid',
        shortName: 'Jahid',
        role: 'Analyst',
        positioning: 'BA',
        summary: 'Summary',
        location: 'DC',
        socialLinks: [
          { label: 'LinkedIn', href: 'https://www.linkedin.com/in/example/', kind: 'linkedin', enabled: true }
        ]
      },
      experiences: [],
      education: [],
      publications: [
        {
          id: 'sample',
          title: 'Sample',
          year: 2025,
          type: 'IEEE conference paper',
          scholarUrl: 'https://scholar.google.com/',
          authors: ['Md Jahid Alam Riad'],
          topics: ['AI'],
          featured: true,
          enabled: true
        }
      ],
      capabilities: []
    })

    expect(upgraded.schemaVersion).toBe(2)
    expect(upgraded.publications[0]?.type).toBe('CONFERENCE_PAPER')
    expect(upgraded.publications[0]?.authors[0]?.isSelf).toBe(true)
    expect(upgraded.principles).toHaveLength(2)
  })
})
