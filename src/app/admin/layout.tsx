import type { Metadata } from 'next'

export const instant = false

export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } }

const AdminLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => children

export default AdminLayout
