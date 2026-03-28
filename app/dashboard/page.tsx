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
    .order('created_at', { ascending: false })

  const firstName = user.user_metadata?.full_name?.split(' ')[0] ?? 'Traveler'

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

      {/* Background texture */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E")`
      }} />

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 32px',
        background: 'rgba(245,239,224,0.93)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--sand-dark)'
      }}>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.35rem', color: 'var(--terracotta)', letterSpacing: '-0.03em' }}>
          Trip<span style={{ color: 'var(--ink)' }}>Mate</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>{user.email}</span>
          <form action={signOut}>
            <button style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '0.82rem',
              background: 'transparent', border: '1px solid var(--sand-dark)',
              borderRadius: '8px', padding: '6px 14px', cursor: 'pointer',
              color: 'var(--ink-soft)'
            }}>Sign out</button>
          </form>
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.03em', color: 'var(--ink)' }}>
              Hey, {firstName} 👋
            </h1>
            <p style={{ color: 'var(--ink-muted)', marginTop: '4px' }}>
              {allTrips.length === 0 ? 'No trips yet. Time to plan something.' : `You have ${allTrips.length} trip${allTrips.length === 1 ? '' : 's'} planned.`}
            </p>
          </div>
          <Link href="/create" style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.9rem',
            background: 'var(--terracotta)', color: 'var(--white)',
            padding: '10px 20px', borderRadius: '12px', textDecoration: 'none',
          }}>
            + New trip
          </Link>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '32px' }}>
          <div style={{ background: 'var(--ink)', color: 'var(--sand)', borderRadius: '16px', padding: '18px 22px' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.55, marginBottom: '7px' }}>Trips planned</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.85rem', letterSpacing: '-0.04em', lineHeight: 1 }}>{allTrips.length}</p>
            <p style={{ fontSize: '0.76rem', opacity: 0.55, marginTop: '5px' }}>total adventures</p>
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--sand-dark)', borderRadius: '16px', padding: '18px 22px' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-muted)', marginBottom: '7px' }}>Next departure</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.85rem', letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--ink)' }}>
              {daysUntilNext !== null ? daysUntilNext : '—'}
            </p>
            <p style={{ fontSize: '0.76rem', color: 'var(--ink-muted)', marginTop: '5px' }}>
              {nextTrip ? `days · ${nextTrip.destination}` : 'no upcoming trips'}
            </p>
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--sand-dark)', borderRadius: '16px', padding: '18px 22px' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-muted)', marginBottom: '7px' }}>Days traveling</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.85rem', letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--ink)' }}>
              {totalDays || '—'}
            </p>
            <p style={{ fontSize: '0.76rem', color: 'var(--ink-muted)', marginTop: '5px' }}>across all trips</p>
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--sand-dark)', borderRadius: '16px', padding: '18px 22px' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-muted)', marginBottom: '7px' }}>Total budget</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--ink)' }}>
              {totalBudget ? formatBudget(totalBudget, 'USD') : '—'}
            </p>
            <p style={{ fontSize: '0.76rem', color: 'var(--ink-muted)', marginTop: '5px' }}>planned spend</p>
          </div>
        </div>

        {/* Trips Grid */}
        {allTrips.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {allTrips.map(trip => (
              <Link key={trip.id} href={`/trips/${trip.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'var(--card)', border: '1px solid var(--sand-dark)',
                  borderRadius: '20px', padding: '22px',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s', cursor: 'pointer'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '4px' }}>
                        {trip.name}
                      </h2>
                      <p style={{ color: 'var(--ink-muted)', fontSize: '0.85rem' }}>📍 {trip.destination}</p>
                    </div>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 600,
                      background: 'var(--terra-bg)', color: 'var(--terracotta)',
                      padding: '4px 10px', borderRadius: '999px'
                    }}>
                      {trip.travelers} {trip.travelers === 1 ? 'traveler' : 'travelers'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
                    {trip.start_date && (
                      <span style={{
                        fontSize: '0.75rem', color: 'var(--ink-muted)',
                        background: 'var(--sand-mid)', padding: '4px 10px', borderRadius: '999px'
                      }}>
                        {formatDate(trip.start_date)}
                        {trip.end_date && ` → ${formatDate(trip.end_date)}`}
                      </span>
                    )}
                    {trip.budget && (
                      <span style={{
                        fontSize: '0.75rem', color: 'var(--ink-muted)',
                        background: 'var(--sand-mid)', padding: '4px 10px', borderRadius: '999px'
                      }}>
                        💰 {formatBudget(trip.budget, trip.budget_currency)}
                      </span>
                    )}
                  </div>

                  {trip.notes && (
                    <p style={{ color: 'var(--ink-muted)', fontSize: '0.8rem', marginTop: '12px' }}>
                      {trip.notes}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{
            border: '2px dashed var(--sand-dark)', borderRadius: '20px',
            padding: '64px 32px', textAlign: 'center'
          }}>
            <p style={{ fontSize: '3rem', marginBottom: '16px' }}>✈️</p>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.3rem', marginBottom: '8px', color: 'var(--ink)' }}>
              No trips yet
            </h2>
            <p style={{ color: 'var(--ink-muted)', marginBottom: '24px' }}>Your future adventures will show up here.</p>
            <Link href="/create" style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 700,
              background: 'var(--terracotta)', color: 'var(--white)',
              padding: '12px 28px', borderRadius: '12px', textDecoration: 'none'
            }}>
              Plan your first trip
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}