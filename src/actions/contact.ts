'use server'

import { TContactForm } from '@/types'
import axios from 'axios'

export const sendMessage = async (formData: TContactForm) => {
  try {
    const { data } = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: formData.token
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )

    console.log(data)
  } catch (error) {
    console.error('Error sending contact message:', error)
  }
}
