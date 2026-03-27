'use client'

import { useState, useEffect, useRef } from 'react'
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

export default function ExtractActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [tripId, setTripId] = useState<string | null>(null)
  const [image, setImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [extracted, setExtracted] = useState(false)
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
      const { id } = await params
      setTripId(id)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/')
    }
    load()
  }, [])

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => setImage(reader.result as string)
    reader.readAsDataURL(file)
    setExtracted(false)
  }

  async function handleExtract() {
    if (!imageFile || !image) return
    setExtracting(true)
    setError(null)

    try {
      const base64 = image.split(',')[1]
      const mediaType = imageFile.type

      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64, mediaType }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error ?? 'Extraction failed')

      setForm({
        type: data.type ?? 'other',
        title: data.title ?? '',
        location: data.location ?? '',
        start_time: data.start_time ?? '',
        end_time: data.end_time ?? '',
        confirmation_code: data.confirmation_code ?? '',
        notes: data.notes ?? '',
        price: data.price ?? '',
        currency: data.currency ?? 'USD',
      })
      setExtracted(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setExtracting(false)
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }

    const { error: insertError } = await supabase
      .from('activities')
      .insert({
        trip_id: tripId,
        user_id: user.id,
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

    if (insertError) {
      setError(insertError.message)
      setSaving(false)
      return
    }

    router.push(`/trips/${tripId}`)
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl">
        <div className="mb-10">
          <a href={`/trips/${tripId}`} className="text-sm text-white/40 hover:text-white/70 transition mb-6 inline-block">
            ← Back to trip
          </a>
          <h1 className="text-4xl font-bold tracking-tight">Scan confirmation</h1>
          <p className="text-white/50 mt-2">Upload a screenshot and we'll fill in the details automatically.</p>
        </div>

        {/* Upload Area */}
        {!extracted && (
          <div className="space-y-4 mb-8">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            {!image ? (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-white/15 rounded-2xl p-16 text-center hover:border-white/30 transition group"
              >
                <p className="text-5xl mb-4">📸</p>
                <p className="font-semibold text-white/70 group-hover:text-white transition">Upload screenshot</p>
                <p className="text-white/30 text-sm mt-1">Tap to choose from your photos</p>
              </button>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-white/10">
                  <img src={image} alt="Confirmation screenshot" className="w-full object-contain max-h-80" />
                  <button
                    onClick={() => { setImage(null); setImageFile(null) }}
                    className="absolute top-3 right-3 bg-black/60 text-white/70 hover:text-white rounded-full w-8 h-8 flex items-center justify-center text-sm transition"
                  >
                    ✕
                  </button>
                </div>

                <button
                  onClick={handleExtract}
                  disabled={extracting}
                  className="w-full bg-white text-black font-semibold py-3.5 rounded-xl hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {extracting ? '✨ Reading confirmation...' : '✨ Extract details'}
                </button>
              </div>
            )}

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                {error}
              </p>
            )}
          </div>
        )}

        {/* Extracted Form */}
        {extracted && (
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
              <span>✅</span>
              <p className="text-green-400 text-sm font-medium">Details extracted! Review and save.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white/70">Type</label>
                <select name="type" value={form.type} onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition">
                  {ACTIVITY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white/70">Title</label>
                <input name="title" value={form.title} onChange={handleChange} required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white/70">Location <span className="text-white/30">(optional)</span></label>
                <input name="location" value={form.location} onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white/70">Start time</label>
                  <input type="datetime-local" name="start_time" value={form.start_time} onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition [color-scheme:dark]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white/70">End time</label>
                  <input type="datetime-local" name="end_time" value={form.end_time} onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition [color-scheme:dark]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white/70">Confirmation code</label>
                <input name="confirmation_code" value={form.confirmation_code} onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white/70">Price <span className="text-white/30">(optional)</span></label>
                <div className="flex gap-3">
                  <select name="currency" value={form.currency} onChange={handleChange}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-white/30 transition">
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input type="number" name="price" value={form.price} onChange={handleChange} min={0} placeholder="0.00"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-white/30 transition" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white/70">Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition resize-none" />
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{error}</p>
              )}

              <button type="submit" disabled={saving}
                className="w-full bg-white text-black font-semibold py-3.5 rounded-xl hover:bg-white/90 transition disabled:opacity-50">
                {saving ? 'Saving...' : 'Save activity →'}
              </button>

              <button type="button" onClick={() => { setExtracted(false); setImage(null); setImageFile(null) }}
                className="w-full text-white/30 hover:text-white text-sm transition">
                ← Try a different image
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  )
}