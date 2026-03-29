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

const TYPE_ICONS: Record<string, string> = {
  flight: '✈️', hotel: '🏨', tour: '🗺️',
  restaurant: '🍽️', transport: '🚌', activity: '🎯', other: '📌',
}

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

const emptyForm = {
  type: 'other',
  title: '',
  location: '',
  start_time: '',
  end_time: '',
  confirmation_code: '',
  notes: '',
  price: '',
  currency: 'USD',
}

export default function ExtractActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [tripId, setTripId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'scan' | 'manual' | 'email'>('scan')
  const [image, setImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [extracted, setExtracted] = useState(false)
  const [form, setForm] = useState(emptyForm)

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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
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

  const tabs = [
    { key: 'scan', label: '📸 Scan', comingSoon: false },
    { key: 'manual', label: '✏️ Manual', comingSoon: false },
    { key: 'email', label: '📧 Email Forward', comingSoon: true },
  ]

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
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.35rem', color: 'var(--terracotta)', letterSpacing: '0.05em', textTransform: 'uppercase' as const }}>
          Adrift        </span>
        <a href={`/trips/${tripId}`} style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.82rem',
          background: 'var(--ink)', color: 'var(--sand)',
          padding: '7px 16px', borderRadius: '999px', textDecoration: 'none',
        }}>
          ← Back to trip
        </a>
      </nav>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'var(--terra-bg)', border: '1px solid var(--terracotta)',
            borderRadius: '999px', padding: '4px 12px', marginBottom: '16px',
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--terracotta)', fontFamily: 'Syne, sans-serif' }}>
              ➕ Add Activity
            </span>
          </div>
          <h1 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: '2rem', letterSpacing: '-0.04em',
            color: 'var(--ink)', lineHeight: 1.1, marginBottom: '8px',
          }}>
            Add to your trip
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)' }}>
            Scan a confirmation, enter manually, or forward an email.
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '3px',
          background: 'var(--sand-dark)',
          borderRadius: '11px', padding: '3px',
          marginBottom: '24px', width: 'fit-content',
        }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => !tab.comingSoon && setActiveTab(tab.key as any)}
              style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 600,
                fontSize: '0.82rem',
                padding: '7px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: tab.comingSoon ? 'default' : 'pointer',
                transition: 'all .2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: activeTab === tab.key ? 'var(--white)' : 'transparent',
                color: activeTab === tab.key ? 'var(--ink)' : 'var(--ink-soft)',
                boxShadow: activeTab === tab.key ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
                opacity: tab.comingSoon ? 0.6 : 1,
              }}
            >
              {tab.label}
              {tab.comingSoon && (
                <span style={{
                  fontSize: '0.6rem', fontWeight: 700,
                  background: 'var(--gold-bg)', color: 'var(--gold)',
                  border: '1px solid var(--gold)',
                  padding: '1px 6px', borderRadius: '999px',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  Soon
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── SCAN TAB ── */}
        {activeTab === 'scan' && (
          <div>
            {!extracted && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />

                {!image ? (
                  <button
                    onClick={() => fileRef.current?.click()}
                    style={{
                      width: '100%', background: 'var(--card)',
                      border: '2px dashed var(--sand-dark)',
                      borderRadius: '20px', padding: '56px 32px',
                      textAlign: 'center', cursor: 'pointer', transition: 'all .2s',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--terracotta)'
                      ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--terra-bg)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--sand-dark)'
                      ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--card)'
                    }}
                  >
                    <p style={{ fontSize: '3rem', marginBottom: '12px' }}>📸</p>
                    <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>
                      Upload screenshot
                    </p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>
                      Tap to choose from your photos
                    </p>
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--sand-dark)' }}>
                      <img src={image} alt="Confirmation screenshot" style={{ width: '100%', objectFit: 'contain', maxHeight: '320px', display: 'block' }} />
                      <button
                        onClick={() => { setImage(null); setImageFile(null) }}
                        style={{
                          position: 'absolute', top: '10px', right: '10px',
                          background: 'rgba(26,23,20,0.6)', color: 'var(--white)',
                          border: 'none', borderRadius: '50%',
                          width: '30px', height: '30px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', fontSize: '0.8rem',
                        }}
                      >✕</button>
                    </div>

                    {extracting ? (
                      <div style={{
                        background: 'var(--card)', border: '1px solid var(--sand-dark)',
                        borderRadius: '16px', padding: '28px', textAlign: 'center',
                      }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '50%',
                          border: '3px solid var(--sand-dark)',
                          borderTopColor: 'var(--terracotta)',
                          margin: '0 auto 16px',
                          animation: 'spin 0.8s linear infinite',
                        }} />
                        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>
                          Reading your confirmation...
                        </p>
                        <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>AI is extracting the details</p>
                      </div>
                    ) : (
                      <button onClick={handleExtract} style={{
                        width: '100%', background: 'var(--terracotta)', color: 'var(--white)',
                        fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.95rem',
                        padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', transition: 'all .2s',
                      }}>
                        ✨ Extract details
                      </button>
                    )}
                  </div>
                )}

                {error && (
                  <div style={{
                    background: 'var(--terra-bg)', border: '1px solid var(--terracotta)',
                    borderRadius: '12px', padding: '12px 16px',
                    fontSize: '0.85rem', color: 'var(--terracotta)',
                  }}>
                    {error}
                  </div>
                )}
              </div>
            )}

            {extracted && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  background: 'var(--sage-bg)', border: '1px solid var(--sage)',
                  borderRadius: '12px', padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                  <span>✅</span>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--sage)', fontFamily: 'Syne, sans-serif' }}>
                    Details extracted! Review and confirm below.
                  </p>
                </div>

                <div style={{
                  background: 'var(--card)', border: '1px solid var(--sand-dark)',
                  borderRadius: '20px', overflow: 'hidden',
                  boxShadow: '0 2px 16px rgba(26,23,20,0.08)',
                }}>
                  <div style={{
                    padding: '16px 20px', borderBottom: '1px solid var(--sand-dark)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'var(--sand-mid)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.5rem' }}>{TYPE_ICONS[form.type] ?? '📌'}</span>
                      <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: 'var(--ink)' }}>
                        {ACTIVITY_TYPES.find(t => t.value === form.type)?.label ?? 'Booking'} Detected
                      </p>
                    </div>
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 700,
                      background: 'var(--terra-bg)', color: 'var(--terracotta)',
                      border: '1px solid var(--terracotta)',
                      padding: '3px 10px', borderRadius: '999px',
                      fontFamily: 'Syne, sans-serif',
                    }}>
                      AI Extracted
                    </span>
                  </div>

                  <form onSubmit={handleSave} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <ActivityFormFields form={form} handleChange={handleChange} />
                    {error && (
                      <div style={{
                        background: 'var(--terra-bg)', border: '1px solid var(--terracotta)',
                        borderRadius: '12px', padding: '12px 16px',
                        fontSize: '0.85rem', color: 'var(--terracotta)',
                      }}>{error}</div>
                    )}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                      <button type="button"
                        onClick={() => { setExtracted(false); setImage(null); setImageFile(null) }}
                        style={{
                          flex: 1, background: 'transparent',
                          border: '1.5px solid var(--sand-dark)', borderRadius: '12px',
                          padding: '13px', fontFamily: 'Syne, sans-serif', fontWeight: 600,
                          fontSize: '0.88rem', color: 'var(--ink-muted)', cursor: 'pointer',
                        }}>
                        ← Try again
                      </button>
                      <button type="submit" disabled={saving} style={{
                        flex: 2,
                        background: saving ? 'var(--ink-muted)' : 'var(--terracotta)',
                        color: 'var(--white)', fontFamily: 'Syne, sans-serif', fontWeight: 700,
                        fontSize: '0.95rem', padding: '13px', borderRadius: '12px',
                        border: 'none', cursor: saving ? 'not-allowed' : 'pointer', transition: 'all .2s',
                      }}>
                        {saving ? 'Saving...' : 'Confirm & Save →'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── MANUAL TAB ── */}
        {activeTab === 'manual' && (
          <div style={{
            background: 'var(--card)', border: '1px solid var(--sand-dark)',
            borderRadius: '20px', overflow: 'hidden',
            boxShadow: '0 2px 16px rgba(26,23,20,0.08)',
          }}>
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid var(--sand-dark)',
              background: 'var(--sand-mid)',
            }}>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: 'var(--ink)' }}>
                ✏️ Enter details manually
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginTop: '2px' }}>
                Fill in what you know — everything except title is optional.
              </p>
            </div>

            <form onSubmit={handleSave} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <ActivityFormFields form={form} handleChange={handleChange} />
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
                {saving ? 'Saving...' : 'Save activity →'}
              </button>
            </form>
          </div>
        )}

        {/* ── EMAIL TAB ── */}
        {activeTab === 'email' && (
          <div style={{
            background: 'var(--card)', border: '1px solid var(--sand-dark)',
            borderRadius: '20px', padding: '48px 32px', textAlign: 'center',
          }}>
            <p style={{ fontSize: '3rem', marginBottom: '16px' }}>📧</p>
            <h3 style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 800,
              fontSize: '1.2rem', color: 'var(--ink)', marginBottom: '8px',
            }}>
              Email forwarding
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--ink-muted)', marginBottom: '20px', lineHeight: 1.6 }}>
              Forward any confirmation email to your personal Adrift address and we'll extract the details automatically.
            </p>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'var(--gold-bg)', color: 'var(--gold)',
              border: '1px solid var(--gold)',
              padding: '6px 16px', borderRadius: '999px',
              fontSize: '0.78rem', fontWeight: 700,
              fontFamily: 'Syne, sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              🚧 Coming Soon
            </span>
          </div>
        )}

      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  )
}

