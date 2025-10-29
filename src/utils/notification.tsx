import { BiCheckCircle as SuccessIcon } from 'react-icons/bi'
import { MdOutlineErrorOutline as ErrorIcon } from 'react-icons/md'

type Props = {
  status: number
  message: string
}

export const getMessage = (obj: Props) => ({
  title: obj.status,
  icon: obj.status === 200 ? <SuccessIcon /> : <ErrorIcon />,
  message: obj.message,
  color: obj.status === 200 ? 'green' : 'red',
  autoClose: 5000
})
