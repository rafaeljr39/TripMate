'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AccountPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [deleting, setDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      setUser(user)
    }
    load()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }

    // Delete all user data in order
    await supabase.from('activities').delete().eq('user_id', user.id)
    await supabase.from('trip_members').delete().eq('user_id', user.id)
    await supabase.from('trips').delete().eq('user_id', user.id)
    await supabase.from('profiles').delete().eq('id', user.id)

    // Sign out
    await supabase.auth.signOut()
    router.push('/?deleted=true')
  }

  if (!user) return null

  return (
    <main style={{ minHeight: '100vh', background: 'var(--sand)', position: 'relative', zIndex: 1 }}>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 32px',
        background: 'rgba(245,239,224,0.93)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--sand-dark)',
      }}>
        <a href="/dashboard" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.35rem', color: 'var(--terracotta)', letterSpacing: '-0.03em', textDecoration: 'none' }}>
          Adrift
        </a>
        <a href="/dashboard" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.82rem', background: 'var(--ink)', color: 'var(--sand)', padding: '7px 16px', borderRadius: '999px', textDecoration: 'none' }}>
          ← Dashboard
        </a>
      </nav>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--terra-bg)', border: '1px solid var(--terracotta)', borderRadius: '999px', padding: '4px 12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--terracotta)', fontFamily: 'Syne, sans-serif' }}>Account</span>
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.04em', color: 'var(--ink)', marginBottom: '8px' }}>Your account</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)' }}>Manage your Adrift account and data.</p>
        </div>

        {/* Profile card */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--sand-dark)', borderRadius: '20px', padding: '24px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--terracotta)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700, color: 'var(--white)', fontFamily: 'Syne, sans-serif', flexShrink: 0 }}>
              {user.user_metadata?.full_name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--ink)' }}>{user.user_metadata?.full_name ?? 'Traveler'}</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            style={{
              width: '100%', background: 'transparent',
              border: '1.5px solid var(--sand-dark)', borderRadius: '12px',
              padding: '12px', fontFamily: 'Syne, sans-serif', fontWeight: 700,
              fontSize: '0.88rem', color: 'var(--ink-muted)', cursor: 'pointer',
              transition: 'all .2s',
            }}
          >
            Sign out
          </button>
        </div>

        {/* Legal links */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--sand-dark)', borderRadius: '20px', padding: '24px', marginBottom: '16px' }}>
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: 'var(--ink)', marginBottom: '16px' }}>Legal</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <a href="/privacy" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', color: 'var(--ink-soft)', textDecoration: 'none' }}>
              <span>Privacy Policy</span>
              <span style={{ color: 'var(--ink-muted)' }}>→</span>
            </a>
            <div style={{ height: '1px', background: 'var(--sand-dark)' }} />
            <a href="/terms" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', color: 'var(--ink-soft)', textDecoration: 'none' }}>
              <span>Terms of Service</span>
              <span style={{ color: 'var(--ink-muted)' }}>→</span>
            </a>
          </div>
        </div>

        {/* Danger zone */}
        <div style={{ background: 'var(--card)', border: '1px solid rgba(196,85,42,0.2)', borderRadius: '20px', padding: '24px' }}>
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: 'var(--terracotta)', marginBottom: '8px' }}>Danger zone</p>
          <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
            Permanently delete your account and all associated data including trips, activities, and bookings. This cannot be undone.
          </p>

          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              style={{
                width: '100%', background: 'transparent',
                border: '1.5px dashed var(--terracotta)', borderRadius: '12px',
                padding: '12px', fontFamily: 'Syne, sans-serif', fontWeight: 700,
                fontSize: '0.88rem', color: 'var(--terracotta)', cursor: 'pointer',
                transition: 'all .2s',
              }}
            >
              Delete my account
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: 'var(--terra-bg)', border: '1px solid var(--terracotta)', borderRadius: '12px', padding: '12px 16px' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--terracotta)', fontWeight: 600 }}>
                  ⚠️ Are you sure? This will permanently delete all your trips and activities.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setShowConfirm(false)}
                  style={{
                    flex: 1, background: 'transparent',
                    border: '1.5px solid var(--sand-dark)', borderRadius: '12px',
                    padding: '12px', fontFamily: 'Syne, sans-serif', fontWeight: 600,
                    fontSize: '0.88rem', color: 'var(--ink-muted)', cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  style={{
                    flex: 1, background: 'var(--terracotta)',
                    border: 'none', borderRadius: '12px',
                    padding: '12px', fontFamily: 'Syne, sans-serif', fontWeight: 700,
                    fontSize: '0.88rem', color: 'var(--white)', cursor: deleting ? 'not-allowed' : 'pointer',
                    opacity: deleting ? 0.6 : 1, transition: 'all .2s',
                  }}
                >
                  {deleting ? 'Deleting...' : 'Yes, delete everything'}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </main>
  )
}