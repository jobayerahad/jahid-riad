import * as yup from 'yup'

export const contactSchema = yup.object().shape({
  name: yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),

  email: yup.string().email('Invalid email address').required('Email is required'),

  subject: yup.string().min(5, 'Subject must be at least 5 characters').required('Subject is required'),

  message: yup.string().min(10, 'Message must be at least 10 characters').required('Message is required')
})
