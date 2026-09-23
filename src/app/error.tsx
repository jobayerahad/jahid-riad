'use client'

import Link from 'next/link'
import { IoHome } from 'react-icons/io5'
import { MdOutlineRefresh } from 'react-icons/md'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import classes from './error.module.css'

type Props = { error: Error & { digest?: string }; reset: () => void }

const Error = ({ reset }: Props) => (
  <main className={classes.wrapper}>
    <Container size="sm">
      <h1 className="mb-6 text-white">Something went wrong</h1>
      <p className="mb-8 text-lg text-white">
        An unexpected error occurred. No technical details have been exposed. Please try again or return home.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button variant="white" onClick={reset}>
          <MdOutlineRefresh aria-hidden="true" />
          Try again
        </Button>
        <Button asChild variant="outline" className="border-white text-white hover:bg-white/10">
          <Link href="/">
            <IoHome aria-hidden="true" />
            Go home
          </Link>
        </Button>
      </div>
    </Container>
  </main>
)

export default Error
