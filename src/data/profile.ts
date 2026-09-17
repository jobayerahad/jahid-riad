import type { Profile } from '@/types/content'

export const SCHOLAR_URL = 'https://scholar.google.com/citations?user=fCis8uEAAAAJ&hl=en'

export const profile: Profile = {
  name: 'Md. Jahid Alam Riad',
  shortName: 'Jahid Riad',
  role: 'IT Business Analyst',
  positioning: 'Business Analysis · Software Engineering · AI Research',
  summary:
    'I connect business needs with practical technical solutions, drawing on experience in requirements analysis, software systems, data, machine learning, and applied research.',
  location: 'Washington, DC, USA',
  socialLinks: [
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/md-jahid-alam-riad-6937aa11a/',
      kind: 'linkedin'
    },
    { label: 'Google Scholar', href: SCHOLAR_URL, kind: 'scholar' }
  ]
}
