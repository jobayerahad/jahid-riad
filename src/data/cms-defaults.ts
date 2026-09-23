import type {
  AboutPrincipleInput,
  ContentCopyInput,
  HeroCopyInput,
  LearningInput,
  SectionCopyInput,
  SiteSettingsInput,
  WorkStoryInput
} from '@/schemas/portfolio-content'

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
  aboutImageId: 'local-personal',
  logoImageId: 'local-logo',
  openGraphImageId: null,
  cvAssetId: null
}

export const defaultHeroCopy: HeroCopyInput = {
  heading: 'Turning complex problems into',
  accent: 'systems that work.',
  introduction:
    'Business analyst, software engineer, and applied AI researcher connecting people, data, and systems.',
  primaryLabel: 'Explore work',
  primaryHref: '#work',
  secondaryLabel: 'View research',
  secondaryHref: '#research',
  focusLabel: 'Business · Technology · Research'
}

export const defaultAboutPrinciples: AboutPrincipleInput[] = [
  {
    title: 'Clarity before complexity',
    text: 'Define the problem, the people affected, and the evidence needed before choosing technology.',
    enabled: true
  },
  {
    title: 'Evidence over claims',
    text: 'Use research, data, and observable outcomes to make work credible and decisions defensible.',
    enabled: true
  }
]

export const defaultSectionCopy: SectionCopyInput[] = [
  {
    section: 'ABOUT',
    eyebrow: 'Profile',
    title: 'Connecting decisions, systems, and research',
    description:
      'I bring business analysis, software engineering, and applied research together to make complex work clearer and more useful.',
    actionLabel: ''
  },
  {
    section: 'EXPERIENCE',
    eyebrow: 'Professional journey',
    title: 'Experience across business and technology',
    description: 'A reverse-chronological view of roles spanning analysis, education, and IT operations.',
    actionLabel: ''
  },
  {
    section: 'PUBLICATIONS',
    eyebrow: 'Selected research',
    title: 'Research with practical context',
    description:
      'Featured work across conversational AI, language models, natural-language processing, and applied machine learning.',
    actionLabel: 'View all publications'
  },
  {
    section: 'CAPABILITIES',
    eyebrow: 'Capabilities',
    title: 'A practical, cross-functional toolkit',
    description: 'Grouped by how the skills are applied rather than by unverifiable percentage scores.',
    actionLabel: ''
  },
  {
    section: 'EDUCATION',
    eyebrow: 'Academic foundation',
    title: 'Education',
    description: 'Formal study across information technology, computer science, telecommunications, and science.',
    actionLabel: ''
  },
  {
    section: 'LEARNING',
    eyebrow: 'Continuous learning',
    title: 'Professional learning',
    description: 'Courses, peer-review practice, and languages that support day-to-day work.',
    actionLabel: ''
  },
  {
    section: 'WORK',
    eyebrow: 'Selected work',
    title: 'Selected work',
    description: 'Three stories that connect analysis, systems, and applied research.',
    actionLabel: ''
  },
  {
    section: 'CONTACT',
    eyebrow: 'Contact',
    title: 'Start a thoughtful conversation',
    description:
      'For business analysis, software delivery, or research collaboration, send a short note with the context and intended outcome.',
    actionLabel: ''
  }
]

export const defaultLearning: LearningInput[] = [
  { title: 'React – The Complete Guide', issuer: 'Udemy', year: null, credentialUrl: '', enabled: true },
  {
    title: 'DevOps Beginners to Advanced with Projects',
    issuer: 'Udemy',
    year: null,
    credentialUrl: '',
    enabled: true
  },
  { title: 'Co-reviewing with a Mentor', issuer: 'Web of Science', year: null, credentialUrl: '', enabled: true },
  { title: 'Reviewing in the Sciences', issuer: 'Web of Science', year: null, credentialUrl: '', enabled: true }
]

export const defaultWorkStories: WorkStoryInput[] = [
  {
    title: 'From needs to delivery',
    body: 'Translating business requirements into clear technical work and implementation plans.',
    evidence: 'IT Business Analyst · UpSkill Consultancy Inc.',
    visualLabel: 'Analysis',
    href: '/profile#experience',
    linkLabel: 'View experience',
    enabled: true
  },
  {
    title: 'Systems with context',
    body: 'Building and reasoning about maintainable software, data, and operational systems.',
    evidence: 'Software engineering',
    visualLabel: 'Systems',
    href: '/profile#skills',
    linkLabel: 'View capabilities',
    enabled: true
  },
  {
    title: 'AI in human contexts',
    body: 'Research across conversational AI, Bangla NLP, sentiment, and cross-cultural sensitivity.',
    evidence: 'Applied AI research',
    visualLabel: 'Research',
    href: '#research',
    linkLabel: 'View research',
    enabled: true
  }
]

export const defaultContentCopy: ContentCopyInput = {
  heroHeading: defaultHeroCopy.heading,
  heroAccent: defaultHeroCopy.accent,
  heroIntroduction: defaultHeroCopy.introduction,
  heroPrimaryLabel: defaultHeroCopy.primaryLabel,
  heroPrimaryHref: defaultHeroCopy.primaryHref,
  heroSecondaryLabel: defaultHeroCopy.secondaryLabel,
  heroSecondaryHref: defaultHeroCopy.secondaryHref,
  heroFocusLabel: defaultHeroCopy.focusLabel,
  aboutEyebrow: 'Profile',
  aboutTitle: 'Connecting decisions, systems, and research',
  aboutBody:
    'I bring business analysis, software engineering, and applied research together to make complex work clearer and more useful.',
  aboutImageAlt: 'Md. Jahid Alam Riad outdoors on a snowy Washington street',
  aboutCaptionLabel: 'Based in',
  principles: defaultAboutPrinciples,
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
  learningEyebrow: 'Continuous learning',
  learningTitle: 'Professional learning',
  learningDescription: 'Courses, peer-review practice, and languages that support day-to-day work.',
  workEyebrow: 'Selected work',
  workTitle: 'Selected work',
  workDescription: 'Three stories that connect analysis, systems, and applied research.',
  contactEyebrow: 'Contact',
  contactTitle: 'Start a thoughtful conversation',
  contactDescription:
    'For business analysis, software delivery, or research collaboration, send a short note with the context and intended outcome.',
  contactPanelTitle: 'Get in touch',
  contactPrivacyCopy:
    'Use the secure form to share the context and intended outcome. Messages are protected by reCAPTCHA and used only to respond to the request.'
}
