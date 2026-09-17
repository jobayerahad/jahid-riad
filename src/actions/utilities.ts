'use server'

import nodemailer from 'nodemailer'
import type { TMail } from '@/types'

type MailCredentials = {
  user: string
  password: string
}

export const sendEmail = async ({ user, password }: MailCredentials, mail: TMail) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass: password }
  })

  await transporter.sendMail({
    from: `Jahid Riad Website <${user}>`,
    ...mail
  })
}
