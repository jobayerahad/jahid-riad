export type AdminErrorCode = 'VALIDATION' | 'UNAUTHORIZED' | 'CONFLICT' | 'REFERENCE' | 'DELIVERY'

export type AdminActionResult<T = undefined> =
  | { ok: true; message: string; data?: T }
  | { ok: false; code: AdminErrorCode; message: string; fieldErrors?: Record<string, string> }

export type AnyAdminActionResult = AdminActionResult<unknown>

export type CmsSection =
  | 'dashboard'
  | 'profile'
  | 'about'
  | 'experience'
  | 'publications'
  | 'capabilities'
  | 'education'
  | 'contact'
  | 'media'
  | 'settings'
  | 'revisions'

export type CmsItemKind = 'experience' | 'publication' | 'capability' | 'education'
