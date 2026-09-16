'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, User, Eye, EyeOff, Pencil, Check, X } from 'lucide-react'

function SectionHeader({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack?: string }) {
  return (
    <div className="mb-6">
      {onBack && (
        <Link href={onBack} className="mb-3 inline-flex items-center gap-1 text-sm text-brand-ink">
          <ArrowLeft className="size-4" /> Back to account
        </Link>
      )}
      <h1 className="text-2xl font-semibold">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  )
}

export function ProfileSection({ user, logout, updateProfile, changePassword }: {
  user: NonNullable<ReturnType<typeof import('@/components/shams/auth-provider').useAuth>['user']>
  logout: () => void
  updateProfile: ReturnType<typeof import('@/components/shams/auth-provider').useAuth>['updateProfile']
  changePassword: ReturnType<typeof import('@/components/shams/auth-provider').useAuth>['changePassword']
}) {
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileName, setProfileName] = useState(user.name)
  const [profileEmail, setProfileEmail] = useState(user.email)
  const [profilePhone, setProfilePhone] = useState(user.phone)
  const [profileMsg, setProfileMsg] = useState('')
  const [profileErr, setProfileErr] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [pwMessage, setPwMessage] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwPending, setPwPending] = useState(false)

  const handleProfileSave = async () => {
    setProfileErr('')
    setProfileMsg('')
    if (!profileName.trim()) { setProfileErr('Name is required'); return }
    if (!profileEmail.trim()) { setProfileErr('Email is required'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileEmail)) { setProfileErr('Invalid email address'); return }
    if (!profilePhone.trim()) { setProfileErr('Phone is required'); return }
    if (!/^01[0-9]{9}$/.test(profilePhone)) { setProfileErr('Phone number must be 11 digits starting with 01'); return }
    const result = await updateProfile({ name: profileName, email: profileEmail, phone: profilePhone })
    if (result.success) {
      setProfileMsg('Profile updated successfully')
      setEditingProfile(false)
    } else {
      setProfileErr(result.error || 'Could not update profile')
    }
  }

  const handleProfileCancel = () => {
    setProfileName(user.name)
    setProfileEmail(user.email)
    setProfilePhone(user.phone)
    setProfileErr('')
    setProfileMsg('')
    setEditingProfile(false)
  }

  const handlePasswordChange = async () => {
    setPwError('')
    setPwMessage('')
    if (!currentPassword || !newPassword || !confirmPassword) return
    if (newPassword.length < 6) { setPwError('New password must be at least 6 characters'); return }
    if (newPassword !== confirmPassword) { setPwError('New passwords do not match'); return }
    setPwPending(true)
    const result = await changePassword(currentPassword, newPassword)
    setPwPending(false)
    if (result.success) {
      setPwMessage('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      setPwError(result.error || 'Could not change password')
    }
  }

  return (
    <main className="shams-container max-w-3xl py-10 pb-[calc(2.5rem+var(--mobile-bottom-nav-height))] sm:pb-10">
      <SectionHeader title="Personal info" subtitle="Edit your account details" onBack="/account" />

      <section className="rounded-(--radius-card) border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Account information</h2>
          {!editingProfile && (
            <button onClick={() => setEditingProfile(true)} className="inline-flex items-center gap-1 text-sm text-brand-ink">
              <Pencil className="size-3.5" /> Edit
            </button>
          )}
        </div>

        {editingProfile ? (
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="mt-1 min-h-11 w-full rounded-(--radius-control) border bg-background px-3 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} className="mt-1 min-h-11 w-full rounded-(--radius-control) border bg-background px-3 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium">Phone</label>
              <input type="tel" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} className="mt-1 min-h-11 w-full rounded-(--radius-control) border bg-background px-3 text-sm" />
            </div>
            {profileErr && <p role="alert" className="rounded-(--radius-control) bg-red-50 p-3 text-sm text-red-700">{profileErr}</p>}
            {profileMsg && <p role="status" className="rounded-(--radius-control) bg-green-50 p-3 text-sm text-green-700">{profileMsg}</p>}
            <div className="flex gap-2">
              <button onClick={handleProfileSave} className="inline-flex min-h-10 items-center gap-1 rounded-(--radius-control) bg-brand px-4 text-sm font-semibold text-brand-foreground">
                <Check className="size-4" /> Save
              </button>
              <button onClick={handleProfileCancel} className="inline-flex min-h-10 items-center gap-1 rounded-(--radius-control) border px-4 text-sm font-medium">
                <X className="size-4" /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Name</dt><dd className="font-medium">{user.name}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Email</dt><dd className="font-medium">{user.email}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Phone</dt><dd className="font-medium">{user.phone}</dd></div>
          </dl>
        )}
      </section>

      <section className="mt-6 rounded-(--radius-card) border bg-card p-5">
        <h2 className="font-semibold">Change password</h2>
        <div className="mt-4 space-y-3">
          <div className="relative">
            <label className="block text-sm font-medium">Current password</label>
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 min-h-11 w-full rounded-(--radius-control) border bg-background px-3 text-sm"
            />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute bottom-3 right-3 text-muted-foreground" aria-label={showCurrent ? 'Hide password' : 'Show password'}>
              {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <div className="relative">
            <label className="block text-sm font-medium">New password</label>
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 min-h-11 w-full rounded-(--radius-control) border bg-background px-3 text-sm"
            />
            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute bottom-3 right-3 text-muted-foreground" aria-label={showNew ? 'Hide password' : 'Show password'}>
              {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium">Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 min-h-11 w-full rounded-(--radius-control) border bg-background px-3 text-sm"
            />
          </div>
          {pwError && <p role="alert" className="rounded-(--radius-control) bg-red-50 p-3 text-sm text-red-700">{pwError}</p>}
          {pwMessage && <p role="status" className="rounded-(--radius-control) bg-green-50 p-3 text-sm text-green-700">{pwMessage}</p>}
          <button
            onClick={handlePasswordChange}
            disabled={pwPending || !currentPassword || !newPassword || !confirmPassword}
            className="min-h-11 rounded-(--radius-control) bg-brand px-5 text-sm font-semibold text-brand-foreground disabled:bg-muted disabled:text-muted-foreground"
          >
            {pwPending ? 'Saving...' : 'Save new password'}
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-(--radius-card) border bg-card p-5">
        <h2 className="font-semibold text-red-600">Danger zone</h2>
        <p className="mt-2 text-sm text-muted-foreground">Sign out of your account on this device.</p>
        <button onClick={logout} className="mt-3 min-h-11 rounded-(--radius-control) border border-red-200 px-5 text-sm font-medium text-red-600 hover:bg-red-50">
          Sign out
        </button>
      </section>
    </main>
  )
}
