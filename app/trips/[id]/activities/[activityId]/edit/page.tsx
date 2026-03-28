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
  width: '100%',
  background: 'var(--white)',
  border: '1.5px solid var(--sand-dark)',
  borderRadius: '12px',
  padding: '12px 16px',
  fontSize: '0.95rem',
  color: 'var(--ink)',
  fontFamily: 'DM Sans, sans-serif',
  outline: 'none',
  transition: 'border-color .2s',
  colorScheme: 'light',
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--ink-muted)',
  fontFamily: 'Syne, sans-serif',
  marginBottom: '6px',
  display: 'block',
}

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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
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

  const focus = (e: React.FocusEvent<any>) => e.target.style.borderColor = 'var(--terracotta)'
  const blur = (e: React.FocusEvent<any>) => e.target.style.borderColor = 'var(--sand-dark)'

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--ink-muted)', fontFamily: 'Syne, sans-serif' }}>Loading activity...</p>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--sand)', position: 'relative', zIndex: 1 }}>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 32px',
        background: 'rgba(245,239,224,0.93)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--sand-dark)',
      }}>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.35rem', color: 'var(--terracotta)', letterSpacing: '-0.03em' }}>
          Trip<span style={{ color: 'var(--ink)' }}>Mate</span>
        </span>
        <a href={`/trips/${tripId}`} style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.82rem',
          background: 'var(--ink)', color: 'var(--sand)',
          padding: '7px 16px', borderRadius: '999px', textDecoration: 'none',
        }}>
          ← Back to trip
        </a>
      </nav>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'var(--terra-bg)', border: '1px solid var(--terracotta)',
            borderRadius: '999px', padding: '4px 12px', marginBottom: '16px',
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--terracotta)', fontFamily: 'Syne, sans-serif' }}>
              ✏️ Edit Activity
            </span>
          </div>
          <h1 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: '2rem', letterSpacing: '-0.04em',
            color: 'var(--ink)', lineHeight: 1.1, marginBottom: '8px',
          }}>
            Edit activity
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)' }}>
            Update the details or delete this activity.
          </p>
        </div>

        {/* Form card */}
        <div style={{
          background: 'var(--card)', border: '1px solid var(--sand-dark)',
          borderRadius: '20px', overflow: 'hidden',
          boxShadow: '0 2px 16px rgba(26,23,20,0.08)',
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--sand-dark)', background: 'var(--sand-mid)' }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: 'var(--ink)' }}>
              Activity details
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div>
              <label style={labelStyle}>Type</label>
              <select name="type" value={form.type} onChange={handleChange}
                style={inputStyle} onFocus={focus} onBlur={blur}>
                {ACTIVITY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Title</label>
              <input name="title" value={form.title} onChange={handleChange} required
                style={inputStyle} onFocus={focus} onBlur={blur} />
            </div>

            <div>
              <label style={labelStyle}>Location <span style={{ textTransform: 'none', fontWeight: 400, opacity: 0.6 }}>(optional)</span></label>
              <input name="location" value={form.location} onChange={handleChange}
                style={inputStyle} onFocus={focus} onBlur={blur} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Start time</label>
                <input type="datetime-local" name="start_time" value={form.start_time} onChange={handleChange}
                  style={inputStyle} onFocus={focus} onBlur={blur} />
              </div>
              <div>
                <label style={labelStyle}>End time</label>
                <input type="datetime-local" name="end_time" value={form.end_time} onChange={handleChange}
                  style={inputStyle} onFocus={focus} onBlur={blur} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Confirmation code <span style={{ textTransform: 'none', fontWeight: 400, opacity: 0.6 }}>(optional)</span></label>
              <input name="confirmation_code" value={form.confirmation_code} onChange={handleChange}
                style={inputStyle} onFocus={focus} onBlur={blur} />
            </div>

            <div>
              <label style={labelStyle}>Price <span style={{ textTransform: 'none', fontWeight: 400, opacity: 0.6 }}>(optional)</span></label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select name="currency" value={form.currency} onChange={handleChange}
                  style={{ ...inputStyle, width: 'auto' }} onFocus={focus} onBlur={blur}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="number" name="price" value={form.price} onChange={handleChange}
                  min={0} placeholder="0.00"
                  style={{ ...inputStyle, flex: 1 }} onFocus={focus} onBlur={blur} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Notes <span style={{ textTransform: 'none', fontWeight: 400, opacity: 0.6 }}>(optional)</span></label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
                style={{ ...inputStyle, resize: 'none' }} onFocus={focus} onBlur={blur} />
            </div>

            {error && (
              <div style={{
                background: 'var(--terra-bg)', border: '1px solid var(--terracotta)',
                borderRadius: '12px', padding: '12px 16px',
                fontSize: '0.85rem', color: 'var(--terracotta)',
              }}>{error}</div>
            )}

            <button type="submit" disabled={saving} style={{
              width: '100%',
              background: saving ? 'var(--ink-muted)' : 'var(--terracotta)',
              color: 'var(--white)', fontFamily: 'Syne, sans-serif', fontWeight: 700,
              fontSize: '0.95rem', padding: '14px', borderRadius: '12px',
              border: 'none', cursor: saving ? 'not-allowed' : 'pointer', transition: 'all .2s',
            }}>
              {saving ? 'Saving...' : 'Save changes →'}
            </button>

            <button type="button" onClick={handleDelete} disabled={deleting} style={{
              width: '100%',
              background: 'transparent',
              color: 'var(--terracotta)',
              border: '1.5px dashed var(--terracotta)',
              fontFamily: 'Syne, sans-serif', fontWeight: 700,
              fontSize: '0.88rem', padding: '13px', borderRadius: '12px',
              cursor: deleting ? 'not-allowed' : 'pointer', transition: 'all .2s',
              opacity: deleting ? 0.5 : 1,
            }}>
              {deleting ? 'Deleting...' : '🗑 Delete activity'}
            </button>

          </form>
        </div>
      </div>
    </main>
  )
}