import type { Metadata } from 'next'
import { RegisterForm } from '@/components/shams/register-form'

export const metadata: Metadata = {
  title: 'Create account',
  description: 'Register at Shams Stores to track orders, save addresses and shop with ease.',
  robots: { index: false },
}

export default function RegisterPage() {
  return <RegisterForm />
}
