import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const sizeMap = {
  xs: 'max-w-[30rem]',
  sm: 'max-w-[48rem]',
  md: 'max-w-[62rem]',
  lg: 'max-w-[75rem]',
  xl: 'max-w-[88rem]',
  full: 'max-w-none'
} as const

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  size?: keyof typeof sizeMap
}

export function Container({ size = 'xl', className, ...props }: ContainerProps) {
  return <div className={cn('mx-auto w-full px-4 sm:px-6', sizeMap[size], className)} {...props} />
}
