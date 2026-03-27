'use client'

import { useState } from 'react'

export default function CopyInviteButton({ inviteUrl, compact }: { inviteUrl: string, compact?: boolean }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (compact) {
    return (
      <button
        onClick={handleCopy}
        className="text-sm text-white/40 hover:text-white transition border border-white/10 rounded-full px-3 py-1"
      >
        {copied ? '✅ Copied!' : '+ Invite'}
      </button>
    )
  }

  return (
    <button
      onClick={handleCopy}
      className="text-sm font-semibold px-4 py-2 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition"
    >
      {copied ? '✅ Copied!' : '🔗 Copy invite link'}
    </button>
  )
}