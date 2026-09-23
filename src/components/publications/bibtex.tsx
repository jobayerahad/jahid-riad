'use client'

import { useState } from 'react'
import { Button, Code, Stack, Text } from '@mantine/core'
import { HiOutlineClipboardDocument, HiOutlineCheck } from 'react-icons/hi2'
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
    <Stack gap="sm" className={classes.block}>
      <Text fw={650}>Citation (BibTeX)</Text>
      <Code block className={classes.code}>
        {bibtex}
      </Code>
      <Button
        variant="light"
        leftSection={copied ? <HiOutlineCheck aria-hidden="true" /> : <HiOutlineClipboardDocument aria-hidden="true" />}
        onClick={copy}
      >
        {copied ? 'Copied' : 'Copy BibTeX'}
      </Button>
    </Stack>
  )
}

export default BibtexBlock
