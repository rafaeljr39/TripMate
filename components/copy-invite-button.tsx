'use client'

import { useState } from 'react'

export default function CopyInviteButton({ inviteUrl }: { inviteUrl: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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