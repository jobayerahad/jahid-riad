'use client'

import Image from 'next/image'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { HiOutlineArchiveBox, HiOutlineCloudArrowUp } from 'react-icons/hi2'
import { archiveMediaAsset, createMediaUploadSignature, registerMediaAsset } from '@/actions/admin'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { AdminData } from '@/lib/admin-data'
import type { AnyAdminActionResult } from '@/types/admin'
import { Field, ResultAlert } from './form-support'
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
    <div className="flex flex-col gap-8">
      <div className={`${classes.formCard} flex flex-col gap-6`}>
        <div>
          <h2 className="text-xl font-bold tracking-tight">Media library</h2>
          <p className="text-muted-foreground">Upload optimized images and a privacy-reviewed PDF CV.</p>
        </div>
        <ResultAlert result={result} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Asset type">
            <Select value={kind} onValueChange={(value) => setKind((value as UploadKind) || 'IMAGE')}>
              <SelectTrigger className="h-[42px] w-full rounded-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IMAGE">Image</SelectItem>
                <SelectItem value="PDF">PDF / CV</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="File">
            <Input
              type="file"
              accept={kind === 'IMAGE' ? 'image/jpeg,image/png,image/webp' : 'application/pdf'}
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
            {file ? (
              <button
                type="button"
                className="text-left text-sm text-muted-foreground underline"
                onClick={() => setFile(null)}
              >
                Clear {file.name}
              </button>
            ) : null}
          </Field>
        </div>
        {kind === 'IMAGE' ? (
          <Field label="Alt text" description="Describe the image for visitors using assistive technology.">
            <Input value={altText} onChange={(event) => setAltText(event.target.value)} maxLength={240} />
          </Field>
        ) : null}
        <div className="flex justify-end">
          <Button loading={pending} onClick={upload}>
            <HiOutlineCloudArrowUp />
            Upload to Cloudinary
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.media.map((asset) => (
          <Card key={asset.id} className={`gap-0 rounded-md py-4 shadow-none ${classes.mediaCard}`}>
            <CardContent className="px-4">
              {asset.kind === 'IMAGE' ? (
                <div className={classes.mediaPreview}>
                  <Image src={asset.secureUrl} alt={asset.altText || ''} fill sizes="(max-width: 48em) 100vw, 320px" />
                </div>
              ) : (
                <div className={classes.pdfPreview}>PDF</div>
              )}
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary">{asset.source}</Badge>
                  <p className="text-xs text-muted-foreground">
                    {asset.bytes ? `${Math.round(asset.bytes / 1024)} KB` : 'Bundled'}
                  </p>
                </div>
                <p className="truncate font-bold">{asset.originalFilename || asset.publicId || asset.secureUrl}</p>
                {asset.altText ? <p className="line-clamp-2 text-sm text-muted-foreground">{asset.altText}</p> : null}
                <div className="flex justify-end">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
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
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