function ActivityFormFields({ form, handleChange }: { form: any, handleChange: any }) {
  const inputS: React.CSSProperties = {
    width: '100%', background: 'var(--white)',
    border: '1.5px solid var(--sand-dark)', borderRadius: '12px',
    padding: '12px 16px', fontSize: '0.95rem', color: 'var(--ink)',
    fontFamily: 'DM Sans, sans-serif', outline: 'none', transition: 'border-color .2s',
    colorScheme: 'light',
  }
  const labelS: React.CSSProperties = {
    fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: '0.08em', color: 'var(--ink-muted)',
    fontFamily: 'Syne, sans-serif', marginBottom: '6px', display: 'block',
  }
  const focus = (e: React.FocusEvent<any>) => e.target.style.borderColor = 'var(--terracotta)'
  const blur = (e: React.FocusEvent<any>) => e.target.style.borderColor = 'var(--sand-dark)'

  return (
    <>
      <div>
        <label style={labelS}>Type</label>
        <select name="type" value={form.type} onChange={handleChange} style={inputS} onFocus={focus} onBlur={blur}>
          {ACTIVITY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <div>
        <label style={labelS}>Title</label>
        <input name="title" value={form.title} onChange={handleChange} required
          placeholder="e.g. Selina Hotel, Ryanair Flight..."
          style={inputS} onFocus={focus} onBlur={blur} />
      </div>
      <div>
        <label style={labelS}>Location <span style={{ textTransform: 'none', fontWeight: 400, opacity: 0.6 }}>(optional)</span></label>
        <input name="location" value={form.location} onChange={handleChange}
          placeholder="e.g. Barcelona, Spain"
          style={inputS} onFocus={focus} onBlur={blur} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={labelS}>Start time</label>
          <input type="datetime-local" name="start_time" value={form.start_time} onChange={handleChange}
            style={inputS} onFocus={focus} onBlur={blur} />
        </div>
        <div>
          <label style={labelS}>End time</label>
          <input type="datetime-local" name="end_time" value={form.end_time} onChange={handleChange}
            style={inputS} onFocus={focus} onBlur={blur} />
        </div>
      </div>
      <div>
        <label style={labelS}>Confirmation code <span style={{ textTransform: 'none', fontWeight: 400, opacity: 0.6 }}>(optional)</span></label>
        <input name="confirmation_code" value={form.confirmation_code} onChange={handleChange}
          placeholder="e.g. ABC-123"
          style={inputS} onFocus={focus} onBlur={blur} />
      </div>
      <div>
        <label style={labelS}>Price <span style={{ textTransform: 'none', fontWeight: 400, opacity: 0.6 }}>(optional)</span></label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select name="currency" value={form.currency} onChange={handleChange}
            style={{ ...inputS, width: 'auto' }} onFocus={focus} onBlur={blur}>
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="number" name="price" value={form.price} onChange={handleChange}
            min={0} step="0.01" placeholder="0.00"
            style={{ ...inputS, flex: 1 }} onFocus={focus} onBlur={blur} />
        </div>
      </div>
      <div>
        <label style={labelS}>Notes <span style={{ textTransform: 'none', fontWeight: 400, opacity: 0.6 }}>(optional)</span></label>
        <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
          placeholder="Any extra details..."
          style={{ ...inputS, resize: 'none' }} onFocus={focus} onBlur={blur} />
      </div>
    </>
  )
}