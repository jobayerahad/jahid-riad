'use client'

import { type ReactNode } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { fadeIn, fadeUp, imageReveal, slideInLeft, slideInRight, staggerContainer } from './motion-variants'

type Props = {
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'left' | 'right' | 'none'
  variant?: 'default' | 'image' | 'fade'
  trigger?: 'load' | 'viewport'
  grouped?: boolean
  as?: 'div' | 'li' | 'article' | 'figure' | 'header'
}

const elements = {
  div: motion.div,
  li: motion.li,
  article: motion.article,
  figure: motion.figure,
  header: motion.header
}

const selectVariants = (direction: Props['direction'], variant: Props['variant']): Variants => {
  if (variant === 'image') return imageReveal
  if (variant === 'fade' || direction === 'none') return fadeIn
  if (direction === 'left') return slideInLeft
  if (direction === 'right') return slideInRight
  return fadeUp
}

const Reveal = ({
  children,
  className,
  delay = 0,
  direction = 'up',
  variant = 'default',
  trigger = 'viewport',
  grouped = false,
  as = 'div'
}: Props) => {
  const reduceMotion = useReducedMotion()
  const Component = elements[as] as typeof motion.div
  const selected = selectVariants(direction, variant)
  const delayed: Variants = {
    ...selected,
    visible: {
      ...(selected.visible as object),
      transition: {
        ...((selected.visible as { transition?: object }).transition ?? {}),
        delay: Math.min(delay, 300) / 1000
      }
    }
  }

  if (reduceMotion) return <Component className={className}>{children}</Component>

  if (grouped)
    return (
      <Component className={className} variants={delayed}>
        {children}
      </Component>
    )

  return (
    <Component
      className={className}
      variants={delayed}
      initial="hidden"
      {...(trigger === 'load'
        ? { animate: 'visible' }
        : { whileInView: 'visible', viewport: { once: true, amount: 0.14, margin: '0px 0px -6% 0px' } })}
    >
      {children}
    </Component>
  )
}

type GroupProps = {
  children: ReactNode
  className?: string
  as?: 'div' | 'ol'
  trigger?: 'load' | 'viewport'
  stagger?: number
  delayChildren?: number
}

const groupElements = { div: motion.div, ol: motion.ol }

export const MotionGroup = ({
  children,
  className,
  as = 'div',
  trigger = 'viewport',
  stagger = 0.08,
  delayChildren = 0.04
}: GroupProps) => {
  const reduceMotion = useReducedMotion()
  const Component = groupElements[as] as typeof motion.div

  if (reduceMotion) return <Component className={className}>{children}</Component>

  return (
    <Component
      className={className}
      variants={staggerContainer(stagger, delayChildren)}
      initial="hidden"
      {...(trigger === 'load'
        ? { animate: 'visible' }
        : { whileInView: 'visible', viewport: { once: true, amount: 0.1, margin: '0px 0px -5% 0px' } })}
    >
      {children}
    </Component>
  )
}

export default Reveal
