'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter()
  const supabase = createClient()
  const [trip, setTrip] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { token } = await params
      setToken(token)
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      const { data: trip } = await supabase.from('trips').select('*').eq('invite_token', token).single()
      setTrip(trip)
      setLoading(false)
    }
    load()
  }, [])

  async function handleJoin() {
    if (!user) {
      await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/invite/${token}` } })
      return
    }
    setJoining(true)
    setError(null)
    const { error: insertError } = await supabase.from('trip_members').insert({ trip_id: trip.id, user_id: user.id, invited_by: trip.user_id, role: 'member' })
    if (insertError && !insertError.message.includes('duplicate')) { setError(insertError.message); setJoining(false); return }
    router.push(`/trips/${trip.id}`)
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--ink-muted)', fontFamily: 'Syne, sans-serif' }}>Loading invite...</p>
      </main>
    )
  }

  if (!trip) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ textAlign: 'center', maxWidth: '360px' }}>
          <p style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</p>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: 'var(--ink)', marginBottom: '8px' }}>Invite not found</h1>
          <p style={{ color: 'var(--ink-muted)', marginBottom: '24px' }}>This invite link may have expired or been removed.</p>
          <a href="/" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, background: 'var(--terracotta)', color: 'var(--white)', padding: '12px 28px', borderRadius: '999px', textDecoration: 'none' }}>
            Go to Adrift
          </a>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--sand)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>

      <div style={{ maxWidth: '400px', width: '100%' }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-muted)', marginBottom: '6px' }}>You're invited</p>
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.35rem', color: 'var(--terracotta)', letterSpacing: '-0.03em' }}>
            Adrift          </p>
        </div>

        {/* Trip card */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--sand-dark)', borderRadius: '20px', overflow: 'hidden', marginBottom: '14px', boxShadow: '0 2px 16px rgba(26,23,20,0.08)' }}>
          <div style={{ background: 'var(--ink)', color: 'var(--sand)', padding: '20px 24px' }}>
            <p style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.5, marginBottom: '6px' }}>Trip</p>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-0.03em' }}>{trip.name}</h1>
            <p style={{ fontSize: '0.85rem', opacity: 0.6, marginTop: '4px' }}>📍 {trip.destination}</p>
          </div>
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {trip.start_date && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>Departure</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)' }}>{formatDate(trip.start_date)}</span>
              </div>
            )}
            {trip.end_date && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>Return</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)' }}>{formatDate(trip.end_date)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>Travelers</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)' }}>{trip.travelers} {trip.travelers === 1 ? 'person' : 'people'}</span>
            </div>
            {trip.budget && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>Budget</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)' }}>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: trip.budget_currency }).format(trip.budget)}
                </span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div style={{ background: 'var(--terra-bg)', border: '1px solid var(--terracotta)', borderRadius: '12px', padding: '12px 16px', fontSize: '0.85rem', color: 'var(--terracotta)', marginBottom: '12px' }}>
            {error}
          </div>
        )}

        <button onClick={handleJoin} disabled={joining} style={{ width: '100%', background: joining ? 'var(--ink-muted)' : 'var(--terracotta)', color: 'var(--white)', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.95rem', padding: '14px', borderRadius: '14px', border: 'none', cursor: joining ? 'not-allowed' : 'pointer', marginBottom: '12px', transition: 'all .2s' }}>
          {joining ? 'Joining...' : user ? '✈️ Join this trip' : '✈️ Sign in to join'}
        </button>

        <p style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', textAlign: 'center', opacity: 0.6 }}>
          {user ? `Signing in as ${user.email}` : "You'll be asked to sign in with Google"}
        </p>
      </div>
    </main>
  )
}