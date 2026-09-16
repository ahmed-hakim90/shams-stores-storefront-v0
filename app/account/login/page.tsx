import type { Metadata } from 'next'
import { LoginForm } from '@/components/shams/account'

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your Shams Stores account to track orders and manage addresses.',
  robots: { index: false },
}

export default function LoginPage() {
  return <LoginForm />
}
