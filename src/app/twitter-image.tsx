import { ImageResponse } from 'next/og'
import { getPortfolioContent } from '@/data/portfolio'

export const alt = 'Md. Jahid Alam Riad portfolio'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function TwitterImage() {
  const { profile, copy } = await getPortfolioContent()
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px',
        color: '#ffffff',
        background: '#111a2e',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <div style={{ display: 'flex', color: '#71d4c8', fontSize: 28, letterSpacing: 3 }}>
        {profile.shortName.toUpperCase()}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', maxWidth: 960, fontSize: 68, fontWeight: 700, lineHeight: 1.05 }}>
          {copy.heroHeading} {copy.heroAccent}
        </div>
        <div style={{ display: 'flex', color: '#c7d2e3', fontSize: 28 }}>{profile.positioning}</div>
      </div>
    </div>,
    size
  )
}
