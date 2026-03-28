import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TripDetailClient from '@/components/trip-detail-client'

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
  const totalSpent = activities?.reduce((sum: number, a: any) => sum + (a.price ?? 0), 0) ?? 0
  const inviteUrl = `https://adrift-app.com/invite/${trip.invite_token}`

  return (
    <TripDetailClient
      trip={trip}
      activities={activities ?? []}
      members={members ?? []}
      days={days}
      totalSpent={totalSpent}
      inviteUrl={inviteUrl}
      tripId={id}
    />
  )
}