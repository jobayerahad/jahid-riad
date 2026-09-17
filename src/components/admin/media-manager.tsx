'use client'

import Image from 'next/image'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  FileInput,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core'
import { HiOutlineArchiveBox, HiOutlineCloudArrowUp } from 'react-icons/hi2'
import { archiveMediaAsset, createMediaUploadSignature, registerMediaAsset } from '@/actions/admin'
import type { AdminData } from '@/lib/admin-data'
import type { AnyAdminActionResult } from '@/types/admin'
import { ResultAlert } from './form-support'
import classes from './styles.module.css'

type UploadKind = 'IMAGE' | 'PDF'

export const MediaManager = ({ data }: { data: AdminData }) => {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [kind, setKind] = useState<UploadKind>('IMAGE')
  const [altText, setAltText] = useState('')
  const [result, setResult] = useState<AnyAdminActionResult | null>(null)
  const [pending, startTransition] = useTransition()

  const upload = () =>
    startTransition(async () => {
      setResult(null)
      if (!file) {
        setResult({ ok: false, code: 'VALIDATION', message: 'Choose a file first.' })
        return
      }
      const imageTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (kind === 'IMAGE' && (!imageTypes.includes(file.type) || file.size > 5 * 1024 * 1024)) {
        setResult({
          ok: false,
          code: 'VALIDATION',
          message: 'Images must be JPEG, PNG, or WebP and no larger than 5 MB.'
        })
        return
      }
      if (kind === 'PDF' && (file.type !== 'application/pdf' || file.size > 10 * 1024 * 1024)) {
        setResult({ ok: false, code: 'VALIDATION', message: 'The CV must be a PDF no larger than 10 MB.' })
        return
      }

      const authorization = await createMediaUploadSignature(kind)
      if (!authorization.ok || !authorization.data) {
        setResult(authorization)
        return
      }
      const form = new FormData()
      form.set('file', file)
      form.set('api_key', authorization.data.apiKey)
      form.set('timestamp', String(authorization.data.timestamp))
      form.set('signature', authorization.data.signature)
      form.set('folder', authorization.data.folder)
      form.set('allowed_formats', authorization.data.allowedFormats)
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${authorization.data.cloudName}/${authorization.data.resourceType}/upload`,
        { method: 'POST', body: form }
      )
      if (!response.ok) {
        setResult({ ok: false, code: 'DELIVERY', message: 'Cloudinary rejected the upload.' })
        return
      }
      const uploaded = (await response.json()) as Record<string, unknown>
      const registered = await registerMediaAsset({
        publicId: uploaded.public_id,
        kind,
        originalFilename: file.name,
        altText: kind === 'IMAGE' ? altText : undefined
      })
      setResult(registered)
      if (registered.ok) {
        setFile(null)
        setAltText('')
        router.refresh()
      }
    })

  return (
    <Stack gap="xl">
      <Stack className={classes.formCard} gap="lg">
        <div>
          <Title order={2}>Media library</Title>
          <Text c="dimmed">Upload optimized images and a privacy-reviewed PDF CV.</Text>
        </div>
        <ResultAlert result={result} />
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <Select
            label="Asset type"
            value={kind}
            onChange={(value) => setKind((value as UploadKind) || 'IMAGE')}
            data={[
              { value: 'IMAGE', label: 'Image' },
              { value: 'PDF', label: 'PDF / CV' }
            ]}
          />
          <FileInput
            label="File"
            value={file}
            onChange={setFile}
            accept={kind === 'IMAGE' ? 'image/jpeg,image/png,image/webp' : 'application/pdf'}
            clearable
          />
        </SimpleGrid>
        {kind === 'IMAGE' && (
          <TextInput
            label="Alt text"
            description="Describe the image for visitors using assistive technology."
            value={altText}
            onChange={(event) => setAltText(event.currentTarget.value)}
            maxLength={240}
          />
        )}
        <Group justify="flex-end">
          <Button leftSection={<HiOutlineCloudArrowUp />} loading={pending} onClick={upload}>
            Upload to Cloudinary
          </Button>
        </Group>
      </Stack>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        {data.media.map((asset) => (
          <Card withBorder radius="md" key={asset.id} className={classes.mediaCard}>
            {asset.kind === 'IMAGE' ? (
              <div className={classes.mediaPreview}>
                <Image src={asset.secureUrl} alt={asset.altText || ''} fill sizes="(max-width: 48em) 100vw, 320px" />
              </div>
            ) : (
              <div className={classes.pdfPreview}>PDF</div>
            )}
            <Stack gap="xs" mt="sm">
              <Group justify="space-between">
                <Badge variant="light">{asset.source}</Badge>
                <Text size="xs" c="dimmed">
                  {asset.bytes ? `${Math.round(asset.bytes / 1024)} KB` : 'Bundled'}
                </Text>
              </Group>
              <Text fw={700} lineClamp={1}>
                {asset.originalFilename || asset.publicId || asset.secureUrl}
              </Text>
              {asset.altText && (
                <Text size="sm" c="dimmed" lineClamp={2}>
                  {asset.altText}
                </Text>
              )}
              <Group justify="flex-end">
                <ActionIcon
                  color="red"
                  variant="subtle"
                  disabled={asset.source === 'LOCAL'}
                  aria-label="Archive asset"
                  onClick={() => {
                    if (!window.confirm('Archive this unused asset?')) return
                    startTransition(async () => {
                      const response = await archiveMediaAsset(asset.id)
                      setResult(response)
                      if (response.ok) router.refresh()
                    })
                  }}
                >
                  <HiOutlineArchiveBox />
                </ActionIcon>
              </Group>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  )
}
