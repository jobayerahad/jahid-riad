'use client'

import { useEffect, useRef, useState, type ComponentType } from 'react'
import classes from './styles.module.css'

type Props = { siteKey: string }

const LazyContactForm = ({ siteKey }: Props) => {
  const boundary = useRef<HTMLDivElement>(null)
  const [Form, setForm] = useState<ComponentType<Props> | null>(null)

  useEffect(() => {
    const element = boundary.current
    if (!element) return

    const load = () => {
      void import('./provider').then((module) => setForm(() => module.default))
    }

    if (!('IntersectionObserver' in window)) {
      load()
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        load()
      },
      { rootMargin: '600px 0px' }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={boundary} className={classes.formBoundary}>
      {Form ? (
        <Form siteKey={siteKey} />
      ) : (
        <div className={classes.formLoading} role="status">
          Contact form loads as this section approaches.
        </div>
      )}
    </div>
  )
}

export default LazyContactForm
