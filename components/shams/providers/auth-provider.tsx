'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { commerceFetch, BrowserCommerceError } from '@/lib/commerce/browser'

export type SavedAddress = {
  id: string
  label: string
  firstName: string
  lastName: string
  phone: string
  governorate: string
  city: string
  address1: string
  address2: string
  postcode: string
  isDefault: boolean
}

export type AuthUser = {
  id: string
  name: string
  email: string
  phone: string
  addresses: SavedAddress[]
}

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: { name: string; email: string; phone: string; password: string }) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  addAddress: (address: Omit<SavedAddress, 'id'>) => Promise<{ success: boolean; error?: string }>
  updateAddress: (id: string, address: Partial<SavedAddress>) => Promise<{ success: boolean; error?: string }>
  removeAddress: (id: string) => Promise<{ success: boolean; error?: string }>
  setDefaultAddress: (id: string) => Promise<{ success: boolean; error?: string }>
  updateProfile: (data: { name?: string; email?: string; phone?: string }) => Promise<{ success: boolean; error?: string }>
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    commerceFetch<{ user: AuthUser }>('/api/auth/me')
      .then((data) => {
        if (data.user) setUser(data.user)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (identifier: string, password: string) => {
    try {
      const data = await commerceFetch<{ user: AuthUser }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      })
      setUser(data.user)
      return { success: true }
    } catch (error) {
      const message = error instanceof BrowserCommerceError ? error.message : 'Login failed. Please try again.'
      return { success: false, error: message }
    }
  }, [])

  const register = useCallback(
    async (data: { name: string; email: string; phone: string; password: string }) => {
      try {
        const result = await commerceFetch<{ user: AuthUser }>('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify(data),
        })
        setUser(result.user)
        return { success: true }
      } catch (error) {
        const message = error instanceof BrowserCommerceError ? error.message : 'Registration failed. Please try again.'
        return { success: false, error: message }
      }
    },
    [],
  )

  const logout = useCallback(async () => {
    try {
      await commerceFetch('/api/auth/me', { method: 'DELETE' })
    } catch {}
    setUser(null)
  }, [])

  const addAddress = useCallback(
    async (address: Omit<SavedAddress, 'id'>) => {
      if (!user) return { success: false, error: 'Not signed in' }
      try {
        const data = await commerceFetch<{ address: SavedAddress; id: string }>('/api/customer/addresses', {
          method: 'POST',
          body: JSON.stringify(address),
        })
        const newAddress: SavedAddress = { ...address, id: data.address?.id || data.id || `addr-${Date.now()}` }
        setUser({ ...user, addresses: [...user.addresses, newAddress] })
        return { success: true }
      } catch (error) {
        const message = error instanceof BrowserCommerceError ? error.message : 'Failed to add address'
        return { success: false, error: message }
      }
    },
    [user],
  )

  const updateAddress = useCallback(
    async (id: string, patch: Partial<SavedAddress>) => {
      if (!user) return { success: false, error: 'Not signed in' }
      try {
        await commerceFetch(`/api/customer/addresses/${id}`, {
          method: 'PUT',
          body: JSON.stringify(patch),
        })
        setUser({
          ...user,
          addresses: user.addresses.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })
        return { success: true }
      } catch (error) {
        const message = error instanceof BrowserCommerceError ? error.message : 'Failed to update address'
        return { success: false, error: message }
      }
    },
    [user],
  )

  const removeAddress = useCallback(
    async (id: string) => {
      if (!user) return { success: false, error: 'Not signed in' }
      try {
        await commerceFetch(`/api/customer/addresses/${id}`, {
          method: 'DELETE',
        })
        setUser({ ...user, addresses: user.addresses.filter((a) => a.id !== id) })
        return { success: true }
      } catch (error) {
        const message = error instanceof BrowserCommerceError ? error.message : 'Failed to delete address'
        return { success: false, error: message }
      }
    },
    [user],
  )

  const setDefaultAddress = useCallback(
    async (id: string) => {
      if (!user) return { success: false, error: 'Not signed in' }
      try {
        await commerceFetch(`/api/customer/addresses/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ is_default: true }),
        })
        setUser({
          ...user,
          addresses: user.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
        })
        return { success: true }
      } catch (error) {
        const message = error instanceof BrowserCommerceError ? error.message : 'Failed to set default address'
        return { success: false, error: message }
      }
    },
    [user],
  )

  const updateProfile = useCallback(
    async (data: { name?: string; email?: string; phone?: string }) => {
      if (!user) return { success: false, error: 'Not signed in' }
      try {
        const [firstName, ...rest] = (data.name || '').split(' ')
        const body: Record<string, string> = {}
        if (firstName) body.first_name = firstName
        if (rest.length) body.last_name = rest.join(' ')
        if (data.email) body.email = data.email
        if (data.phone) body.phone = data.phone

        await commerceFetch('/api/auth/profile', {
          method: 'PUT',
          body: JSON.stringify(body),
        })

        setUser({
          ...user,
          name: data.name ?? user.name,
          email: data.email ?? user.email,
          phone: data.phone ?? user.phone,
        })
        return { success: true }
      } catch (error) {
        const message = error instanceof BrowserCommerceError ? error.message : 'Failed to update profile'
        return { success: false, error: message }
      }
    },
    [user],
  )

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      try {
        await commerceFetch('/api/auth/password', {
          method: 'POST',
          body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
        })
        return { success: true }
      } catch (error) {
        const message = error instanceof BrowserCommerceError ? error.message : 'Failed to change password'
        return { success: false, error: message }
      }
    },
    [],
  )

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, addAddress, updateAddress, removeAddress, setDefaultAddress, updateProfile, changePassword }}
    >
      {children}
    </AuthContext.Provider>
  )
}
