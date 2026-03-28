'use client'

import { useState } from 'react'
import Link from 'next/link'

const TYPE_ICONS: Record<string, string> = {
  flight: '✈️', hotel: '🏨', tour: '🗺️',
  restaurant: '🍽️', transport: '🚌', activity: '🎯', other: '📌',
}

const TYPE_COLORS: Record<string, string> = {
  flight: 'var(--sky)',
  hotel: 'var(--sage)',
  tour: 'var(--gold)',
  restaurant: 'var(--terracotta)',
  transport: 'var(--gold)',
  activity: 'var(--gold)',
  other: 'var(--ink-muted)',
}

const TYPE_BG: Record<string, string> = {
  flight: 'var(--sky-bg)',
  hotel: 'var(--sage-bg)',
  tour: 'var(--gold-bg)',
  restaurant: 'var(--terra-bg)',
  transport: 'var(--gold-bg)',
  activity: 'var(--gold-bg)',
  other: 'rgba(26,23,20,0.05)',
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatBudget(amount: number | null, currency: string) {
  if (!amount) return null
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

function formatDayHeader(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function formatDayLabel(dateStr: string) {
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
  const [activeTab, setActiveTab] = useState<'calendar' | 'bookings'>('calendar')
  const [bookingsView, setBookingsView] = useState<'list' | 'timeline'>('list')
  const [copied, setCopied] = useState(false)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const tripStartDate = trip.start_date ? new Date(trip.start_date) : new Date()
  const [calMonth, setCalMonth] = useState(tripStartDate.getMonth())
  const [calYear, setCalYear] = useState(tripStartDate.getFullYear())

  const hotels = activities.filter(a => a.type === 'hotel' && a.start_time && a.end_time)
  const flights = activities.filter(a => a.type === 'flight' && a.start_time)

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

  const now = new Date()
  const upcomingActivities = activities
    .filter(a => a.start_time && new Date(a.start_time) >= now)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 3)

  const budgetByType: Record<string, number> = {}
  activities.forEach(a => {
    if (a.price) budgetByType[a.type] = (budgetByType[a.type] ?? 0) + a.price
  })
  const confirmedCount = activities.filter(a => a.confirmation_code).length

  const selectedDayActivities = selectedDay
    ? activities.filter(a => a.start_time && a.start_time.slice(0, 10) === selectedDay)
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    : []
  const selectedDayTotal = selectedDayActivities.reduce((sum, a) => sum + (a.price ?? 0), 0)

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
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const daysInMonth = getDaysInMonth(calYear, calMonth)
  const firstDay = getFirstDayOfMonth(calYear, calMonth)
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const grouped: Record<string, any[]> = {}
  const noDate: any[] = []
  activities.forEach(a => {
    if (a.start_time) {
      const day = a.start_time.split('T')[0]
      if (!grouped[day]) grouped[day] = []
      grouped[day].push(a)
    } else noDate.push(a)
  })
  const sortedDays = Object.keys(grouped).sort()
  const extractHref = `/trips/${tripId}/activities/extract`

  return (
    <main style={{ minHeight: '100vh', background: 'var(--sand)', position: 'relative' }}>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px',
        background: 'rgba(245,239,224,0.93)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--sand-dark)',
      }}>
        <Link href="/dashboard" style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', textDecoration: 'none', fontWeight: 500, flexShrink: 0 }}>← Back</Link>
        <div className="nav-dest-pill">
          📍 {trip.destination}{trip.start_date && ` · ${new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
        </div>
        <Link href={`/trips/${tripId}/edit`} style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', textDecoration: 'none', fontWeight: 500, flexShrink: 0 }}>Edit</Link>
      </nav>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto' }} className="page-pad">

        {/* Trip title */}
        <div style={{ marginBottom: '20px' }}>
          <h1 className="trip-title-h1">{trip.name}</h1>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem' }}>
            📍 {trip.destination}
            {trip.start_date && trip.end_date && <span style={{ marginLeft: '10px' }}>{formatDate(trip.start_date)} → {formatDate(trip.end_date)}</span>}
          </p>
        </div>

        {/* STAT BAR */}
        <div className="stat-bar-grid" style={{ marginBottom: '22px' }}>
          <div style={{ background: 'var(--ink)', color: 'var(--sand)', borderRadius: '13px', padding: '13px 16px', flex: '1.6' }}>
            <p style={{ fontSize: '0.62rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.55, marginBottom: '4px' }}>My Trip Budget</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.04em', lineHeight: 1 }}>
              {trip.budget ? formatBudget(trip.budget, trip.budget_currency) : '—'}
            </p>
            {trip.budget && (
              <>
                <div style={{ height: '4px', background: 'rgba(245,239,224,0.2)', borderRadius: '99px', overflow: 'hidden', marginTop: '8px' }}>
                  <div style={{ height: '100%', borderRadius: '99px', background: 'linear-gradient(90deg, var(--gold-light), var(--terra-light))', width: `${Math.min((totalSpent / trip.budget) * 100, 100)}%` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', marginTop: '4px', opacity: 0.55 }}>
                  <span>{formatBudget(totalSpent, trip.budget_currency)} booked</span>
                  <span>{formatBudget(trip.budget - totalSpent, trip.budget_currency)} left</span>
                </div>
              </>
            )}
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--sand-dark)', borderRadius: '13px', padding: '13px 16px', flex: 1 }}>
            <p style={{ fontSize: '0.62rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-muted)', marginBottom: '4px' }}>Bookings</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--ink)' }}>{activities.length}</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--ink-muted)', marginTop: '3px' }}>{confirmedCount} confirmed</p>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--sand-dark)', borderRadius: '13px', padding: '13px 16px', flex: 1 }}>
            <p style={{ fontSize: '0.62rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-muted)', marginBottom: '4px' }}>Activities</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--ink)' }}>
              {activities.filter(a => !['flight', 'hotel', 'transport'].includes(a.type)).length}
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--ink-muted)', marginTop: '3px' }}>{days ?? '—'} days</p>
          </div>
          <div style={{
            background: gapDays.length > 0 ? 'var(--terra-bg)' : 'var(--card)',
            border: gapDays.length > 0 ? '1px solid rgba(196,85,42,0.28)' : '1px solid var(--sand-dark)',
            borderRadius: '13px', padding: '13px 16px', flex: 1
          }}>
            <p style={{ fontSize: '0.62rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: gapDays.length > 0 ? 'var(--terracotta)' : 'var(--ink-muted)', marginBottom: '4px' }}>
              {gapDays.length > 0 ? '⚠ Gaps' : 'Gaps'}
            </p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.04em', lineHeight: 1, color: gapDays.length > 0 ? 'var(--terracotta)' : 'var(--ink)' }}>
              {gapDays.length}
            </p>
            <p style={{ fontSize: '0.7rem', color: gapDays.length > 0 ? 'var(--terracotta)' : 'var(--ink-muted)', marginTop: '3px' }}>nights</p>
          </div>
        </div>

        {/* Tabs row */}
        <div className="tabs-action-row">
          <div style={{ display: 'flex', gap: '3px', background: 'var(--sand-dark)', borderRadius: '11px', padding: '3px' }}>
            {(['calendar', 'bookings'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '0.82rem',
                padding: '7px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'all .2s',
                background: activeTab === tab ? 'var(--white)' : 'transparent',
                color: activeTab === tab ? 'var(--ink)' : 'var(--ink-soft)',
                boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
              }}>
                {tab === 'calendar' ? '📅 Calendar' : '📋 Bookings'}
              </button>
            ))}
          </div>
          <Link href={extractHref} style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.82rem',
            background: 'var(--terracotta)', color: 'var(--white)',
            padding: '7px 16px', borderRadius: '999px', textDecoration: 'none',
          }}>
            + Add Booking
          </Link>
        </div>

        {/* Two-column layout */}
        <div className="two-col">

          {/* LEFT */}
          <div>
            {/* CALENDAR TAB */}
            {activeTab === 'calendar' && (
              <div style={{ background: 'var(--card)', border: '1px solid var(--sand-dark)', borderRadius: '20px', overflow: 'hidden' }}>
                <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--sand-dark)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: 'var(--ink)' }}>{monthName}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={prevMonth} style={{ width: '26px', height: '26px', borderRadius: '7px', border: '1px solid var(--sand-dark)', background: 'var(--white)', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--ink-soft)' }}>‹</button>
                    <button onClick={nextMonth} style={{ width: '26px', height: '26px', borderRadius: '7px', border: '1px solid var(--sand-dark)', background: 'var(--white)', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--ink-soft)' }}>›</button>
                  </div>
                </div>

                <div style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', marginBottom: '6px' }}>
                    {weekdays.map(w => (
                      <div key={w} style={{ textAlign: 'center', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-muted)', opacity: 0.6, padding: '3px 0' }}>{w}</div>
                    ))}
                  </div>
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
                      const isSelected = selectedDay === dateStr
                      const dayActivities = activities.filter(a => a.start_time?.slice(0, 10) === dateStr)

                      let bg = 'transparent', color = 'var(--ink)', border = 'none'
                      const opacity = inTrip ? 1 : 0.3

                      if (isSelected) { bg = 'var(--terracotta)'; color = 'white'; border = 'none' }
                      else if (hasHotel && hasFlight) { bg = 'var(--sage)'; color = 'white' }
                      else if (hasHotel) { bg = 'var(--sage)'; color = 'white' }
                      else if (hasFlight) { bg = 'var(--sky)'; color = 'white' }
                      else if (isGap) { border = '1.5px dashed var(--terra-light)'; color = 'var(--terracotta)'; bg = 'rgba(196,85,42,0.07)' }
                      else if (isStart || isEnd) { bg = 'var(--ink)'; color = 'var(--sand)' }

                      return (
                        <div
                          key={dateStr}
                          onClick={() => inTrip && setSelectedDay(selectedDay === dateStr ? null : dateStr)}
                          style={{
                            aspectRatio: '1', borderRadius: '9px',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            background: bg, color, border, opacity,
                            fontSize: '0.82rem', fontWeight: isStart || isEnd || isSelected ? 700 : 500,
                            cursor: inTrip ? 'pointer' : 'default',
                            transition: 'all .15s', position: 'relative',
                          }}
                        >
                          {day}
                          {dayActivities.length > 0 && !isSelected && (
                            <div style={{
                              position: 'absolute', bottom: '4px',
                              width: '5px', height: '5px', borderRadius: '50%',
                              background: (hasHotel || hasFlight) ? 'rgba(255,255,255,0.75)' : 'var(--gold)',
                              boxShadow: (hasHotel || hasFlight) ? 'none' : '0 0 0 1.5px rgba(201,146,42,0.3)',
                            }} />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div style={{ padding: '10px 20px', borderTop: '1px solid var(--sand-dark)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '3px', background: 'var(--sky)' }} />
                    <span style={{ fontSize: '0.68rem', fontWeight: 500, color: 'var(--ink-muted)' }}>Flight</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '3px', background: 'var(--sage)' }} />
                    <span style={{ fontSize: '0.68rem', fontWeight: 500, color: 'var(--ink-muted)' }}>Hotel</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '3px', background: 'rgba(196,85,42,0.2)', border: '1.5px dashed var(--terracotta)' }} />
                    <span style={{ fontSize: '0.68rem', fontWeight: 500, color: 'var(--ink-muted)' }}>No accommodation</span>
                  </div>
                </div>

                {/* Gap alert */}
                {gapDays.length > 0 && (
                  <div style={{ margin: '0 22px 22px', background: 'var(--terra-bg)', border: '1px solid rgba(196,85,42,0.22)', borderRadius: '11px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '9px' }}>
                    <span>⚠️</span>
                    <p style={{ fontSize: '0.8rem', color: 'var(--terracotta)' }}>
                      <strong>No accommodation booked</strong> for {gapDays.length} night{gapDays.length === 1 ? '' : 's'}.
                    </p>
                  </div>
                )}

                {/* DAY DETAIL DRAWER */}
                {selectedDay && (
                  <div style={{ margin: '0 22px 22px', background: 'var(--white)', border: '1px solid var(--sand-dark)', borderRadius: '16px', overflow: 'hidden' }}>
                    <div style={{ padding: '14px 18px', background: 'var(--ink)', color: 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1rem' }}>
                          📍 {formatDayLabel(selectedDay)}
                        </p>
                        <p style={{ fontSize: '0.74rem', opacity: 0.55, marginTop: '2px' }}>
                          {trip.destination} · {selectedDayActivities.length} {selectedDayActivities.length === 1 ? 'activity' : 'activities'}
                        </p>
                      </div>
                      <button onClick={() => setSelectedDay(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'var(--sand)', width: '28px', height: '28px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>

                    {selectedDayActivities.length > 0 ? (
                      <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '0' }}>
                        {selectedDayActivities.map((a, idx) => (
                          <div key={a.id} style={{ display: 'flex', gap: '12px', position: 'relative', paddingBottom: idx < selectedDayActivities.length - 1 ? '14px' : '0' }}>
                            {idx < selectedDayActivities.length - 1 && (
                              <div style={{ position: 'absolute', left: '17px', top: '34px', bottom: 0, width: '2px', background: 'var(--sand-dark)' }} />
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                              <p style={{ fontSize: '0.62rem', fontWeight: 600, opacity: 0.5, marginBottom: '3px', whiteSpace: 'nowrap' }}>
                                {a.start_time ? new Date(a.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
                              </p>
                              <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: TYPE_BG[a.type] ?? 'rgba(26,23,20,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', position: 'relative', zIndex: 1 }}>
                                {TYPE_ICONS[a.type] ?? '📌'}
                              </div>
                            </div>
                            <div style={{ flex: 1, background: 'var(--sand)', border: '1px solid var(--sand-dark)', borderRadius: '11px', padding: '10px 13px' }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                                <div style={{ flex: 1 }}>
                                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: 'var(--ink)' }}>
                                    {a.title}
        
                                  </p>
                                  {a.location && <p style={{ fontSize: '0.72rem', opacity: 0.6, marginTop: '2px' }}>{a.location}</p>}
                                  {a.notes && <p style={{ fontSize: '0.72rem', opacity: 0.6, marginTop: '2px' }}>{a.notes}</p>}
                                </div>
                                {a.price && (
                                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: 'var(--terracotta)', flexShrink: 0 }}>
                                    {formatBudget(a.price, a.currency ?? 'USD')}
                                  </p>
                                )}
                              </div>
                              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Link href={`/share/${a.id}`} target="_blank" style={{ fontSize: '0.65rem', fontWeight: 600, padding: '3px 9px', borderRadius: '6px', border: '1px solid var(--sand-dark)', background: 'var(--white)', textDecoration: 'none', color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  🔗 Share
                                </Link>
                                <Link href={`/trips/${tripId}/activities/${a.id}/edit`} style={{ fontSize: '0.65rem', fontWeight: 600, padding: '3px 9px', borderRadius: '6px', border: '1px solid var(--sand-dark)', background: 'var(--white)', textDecoration: 'none', color: 'var(--ink-muted)' }}>
                                  Edit
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: '14px 18px' }}>
                        <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', textAlign: 'center', padding: '8px 0' }}>No activities on this day yet</p>
                      </div>
                    )}

                    <Link href={extractHref} style={{ display: 'flex', alignItems: 'center', gap: '7px', margin: '0 18px 14px', padding: '9px 13px', border: '1.5px dashed var(--sand-dark)', borderRadius: '10px', fontSize: '0.77rem', color: 'var(--ink-muted)', textDecoration: 'none', background: 'transparent' }}>
                      + Add activity to this day
                    </Link>

                    {selectedDayTotal > 0 && (
                      <div style={{ margin: '0 18px 16px', padding: '11px 15px', background: 'var(--ink)', color: 'var(--sand)', borderRadius: '11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.74rem', opacity: 0.55 }}>Day total</span>
                        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.05rem' }}>
                          {formatBudget(selectedDayTotal, trip.budget_currency ?? 'USD')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* BOOKINGS TAB */}
            {activeTab === 'bookings' && (
              <div style={{ background: 'var(--card)', border: '1px solid var(--sand-dark)', borderRadius: '20px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--sand-dark)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: 'var(--ink)' }}>All Bookings</p>
                  <div style={{ display: 'flex', gap: '3px', background: 'var(--sand-dark)', borderRadius: '9px', padding: '3px' }}>
                    {(['list', 'timeline'] as const).map(v => (
                      <button key={v} onClick={() => setBookingsView(v)} style={{
                        fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '0.75rem',
                        padding: '5px 14px', borderRadius: '7px', border: 'none', cursor: 'pointer', transition: 'all .2s',
                        background: bookingsView === v ? 'var(--white)' : 'transparent',
                        color: bookingsView === v ? 'var(--ink)' : 'var(--ink-soft)',
                      }}>
                        {v === 'list' ? 'List' : 'Timeline'}
                      </button>
                    ))}
                  </div>
                </div>

                {activities.length === 0 ? (
                  <div style={{ padding: '48px 32px', textAlign: 'center' }}>
                    <p style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🗺️</p>
                    <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '8px' }}>No bookings yet</h3>
                    <p style={{ color: 'var(--ink-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>Scan a confirmation to add your first booking.</p>
                    <Link href={extractHref} style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.85rem', background: 'var(--terracotta)', color: 'var(--white)', padding: '10px 22px', borderRadius: '999px', textDecoration: 'none' }}>
                      📸 Scan confirmation
                    </Link>
                  </div>
                ) : bookingsView === 'list' ? (
                  <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {activities.map(a => <ActivityCard key={a.id} activity={a} tripId={tripId} />)}
                  </div>
                ) : (
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
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

          {/* RIGHT SIDEBAR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Coming Up */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--sand-dark)', borderRadius: '18px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid var(--sand-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.92rem', color: 'var(--ink)' }}>Coming Up</p>
                <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--terracotta)', cursor: 'pointer' }}>View all</span>
              </div>
              <div style={{ padding: '10px 18px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {upcomingActivities.length > 0 ? upcomingActivities.map(a => {
                  const d = new Date(a.start_time)
                  const mon = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
                  const dayNum = d.getDate()
                  return (
                    <div key={a.id} style={{ display: 'flex', gap: '9px', alignItems: 'flex-start', padding: '9px 11px', borderRadius: '10px', background: 'var(--white)', border: '1px solid var(--sand-dark)' }}>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '0.7rem', background: 'var(--terracotta)', color: '#fff', borderRadius: '7px', padding: '3px 7px', textAlign: 'center', flexShrink: 0, lineHeight: 1.3 }}>
                        {mon}<br />{dayNum}
                      </div>
                      <div style={{ fontSize: '0.77rem' }}>
                        <p style={{ fontWeight: 600, color: 'var(--ink)' }}>{TYPE_ICONS[a.type]} {a.title}</p>
                        <p style={{ opacity: 0.5, fontSize: '0.7rem', marginTop: '1px' }}>
                          {a.location ?? d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                }) : (
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <p style={{ fontSize: '1.4rem', marginBottom: '4px' }}>🌴</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>No upcoming activities</p>
                  </div>
                )}
              </div>
            </div>

            {/* Budget Breakdown */}
            {trip.budget && (
              <div style={{ background: 'var(--card)', border: '1px solid var(--sand-dark)', borderRadius: '18px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid var(--sand-dark)' }}>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.92rem', color: 'var(--ink)' }}>Budget Breakdown</p>
                </div>
                <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.entries(budgetByType).length === 0 ? (
                    <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', textAlign: 'center', padding: '8px 0' }}>No spending tracked yet</p>
                  ) : Object.entries(budgetByType).map(([type, amount]) => {
                    const pct = trip.budget ? Math.min((amount / trip.budget) * 100, 100) : 0
                    const color = TYPE_COLORS[type] ?? 'var(--ink-muted)'
                    return (
                      <div key={type}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--ink-muted)' }}>{TYPE_ICONS[type]} {type}</span>
                          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--ink)' }}>{formatBudget(amount, trip.budget_currency)}</span>
                        </div>
                        <div style={{ height: '4px', background: 'var(--sand-dark)', borderRadius: '99px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: '99px', background: color, width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Invite Travel Buddy */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--sand-dark)', borderRadius: '18px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 18px', textAlign: 'center' }}>
                <p style={{ fontSize: '1.8rem', marginBottom: '6px' }}>👋</p>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: 'var(--ink)', marginBottom: '4px' }}>
                  Traveling with someone?
                </p>
                <p style={{ fontSize: '0.74rem', color: 'var(--ink-muted)', marginBottom: '12px', lineHeight: 1.4, opacity: 0.7 }}>
                  Invite a travel buddy to share bookings, split costs, and coordinate plans together.
                </p>
                <button onClick={handleCopyInvite} style={{
                  width: '100%', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.78rem',
                  background: copied ? 'var(--terra-bg)' : 'transparent',
                  color: 'var(--terracotta)',
                  border: copied ? '1.5px solid var(--terracotta)' : '1.5px dashed var(--terracotta)',
                  borderRadius: '10px', padding: '9px 16px', cursor: 'pointer', transition: 'all .2s',
                }}>
                  {copied ? '✓ Copied!' : '+ Invite a Travel Buddy'}
                </button>
              </div>
            </div>

            {/* Add Booking CTA */}
            <Link href={extractHref} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
              background: 'var(--terracotta)', color: 'var(--white)',
              borderRadius: '13px', padding: '13px',
              fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.88rem',
              textDecoration: 'none',
            }}>
              + Add Booking
            </Link>
          </div>
        </div>
      </div>

      <style>{`@keyframes slideDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </main>
  )
}

function ActivityCard({ activity, tripId, showTime }: { activity: any, tripId: string, showTime?: boolean }) {
  const icon = TYPE_ICONS[activity.type] ?? '📌'
  const iconBg = TYPE_BG[activity.type] ?? 'rgba(26,23,20,0.05)'
  const price = activity.price
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: activity.currency ?? 'USD' }).format(activity.price)
    : null

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--white)', border: '1px solid var(--sand-dark)', borderRadius: '12px', padding: '12px 14px', transition: 'transform .15s' }}>
      <div style={{ width: '38px', height: '38px', borderRadius: '9px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '0.86rem', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {activity.title}
        </p>
        <p style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', opacity: 0.6, marginTop: '2px' }}>
          {activity.location ?? ''}
          {showTime && activity.start_time && ` · ${new Date(activity.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
        </p>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
        {price && <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.92rem', color: 'var(--ink)' }}>{price}</p>}
        <Link href={`/share/${activity.id}`} target="_blank" style={{ fontSize: '0.68rem', color: 'var(--ink-muted)', border: '1px solid var(--sand-dark)', borderRadius: '6px', padding: '3px 8px', textDecoration: 'none', fontWeight: 600 }}>Share</Link>
        <Link href={`/trips/${tripId}/activities/${activity.id}/edit`} style={{ fontSize: '0.68rem', color: 'var(--ink-muted)', border: '1px solid var(--sand-dark)', borderRadius: '6px', padding: '3px 8px', textDecoration: 'none', fontWeight: 600 }}>Edit</Link>
      </div>
    </div>
  )
}