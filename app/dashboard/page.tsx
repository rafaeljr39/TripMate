import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatBudget(amount: number | null, currency: string) {
  if (!amount) return null
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

function daysBetween(start: string | null, end: string | null) {
  if (!start || !end) return null
  const diff = new Date(end).getTime() - new Date(start).getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function getNextTrip(trips: any[]) {
  const now = new Date()
  return trips
    .filter(t => t.start_date && new Date(t.start_date) >= now)
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())[0] ?? null
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: trips } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', user.id) 
    .order('created_at', { ascending: false })

  const firstName = user.user_metadata?.full_name?.split(' ')[0] ?? 'Traveler'
  const initials = user.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : (user.email?.[0] ?? 'T').toUpperCase()

  const allTrips = trips ?? []
  const nextTrip = getNextTrip(allTrips)
  const totalDays = allTrips.reduce((sum, t) => sum + (daysBetween(t.start_date, t.end_date) ?? 0), 0)
  const totalBudget = allTrips.reduce((sum, t) => sum + (t.budget ?? 0), 0)
  const daysUntilNext = nextTrip ? daysBetween(new Date().toISOString().split('T')[0], nextTrip.start_date) : null

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--sand)', position: 'relative' }}>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px',
        background: 'rgba(245,239,224,0.93)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--sand-dark)',
      }}>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.35rem', color: 'var(--terracotta)', letterSpacing: '0.05em', textTransform: 'uppercase' as const, flexShrink: 0 }}>
          Adrift        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link href="/create" style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.82rem',
            background: 'var(--terracotta)', color: 'var(--white)',
            padding: '7px 14px', borderRadius: '999px', textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}>
            + New trip
          </Link>
          <form action={signOut} style={{ margin: 0 }}>
            <button style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '0.82rem',
              background: 'transparent', border: '1.5px dashed var(--sand-dark)',
              borderRadius: '999px', padding: '6px 12px', cursor: 'pointer',
              color: 'var(--ink-muted)', transition: 'all .2s',
              whiteSpace: 'nowrap',
            }}>
              sign out
            </button>
          </form>
         <a href="/account" style={{ textDecoration: 'none' }}>
  <div style={{
    width: '34px', height: '34px', borderRadius: '50%',
    background: 'var(--terracotta)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700,
    color: 'var(--white)', flexShrink: 0, cursor: 'pointer',
  }}>
    {initials}
  </div>
</a>
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto' }} className="page-pad">

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 className="trip-title-h1">
            Hey, {firstName} 👋
          </h1>
          <p style={{ color: 'var(--ink-muted)', marginTop: '4px', fontSize: '0.95rem' }}>
            {allTrips.length === 0 ? 'No trips yet. Time to plan something.' : `You have ${allTrips.length} trip${allTrips.length === 1 ? '' : 's'} planned.`}
          </p>
        </div>

        {/* Stat Cards */}
        <div className="dash-stat-bar">
          <div style={{ background: 'var(--ink)', color: 'var(--sand)', borderRadius: '16px', padding: '16px 20px', flex: '1.6' }}>
            <p style={{ fontSize: '0.62rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.55, marginBottom: '6px' }}>Total budget</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-0.04em', lineHeight: 1 }}>
              {totalBudget ? formatBudget(totalBudget, 'USD') : '—'}
            </p>
            <p style={{ fontSize: '0.7rem', opacity: 0.55, marginTop: '4px' }}>planned spend</p>
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--sand-dark)', borderRadius: '16px', padding: '16px 20px', flex: 1 }}>
            <p style={{ fontSize: '0.62rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-muted)', marginBottom: '6px' }}>Trips planned</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--ink)' }}>{allTrips.length}</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--ink-muted)', marginTop: '4px' }}>total adventures</p>
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--sand-dark)', borderRadius: '16px', padding: '16px 20px', flex: 1 }}>
            <p style={{ fontSize: '0.62rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-muted)', marginBottom: '6px' }}>Next departure in</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--ink)' }}>
              {daysUntilNext !== null ? daysUntilNext : '—'}
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--ink-muted)', marginTop: '4px' }}>
              {nextTrip ? `days · ${nextTrip.destination}` : 'no upcoming trips'}
            </p>
          </div>
        </div>

        {/* Trips Grid */}
        {allTrips.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {allTrips.map((trip, i) => {
              const accentColors = ['var(--terracotta)', 'var(--sage)', 'var(--sky)', 'var(--gold)']
              const accent = accentColors[i % accentColors.length]
              return (
                <Link key={trip.id} href={`/trips/${trip.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: 'var(--card)', border: '1px solid var(--sand-dark)',
                    borderRadius: '20px', overflow: 'hidden',
                    backdropFilter: 'blur(8px)', transition: 'all 0.2s', cursor: 'pointer',
                  }}>
                    <div style={{ height: '4px', background: accent }} />
                    <div style={{ padding: '20px 22px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div>
                          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: 'var(--ink)', marginBottom: '4px' }}>
                            {trip.name}
                          </h2>
                          <p style={{ color: 'var(--ink-muted)', fontSize: '0.82rem' }}>📍 {trip.destination}</p>
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, background: 'var(--terra-bg)', color: 'var(--terracotta)', padding: '4px 10px', borderRadius: '999px', flexShrink: 0 }}>
                          {trip.travelers} {trip.travelers === 1 ? 'traveler' : 'travelers'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '14px' }}>
                        {trip.start_date && (
                          <span style={{ fontSize: '0.73rem', color: 'var(--ink-muted)', background: 'var(--sand-mid)', padding: '4px 10px', borderRadius: '999px' }}>
                            {formatDate(trip.start_date)}{trip.end_date && ` → ${formatDate(trip.end_date)}`}
                          </span>
                        )}
                        {trip.budget && (
                          <span style={{ fontSize: '0.73rem', color: 'var(--ink-muted)', background: 'var(--sand-mid)', padding: '4px 10px', borderRadius: '999px' }}>
                            💰 {formatBudget(trip.budget, trip.budget_currency)}
                          </span>
                        )}
                      </div>
                      {trip.notes && (
                        <p style={{ color: 'var(--ink-muted)', fontSize: '0.78rem', marginTop: '10px', lineHeight: 1.5 }}>
                          {trip.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div style={{ border: '2px dashed var(--sand-dark)', borderRadius: '20px', padding: '64px 32px', textAlign: 'center' }}>
            <p style={{ fontSize: '3rem', marginBottom: '16px' }}>✈️</p>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.3rem', marginBottom: '8px', color: 'var(--ink)' }}>No trips yet</h2>
            <p style={{ color: 'var(--ink-muted)', marginBottom: '24px' }}>Your future adventures will show up here.</p>
            <Link href="/create" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, background: 'var(--terracotta)', color: 'var(--white)', padding: '12px 28px', borderRadius: '999px', textDecoration: 'none' }}>
              Plan your first trip
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}