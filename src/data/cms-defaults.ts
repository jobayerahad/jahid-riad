import type { ContentCopyInput, SiteSettingsInput } from '@/schemas/portfolio-content'

export const defaultSiteSettings: SiteSettingsInput = {
  siteName: 'Md. Jahid Alam Riad',
  siteUrl: 'https://www.jahidriad.com',
  defaultTitle: 'Md. Jahid Alam Riad | IT Business Analyst',
  titleTemplate: '%s | Md. Jahid Alam Riad',
  metaDescription:
    'Portfolio of Md. Jahid Alam Riad, an IT Business Analyst with software engineering, AI, data, and applied research experience.',
  keywords: ['Jahid Riad', 'IT Business Analyst', 'Software Engineering', 'Applied AI', 'Machine Learning Research'],
  openGraphTitle: 'Md. Jahid Alam Riad | IT Business Analyst',
  openGraphDescription: 'Business analysis informed by software engineering, data, AI, and applied research.',
  twitterTitle: 'Md. Jahid Alam Riad | IT Business Analyst',
  twitterDescription: 'Business analysis informed by software engineering, data, AI, and applied research.',
  heroImageId: 'local-about',
  aboutImageId: null,
  logoImageId: 'local-logo',
  openGraphImageId: null,
  cvAssetId: null
}

export const defaultContentCopy: ContentCopyInput = {
  heroHeading: 'Business analysis, software engineering',
  heroAccent: 'and applied AI research.',
  heroIntroduction:
    "I'm {name}, an {role} working across requirements, software systems, data, and applied AI research.",
  heroPrimaryLabel: 'Explore research',
  heroPrimaryHref: '#publications',
  heroSecondaryLabel: 'LinkedIn',
  heroSecondaryHref: 'https://www.linkedin.com/in/md-jahid-alam-riad-6937aa11a/',
  heroFocusLabel: 'Current focus',
  aboutEyebrow: 'Profile',
  aboutTitle: 'Connecting decisions, systems, and research',
  aboutBody:
    'My background spans business analysis, IT operations, teaching, software development, and applied machine-learning research. That range helps me communicate across technical and non-technical teams while keeping solutions grounded in real constraints.',
  aboutImageAlt: 'Attending a professional research conference',
  aboutCaptionLabel: 'Based in',
  principleOneTitle: 'Clarity before complexity',
  principleOneText: 'Define the problem, the people affected, and the evidence needed before choosing technology.',
  principleTwoTitle: 'Evidence over claims',
  principleTwoText: 'Use research, data, and observable outcomes to make work credible and decisions defensible.',
  experienceEyebrow: 'Professional journey',
  experienceTitle: 'Experience across business and technology',
  experienceDescription: 'A reverse-chronological view of roles spanning analysis, education, and IT operations.',
  publicationsEyebrow: 'Selected research',
  publicationsTitle: 'Research with practical context',
  publicationsDescription:
    'Featured work across conversational AI, language models, natural-language processing, and applied machine learning.',
  publicationsActionLabel: 'View all publications',
  capabilitiesEyebrow: 'Capabilities',
  capabilitiesTitle: 'A practical, cross-functional toolkit',
  capabilitiesDescription: 'Grouped by how the skills are applied rather than by unverifiable percentage scores.',
  educationEyebrow: 'Academic foundation',
  educationTitle: 'Education',
  educationDescription:
    'Formal study across information technology, computer science, telecommunications, and science.',
  contactEyebrow: 'Contact',
  contactTitle: 'Start a thoughtful conversation',
  contactDescription:
    'For business analysis, software delivery, or research collaboration, send a short note with the context and intended outcome.',
  contactPanelTitle: 'Get in touch',
  contactPrivacyCopy:
    'Use the secure form to share the context and intended outcome. Messages are protected by reCAPTCHA and used only to respond to the request.'
}
