'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const ACTIVITY_TYPES = [
  { value: 'flight', label: '✈️ Flight' },
  { value: 'hotel', label: '🏨 Hotel' },
  { value: 'tour', label: '🗺️ Tour' },
  { value: 'restaurant', label: '🍽️ Restaurant' },
  { value: 'transport', label: '🚌 Transport' },
  { value: 'activity', label: '🎯 Activity' },
  { value: 'other', label: '📌 Other' },
]

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'MXN']

export default function EditActivityPage({ params }: { params: Promise<{ id: string, activityId: string }> }) {
  const router = useRouter()
  const supabase = createClient()
  const [tripId, setTripId] = useState<string | null>(null)
  const [activityId, setActivityId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    type: 'other',
    title: '',
    location: '',
    start_time: '',
    end_time: '',
    confirmation_code: '',
    notes: '',
    price: '',
    currency: 'USD',
  })

  useEffect(() => {
    async function load() {
      const { id, activityId } = await params
      setTripId(id)
      setActivityId(activityId)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }

      const { data: activity } = await supabase
        .from('activities')
        .select('*')
        .eq('id', activityId)
        .eq('user_id', user.id)
        .single()

      if (!activity) { router.push(`/trips/${id}`); return }

      setForm({
        type: activity.type,
        title: activity.title,
        location: activity.location ?? '',
        start_time: activity.start_time ? new Date(activity.start_time).toISOString().slice(0, 16) : '',
        end_time: activity.end_time ? new Date(activity.end_time).toISOString().slice(0, 16) : '',
        confirmation_code: activity.confirmation_code ?? '',
        notes: activity.notes ?? '',
        price: activity.price ?? '',
        currency: activity.currency ?? 'USD',
      })
      setLoading(false)
    }
    load()
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
      .from('activities')
      .update({
        type: form.type,
        title: form.title,
        location: form.location || null,
        start_time: form.start_time || null,
        end_time: form.end_time || null,
        confirmation_code: form.confirmation_code || null,
        notes: form.notes || null,
        price: form.price ? Number(form.price) : null,
        currency: form.currency,
      })
      .eq('id', activityId)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    router.push(`/trips/${tripId}`)
  }

  async function handleDelete() {
    if (!confirm('Delete this activity? This cannot be undone.')) return
    setDeleting(true)

    await supabase.from('activities').delete().eq('id', activityId)
    router.push(`/trips/${tripId}`)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center">
        <p className="text-white/40">Loading activity...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl">
        <div className="mb-10">
          <a href={`/trips/${tripId}`} className="text-sm text-white/40 hover:text-white/70 transition mb-6 inline-block">
            ← Back to trip
          </a>
          <h1 className="text-4xl font-bold tracking-tight">Edit activity</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/70">Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition"
            >
              {ACTIVITY_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/70">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-white/30 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/70">Location <span className="text-white/30">(optional)</span></label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-white/30 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/70">Start time <span className="text-white/30">(optional)</span></label>
              <input
                type="datetime-local"
                name="start_time"
                value={form.start_time}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition [color-scheme:dark]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/70">End time <span className="text-white/30">(optional)</span></label>
              <input
                type="datetime-local"
                name="end_time"
                value={form.end_time}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/70">Confirmation code <span className="text-white/30">(optional)</span></label>
            <input
              name="confirmation_code"
              value={form.confirmation_code}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-white/30 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/70">Price <span className="text-white/30">(optional)</span></label>
            <div className="flex gap-3">
              <select
                name="currency"
                value={form.currency}
                onChange={handleChange}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-white/30 transition"
              >
                {CURRENCIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                type="number"
                name="price"
                value={form.price}
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
            className="w-full bg-white text-black font-semibold py-3.5 rounded-xl hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save changes →'}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="w-full bg-red-500/10 text-red-400 border border-red-500/20 font-semibold py-3.5 rounded-xl hover:bg-red-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? 'Deleting...' : 'Delete activity'}
          </button>
        </form>
      </div>
    </main>
  )
}