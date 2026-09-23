import { beforeEach, describe, expect, it, vi } from 'vitest'

const { queryRaw, executeRaw } = vi.hoisted(() => ({
  queryRaw: vi.fn(),
  executeRaw: vi.fn()
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $queryRaw: queryRaw,
    $executeRaw: executeRaw
  },
  isDatabaseConfigured: () => true
}))

import { isRateLimited } from '@/lib/rate-limit'

describe('isRateLimited', () => {
  beforeEach(() => {
    queryRaw.mockReset()
    executeRaw.mockReset()
    executeRaw.mockResolvedValue(0)
  })

  it('allows requests at or below the limit', async () => {
    queryRaw.mockResolvedValue([{ count: 5 }])
    await expect(isRateLimited('contact', '127.0.0.1')).resolves.toBe(false)
  })

  it('blocks requests above the limit', async () => {
    queryRaw.mockResolvedValue([{ count: 6 }])
    await expect(isRateLimited('contact', '127.0.0.1')).resolves.toBe(true)
  })

  it('respects custom limits', async () => {
    queryRaw.mockResolvedValue([{ count: 3 }])
    await expect(isRateLimited('contact', '127.0.0.1', { limit: 2 })).resolves.toBe(true)
  })

  it('throws when the database returns no count', async () => {
    queryRaw.mockResolvedValue([])
    await expect(isRateLimited('contact', '127.0.0.1')).rejects.toThrow('Rate-limit service unavailable')
  })
})
