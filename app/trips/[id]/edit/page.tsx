'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'MXN']

export default function EditTripPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tripId, setTripId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    destination: '',
    start_date: '',
    end_date: '',
    travelers: 1,
    budget: '',
    budget_currency: 'USD',
    notes: '',
  })

  useEffect(() => {
    async function loadTrip() {
      setLoading(true)
      const { id } = await params
      setTripId(id)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }

      const { data: trip } = await supabase
        .from('trips')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (!trip) { router.push('/dashboard'); return }

      setForm({
        name: trip.name,
        destination: trip.destination,
        start_date: trip.start_date ?? '',
        end_date: trip.end_date ?? '',
        travelers: trip.travelers,
        budget: trip.budget ?? '',
        budget_currency: trip.budget_currency ?? 'USD',
        notes: trip.notes ?? '',
      })
      setLoading(false)
    }
    loadTrip()
  }, [])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { error: updateError } = await supabase
      .from('trips')
      .update({
        name: form.name,
        destination: form.destination,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        travelers: Number(form.travelers),
        budget: form.budget ? Number(form.budget) : null,
        budget_currency: form.budget_currency,
        notes: form.notes || null,
      })
      .eq('id', tripId)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    router.push(`/trips/${tripId}`)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center">
        <p className="text-white/40">Loading trip...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl">
        <div className="mb-10">
          <a href={`/trips/${tripId}`} className="text-sm text-white/40 hover:text-white/70 transition mb-6 inline-block">
            ← Back
          </a>
          <h1 className="text-4xl font-bold tracking-tight">Edit trip</h1>
          <p className="text-white/50 mt-2">Update your trip details.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/70">Trip name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-white/30 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/70">Destination</label>
            <input
              name="destination"
              value={form.destination}
              onChange={handleChange}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-white/30 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/70">Start date</label>
              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition [color-scheme:dark]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/70">End date</label>
              <input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/70">Number of travelers</label>
            <input
              type="number"
              name="travelers"
              value={form.travelers}
              onChange={handleChange}
              min={1}
              max={50}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/70">Total budget <span className="text-white/30">(optional)</span></label>
            <div className="flex gap-3">
              <select
                name="budget_currency"
                value={form.budget_currency}
                onChange={handleChange}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-white/30 transition"
              >
                {CURRENCIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                type="number"
                name="budget"
                value={form.budget}
                onChange={handleChange}
                min={0}
                placeholder="0.00"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-white/30 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/70">Notes <span className="text-white/30">(optional)</span></label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-white/30 transition resize-none"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-white text-black font-semibold py-3.5 rounded-xl hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {saving ? 'Saving...' : 'Save changes →'}
          </button>
        </form>
      </div>
    </main>
  )
}