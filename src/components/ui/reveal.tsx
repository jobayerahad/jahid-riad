'use client'

import { createElement, type CSSProperties, type ReactNode, useEffect, useRef } from 'react'
import classes from './reveal.module.css'

type Props = {
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'left' | 'right' | 'none'
  as?: 'div' | 'li' | 'article'
}

const Reveal = ({ children, className, delay = 0, direction = 'up', as = 'div' }: Props) => {
  const elementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      element.dataset.visible = 'true'
      return
    }

    element.dataset.revealReady = 'true'
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        element.dataset.visible = 'true'
        observer.disconnect()
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return createElement(
    as,
    {
      ref: elementRef,
      className: [classes.reveal, className].filter(Boolean).join(' '),
      'data-direction': direction,
      style: { '--reveal-delay': `${Math.min(delay, 300)}ms` } as CSSProperties
    },
    children
  )
}

export default Reveal
