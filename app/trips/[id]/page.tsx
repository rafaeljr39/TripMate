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

  const initials = user.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : user.email?.[0].toUpperCase() ?? '?'

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      <nav className="border-b border-white/8 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-white/40 hover:text-white transition">
          ← Back to trips
        </Link>
        <span className="font-bold text-lg tracking-tight">TripMate</span>
        <Link href={`/trips/${id}/edit`} className="text-sm text-white/40 hover:text-white transition">
          Edit
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Trip Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight">{trip.name}</h1>
            <div className="flex items-center gap-2">
              <CopyInviteButton inviteUrl={inviteUrl} compact />
              <div className="flex items-center">
                <div
                  style={{ background: '#C4552A' }}
                  className="w-7 h-7 rounded-full border-2 border-[#0f0f0f] flex items-center justify-center text-xs font-bold text-white"
                >
                  {initials}
                </div>
                {members && members.length > 0 && (
                  <div className="w-7 h-7 rounded-full border-2 border-[#0f0f0f] bg-white/20 flex items-center justify-center text-xs font-bold text-white -ml-2">
                    +{members.length}
                  </div>
                )}
              </div>
            </div>
          </div>
          <p className="text-white/50 text-lg">📍 {trip.destination}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
          {trip.start_date && (
            <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
              <p className="text-white/40 text-xs mb-1">Departure</p>
              <p className="font-semibold text-sm">{formatDate(trip.start_date)}</p>
            </div>
          )}
          {trip.end_date && (
            <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
              <p className="text-white/40 text-xs mb-1">Return</p>
              <p className="font-semibold text-sm">{formatDate(trip.end_date)}</p>
            </div>
          )}
          {days && (
            <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
              <p className="text-white/40 text-xs mb-1">Duration</p>
              <p className="font-semibold text-sm">{days} days</p>
            </div>
          )}
          <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
            <p className="text-white/40 text-xs mb-1">Travelers</p>
            <p className="font-semibold text-sm">{trip.travelers} {trip.travelers === 1 ? 'person' : 'people'}</p>
          </div>
          {trip.budget && (
            <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
              <p className="text-white/40 text-xs mb-1">Budget</p>
              <p className="font-semibold text-sm">{formatBudget(trip.budget, trip.budget_currency)}</p>
            </div>
          )}
          {trip.budget && totalSpent > 0 && (
            <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
              <p className="text-white/40 text-xs mb-1">Spent</p>
              <p className={`font-semibold text-sm ${totalSpent > trip.budget ? 'text-red-400' : 'text-green-400'}`}>
                {formatBudget(totalSpent, trip.budget_currency)}
              </p>
            </div>
          )}
          {trip.notes && (
            <div className="bg-white/5 border border-white/8 rounded-2xl p-4 col-span-2">
              <p className="text-white/40 text-xs mb-1">Notes</p>
              <p className="text-sm text-white/70">{trip.notes}</p>
            </div>
          )}
        </div>

        {/* Timeline Component */}
        <TripTimeline activities={activities ?? []} tripId={id} />

      </div>
    </main>
  )
}