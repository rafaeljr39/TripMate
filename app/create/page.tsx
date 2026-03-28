'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'MXN']

export default function CreateTripPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/')
      return
    }

    const { data, error: insertError } = await supabase
      .from('trips')
      .insert({
        user_id: user.id,
        name: form.name,
        destination: form.destination,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        travelers: Number(form.travelers),
        budget: form.budget ? Number(form.budget) : null,
        budget_currency: form.budget_currency,
        notes: form.notes || null,
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <main style={{ position: 'relative', zIndex: 1 }} className="min-h-screen px-4 py-12 flex flex-col items-center justify-center">

      {/* Nav */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 32px',
        background: 'rgba(245,239,224,0.93)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--sand-dark)',
      }}>
        <span style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 800,
          fontSize: '1.35rem',
          color: 'var(--terracotta)',
          letterSpacing: '-0.03em',
        }}>
          Adrift        </span>
        <a href="/dashboard" style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 700,
          fontSize: '0.82rem',
          background: 'var(--ink)',
          color: 'var(--sand)',
          padding: '7px 16px',
          borderRadius: '999px',
          textDecoration: 'none',
          transition: 'all .2s',
        }}>
          ← Dashboard
        </a>
      </nav>

      {/* Form card */}
      <div style={{
        width: '100%',
        maxWidth: '560px',
        background: 'var(--card)',
        border: '1px solid var(--sand-dark)',
        borderRadius: '24px',
        padding: '40px',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 2px 16px rgba(26,23,20,0.08)',
        marginTop: '80px',
      }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--terra-bg)',
            border: '1px solid var(--terracotta)',
            borderRadius: '999px',
            padding: '4px 12px',
            marginBottom: '16px',
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--terracotta)', fontFamily: 'Syne, sans-serif' }}>
              ✈️ New Trip
            </span>
          </div>
          <h1 style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800,
            fontSize: '2rem',
            letterSpacing: '-0.04em',
            color: 'var(--ink)',
            lineHeight: 1.1,
            marginBottom: '8px',
          }}>
            Plan your next adventure
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)' }}>
            Fill in the details and we'll build the itinerary around you.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Trip name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-muted)', fontFamily: 'Syne, sans-serif' }}>
              Trip name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="e.g. Japan Spring 2026"
              style={{
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
              }}
              onFocus={e => e.target.style.borderColor = 'var(--terracotta)'}
              onBlur={e => e.target.style.borderColor = 'var(--sand-dark)'}
            />
          </div>

          {/* Destination */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-muted)', fontFamily: 'Syne, sans-serif' }}>
              Destination
            </label>
            <input
              name="destination"
              value={form.destination}
              onChange={handleChange}
              required
              placeholder="e.g. Tokyo, Japan"
              style={{
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
              }}
              onFocus={e => e.target.style.borderColor = 'var(--terracotta)'}
              onBlur={e => e.target.style.borderColor = 'var(--sand-dark)'}
            />
          </div>

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-muted)', fontFamily: 'Syne, sans-serif' }}>
                Start date
              </label>
              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                style={{
                  width: '100%',
                  background: 'var(--white)',
                  border: '1.5px solid var(--sand-dark)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '0.95rem',
                  color: 'var(--ink)',
                  fontFamily: 'DM Sans, sans-serif',
                  outline: 'none',
                  colorScheme: 'light',
                  transition: 'border-color .2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--terracotta)'}
                onBlur={e => e.target.style.borderColor = 'var(--sand-dark)'}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-muted)', fontFamily: 'Syne, sans-serif' }}>
                End date
              </label>
              <input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                style={{
                  width: '100%',
                  background: 'var(--white)',
                  border: '1.5px solid var(--sand-dark)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '0.95rem',
                  color: 'var(--ink)',
                  fontFamily: 'DM Sans, sans-serif',
                  outline: 'none',
                  colorScheme: 'light',
                  transition: 'border-color .2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--terracotta)'}
                onBlur={e => e.target.style.borderColor = 'var(--sand-dark)'}
              />
            </div>
          </div>

          {/* Travelers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-muted)', fontFamily: 'Syne, sans-serif' }}>
              Travelers
            </label>
            <input
              type="number"
              name="travelers"
              value={form.travelers}
              onChange={handleChange}
              min={1}
              max={50}
              style={{
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
              }}
              onFocus={e => e.target.style.borderColor = 'var(--terracotta)'}
              onBlur={e => e.target.style.borderColor = 'var(--sand-dark)'}
            />
          </div>

          {/* Budget */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-muted)', fontFamily: 'Syne, sans-serif' }}>
              Budget <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400, color: 'var(--ink-muted)', opacity: 0.6 }}>(optional)</span>
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                name="budget_currency"
                value={form.budget_currency}
                onChange={handleChange}
                style={{
                  background: 'var(--white)',
                  border: '1.5px solid var(--sand-dark)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  fontSize: '0.95rem',
                  color: 'var(--ink)',
                  fontFamily: 'DM Sans, sans-serif',
                  outline: 'none',
                  cursor: 'pointer',
                }}
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
                style={{
                  flex: 1,
                  background: 'var(--white)',
                  border: '1.5px solid var(--sand-dark)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '0.95rem',
                  color: 'var(--ink)',
                  fontFamily: 'DM Sans, sans-serif',
                  outline: 'none',
                  transition: 'border-color .2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--terracotta)'}
                onBlur={e => e.target.style.borderColor = 'var(--sand-dark)'}
              />
            </div>
          </div>

          {/* Notes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-muted)', fontFamily: 'Syne, sans-serif' }}>
              Notes <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400, opacity: 0.6 }}>(optional)</span>
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Anything specific you want to do or keep in mind..."
              style={{
                width: '100%',
                background: 'var(--white)',
                border: '1.5px solid var(--sand-dark)',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '0.95rem',
                color: 'var(--ink)',
                fontFamily: 'DM Sans, sans-serif',
                outline: 'none',
                resize: 'none',
                transition: 'border-color .2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--terracotta)'}
              onBlur={e => e.target.style.borderColor = 'var(--sand-dark)'}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(196,85,42,0.08)',
              border: '1px solid var(--terracotta)',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '0.85rem',
              color: 'var(--terracotta)',
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? 'var(--ink-muted)' : 'var(--terracotta)',
              color: 'var(--white)',
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              fontSize: '0.95rem',
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all .2s',
              marginTop: '4px',
            }}
          >
            {loading ? 'Creating trip...' : 'Create trip →'}
          </button>

        </form>
      </div>
    </main>
  )
}