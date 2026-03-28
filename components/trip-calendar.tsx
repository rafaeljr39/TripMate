'use client'

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

function formatMonthYear(year, month) {
  return new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function isBetween(dateStr, startStr, endStr) {
  if (!dateStr || !startStr || !endStr) return false
  const d = new Date(dateStr)
  const s = new Date(startStr)
  const e = new Date(endStr)
  return d >= s && d <= e
}

function isSameDay(dateStr, targetStr) {
  if (!dateStr || !targetStr) return false
  return dateStr.slice(0, 10) === targetStr.slice(0, 10)
}

function toDateStr(year, month, day) {
  return year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0')
}

export default function TripCalendar({ activities, trip }) {
  if (!trip.start_date || !trip.end_date) return null

  const tripStart = new Date(trip.start_date)
  const tripEnd = new Date(trip.end_date)

  const hotels = activities.filter(a => a.type === 'hotel' && a.start_time && a.end_time)
  const flights = activities.filter(a => a.type === 'flight' && a.start_time)

  const startMonth = tripStart.getMonth()
  const startYear = tripStart.getFullYear()
  const endMonth = tripEnd.getMonth()
  const endYear = tripEnd.getFullYear()

  const months = []
  let m = startMonth
  let y = startYear
  while (y < endYear || (y === endYear && m <= endMonth)) {
    months.push({ year: y, month: m })
    m++
    if (m > 11) { m = 0; y++ }
  }

  const gapDays = []
  const current = new Date(trip.start_date)
  const end = new Date(trip.end_date)
  while (current <= end) {
    const dateStr = current.toISOString().slice(0, 10)
    const hasHotel = hotels.some(h => isBetween(dateStr, h.start_time, h.end_time))
    const hasFlight = flights.some(f => isSameDay(f.start_time, dateStr))
    if (!hasHotel && !hasFlight) {
      gapDays.push(dateStr)
    }
    current.setDate(current.getDate() + 1)
  }

  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  return (
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.3rem', color: 'var(--ink)', marginBottom: '16px' }}>
        Trip Calendar
      </h2>

      {gapDays.length > 0 && (
        <div style={{ background: 'rgba(196,85,42,0.07)', border: '1px solid rgba(196,85,42,0.22)', borderRadius: '11px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '16px' }}>
          <span style={{ fontSize: '1rem' }}>⚠️</span>
          <p style={{ fontSize: '0.82rem', color: 'var(--terracotta)', fontWeight: 500 }}>
            <strong>{gapDays.length} night{gapDays.length === 1 ? '' : 's'} without accommodation</strong> — you may need to book a hotel for some dates.
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: months.length === 1 ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
        {months.map(({ year, month }) => {
          const daysInMonth = getDaysInMonth(year, month)
          const firstDay = getFirstDayOfMonth(year, month)
          const cells = []

          for (let i = 0; i < firstDay; i++) {
            cells.push(null)
          }
          for (let d = 1; d <= daysInMonth; d++) {
            cells.push(d)
          }

          return (
            <div key={year + '-' + month} style={{ background: 'var(--card)', border: '1px solid var(--sand-dark)', borderRadius: '20px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--sand-dark)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--ink)' }}>{formatMonthYear(year, month)}</p>
              </div>
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', marginBottom: '6px' }}>
                  {weekdays.map(w => (
                    <div key={w} style={{ textAlign: 'center', fontSize: '0.62rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-muted)', opacity: 0.6, padding: '3px 0' }}>{w}</div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                  {cells.map((day, i) => {
                    if (!day) return <div key={'empty-' + i} />

                    const dateStr = toDateStr(year, month, day)
                    const inTrip = dateStr >= trip.start_date && dateStr <= trip.end_date
                    const hasHotel = hotels.some(h => isBetween(dateStr, h.start_time, h.end_time))
                    const hasFlight = flights.some(f => isSameDay(f.start_time, dateStr))
                    const isGap = inTrip && !hasHotel && !hasFlight
                    const isStart = dateStr === trip.start_date
                    const isEnd = dateStr === trip.end_date

                    let bg = 'transparent'
                    let color = 'var(--ink)'
                    let border = 'none'
                    let opacity = inTrip ? 1 : 0.3

                    if (hasHotel && hasFlight) { bg = 'var(--sage)'; color = 'white' }
                    else if (hasHotel) { bg = 'var(--sky)'; color = 'white' }
                    else if (hasFlight) { bg = 'var(--sky-light)'; color = 'white' }
                    else if (isGap) { border = '1.5px dashed var(--terra-light)'; color = 'var(--terracotta)'; bg = 'var(--terra-bg)' }
                    else if (isStart || isEnd) { bg = 'var(--ink)'; color = 'var(--sand)' }

                    return (
                      <div key={dateStr} style={{ aspectRatio: '1', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, color, border, opacity, fontSize: '0.82rem', fontWeight: isStart || isEnd ? 700 : 500, cursor: 'default' }}>
                        {day}
                      </div>
                    )
                  })}
                </div>
              </div>
              <div style={{ padding: '10px 16px', borderTop: '1px solid var(--sand-dark)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '3px', background: 'var(--sky)' }} />
                  <span style={{ fontSize: '0.68rem', fontWeight: 500, color: 'var(--ink-muted)' }}>Hotel</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '3px', background: 'var(--sky-light)' }} />
                  <span style={{ fontSize: '0.68rem', fontWeight: 500, color: 'var(--ink-muted)' }}>Flight</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '3px', background: 'var(--sage)' }} />
                  <span style={{ fontSize: '0.68rem', fontWeight: 500, color: 'var(--ink-muted)' }}>Both</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '3px', background: 'var(--terra-bg)', border: '1.5px dashed var(--terra-light)' }} />
                  <span style={{ fontSize: '0.68rem', fontWeight: 500, color: 'var(--ink-muted)' }}>Gap</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}