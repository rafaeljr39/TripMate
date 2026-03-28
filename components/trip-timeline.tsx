'use client'

import { useState } from 'react'

const TYPE_ICONS: Record<string, string> = {
  flight: '✈️', hotel: '🏨', tour: '🗺️',
  restaurant: '🍽️', transport: '🚌', activity: '🎯', other: '📌',
}

function formatTime(dateStr: string) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function formatDayHeader(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function ActivityCard({ activity, tripId, showTime }: { activity: any, tripId: any, showTime?: boolean }) {
  const shareHref = '/share/' + activity.id
  const editHref = '/trips/' + tripId + '/activities/' + activity.id + '/edit'
  const icon = TYPE_ICONS[activity.type] || '📌'
  const price = activity.price
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: activity.currency }).format(activity.price)
    : null

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--sand-dark)', borderRadius: '16px', padding: '18px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <span style={{ fontSize: '1.5rem' }}>{icon}</span>
          <div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: 'var(--ink)', marginBottom: '3px' }}>{activity.title}</h3>
            {activity.location && <p style={{ color: 'var(--ink-muted)', fontSize: '0.8rem' }}>📍 {activity.location}</p>}
            {showTime && activity.start_time && <p style={{ color: 'var(--ink-muted)', fontSize: '0.75rem', marginTop: '3px' }}>{formatTime(activity.start_time)}</p>}
            {activity.notes && <p style={{ color: 'var(--ink-muted)', fontSize: '0.78rem', marginTop: '6px' }}>{activity.notes}</p>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {price && <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: 'var(--terracotta)' }}>{price}</span>}
          {activity.confirmation_code && <span style={{ fontSize: '0.7rem', color: 'var(--ink-muted)', background: 'var(--sand-mid)', padding: '3px 8px', borderRadius: '999px' }}>#{activity.confirmation_code}</span>}
          <a href={shareHref} target="_blank" style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', border: '1px solid var(--sand-dark)', borderRadius: '8px', padding: '4px 10px', textDecoration: 'none', fontWeight: 500 }}>Share</a>
          <a href={editHref} style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', border: '1px solid var(--sand-dark)', borderRadius: '8px', padding: '4px 10px', textDecoration: 'none', fontWeight: 500 }}>Edit</a>
        </div>
      </div>
    </div>
  )
}

export default function TripTimeline({ activities, tripId }: { activities: any[], tripId: any }) {
  const [view, setView] = useState('list')

  const grouped: Record<string, any[]> = {}
  const noDate: any[] = []

  activities.forEach((activity: any) => {
    if (activity.start_time) {
      const day = activity.start_time.split('T')[0]
      if (!grouped[day]) grouped[day] = []
      grouped[day].push(activity)
    } else {
      noDate.push(activity)
    }
  })

  const sortedDays = Object.keys(grouped).sort()
  const extractHref = '/trips/' + tripId + '/activities/extract'

  const tabBase = { fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '0.78rem', padding: '5px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }
  const activeTab = { ...tabBase, background: 'var(--white)', color: 'var(--ink)' }
  const inactiveTab = { ...tabBase, background: 'transparent', color: 'var(--ink-soft)' }
  const addBtnStyle = { fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.82rem', background: 'var(--terracotta)', color: 'var(--white)', padding: '7px 16px', borderRadius: '999px', textDecoration: 'none' }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.3rem', color: 'var(--ink)' }}>
          Activities{activities.length > 0 && <span style={{ fontWeight: 400, fontSize: '1rem', color: 'var(--ink-muted)', marginLeft: '8px' }}>{activities.length}</span>}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {activities.length > 0 && (
            <div style={{ display: 'flex', background: 'var(--sand-dark)', borderRadius: '10px', padding: '3px', gap: '2px' }}>
              <button onClick={() => setView('list')} style={view === 'list' ? activeTab : inactiveTab}>List</button>
              <button onClick={() => setView('timeline')} style={view === 'timeline' ? activeTab : inactiveTab}>Timeline</button>
            </div>
          )}
          <a href={extractHref} style={addBtnStyle}>+ Add activity</a>
        </div>
      </div>

      {activities.length === 0 && (
        <div style={{ border: '2px dashed var(--sand-dark)', borderRadius: '16px', padding: '48px 32px', textAlign: 'center' }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🗺️</p>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '8px' }}>No activities yet</h3>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>Upload a confirmation screenshot to add your first activity.</p>
          <a href={extractHref} style={addBtnStyle}>📸 Scan confirmation</a>
        </div>
      )}

      {view === 'list' && activities.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {activities.map((activity: any) => <ActivityCard key={activity.id} activity={activity} tripId={tripId} />)}
        </div>
      )}

      {view === 'timeline' && activities.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {sortedDays.map((day) => (
            <div key={day}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <div style={{ height: '1px', flex: 1, background: 'var(--sand-dark)' }} />
                <p style={{ color: 'var(--ink-muted)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{formatDayHeader(day)}</p>
                <div style={{ height: '1px', flex: 1, background: 'var(--sand-dark)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {grouped[day].map((activity: any) => <ActivityCard key={activity.id} activity={activity} tripId={tripId} showTime />)}
              </div>
            </div>
          ))}
          {noDate.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <div style={{ height: '1px', flex: 1, background: 'var(--sand-dark)' }} />
                <p style={{ color: 'var(--ink-muted)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>No date set</p>
                <div style={{ height: '1px', flex: 1, background: 'var(--sand-dark)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {noDate.map((activity: any) => <ActivityCard key={activity.id} activity={activity} tripId={tripId} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}