'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import QRCode from 'qrcode'

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

const TYPE_ICONS: Record<string, string> = {
  flight: '✈️', hotel: '🏨', tour: '🗺️',
  restaurant: '🍽️', transport: '🚌', activity: '🎯', other: '📌',
}

const TYPE_LABELS: Record<string, string> = {
  flight: 'Flight', hotel: 'Hotel', tour: 'Tour',
  restaurant: 'Restaurant', transport: 'Transport', activity: 'Activity', other: 'Booking',
}

export default function ShareActivityPage({ params }: { params: Promise<{ activityId: string }> }) {
  const supabase = createClient()
  const [activity, setActivity] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [qrUrl, setQrUrl] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { activityId } = await params
      const { data } = await supabase.from('activities').select('*, trips(name, destination)').eq('id', activityId).single()
      setActivity(data)
      setLoading(false)
      const url = window.location.href
      const dataUrl = await QRCode.toDataURL(url, { width: 160, margin: 2, color: { dark: '#1A1714', light: '#FDFAF4' } })
      setQrUrl(dataUrl)
    }
    load()
  }, [])

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--ink-muted)', fontFamily: 'Syne, sans-serif' }}>Loading...</p>
      </main>
    )
  }

  if (!activity) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ textAlign: 'center', maxWidth: '360px' }}>
          <p style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</p>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: 'var(--ink)', marginBottom: '8px' }}>Activity not found</h1>
          <p style={{ color: 'var(--ink-muted)', marginBottom: '24px' }}>This link may have expired or been removed.</p>
          <Link href="/" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, background: 'var(--terracotta)', color: 'var(--white)', padding: '12px 28px', borderRadius: '999px', textDecoration: 'none' }}>
            Go to Adrift
          </Link>
        </div>
      </main>
    )
  }

  const icon = TYPE_ICONS[activity.type] ?? '📌'
  const label = TYPE_LABELS[activity.type] ?? 'Booking'
  const trip = activity.trips as any

  return (
    <main style={{ minHeight: '100vh', background: 'var(--sand)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '400px', width: '100%' }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-muted)', marginBottom: '6px' }}>Shared via</p>
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.35rem', color: 'var(--terracotta)', letterSpacing: '0.05em', textTransform: 'uppercase' as const }}>
            Adrift          </p>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--sand-dark)', borderRadius: '20px', overflow: 'hidden', marginBottom: '14px', boxShadow: '0 2px 16px rgba(26,23,20,0.08)' }}>

          {/* Header */}
          <div style={{ background: 'var(--ink)', color: 'var(--sand)', padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '2rem' }}>{icon}</span>
              <div>
                <p style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.5, marginBottom: '4px' }}>{label}</p>
                <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.02em' }}>{activity.title}</h1>
              </div>
            </div>
            {trip && <p style={{ fontSize: '0.78rem', opacity: 0.5, marginTop: '10px' }}>📍 {trip.destination} · {trip.name}</p>}
          </div>

          {/* Details */}
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activity.location && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', flexShrink: 0 }}>Location</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)', textAlign: 'right' }}>{activity.location}</span>
              </div>
            )}
            {activity.start_time && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', flexShrink: 0 }}>Start</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)', textAlign: 'right' }}>{formatDateTime(activity.start_time)}</span>
              </div>
            )}
            {activity.end_time && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', flexShrink: 0 }}>End</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)', textAlign: 'right' }}>{formatDateTime(activity.end_time)}</span>
              </div>
            )}
            {activity.confirmation_code && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>Ref</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)', fontFamily: 'monospace' }}>#{activity.confirmation_code}</span>
              </div>
            )}
            {activity.price && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>Price</span>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.92rem', color: 'var(--terracotta)' }}>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: activity.currency }).format(activity.price)}
                </span>
              </div>
            )}
            {activity.notes && (
              <div style={{ paddingTop: '10px', borderTop: '1px solid var(--sand-dark)' }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', marginBottom: '4px' }}>Notes</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--ink-soft)' }}>{activity.notes}</p>
              </div>
            )}
          </div>

          {/* QR Code */}
          {qrUrl && (
            <div style={{ borderTop: '1px solid var(--sand-dark)', padding: '20px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <p style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', marginBottom: '12px' }}>Scan to open on another device</p>
              <div style={{ background: 'var(--white)', padding: '10px', borderRadius: '12px', border: '1px solid var(--sand-dark)' }}>
                <img src={qrUrl} alt="QR Code" style={{ width: '120px', height: '120px', display: 'block' }} />
              </div>
            </div>
          )}
        </div>

        {/* Copy link */}
        <button onClick={copyLink} style={{ width: '100%', background: copied ? 'var(--sage-bg)' : 'var(--card)', color: copied ? 'var(--sage)' : 'var(--ink-muted)', border: '1px solid var(--sand-dark)', borderRadius: '14px', padding: '12px', marginBottom: '10px', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '0.85rem', transition: 'all .2s' }}>
          {copied ? '✅ Link copied!' : '🔗 Copy share link'}
        </button>

        {/* CTA */}
        <Link href="/" style={{ display: 'block', width: '100%', background: 'var(--terracotta)', color: 'var(--white)', borderRadius: '14px', padding: '14px', textAlign: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
          ✈️ Plan your own trips free
        </Link>

        <p style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', textAlign: 'center', marginTop: '16px', opacity: 0.5 }}>
          Adrift — travel planning made simple
        </p>
      </div>
    </main>
  )
}