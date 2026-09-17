import { v2 as cloudinary } from 'cloudinary'
import { z } from 'zod'

const cloudinaryEnvSchema = z.object({
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1)
})

export const getCloudinaryConfig = () => {
  const parsed = cloudinaryEnvSchema.safeParse(process.env)
  if (!parsed.success) return null
  cloudinary.config({
    cloud_name: parsed.data.CLOUDINARY_CLOUD_NAME,
    api_key: parsed.data.CLOUDINARY_API_KEY,
    api_secret: parsed.data.CLOUDINARY_API_SECRET,
    secure: true
  })
  return { client: cloudinary, ...parsed.data }
}
