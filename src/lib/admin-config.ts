export const isAdminConfigured = () => Boolean(process.env.DATABASE_URL && process.env.ADMIN_EMAIL)
