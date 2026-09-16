'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

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
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (identifier: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { success: false, error: data.error || 'Invalid email/phone or password' }
      }
      setUser(data.user)
      return { success: true }
    } catch {
      return { success: false, error: 'Login failed. Please try again.' }
    }
  }, [])

  const register = useCallback(
    async (data: { name: string; email: string; phone: string; password: string }) => {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        const result = await res.json()
        if (!res.ok) {
          return { success: false, error: result.error || 'Registration failed' }
        }
        setUser(result.user)
        return { success: true }
      } catch {
        return { success: false, error: 'Registration failed. Please try again.' }
      }
    },
    [],
  )

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/me', { method: 'DELETE' })
    } catch {}
    setUser(null)
  }, [])

  const addAddress = useCallback(
    async (address: Omit<SavedAddress, 'id'>) => {
      if (!user) return { success: false, error: 'Not signed in' }
      try {
        const res = await fetch('/api/customer/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(address),
        })
        const data = await res.json()
        if (!res.ok) return { success: false, error: data.error || 'Failed to add address' }
        const newAddress: SavedAddress = { ...address, id: data.address?.id || data.id || `addr-${Date.now()}` }
        setUser({ ...user, addresses: [...user.addresses, newAddress] })
        return { success: true }
      } catch {
        return { success: false, error: 'Failed to add address' }
      }
    },
    [user],
  )

  const updateAddress = useCallback(
    async (id: string, patch: Partial<SavedAddress>) => {
      if (!user) return { success: false, error: 'Not signed in' }
      try {
        const res = await fetch(`/api/customer/addresses/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        })
        const data = await res.json()
        if (!res.ok) return { success: false, error: data.error || 'Failed to update address' }
        setUser({
          ...user,
          addresses: user.addresses.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })
        return { success: true }
      } catch {
        return { success: false, error: 'Failed to update address' }
      }
    },
    [user],
  )

  const removeAddress = useCallback(
    async (id: string) => {
      if (!user) return { success: false, error: 'Not signed in' }
      try {
        const res = await fetch(`/api/customer/addresses/${id}`, {
          method: 'DELETE',
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          return { success: false, error: data.error || 'Failed to delete address' }
        }
        setUser({ ...user, addresses: user.addresses.filter((a) => a.id !== id) })
        return { success: true }
      } catch {
        return { success: false, error: 'Failed to delete address' }
      }
    },
    [user],
  )

  const setDefaultAddress = useCallback(
    async (id: string) => {
      if (!user) return { success: false, error: 'Not signed in' }
      try {
        const res = await fetch(`/api/customer/addresses/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_default: true }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          return { success: false, error: data.error || 'Failed to set default address' }
        }
        setUser({
          ...user,
          addresses: user.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
        })
        return { success: true }
      } catch {
        return { success: false, error: 'Failed to set default address' }
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

        const res = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const result = await res.json()
        if (!res.ok) return { success: false, error: result.error || 'Failed to update profile' }

        setUser({
          ...user,
          name: data.name ?? user.name,
          email: data.email ?? user.email,
          phone: data.phone ?? user.phone,
        })
        return { success: true }
      } catch {
        return { success: false, error: 'Failed to update profile' }
      }
    },
    [user],
  )

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      try {
        const res = await fetch('/api/auth/password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
        })
        const data = await res.json()
        if (!res.ok) return { success: false, error: data.error || 'Failed to change password' }
        return { success: true }
      } catch {
        return { success: false, error: 'Failed to change password' }
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
