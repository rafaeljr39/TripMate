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

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--white)', border: '1.5px solid var(--sand-dark)',
  borderRadius: '12px', padding: '12px 16px', fontSize: '0.95rem', color: 'var(--ink)',
  fontFamily: 'DM Sans, sans-serif', outline: 'none', transition: 'border-color .2s', colorScheme: 'light',
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em',
  color: 'var(--ink-muted)', fontFamily: 'Syne, sans-serif', marginBottom: '6px', display: 'block',
}

export default function NewActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const supabase = createClient()
  const [tripId, setTripId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    type: 'other', title: '', location: '', start_time: '', end_time: '',
    confirmation_code: '', notes: '', price: '', currency: 'USD',
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }
    const { error: insertError } = await supabase.from('activities').insert({
      trip_id: tripId, user_id: user.id, type: form.type, title: form.title,
      location: form.location || null, start_time: form.start_time || null,
      end_time: form.end_time || null, confirmation_code: form.confirmation_code || null,
      notes: form.notes || null, price: form.price ? Number(form.price) : null, currency: form.currency,
    })
    if (insertError) { setError(insertError.message); setSaving(false); return }
    router.push(`/trips/${tripId}`)
  }

  const focus = (e: React.FocusEvent<any>) => e.target.style.borderColor = 'var(--terracotta)'
  const blur = (e: React.FocusEvent<any>) => e.target.style.borderColor = 'var(--sand-dark)'

  return (
    <main style={{ minHeight: '100vh', background: 'var(--sand)', position: 'relative', zIndex: 1 }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px', background: 'rgba(245,239,224,0.93)', backdropFilter: 'blur(14px)', borderBottom: '1px solid var(--sand-dark)' }}>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.35rem', color: 'var(--terracotta)', letterSpacing: '-0.03em' }}>
          Adrift        </span>
        <a href={`/trips/${tripId}`} style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.82rem', background: 'var(--ink)', color: 'var(--sand)', padding: '7px 16px', borderRadius: '999px', textDecoration: 'none' }}>
          ← Back to trip
        </a>
      </nav>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--terra-bg)', border: '1px solid var(--terracotta)', borderRadius: '999px', padding: '4px 12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--terracotta)', fontFamily: 'Syne, sans-serif' }}>➕ New Activity</span>
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.04em', color: 'var(--ink)', lineHeight: 1.1, marginBottom: '8px' }}>Add activity</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)' }}>Add a flight, hotel, tour or anything else.</p>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--sand-dark)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 16px rgba(26,23,20,0.08)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--sand-dark)', background: 'var(--sand-mid)' }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: 'var(--ink)' }}>Activity details</p>
          </div>
          <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Type</label>
              <select name="type" value={form.type} onChange={handleChange} style={inputStyle} onFocus={focus} onBlur={blur}>
                {ACTIVITY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Title</label>
              <input name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Flight to Tokyo, Airbnb Shibuya" style={inputStyle} onFocus={focus} onBlur={blur} />
            </div>
            <div>
              <label style={labelStyle}>Location <span style={{ textTransform: 'none', fontWeight: 400, opacity: 0.6 }}>(optional)</span></label>
              <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Tokyo Narita Airport" style={inputStyle} onFocus={focus} onBlur={blur} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Start time</label>
                <input type="datetime-local" name="start_time" value={form.start_time} onChange={handleChange} style={inputStyle} onFocus={focus} onBlur={blur} />
              </div>
              <div>
                <label style={labelStyle}>End time</label>
                <input type="datetime-local" name="end_time" value={form.end_time} onChange={handleChange} style={inputStyle} onFocus={focus} onBlur={blur} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Confirmation code <span style={{ textTransform: 'none', fontWeight: 400, opacity: 0.6 }}>(optional)</span></label>
              <input name="confirmation_code" value={form.confirmation_code} onChange={handleChange} placeholder="e.g. ABC123" style={inputStyle} onFocus={focus} onBlur={blur} />
            </div>
            <div>
              <label style={labelStyle}>Price <span style={{ textTransform: 'none', fontWeight: 400, opacity: 0.6 }}>(optional)</span></label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select name="currency" value={form.currency} onChange={handleChange} style={{ ...inputStyle, width: 'auto' }} onFocus={focus} onBlur={blur}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="number" name="price" value={form.price} onChange={handleChange} min={0} step="0.01" placeholder="0.00" style={{ ...inputStyle, flex: 1 }} onFocus={focus} onBlur={blur} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Notes <span style={{ textTransform: 'none', fontWeight: 400, opacity: 0.6 }}>(optional)</span></label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Any additional details..." style={{ ...inputStyle, resize: 'none' }} onFocus={focus} onBlur={blur} />
            </div>
            {error && (
              <div style={{ background: 'var(--terra-bg)', border: '1px solid var(--terracotta)', borderRadius: '12px', padding: '12px 16px', fontSize: '0.85rem', color: 'var(--terracotta)' }}>{error}</div>
            )}
            <button type="submit" disabled={saving} style={{ width: '100%', background: saving ? 'var(--ink-muted)' : 'var(--terracotta)', color: 'var(--white)', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.95rem', padding: '14px', borderRadius: '12px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', transition: 'all .2s' }}>
              {saving ? 'Saving...' : 'Add activity →'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}