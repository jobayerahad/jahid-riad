import type { ContactInput } from '@/schemas/contact'
import { escapeHtml } from './escape-html'

export const createContactEmail = (input: ContactInput) => {
  const name = escapeHtml(input.name)
  const email = escapeHtml(input.email)
  const subject = escapeHtml(input.subject)
  const message = escapeHtml(input.message).replace(/\r?\n/g, '<br />')

  return {
    text: `Name: ${input.name}\nEmail: ${input.email}\nSubject: ${input.subject}\n\n${input.message}`,
    html: `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:32px;background:#f6f5f0;color:#15243b;font-family:Arial,sans-serif">
    <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #dce3e9;border-radius:12px;overflow:hidden">
      <div style="padding:24px 28px;background:#15243b;color:#fff">
        <h1 style="font-size:20px;margin:0">New portfolio contact</h1>
      </div>
      <div style="padding:28px;line-height:1.6">
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr style="border:0;border-top:1px solid #dce3e9;margin:24px 0" />
        <p>${message}</p>
      </div>
    </div>
  </body>
</html>`
  }
}
