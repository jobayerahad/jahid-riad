'use server'

import nodemailer from 'nodemailer'
import { TMail } from '@/types'

export const sendEmail = async ({ to, subject, text, html }: TMail) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, // your Gmail address
      pass: process.env.GMAIL_APP_PASSWORD // App password from Google
    }
  })

  const mailOptions = {
    from: `Jahid Riad Website <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text,
    html
  }

  await transporter.sendMail(mailOptions)
}
