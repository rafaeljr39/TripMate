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

      const { data: trip } = await supabase
        .from('trips')
        .select('*')
        .eq('invite_token', token)
        .single()

      setTrip(trip)
      setLoading(false)
    }
    load()
  }, [])

  async function handleJoin() {
    if (!user) {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/invite/${token}`,
        },
      })
      return
    }

    setJoining(true)
    setError(null)

    const { error: insertError } = await supabase
      .from('trip_members')
      .insert({
        trip_id: trip.id,
        user_id: user.id,
        invited_by: trip.user_id,
        role: 'member',
      })

    if (insertError && !insertError.message.includes('duplicate')) {
      setError(insertError.message)
      setJoining(false)
      return
    }

    router.push(`/trips/${trip.id}`)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <p className="text-white/30">Loading invite...</p>
      </main>
    )
  }

  if (!trip) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm mx-auto">
          <p className="text-5xl mb-4">🔍</p>
          <h1 className="text-2xl font-bold mb-2">Invite not found</h1>
          <p className="text-white/40 mb-6">This invite link may have expired or been removed.</p>
          <a href="/" className="bg-white text-black font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition inline-block">
            Go to TripMate
          </a>
        </div>
      </main>
    )
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center px-4 py-12">
      <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>

        {/* Brand */}
        <div className="text-center mb-8">
          <p className="text-white/30 text-xs font-medium tracking-widest uppercase mb-1">You're invited</p>
          <p className="font-bold text-lg">TripMate ✈️</p>
        </div>

        {/* Trip Card */}
        <div style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', marginBottom: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Trip</p>
            <h1 className="text-2xl font-bold">{trip.name}</h1>
            <p className="text-white/50 text-sm mt-1">📍 {trip.destination}</p>
          </div>

          <div style={{ padding: '20px 24px' }} className="space-y-3">
            {trip.start_date && (
              <div className="flex justify-between items-start gap-4">
                <span className="text-white/30 text-sm shrink-0">Departure</span>
                <span className="text-white text-sm font-medium">{formatDate(trip.start_date)}</span>
              </div>
            )}
            {trip.end_date && (
              <div className="flex justify-between items-start gap-4">
                <span className="text-white/30 text-sm shrink-0">Return</span>
                <span className="text-white text-sm font-medium">{formatDate(trip.end_date)}</span>
              </div>
            )}
            <div className="flex justify-between items-start gap-4">
              <span className="text-white/30 text-sm shrink-0">Travelers</span>
              <span className="text-white text-sm font-medium">{trip.travelers} {trip.travelers === 1 ? 'person' : 'people'}</span>
            </div>
            {trip.budget && (
              <div className="flex justify-between items-start gap-4">
                <span className="text-white/30 text-sm shrink-0">Budget</span>
                <span className="text-white text-sm font-medium">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: trip.budget_currency }).format(trip.budget)}
                </span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 mb-4">
            {error}
          </p>
        )}

        <button
          onClick={handleJoin}
          disabled={joining}
          style={{ width: '100%', background: 'white', color: 'black', borderRadius: '16px', padding: '14px', border: 'none', cursor: 'pointer', marginBottom: '12px' }}
          className="font-semibold text-sm hover:opacity-90 transition disabled:opacity-50"
        >
          {joining ? 'Joining...' : user ? '✈️ Join this trip' : '✈️ Sign in to join'}
        </button>

        <p className="text-white/20 text-xs text-center">
          {user ? `Signing in as ${user.email}` : 'You\'ll be asked to sign in with Google'}
        </p>
      </div>
    </main>
  )
}