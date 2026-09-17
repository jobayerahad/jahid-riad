import type { CapabilityGroup } from '@/types/content'

export const capabilityGroups: CapabilityGroup[] = [
  {
    id: 'business-analysis',
    title: 'Business Analysis',
    description: 'Turning stakeholder needs into clear, testable, and actionable delivery work.',
    items: ['Requirements analysis', 'Process improvement', 'Stakeholder communication', 'Reporting & dashboards']
  },
  {
    id: 'software-engineering',
    title: 'Software Engineering',
    description: 'Building and reasoning about maintainable web and software systems.',
    items: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'HTML & CSS', 'SQL']
  },
  {
    id: 'ai-data',
    title: 'AI, ML & Data',
    description: 'Applied machine-learning and data workflows for analysis and research.',
    items: ['Python', 'TensorFlow', 'scikit-learn', 'Pandas', 'NumPy', 'Keras', 'Data analysis']
  },
  {
    id: 'research',
    title: 'Research',
    description: 'Structured investigation, evaluation, and academic communication.',
    items: ['Research methodology', 'Statistical modeling', 'Academic writing', 'Literature review']
  },
  {
    id: 'tools-platforms',
    title: 'Tools & Platforms',
    description: 'Practical tooling used across software, data, and delivery workflows.',
    items: ['Git', 'GitHub', 'MySQL', 'MongoDB', 'Laravel', 'SaaS systems']
  }
]
