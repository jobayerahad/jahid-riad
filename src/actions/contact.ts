'use server'

import axios from 'axios'
import { TContactForm } from '@/types'
import { sendEmail } from './utilities'

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

    if (!data.success || data.score < 0.5)
      return {
        status: 400,
        message: 'reCAPTCHA verification failed. Please try again.'
      }

    if (data.action !== 'contact_form')
      return {
        status: 400,
        message: 'Invalid reCAPTCHA action.'
      }

    await sendEmail({
      to: process.env.RECEIVER_EMAIL || '',
      subject: formData.subject || 'Contact Form Message',
      text: `Name: ${formData.name}\nEmail: ${formData.email}\nMessage: ${formData.message}`,
      html: ` <!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>New Contact Form Submission</title>
                <style>
                  body {
                    margin: 0;
                    padding: 40px 0;
                    background: #f6f8fb;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    color: #111827;
                  }

                  .email-wrapper {
                    max-width: 640px;
                    margin: 0 auto;
                    background: #ffffff;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 8px 30px rgba(0,0,0,0.05);
                    border: 1px solid rgba(0,0,0,0.05);
                  }

                  .header {
                    background: linear-gradient(135deg, #6366f1, #3b82f6);
                    color: #fff;
                    padding: 32px;
                    text-align: center;
                  }

                  .header h1 {
                    margin: 0;
                    font-size: 22px;
                    letter-spacing: -0.5px;
                    font-weight: 600;
                  }

                  .content {
                    padding: 32px;
                  }

                  .content h2 {
                    font-size: 18px;
                    font-weight: 600;
                    margin-bottom: 16px;
                    color: #111827;
                  }

                  .info {
                    margin-bottom: 24px;
                  }

                  .info-item {
                    margin-bottom: 12px;
                    font-size: 15px;
                    color: #374151;
                  }

                  .info-item span {
                    font-weight: 600;
                    color: #111827;
                  }

                  .message-box {
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 20px;
                    font-size: 15px;
                    line-height: 1.6;
                    white-space: pre-wrap;
                  }

                  .footer {
                    text-align: center;
                    padding: 24px;
                    font-size: 13px;
                    color: #6b7280;
                    border-top: 1px solid #f3f4f6;
                    background: #fafafa;
                  }

                  a {
                    color: #3b82f6;
                    text-decoration: none;
                  }

                  @media (max-width: 600px) {
                    body { padding: 20px; }
                    .content { padding: 24px; }
                  }
                </style>
              </head>
              <body>
                <div class="email-wrapper">
                  <div class="header">
                    <h1>Contact Form Message</h1>
                  </div>

                  <div class="content">
                    <div class="info">
                      <div class="info-item"><span>Name:</span> ${formData.name}</div>
                      <div class="info-item"><span>Email:</span> <a href="mailto:${formData.email}">${
        formData.email
      }</a></div>
                      <div class="info-item"><span>Subject:</span> ${formData.subject}</div>
                    </div>

                    <h2>Message</h2>
                    <div class="message-box">${formData.message.replace(/\n/g, '<br/>')}</div>
                  </div>

                  <div class="footer">
                    This message was sent from your website’s contact form.<br>
                    &copy; ${new Date().getFullYear()} All rights reserved.
                  </div>
                </div>
              </body>
              </html>`
    })

    return {
      status: 200,
      message: 'Your message has been sent successfully! We’ll get back to you soon.'
    }
  } catch (error) {
    return {
      status: 500,
      message: 'Oops, something went wrong while sending your message. Please try again in a moment.'
    }
  }
}
