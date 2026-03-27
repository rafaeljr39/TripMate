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

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: trips } = await supabase
    .from('trips')
    .select('*')
    .order('created_at', { ascending: false })

  const firstName = user.user_metadata?.full_name?.split(' ')[0] ?? 'Traveler'

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      <nav className="border-b border-white/8 px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-lg tracking-tight">TripMate</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/40">{user.email}</span>
          <form action={signOut}>
            <button className="text-sm text-white/40 hover:text-white transition">Sign out</button>
          </form>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hey, {firstName} 👋</h1>
            <p className="text-white/40 mt-1">
              {trips?.length === 0
                ? "No trips yet. Time to plan something."
                : `You have ${trips?.length} trip${trips?.length === 1 ? '' : 's'} planned.`}
            </p>
          </div>
          <Link
            href="/create"
            className="bg-white text-black text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-white/90 transition"
          >
            + New trip
          </Link>
        </div>

        {trips && trips.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {trips.map(trip => (
              <div
                key={trip.id}
                className="bg-white/5 border border-white/8 rounded-2xl p-5 hover:bg-white/8 transition cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="font-semibold text-lg group-hover:text-white transition">{trip.name}</h2>
                    <p className="text-white/50 text-sm">📍 {trip.destination}</p>
                  </div>
                  <span className="text-white/20 text-xs bg-white/5 px-2.5 py-1 rounded-full">
                    {trip.travelers} {trip.travelers === 1 ? 'traveler' : 'travelers'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {trip.start_date && (
                    <span className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full">
                      {formatDate(trip.start_date)}
                      {trip.end_date && ` → ${formatDate(trip.end_date)}`}
                    </span>
                  )}
                  {trip.budget && (
                    <span className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full">
                      💰 {formatBudget(trip.budget, trip.budget_currency)}
                    </span>
                  )}
                </div>

                {trip.notes && (
                  <p className="text-white/30 text-sm mt-3 line-clamp-2">{trip.notes}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-white/10 rounded-2xl p-16 text-center">
            <p className="text-5xl mb-4">✈️</p>
            <h2 className="text-xl font-semibold mb-2">No trips yet</h2>
            <p className="text-white/40 mb-6 text-sm">Your future adventures will show up here.</p>
            <Link
              href="/create"
              className="bg-white text-black text-sm font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition inline-block"
            >
              Plan your first trip
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}