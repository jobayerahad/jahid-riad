export const isAdminConfigured = () =>
  Boolean(
    process.env.DATABASE_URL &&
    process.env.BETTER_AUTH_URL &&
    process.env.BETTER_AUTH_SECRET &&
    process.env.BETTER_AUTH_SECRET.length >= 32 &&
    process.env.ADMIN_EMAIL
  )
