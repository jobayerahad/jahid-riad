import { render } from '@react-email/render'
import { describe, expect, it } from 'vitest'
import { ContactNotification } from '@/emails/contact-notification'

describe('ContactNotification', () => {
  it('renders escaped fields and preserves line breaks', async () => {
    const html = await render(
      ContactNotification({
        name: 'Ada <script>',
        email: 'ada@example.com',
        subject: 'Hello & thanks',
        message: 'Line one\nLine two'
      })
    )

    expect(html).toContain('Ada &lt;script&gt;')
    expect(html).toContain('Hello &amp; thanks')
    expect(html).toContain('mailto:ada@example.com')
    expect(html).toContain('Line one')
    expect(html).toContain('Line two')
    expect(html).toContain('white-space:pre-wrap')
    expect(html).not.toContain('<script>')
  })
})
