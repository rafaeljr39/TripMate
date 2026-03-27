'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import QRCode from 'qrcode'

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
    year: 'numeric', hour: '2-digit', minute: '2-digit'
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
      const { data } = await supabase
        .from('activities')
        .select('*, trips(name, destination)')
        .eq('id', activityId)
        .single()
      setActivity(data)
      setLoading(false)

      const url = window.location.href
      const dataUrl = await QRCode.toDataURL(url, {
        width: 160,
        margin: 2,
        color: { dark: '#ffffff', light: '#00000000' }
      })
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
      <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <p className="text-white/30">Loading...</p>
      </main>
    )
  }

  if (!activity) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center px-4">
        <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }} className="text-center">
          <p className="text-5xl mb-4">🔍</p>
          <h1 className="text-2xl font-bold mb-2">Activity not found</h1>
          <p className="text-white/40 mb-6">This link may have expired or been removed.</p>
          <Link href="/" className="bg-white text-black font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition inline-block">
            Go to TripMate
          </Link>
        </div>
      </main>
    )
  }

  const icon = TYPE_ICONS[activity.type] ?? '📌'
  const label = TYPE_LABELS[activity.type] ?? 'Booking'
  const trip = activity.trips as any

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center px-4 py-12">
      <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>

        {/* Brand */}
        <div className="text-center mb-6">
          <p className="text-white/30 text-xs font-medium tracking-widest uppercase mb-1">Shared via</p>
          <p className="font-bold text-lg">TripMate ✈️</p>
        </div>

        {/* Card */}
        <div style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', marginBottom: '16px' }}>

          {/* Card Header */}
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{icon}</span>
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-0.5">{label}</p>
                <h1 className="text-xl font-bold">{activity.title}</h1>
              </div>
            </div>
            {trip && (
              <p className="text-white/30 text-xs mt-3">📍 {trip.destination} · {trip.name}</p>
            )}
          </div>

          {/* Card Body */}
          <div style={{ padding: '20px 24px' }} className="space-y-3">
            {activity.location && (
              <div className="flex justify-between items-start gap-4">
                <span className="text-white/30 text-sm shrink-0">Location</span>
                <span className="text-white text-sm font-medium text-right">{activity.location}</span>
              </div>
            )}
            {activity.start_time && (
              <div className="flex justify-between items-start gap-4">
                <span className="text-white/30 text-sm shrink-0">Start</span>
                <span className="text-white text-sm font-medium text-right">{formatDateTime(activity.start_time)}</span>
              </div>
            )}
            {activity.end_time && (
              <div className="flex justify-between items-start gap-4">
                <span className="text-white/30 text-sm shrink-0">End</span>
                <span className="text-white text-sm font-medium text-right">{formatDateTime(activity.end_time)}</span>
              </div>
            )}
            {activity.confirmation_code && (
              <div className="flex justify-between items-start gap-4">
                <span className="text-white/30 text-sm shrink-0">Ref</span>
                <span className="text-white text-sm font-mono font-medium">#{activity.confirmation_code}</span>
              </div>
            )}
            {activity.price && (
              <div className="flex justify-between items-start gap-4">
                <span className="text-white/30 text-sm shrink-0">Price</span>
                <span className="text-white text-sm font-semibold">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: activity.currency }).format(activity.price)}
                </span>
              </div>
            )}
            {activity.notes && (
              <div style={{ paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-white/30 text-xs mb-1">Notes</p>
                <p className="text-white/70 text-sm">{activity.notes}</p>
              </div>
            )}
          </div>

          {/* QR Code */}
          {qrUrl && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '20px 24px' }} className="flex flex-col items-center">
              <p className="text-white/30 text-xs mb-3">Scan to open on another device</p>
              <img src={qrUrl} alt="QR Code" style={{ width: '128px', height: '128px' }} />
            </div>
          )}
        </div>

        {/* Copy Link */}
        <button
          onClick={copyLink}
          style={{ width: '100%', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '12px', marginBottom: '12px', background: 'transparent', cursor: 'pointer' }}
          className="text-white/60 hover:text-white transition text-sm font-medium"
        >
          {copied ? '✅ Link copied!' : '🔗 Copy share link'}
        </button>

        {/* CTA */}
        <Link
          href="/"
          style={{ display: 'block', width: '100%', background: 'white', color: 'black', borderRadius: '16px', padding: '14px', textAlign: 'center' }}
          className="font-semibold text-sm hover:opacity-90 transition"
        >
          ✈️ Plan your own trips free
        </Link>

        <p className="text-white/20 text-xs text-center mt-4">
          TripMate — travel planning made simple
        </p>
      </div>
    </main>
  )
}