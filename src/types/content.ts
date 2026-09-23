export type SocialLink = {
  label: string
  href: string
  kind: 'linkedin' | 'scholar' | 'github' | 'orcid' | 'researchgate' | 'x' | 'email' | 'website'
}

export type Profile = {
  name: string
  shortName: string
  role: string
  positioning: string
  summary: string
  location: string
  socialLinks: SocialLink[]
}

export type Experience = {
  id: string
  organization: string
  organizationUrl?: string
  role: string
  location: string
  startDate: string
  endDate?: string
  period: string
  current?: boolean
  summary: string
  highlights: string[]
}

export type Education = {
  id: string
  institution: string
  degree: string
  location: string
  startYear: number
  endYear?: number | null
  detail?: string
}

export type PublicationAuthor = {
  name: string
  isSelf?: boolean
}

export type Publication = {
  id: string
  slug?: string
  title: string
  year: number
  month?: number | null
  authors?: Array<string | PublicationAuthor>
  venue?: string
  pages?: string
  doi?: string
  type: string
  status?: string
  paperUrl?: string
  scholarUrl?: string
  abstract?: string
  bibtex?: string
  topics: string[]
  featured: boolean
  coverImageId?: string | null
  pdfAssetId?: string | null
}

export type CapabilityGroup = {
  id: string
  title: string
  description: string
  items: string[]
}

export type LearningItem = {
  id: string
  title: string
  issuer: string
  year?: number | null
  credentialUrl?: string
}
