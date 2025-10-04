'use client'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

const GlobalError = ({ error, reset }: Props) => (
  <html>
    <head>
      <style>{`
          body { 
            margin: 0; 
            padding: 0; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            min-height: 100dvh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            text-align: center;
            color: white;
            padding: 40px;
            max-width: 600px;
          }
          h1 { 
            font-size: 2.5rem; 
            margin-bottom: 20px; 
          }
          p { 
            font-size: 1.2rem; 
            margin-bottom: 30px; 
            opacity: 0.9;
          }
          .error { 
            background: rgba(0,0,0,0.2); 
            padding: 15px; 
            border-radius: 8px; 
            margin: 20px 0; 
            font-family: monospace;
            font-size: 0.9rem;
            word-break: break-all;
          }
          button { 
            background: white; 
            color: #667eea; 
            border: none; 
            padding: 12px 30px; 
            border-radius: 8px; 
            font-size: 1rem; 
            cursor: pointer; 
            margin: 0 10px;
            font-weight: 600;
          }
          button:hover { 
            background: #f5f5f5; 
          }
          .buttons { 
            margin-top: 30px; 
          }
        `}</style>
    </head>

    <body>
      <div className="container">
        <h1>Something went wrong!</h1>
        <p>We apologize for the inconvenience. An unexpected error has occurred.</p>
        <code className="error">{error.message || 'Unknown error occurred'}</code>
        <div className="buttons">
          <button onClick={() => reset()}>Try Again</button>
          <button onClick={() => (window.location.href = '/')}>Go Home</button>
        </div>
      </div>
    </body>
  </html>
)

export default GlobalError
