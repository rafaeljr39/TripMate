'use client'

import { useState } from 'react'
import Link from 'next/link'

const TYPE_ICONS: Record<string, string> = {
  flight: '✈️', hotel: '🏨', tour: '🗺️',
  restaurant: '🍽️', transport: '🚌', activity: '🎯', other: '📌',
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatBudget(amount: number | null, currency: string) {
  if (!amount) return null
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function formatDayHeader(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function toDateStr(year: number, month: number, day: number) {
  return year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0')
}

function isBetween(dateStr: string, startStr: string, endStr: string) {
  if (!dateStr || !startStr || !endStr) return false
  return dateStr >= startStr.slice(0, 10) && dateStr <= endStr.slice(0, 10)
}

function isSameDay(dateStr: string, targetStr: string) {
  if (!dateStr || !targetStr) return false
  return dateStr.slice(0, 10) === targetStr.slice(0, 10)
}

export default function TripDetailClient({
  trip, activities, members, days, totalSpent, inviteUrl, tripId
}: {
  trip: any, activities: any[], members: any[],
  days: number | null, totalSpent: number,
  inviteUrl: string, tripId: string
}) {
  const [activeTab, setActiveTab] = useState<'bookings' | 'calendar'>('bookings')
  const [calendarView, setCalendarView] = useState<'list' | 'timeline'>('list')
  const [copied, setCopied] = useState(false)

  // Calendar month state — default to trip start month
  const tripStartDate = trip.start_date ? new Date(trip.start_date) : new Date()
  const [calMonth, setCalMonth] = useState(tripStartDate.getMonth())
  const [calYear, setCalYear] = useState(tripStartDate.getFullYear())

  const hotels = activities.filter(a => a.type === 'hotel' && a.start_time && a.end_time)
  const flights = activities.filter(a => a.type === 'flight' && a.start_time)

  // Gap detection
  const gapDays: string[] = []
  if (trip.start_date && trip.end_date) {
    const current = new Date(trip.start_date)
    const end = new Date(trip.end_date)
    while (current <= end) {
      const dateStr = current.toISOString().slice(0, 10)
      const hasHotel = hotels.some(h => isBetween(dateStr, h.start_time, h.end_time))
      const hasFlight = flights.some(f => isSameDay(f.start_time, dateStr))
      if (!hasHotel && !hasFlight) gapDays.push(dateStr)
      current.setDate(current.getDate() + 1)
    }
  }

  // Coming up — next activity from today
  const now = new Date()
  const upcomingActivity = activities
    .filter(a => a.start_time && new Date(a.start_time) >= now)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())[0] ?? null

  // Budget breakdown by type
  const budgetByType: Record<string, number> = {}
  activities.forEach(a => {
    if (a.price) {
      budgetByType[a.type] = (budgetByType[a.type] ?? 0) + a.price
    }
  })

  function handleCopyInvite() {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) }
    else setCalMonth(m => m - 1)
  }

  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) }
    else setCalMonth(m => m + 1)
  }

  const monthName = new Date(calYear, calMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  // Build calendar cells
  const daysInMonth = getDaysInMonth(calYear, calMonth)
  const firstDay = getFirstDayOfMonth(calYear, calMonth)
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  // Grouped activities for timeline
  const grouped: Record<string, any[]> = {}
  const noDate: any[] = []
  activities.forEach(a => {
    if (a.start_time) {
      const day = a.start_time.split('T')[0]
      if (!grouped[day]) grouped[day] = []
      grouped[day].push(a)
    } else {
      noDate.push(a)
    }
  })
  const sortedDays = Object.keys(grouped).sort()

  const extractHref = `/trips/${tripId}/activities/extract`

  return (
    <main style={{ minHeight: '100vh', background: 'var(--sand)', position: 'relative' }}>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 32px',
        background: 'rgba(245,239,224,0.93)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--sand-dark)',
      }}>
        <Link href="/dashboard" style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', textDecoration: 'none', fontWeight: 500 }}>
          ← Back
        </Link>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.35rem', color: 'var(--terracotta)', letterSpacing: '-0.03em' }}>
          Trip<span style={{ color: 'var(--ink)' }}>Mate</span>
        </span>
        <Link href={`/trips/${tripId}/edit`} style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', textDecoration: 'none', fontWeight: 500 }}>
          Edit
        </Link>
      </nav>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Trip header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '2.2rem', letterSpacing: '-0.04em', color: 'var(--ink)', marginBottom: '4px' }}>
            {trip.name}
          </h1>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.95rem' }}>
            📍 {trip.destination}
            {trip.start_date && trip.end_date && (
              <span style={{ marginLeft: '12px' }}>
                {formatDate(trip.start_date)} → {formatDate(trip.end_date)}
              </span>
            )}
          </p>
        </div>

        {/* Compact stat bar */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <div style={{ background: 'var(--ink)', color: 'var(--sand)', borderRadius: '13px', padding: '13px 16px', flex: '1.4' }}>
            <p style={{ fontSize: '0.62rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.55, marginBottom: '4px' }}>Duration</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.04em', lineHeight: 1 }}>
              {days ?? '—'}<span style={{ fontSize: '0.8rem', fontWeight: 500, marginLeft: '4px', opacity: 0.7 }}>days</span>
            </p>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--sand-dark)', borderRadius: '13px', padding: '13px 16px', flex: 1 }}>
            <p style={{ fontSize: '0.62rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-muted)', marginBottom: '4px' }}>Travelers</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--ink)' }}>{trip.travelers}</p>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--sand-dark)', borderRadius: '13px', padding: '13px 16px', flex: 1 }}>
            <p style={{ fontSize: '0.62rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-muted)', marginBottom: '4px' }}>Activities</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--ink)' }}>{activities.length}</p>
          </div>
          {trip.budget && (
            <div style={{ background: 'var(--card)', border: '1px solid var(--sand-dark)', borderRadius: '13px', padding: '13px 16px', flex: 2 }}>
              <p style={{ fontSize: '0.62rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-muted)', marginBottom: '4px' }}>Budget</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--ink)' }}>
                {formatBudget(trip.budget, trip.budget_currency)}
              </p>
              {totalSpent > 0 && (
                <>
                  <div style={{ height: '4px', background: 'var(--sand-dark)', borderRadius: '99px', overflow: 'hidden', marginTop: '8px' }}>
                    <div style={{ height: '100%', borderRadius: '99px', background: totalSpent > trip.budget ? 'var(--terracotta)' : 'var(--gold-light)', width: `${Math.min((totalSpent / trip.budget) * 100, 100)}%`, transition: 'width .6s ease' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', marginTop: '4px', color: 'var(--ink-muted)' }}>
                    <span>Spent: {formatBudget(totalSpent, trip.budget_currency)}</span>
                    <span>{Math.round((totalSpent / trip.budget) * 100)}%</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '22px', alignItems: 'start' }}>

          {/* LEFT — main content */}
          <div>
            {/* Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '3px', background: 'var(--sand-dark)', borderRadius: '11px', padding: '3px' }}>
                {(['bookings', 'calendar'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{
                    fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '0.82rem',
                    padding: '7px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'all .2s',
                    background: activeTab === tab ? 'var(--white)' : 'transparent',
                    color: activeTab === tab ? 'var(--ink)' : 'var(--ink-soft)',
                    boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
                  }}>
                    {tab === 'bookings' ? '🗂 Bookings' : '📅 Calendar'}
                  </button>
                ))}
              </div>
              <Link href={extractHref} style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.82rem',
                background: 'var(--terracotta)', color: 'var(--white)',
                padding: '7px 16px', borderRadius: '999px', textDecoration: 'none',
              }}>
                + Add activity
              </Link>
            </div>

            {/* BOOKINGS TAB */}
            {activeTab === 'bookings' && (
              <div>
                {activities.length === 0 ? (
                  <div style={{
                    border: '2px dashed var(--sand-dark)', borderRadius: '16px',
                    padding: '48px 32px', textAlign: 'center',
                  }}>
                    <p style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🗺️</p>
                    <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '8px' }}>No activities yet</h3>
                    <p style={{ color: 'var(--ink-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>Scan a confirmation to add your first activity.</p>
                    <Link href={extractHref} style={{
                      fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.85rem',
                      background: 'var(--terracotta)', color: 'var(--white)',
                      padding: '10px 22px', borderRadius: '999px', textDecoration: 'none',
                    }}>📸 Scan confirmation</Link>
                  </div>
                ) : (
                  <div>
                    {/* List/Timeline toggle */}
                    <div style={{ display: 'flex', gap: '3px', background: 'var(--sand-dark)', borderRadius: '9px', padding: '3px', width: 'fit-content', marginBottom: '14px' }}>
                      {(['list', 'timeline'] as const).map(v => (
                        <button key={v} onClick={() => setCalendarView(v)} style={{
                          fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '0.75rem',
                          padding: '5px 14px', borderRadius: '7px', border: 'none', cursor: 'pointer', transition: 'all .2s',
                          background: calendarView === v ? 'var(--white)' : 'transparent',
                          color: calendarView === v ? 'var(--ink)' : 'var(--ink-soft)',
                        }}>
                          {v === 'list' ? 'List' : 'Timeline'}
                        </button>
                      ))}
                    </div>

                    {calendarView === 'list' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {activities.map(a => <ActivityCard key={a.id} activity={a} tripId={tripId} />)}
                      </div>
                    )}

                    {calendarView === 'timeline' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {sortedDays.map(day => (
                          <div key={day}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                              <div style={{ height: '1px', flex: 1, background: 'var(--sand-dark)' }} />
                              <p style={{ color: 'var(--ink-muted)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{formatDayHeader(day)}</p>
                              <div style={{ height: '1px', flex: 1, background: 'var(--sand-dark)' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {grouped[day].map(a => <ActivityCard key={a.id} activity={a} tripId={tripId} showTime />)}
                            </div>
                          </div>
                        ))}
                        {noDate.length > 0 && (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                              <div style={{ height: '1px', flex: 1, background: 'var(--sand-dark)' }} />
                              <p style={{ color: 'var(--ink-muted)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>No date set</p>
                              <div style={{ height: '1px', flex: 1, background: 'var(--sand-dark)' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {noDate.map(a => <ActivityCard key={a.id} activity={a} tripId={tripId} />)}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* CALENDAR TAB */}
            {activeTab === 'calendar' && (
              <div style={{ background: 'var(--card)', border: '1px solid var(--sand-dark)', borderRadius: '20px', overflow: 'hidden' }}>

                {/* Gap alert */}
                {gapDays.length > 0 && (
                  <div style={{ margin: '16px 16px 0', background: 'var(--terra-bg)', border: '1px solid rgba(196,85,42,0.22)', borderRadius: '11px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '9px' }}>
                    <span>⚠️</span>
                    <p style={{ fontSize: '0.82rem', color: 'var(--terracotta)', fontWeight: 500 }}>
                      <strong>{gapDays.length} night{gapDays.length === 1 ? '' : 's'}</strong> without accommodation
                    </p>
                  </div>
                )}

                {/* Month header */}
                <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--sand-dark)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <button onClick={prevMonth} style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid var(--sand-dark)', background: 'var(--white)', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--ink-soft)' }}>‹</button>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: 'var(--ink)' }}>{monthName}</p>
                  <button onClick={nextMonth} style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid var(--sand-dark)', background: 'var(--white)', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--ink-soft)' }}>›</button>
                </div>

                <div style={{ padding: '16px 20px' }}>
                  {/* Weekday headers */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', marginBottom: '6px' }}>
                    {weekdays.map(w => (
                      <div key={w} style={{ textAlign: 'center', fontSize: '0.62rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-muted)', opacity: 0.6, padding: '3px 0' }}>{w}</div>
                    ))}
                  </div>

                  {/* Days grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                    {cells.map((day, i) => {
                      if (!day) return <div key={'e-' + i} />
                      const dateStr = toDateStr(calYear, calMonth, day)
                      const inTrip = trip.start_date && trip.end_date && dateStr >= trip.start_date && dateStr <= trip.end_date
                      const hasHotel = hotels.some(h => isBetween(dateStr, h.start_time, h.end_time))
                      const hasFlight = flights.some(f => isSameDay(f.start_time, dateStr))
                      const isGap = inTrip && !hasHotel && !hasFlight
                      const isStart = dateStr === trip.start_date
                      const isEnd = dateStr === trip.end_date

                      let bg = 'transparent'
                      let color = 'var(--ink)'
                      let border = 'none'
                      const opacity = inTrip ? 1 : 0.3

                      if (hasHotel && hasFlight) { bg = 'var(--sage)'; color = 'white' }
                      else if (hasHotel) { bg = 'var(--sky)'; color = 'white' }
                      else if (hasFlight) { bg = 'var(--sky-light)'; color = 'white' }
                      else if (isGap) { border = '1.5px dashed var(--terra-light)'; color = 'var(--terracotta)'; bg = 'var(--terra-bg)' }
                      else if (isStart || isEnd) { bg = 'var(--ink)'; color = 'var(--sand)' }

                      return (
                        <div key={dateStr} style={{
                          aspectRatio: '1', borderRadius: '9px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: bg, color, border, opacity,
                          fontSize: '0.82rem', fontWeight: isStart || isEnd ? 700 : 500,
                        }}>
                          {day}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div style={{ padding: '10px 20px', borderTop: '1px solid var(--sand-dark)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {[
                    { color: 'var(--sky)', label: 'Hotel' },
                    { color: 'var(--sky-light)', label: 'Flight' },
                    { color: 'var(--sage)', label: 'Both' },
                  ].map(l => (
                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '3px', background: l.color }} />
                      <span style={{ fontSize: '0.68rem', fontWeight: 500, color: 'var(--ink-muted)' }}>{l.label}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '3px', background: 'var(--terra-bg)', border: '1.5px dashed var(--terra-light)' }} />
                    <span style={{ fontSize: '0.68rem', fontWeight: 500, color: 'var(--ink-muted)' }}>Gap</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Coming Up */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--sand-dark)', borderRadius: '20px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--sand-dark)' }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: 'var(--ink)' }}>Coming Up</p>
              </div>
              <div style={{ padding: '14px 18px' }}>
                {upcomingActivity ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '1.4rem' }}>{TYPE_ICONS[upcomingActivity.type] ?? '📌'}</span>
                      <div>
                        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: 'var(--ink)' }}>{upcomingActivity.title}</p>
                        {upcomingActivity.location && <p style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>📍 {upcomingActivity.location}</p>}
                      </div>
                    </div>
                    {upcomingActivity.start_time && (
                      <div style={{ background: 'var(--terra-bg)', borderRadius: '8px', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.75rem' }}>🕐</span>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--terracotta)' }}>
                          {formatDate(upcomingActivity.start_time)} · {formatTime(upcomingActivity.start_time)}
                        </p>
                      </div>
                    )}
                    {upcomingActivity.price && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginTop: '8px' }}>
                        💰 {new Intl.NumberFormat('en-US', { style: 'currency', currency: upcomingActivity.currency ?? 'USD' }).format(upcomingActivity.price)}
                      </p>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '12px 0' }}>
                    <p style={{ fontSize: '1.5rem', marginBottom: '6px' }}>🌴</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>No upcoming activities</p>
                  </div>
                )}
              </div>
            </div>

            {/* Budget Breakdown */}
            {trip.budget && (
              <div style={{ background: 'var(--card)', border: '1px solid var(--sand-dark)', borderRadius: '20px', overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--sand-dark)' }}>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: 'var(--ink)' }}>Budget Breakdown</p>
                </div>
                <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>Total budget</span>
                    <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: 'var(--ink)' }}>{formatBudget(trip.budget, trip.budget_currency)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>Spent</span>
                    <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: totalSpent > trip.budget ? 'var(--terracotta)' : 'var(--sage)' }}>{formatBudget(totalSpent, trip.budget_currency)}</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--sand-dark)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '99px', background: totalSpent > trip.budget ? 'var(--terracotta)' : 'var(--gold-light)', width: `${Math.min((totalSpent / trip.budget) * 100, 100)}%`, transition: 'width .6s ease' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--ink-muted)' }}>
                    <span>{Math.round((totalSpent / trip.budget) * 100)}% used</span>
                    <span>{formatBudget(trip.budget - totalSpent, trip.budget_currency)} left</span>
                  </div>

                  {Object.keys(budgetByType).length > 0 && (
                    <div style={{ borderTop: '1px solid var(--sand-dark)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {Object.entries(budgetByType).map(([type, amount]) => (
                        <div key={type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>{TYPE_ICONS[type]} {type}</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink)' }}>{formatBudget(amount, trip.budget_currency)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Invite Travel Buddy */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--sand-dark)', borderRadius: '20px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--sand-dark)' }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: 'var(--ink)' }}>Travel Buddy</p>
              </div>
              <div style={{ padding: '14px 18px' }}>
                <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginBottom: '12px', lineHeight: 1.5 }}>
                  {members.length === 0
                    ? 'Traveling solo. Invite someone to share this trip.'
                    : `${members.length + 1} traveler${members.length + 1 === 1 ? '' : 's'} on this trip.`}
                </p>
                <button
                  onClick={handleCopyInvite}
                  style={{
                    width: '100%',
                    fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.82rem',
                    background: copied ? 'var(--sage)' : 'var(--terracotta)',
                    color: 'var(--white)', border: 'none',
                    padding: '10px', borderRadius: '10px',
                    cursor: 'pointer', transition: 'all .2s',
                  }}
                >
                  {copied ? '✓ Link copied!' : '🔗 Copy invite link'}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}

function ActivityCard({ activity, tripId, showTime }: { activity: any, tripId: string, showTime?: boolean }) {
  const icon = TYPE_ICONS[activity.type] ?? '📌'
  const price = activity.price
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: activity.currency ?? 'USD' }).format(activity.price)
    : null

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--sand-dark)', borderRadius: '16px', padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <span style={{ fontSize: '1.4rem' }}>{icon}</span>
          <div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.92rem', color: 'var(--ink)', marginBottom: '2px' }}>{activity.title}</h3>
            {activity.location && <p style={{ color: 'var(--ink-muted)', fontSize: '0.78rem' }}>📍 {activity.location}</p>}
            {showTime && activity.start_time && (
              <p style={{ color: 'var(--ink-muted)', fontSize: '0.73rem', marginTop: '2px' }}>
                🕐 {new Date(activity.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
            {activity.notes && <p style={{ color: 'var(--ink-muted)', fontSize: '0.76rem', marginTop: '4px' }}>{activity.notes}</p>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginLeft: '8px' }}>
          {price && <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: 'var(--terracotta)' }}>{price}</span>}
          {activity.confirmation_code && (
            <span style={{ fontSize: '0.68rem', color: 'var(--ink-muted)', background: 'var(--sand-mid)', padding: '2px 7px', borderRadius: '999px' }}>
              #{activity.confirmation_code}
            </span>
          )}
          <Link href={`/share/${activity.id}`} target="_blank" style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', border: '1px solid var(--sand-dark)', borderRadius: '7px', padding: '3px 9px', textDecoration: 'none', fontWeight: 500 }}>
            Share
          </Link>
          <Link href={`/trips/${tripId}/activities/${activity.id}/edit`} style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', border: '1px solid var(--sand-dark)', borderRadius: '7px', padding: '3px 9px', textDecoration: 'none', fontWeight: 500 }}>
            Edit
          </Link>
        </div>
      </div>
    </div>
  )
}