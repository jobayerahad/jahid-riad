import { Body, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from '@react-email/components'

export type ContactNotificationProps = {
  name: string
  email: string
  subject: string
  message: string
}

export const ContactNotification = ({ name, email, subject, message }: ContactNotificationProps) => (
  <Html lang="en">
    <Head />
    <Preview>
      New portfolio contact from {name}: {subject}
    </Preview>
    <Body style={body}>
      <Container style={container}>
        <Section style={header}>
          <Heading as="h1" style={heading}>
            New portfolio contact
          </Heading>
        </Section>
        <Section style={content}>
          <Text style={field}>
            <strong>Name:</strong> {name}
          </Text>
          <Text style={field}>
            <strong>Email:</strong> <Link href={`mailto:${email}`}>{email}</Link>
          </Text>
          <Text style={field}>
            <strong>Subject:</strong> {subject}
          </Text>
          <Hr style={divider} />
          <Text style={messageBody}>{message}</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

const body = {
  margin: 0,
  padding: '32px',
  background: '#f6f5f0',
  color: '#15243b',
  fontFamily: 'Arial, sans-serif'
} as const

const container = {
  maxWidth: '640px',
  margin: '0 auto',
  background: '#fff',
  border: '1px solid #dce3e9',
  borderRadius: '12px',
  overflow: 'hidden' as const
}

const header = {
  padding: '24px 28px',
  background: '#15243b',
  color: '#fff'
} as const

const heading = {
  fontSize: '20px',
  margin: 0,
  color: '#fff'
} as const

const content = {
  padding: '28px',
  lineHeight: 1.6
} as const

const field = {
  margin: '0 0 12px',
  color: '#15243b',
  fontSize: '15px'
} as const

const divider = {
  border: 0,
  borderTop: '1px solid #dce3e9',
  margin: '24px 0'
} as const

const messageBody = {
  margin: 0,
  color: '#15243b',
  fontSize: '15px',
  whiteSpace: 'pre-wrap' as const
}

export default ContactNotification
