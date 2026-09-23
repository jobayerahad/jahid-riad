'use client'

import { useState } from 'react'
import { HiOutlineClipboardDocument, HiOutlineCheck } from 'react-icons/hi2'
import { Button } from '@/components/ui/button'
import { generateBibtex } from '@/lib/bibtex'
import type { PublishedPortfolioSnapshot } from '@/schemas/portfolio-content'
import classes from './bibtex.module.css'

type Props = { publication: PublishedPortfolioSnapshot['publications'][number] }

const BibtexBlock = ({ publication }: Props) => {
  const [copied, setCopied] = useState(false)
  const bibtex = generateBibtex(publication)

  const copy = async () => {
    await navigator.clipboard.writeText(bibtex)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`${classes.block} flex flex-col gap-3`}>
      <p className="font-semibold">Citation (BibTeX)</p>
      <pre className={classes.code}>{bibtex}</pre>
      <Button variant="light" onClick={copy}>
        {copied ? <HiOutlineCheck aria-hidden="true" /> : <HiOutlineClipboardDocument aria-hidden="true" />}
        {copied ? 'Copied' : 'Copy BibTeX'}
      </Button>
    </div>
  )
}

export default BibtexBlock
