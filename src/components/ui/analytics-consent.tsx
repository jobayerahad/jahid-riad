'use client'

import { useEffect, useState } from 'react'
import { GoogleAnalytics } from '@next/third-parties/google'
import { Button } from '@/components/ui/button'
import classes from './analytics-consent.module.css'

const STORAGE_KEY = 'jr-analytics-consent'

type Props = { gaId: string }

const AnalyticsConsent = ({ gaId }: Props) => {
  const [consent, setConsent] = useState<'unknown' | 'granted' | 'denied'>('unknown')

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'granted' || stored === 'denied') setConsent(stored)
    else setConsent('unknown')
  }, [])

  const choose = (value: 'granted' | 'denied') => {
    window.localStorage.setItem(STORAGE_KEY, value)
    setConsent(value)
  }

  return (
    <>
      {consent === 'granted' ? <GoogleAnalytics gaId={gaId} /> : null}
      {consent === 'unknown' ? (
        <div className={classes.banner} role="dialog" aria-label="Analytics consent">
          <p className="text-sm">
            This site can use Google Analytics to understand visits. Choose whether to allow analytics cookies.
          </p>
          <div className="flex gap-2">
            <Button size="xs" variant="outline" onClick={() => choose('denied')}>
              Decline
            </Button>
            <Button size="xs" onClick={() => choose('granted')}>
              Allow analytics
            </Button>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default AnalyticsConsent
