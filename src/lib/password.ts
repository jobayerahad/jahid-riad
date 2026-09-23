import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'

const SCRYPT_N = 131072 // 2^17 (OWASP recommendation)
const SCRYPT_R = 8
const SCRYPT_P = 1
const SCRYPT_KEYLEN = 64
const SALT_BYTES = 16

/** Caps accepted params so a poisoned hash cannot force expensive or unbounded work. */
const MAX_N = 262144 // 2^18
const MAX_R = 16
const MAX_P = 4
const MIN_N = 16384

type ScryptOptions = { N: number; r: number; p: number }

const scryptAsync = (password: string, salt: Buffer, keylen: number, options: ScryptOptions) =>
  new Promise<Buffer>((resolve, reject) => {
    // Node defaults maxmem too low for N=2^17; request enough memory for the cost factor.
    scryptCallback(password, salt, keylen, { ...options, maxmem: 256 * 1024 * 1024 }, (error, derivedKey) => {
      if (error) reject(error)
      else resolve(derivedKey)
    })
  })

/** Dummy hash used when no admin row exists so timing does not leak that fact. */
const DUMMY_PASSWORD_HASH =
  'scrypt$16384$8$1$00000000000000000000000000000000$00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'

export const hashPassword = async (password: string) => {
  const salt = randomBytes(SALT_BYTES)
  const derived = await scryptAsync(password, salt, SCRYPT_KEYLEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P
  })

  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString('hex')}$${derived.toString('hex')}`
}

const parseStoredHash = (stored: string) => {
  const parts = stored.split('$')
  if (parts.length !== 6 || parts[0] !== 'scrypt') return null

  const [, nRaw, rRaw, pRaw, saltHex, hashHex] = parts
  const N = Number(nRaw)
  const r = Number(rRaw)
  const p = Number(pRaw)
  if (!Number.isInteger(N) || !Number.isInteger(r) || !Number.isInteger(p) || !saltHex || !hashHex) return null
  if (N < MIN_N || N > MAX_N || r < 1 || r > MAX_R || p < 1 || p > MAX_P) return null
  if ((N & (N - 1)) !== 0) return null

  return { N, r, p, saltHex, hashHex }
}

export const needsRehash = (stored: string) => {
  const parsed = parseStoredHash(stored)
  if (!parsed) return true
  return parsed.N !== SCRYPT_N || parsed.r !== SCRYPT_R || parsed.p !== SCRYPT_P
}

export const verifyPassword = async (password: string, stored: string) => {
  const parsed = parseStoredHash(stored)
  if (!parsed) return false

  let salt: Buffer
  let expected: Buffer
  try {
    salt = Buffer.from(parsed.saltHex, 'hex')
    expected = Buffer.from(parsed.hashHex, 'hex')
  } catch {
    return false
  }

  if (salt.length === 0 || expected.length === 0) return false

  const derived = await scryptAsync(password, salt, expected.length, {
    N: parsed.N,
    r: parsed.r,
    p: parsed.p
  })
  if (derived.length !== expected.length) return false

  return timingSafeEqual(derived, expected)
}

/** Verifies against a real hash, or a dummy hash when none exists (constant-ish timing). */
export const verifyPasswordSafe = async (password: string, stored: string | null | undefined) => {
  const hash = stored && stored.length > 0 ? stored : DUMMY_PASSWORD_HASH
  const ok = await verifyPassword(password, hash)
  return Boolean(stored) && ok
}
