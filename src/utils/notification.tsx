import { BiCheckCircle as SuccessIcon } from 'react-icons/bi'
import { MdOutlineErrorOutline as ErrorIcon } from 'react-icons/md'
import { MdOutlineWarningAmber as WarningIcon } from 'react-icons/md'
import { FiInfo as InfoIcon } from 'react-icons/fi'
import { ReactNode } from 'react'

type Props = {
  status: number
  message?: string
}

export const getMessage = (obj: Props) => {
  const { status, message } = obj

  // Define friendly titles & icons based on status code groups
  const statusMap: Record<number | string, { title: string; icon: ReactNode; color: string }> = {
    200: { title: 'Message sent successfully 🎉', icon: <SuccessIcon />, color: 'green' },
    201: { title: 'Created successfully ✅', icon: <SuccessIcon />, color: 'green' },
    400: { title: 'Invalid request — please check your input', icon: <ErrorIcon />, color: 'orange' },
    401: { title: 'You’re not authorized to perform this action', icon: <ErrorIcon />, color: 'red' },
    403: { title: 'Access denied', icon: <ErrorIcon />, color: 'red' },
    404: { title: 'The resource could not be found', icon: <ErrorIcon />, color: 'red' },
    408: { title: 'Request timed out — please try again', icon: <WarningIcon />, color: 'orange' },
    429: { title: 'Too many requests — please wait a moment', icon: <WarningIcon />, color: 'orange' },
    500: { title: 'Server error — please try again later', icon: <ErrorIcon />, color: 'red' },
    502: { title: 'Bad gateway — temporary issue', icon: <ErrorIcon />, color: 'red' },
    503: { title: 'Service unavailable — try again shortly', icon: <ErrorIcon />, color: 'red' },
    default: { title: 'Something went wrong 😕', icon: <InfoIcon />, color: 'gray' }
  }

  const mapped = statusMap[status] || statusMap.default

  return {
    title: mapped.title,
    icon: mapped.icon,
    message: message || mapped.title,
    color: mapped.color,
    autoClose: 5000
  }
}
