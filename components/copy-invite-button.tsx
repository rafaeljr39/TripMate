'use client'

import { useState } from 'react'

export default function CopyInviteButton({ inviteUrl, compact, memberCount }: { inviteUrl: string, compact?: boolean, memberCount?: number }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (compact) {
    return (
      <div style={{
        background: 'rgba(196,85,42,0.06)',
        border: '1px solid rgba(196,85,42,0.2)',
        borderRadius: '14px',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '0.85rem', color: 'var(--ink)', margin: 0 }}>
              {memberCount ? `${memberCount + 1} travelers` : 'Traveling solo'}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', margin: 0 }}>
              Invite friends to join this trip
            </p>
          </div>
        </div>
        <button
          onClick={handleCopy}
          style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 700,
            fontSize: '0.8rem',
            background: copied ? 'var(--sage)' : 'var(--terracotta)',
            color: 'var(--white)',
            border: 'none',
            padding: '8px 18px',
            borderRadius: '999px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
          }}
        >
          {copied ? '✓ Link copied!' : '+ Invite friends'}
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleCopy}
      style={{
        fontFamily: 'Syne, sans-serif',
        fontWeight: 700,
        fontSize: '0.85rem',
        background: copied ? 'var(--sage)' : 'var(--terracotta)',
        color: 'var(--white)',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {copied ? '✓ Link copied!' : '🔗 Copy invite link'}
    </button>
  )
}