'use client'

import { useEffect, useState } from 'react'
import { Button, Group, Text } from '@mantine/core'
import { GoogleAnalytics } from '@next/third-parties/google'
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
          <Text size="sm">
            This site can use Google Analytics to understand visits. Choose whether to allow analytics cookies.
          </Text>
          <Group gap="sm">
            <Button size="xs" variant="default" onClick={() => choose('denied')}>
              Decline
            </Button>
            <Button size="xs" onClick={() => choose('granted')}>
              Allow analytics
            </Button>
          </Group>
        </div>
      ) : null}
    </>
  )
}

export default AnalyticsConsent
