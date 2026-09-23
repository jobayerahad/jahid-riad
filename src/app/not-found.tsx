'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FaArrowLeft } from 'react-icons/fa6'
import { IoHome } from 'react-icons/io5'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import classes from './not-found.module.css'

const NotFound = () => {
  const { back } = useRouter()

  return (
    <main className={classes.wrapper}>
      <Container size="md">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
          <div className="flex flex-col justify-center">
            <h1 className="mb-6 text-[2rem] text-white">Page not found</h1>

            <p className="mb-4 text-white">
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="default">
                <Link href="/">
                  <IoHome aria-hidden="true" />
                  Go Home
                </Link>
              </Button>

              <Button variant="outline" className="border-white text-white hover:bg-white/10" onClick={back}>
                <FaArrowLeft aria-hidden="true" />
                Go Back
              </Button>
            </div>
          </div>

          <div className={classes.illustration} aria-hidden="true">
            <div className={classes.orbit}></div>
            <div className={classes.planet}></div>
            <div className={classes.rocket}>
              <div className={classes.rocketBody}></div>
              <div className={classes.rocketWing}></div>
              <div className={classes.rocketFire}></div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  )
}

export default NotFound
