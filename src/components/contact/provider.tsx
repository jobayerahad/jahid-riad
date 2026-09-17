'use client'

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import ContactForm from './form'

type Props = { siteKey: string }

const ContactFormProvider = ({ siteKey }: Props) => {
  if (!siteKey) return <ContactForm configured={false} />

  return (
    <GoogleReCaptchaProvider reCaptchaKey={siteKey} scriptProps={{ async: true, defer: true, appendTo: 'body' }}>
      <ContactForm configured />
    </GoogleReCaptchaProvider>
  )
}

export default ContactFormProvider
