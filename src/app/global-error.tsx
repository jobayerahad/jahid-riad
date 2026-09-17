'use client'

import { useRouter } from 'next/navigation'

type Props = { error: Error & { digest?: string }; reset: () => void }

const GlobalError = ({ reset }: Props) => {
  const router = useRouter()

  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#111a2e', color: 'white', fontFamily: 'Arial, sans-serif' }}>
        <main style={{ maxWidth: 640, margin: '0 auto', padding: '20vh 24px 48px', textAlign: 'center' }}>
          <h1>Something went wrong</h1>
          <p>An unexpected error occurred. Please try again or return to the homepage.</p>
          <button type="button" onClick={reset} style={{ minHeight: 44, padding: '10px 20px', margin: 8 }}>
            Try again
          </button>
          <button
            type="button"
            onClick={() => router.push('/')}
            style={{ minHeight: 44, padding: '10px 20px', margin: 8 }}
          >
            Go home
          </button>
        </main>
      </body>
    </html>
  )
}

export default GlobalError
