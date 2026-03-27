'use client'

import { useState } from 'react'

const TYPE_ICONS = {
  flight: '✈️',
  hotel: '🏨',
  tour: '🗺️',
  restaurant: '🍽️',
  transport: '🚌',
  activity: '🎯',
  other: '📌',
}

function formatTime(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function formatDayHeader(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

function ActivityCard({ activity, tripId, showTime }) {
  const shareHref = '/share/' + activity.id
  const editHref = '/trips/' + tripId + '/activities/' + activity.id + '/edit'
  const icon = TYPE_ICONS[activity.type] || '📌'
  const price = activity.price
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: activity.currency }).format(activity.price)
    : null

  return (
    <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="font-semibold">{activity.title}</h3>
            {activity.location && (
              <p className="text-white/50 text-sm">📍 {activity.location}</p>
            )}
            {showTime && activity.start_time && (
              <p className="text-white/40 text-xs mt-1">{formatTime(activity.start_time)}</p>
            )}
            {activity.notes && (
              <p className="text-white/30 text-sm mt-1">{activity.notes}</p>
            )}
          </div>
        </div>
        <div className="flex items-start gap-2">
          {price && (
            <p className="text-sm font-semibold mr-1">{price}</p>
          )}
          <a
            href={shareHref}
            target="_blank"
            className="text-white/30 hover:text-white text-xs border border-white/10 rounded-lg px-2.5 py-1.5 transition"
          >
            Share
          </a>
          <a
            href={editHref}
            className="text-white/30 hover:text-white text-xs border border-white/10 rounded-lg px-2.5 py-1.5 transition"
          >
            Edit
          </a>
        </div>
      </div>
    </div>
  )
}

export default function TripTimeline({ activities, tripId }) {
  const [view, setView] = useState('list')

  const grouped = {}
  const noDate = []

  activities.forEach((activity) => {
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

  const listBtnClass = view === 'list'
    ? 'text-xs px-3 py-1.5 rounded-lg transition font-medium bg-white text-black'
    : 'text-xs px-3 py-1.5 rounded-lg transition font-medium text-white/40 hover:text-white'

  const timelineBtnClass = view === 'timeline'
    ? 'text-xs px-3 py-1.5 rounded-lg transition font-medium bg-white text-black'
    : 'text-xs px-3 py-1.5 rounded-lg transition font-medium text-white/40 hover:text-white'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">
          Activities
          {activities.length > 0 && (
            <span className="text-white/30 font-normal text-base ml-2">{activities.length}</span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          {activities.length > 0 && (
            <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
              <button onClick={() => setView('list')} className={listBtnClass}>
                List
              </button>
              <button onClick={() => setView('timeline')} className={timelineBtnClass}>
                Timeline
              </button>
            </div>
          )}
          <a
            href={extractHref}
            className="bg-white text-black text-sm font-semibold px-4 py-2 rounded-xl hover:bg-white/90 transition"
          >
            + Add activity
          </a>
        </div>
      </div>

      {activities.length === 0 && (
        <div className="border border-dashed border-white/10 rounded-2xl p-16 text-center">
          <p className="text-4xl mb-4">🗺️</p>
          <h3 className="text-lg font-semibold mb-2">No activities yet</h3>
          <p className="text-white/40 text-sm mb-6">
            Upload a confirmation screenshot to add your first activity.
          </p>
          <a
            href={extractHref}
            className="bg-white text-black text-sm font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition inline-block"
          >
            📸 Scan confirmation
          </a>
        </div>
      )}

      {view === 'list' && activities.length > 0 && (
        <div className="space-y-3">
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} tripId={tripId} />
          ))}
        </div>
      )}

      {view === 'timeline' && activities.length > 0 && (
        <div className="space-y-8">
          {sortedDays.map((day) => (
            <div key={day}>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-white/8" />
                <p className="text-white/40 text-xs font-medium uppercase tracking-wider whitespace-nowrap">
                  {formatDayHeader(day)}
                </p>
                <div className="h-px flex-1 bg-white/8" />
              </div>
              <div className="space-y-3">
                {grouped[day].map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} tripId={tripId} showTime />
                ))}
              </div>
            </div>
          ))}
          {noDate.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-white/8" />
                <p className="text-white/40 text-xs font-medium uppercase tracking-wider whitespace-nowrap">
                  No date set
                </p>
                <div className="h-px flex-1 bg-white/8" />
              </div>
              <div className="space-y-3">
                {noDate.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} tripId={tripId} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
