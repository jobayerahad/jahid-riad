'use client'

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { WrapperProps } from '@/types'

const ReCaptchaProvider = ({ children }: WrapperProps) => (
  <GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}>
    {children}
  </GoogleReCaptchaProvider>
)

export default ReCaptchaProvider
