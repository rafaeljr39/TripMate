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

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function daysBetween(start: string | null, end: string | null) {
  if (!start || !end) return null
  const diff = new Date(end).getTime() - new Date(start).getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

const TYPE_ICONS: Record<string, string> = {
  flight: '✈️',
  hotel: '🏨',
  tour: '🗺️',
  restaurant: '🍽️',
  transport: '🚌',
  activity: '🎯',
  other: '📌',
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

  const days = daysBetween(trip.start_date, trip.end_date)

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      <nav className="border-b border-white/8 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-white/40 hover:text-white transition">
          ← Back to trips
        </Link>
        <span className="font-bold text-lg tracking-tight">TripMate</span>
        <Link href={`/trips/${id}/edit`} className="text-sm text-white/40 hover:text-white transition">
          Edit trip
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-2">{trip.name}</h1>
          <p className="text-white/50 text-lg">📍 {trip.destination}</p>
        </div>

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
          {trip.notes && (
            <div className="bg-white/5 border border-white/8 rounded-2xl p-4 col-span-2">
              <p className="text-white/40 text-xs mb-1">Notes</p>
              <p className="text-sm text-white/70">{trip.notes}</p>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Activities</h2>
            <Link
              href={`/trips/${id}/activities/new`}
              className="bg-white text-black text-sm font-semibold px-4 py-2 rounded-xl hover:bg-white/90 transition"
            >
              + Add activity
            </Link>
          </div>

          {activities && activities.length > 0 ? (
            <div className="space-y-3">
              {activities.map(activity => (
                <div
                  key={activity.id}
                  className="bg-white/5 border border-white/8 rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{TYPE_ICONS[activity.type] ?? '📌'}</span>
                      <div>
                        <h3 className="font-semibold">{activity.title}</h3>
                        {activity.location && (
                          <p className="text-white/50 text-sm">📍 {activity.location}</p>
                        )}
                        {activity.start_time && (
                          <p className="text-white/40 text-xs mt-1">
                            {formatDateTime(activity.start_time)}
                            {activity.end_time && ` → ${formatDateTime(activity.end_time)}`}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {activity.price && (
                        <p className="text-sm font-semibold">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: activity.currency }).format(activity.price)}
                        </p>
                      )}
                      {activity.confirmation_code && (
                        <p className="text-white/30 text-xs mt-1">#{activity.confirmation_code}</p>
                      )}
                    </div>
                  </div>
                  {activity.notes && (
                    <p className="text-white/30 text-sm mt-3 ml-9">{activity.notes}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-white/10 rounded-2xl p-16 text-center">
              <p className="text-4xl mb-4">🗺️</p>
              <h3 className="text-lg font-semibold mb-2">No activities yet</h3>
              <p className="text-white/40 text-sm mb-6">
                Add flights, hotels, tours and more to build your itinerary.
              </p>
              <Link
                href={`/trips/${id}/activities/new`}
                className="bg-white text-black text-sm font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition inline-block"
              >
                + Add your first activity
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}