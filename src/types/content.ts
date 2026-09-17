export type SocialLink = {
  label: string
  href: string
  kind: 'linkedin' | 'scholar'
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
  endYear: number
  detail: string
}

export type Publication = {
  id: string
  title: string
  year: number
  authors?: string[]
  venue?: string
  pages?: string
  doi?: string
  type: string
  paperUrl?: string
  scholarUrl: string
  abstract?: string
  topics: string[]
  featured: boolean
}

export type CapabilityGroup = {
  id: string
  title: string
  description: string
  items: string[]
}
