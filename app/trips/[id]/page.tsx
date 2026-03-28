import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import CopyInviteButton from '@/components/copy-invite-button'
import TripTimeline from '@/components/trip-timeline'

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

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: trip } = await supabase
    .from('trips')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!trip) redirect('/dashboard')

  const { data: activities } = await supabase
    .from('activities')
    .select('*')
    .eq('trip_id', id)
    .order('start_time', { ascending: true })

  const { data: members } = await supabase
    .from('trip_members')
    .select('*')
    .eq('trip_id', id)

  const days = daysBetween(trip.start_date, trip.end_date)
  const totalSpent = activities?.reduce((sum, a) => sum + (a.price ?? 0), 0) ?? 0
  const inviteUrl = `https://trip-mate-delta.vercel.app/invite/${trip.invite_token}`

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
        <Link href="/dashboard" style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', textDecoration: 'none', fontWeight: 500 }}>
          ← Back
        </Link>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.35rem', color: 'var(--terracotta)', letterSpacing: '-0.03em' }}>
          Trip<span style={{ color: 'var(--ink)' }}>Mate</span>
        </span>
        <Link href={`/trips/${id}/edit`} style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', textDecoration: 'none', fontWeight: 500 }}>
          Edit
        </Link>
      </nav>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Trip Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '2.2rem', letterSpacing: '-0.03em', color: 'var(--ink)', marginBottom: '6px' }}>
            {trip.name}
          </h1>
          <p style={{ color: 'var(--ink-muted)', fontSize: '1rem', marginBottom: '20px' }}>📍 {trip.destination}</p>

          {/* Invite Bar */}
          <CopyInviteButton inviteUrl={inviteUrl} compact memberCount={members?.length ?? 0} />
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '32px' }}>
          {trip.start_date && (
            <div style={{ background: 'var(--card)', border: '1px solid var(--sand-dark)', borderRadius: '16px', padding: '18px 22px' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-muted)', marginBottom: '7px' }}>Departure</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--ink)' }}>{formatDate(trip.start_date)}</p>
            </div>
          )}
          {trip.end_date && (
            <div style={{ background: 'var(--card)', border: '1px solid var(--sand-dark)', borderRadius: '16px', padding: '18px 22px' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-muted)', marginBottom: '7px' }}>Return</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--ink)' }}>{formatDate(trip.end_date)}</p>
            </div>
          )}
          {days && (
            <div style={{ background: 'var(--card)', border: '1px solid var(--sand-dark)', borderRadius: '16px', padding: '18px 22px' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-muted)', marginBottom: '7px' }}>Duration</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.85rem', letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--ink)' }}>
                {days}<span style={{ fontSize: '0.9rem', fontWeight: 500, marginLeft: '4px' }}>days</span>
              </p>
            </div>
          )}
          <div style={{ background: 'var(--card)', border: '1px solid var(--sand-dark)', borderRadius: '16px', padding: '18px 22px' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-muted)', marginBottom: '7px' }}>Travelers</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.85rem', letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--ink)' }}>{trip.travelers}</p>
          </div>
          {trip.budget && (
            <div style={{ background: 'var(--ink)', color: 'var(--sand)', borderRadius: '16px', padding: '18px 22px' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.55, marginBottom: '7px' }}>Budget</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.04em', lineHeight: 1 }}>
                {formatBudget(trip.budget, trip.budget_currency)}
              </p>
              {totalSpent > 0 && (
                <div>
                  <div style={{ height: '4px', background: 'rgba(245,239,224,0.2)', borderRadius: '99px', overflow: 'hidden', marginTop: '10px' }}>
                    <div style={{ height: '100%', borderRadius: '99px', background: totalSpent > trip.budget ? '#E8835A' : '#F0B84A', width: `${Math.min((totalSpent / trip.budget) * 100, 100)}%` }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginTop: '5px', opacity: 0.55 }}>
                    <span>Spent: {formatBudget(totalSpent, trip.budget_currency)}</span>
                    <span>{Math.round((totalSpent / trip.budget) * 100)}%</span>
                  </div>
                </div>
              )}
            </div>
          )}
          {trip.notes && (
            <div style={{ background: 'var(--card)', border: '1px solid var(--sand-dark)', borderRadius: '16px', padding: '18px 22px', gridColumn: 'span 2' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-muted)', marginBottom: '7px' }}>Notes</p>
              <p style={{ color: 'var(--ink-soft)', fontSize: '0.85rem' }}>{trip.notes}</p>
            </div>
          )}
        </div>

        {/* Activities */}
        <TripTimeline activities={activities ?? []} tripId={id} />

      </div>
    </main>
  )
}