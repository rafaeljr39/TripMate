'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function HomePage() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function signInWithGoogle() {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--sand)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>

      {/* Background texture */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E")`
      }} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '480px' }}>

        {/* Logo */}
        <div style={{ marginBottom: '48px' }}>
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '2rem', color: 'var(--terracotta)', letterSpacing: '-0.03em', marginBottom: '8px' }}>
            Adrift          </p>
          <p style={{ color: 'var(--ink-muted)', fontSize: '1.1rem', lineHeight: 1.5 }}>
            Your personal travel planner.<br />Every booking, every detail, one place.
          </p>
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '48px' }}>
          {['📸 Scan confirmations', '📅 Gap alerts', '🔗 Share activities', '👥 Invite friends'].map(f => (
            <span key={f} style={{
              background: 'var(--card)', border: '1px solid var(--sand-dark)',
              borderRadius: '999px', padding: '6px 14px', fontSize: '0.82rem',
              color: 'var(--ink-soft)', fontWeight: 500
            }}>{f}</span>
          ))}
        </div>

        {/* Sign in button */}
        <button
          onClick={signInWithGoogle}
          disabled={loading}
          style={{
            width: '100%', background: 'var(--ink)', color: 'var(--sand)',
            fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem',
            padding: '16px 32px', borderRadius: '16px', border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
            transition: 'all 0.2s',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? 'Redirecting...' : 'Continue with Google'}
        </button>

        <p style={{ color: 'var(--ink-muted)', fontSize: '0.75rem', marginTop: '16px' }}>
  Free to use · No credit card required
</p>
<p style={{ color: 'var(--ink-muted)', fontSize: '0.72rem', marginTop: '12px', opacity: 0.6 }}>
  <a href="/privacy" style={{ color: 'var(--ink-muted)', textDecoration: 'underline' }}>Privacy Policy</a>
  {' · '}
  <a href="/terms" style={{ color: 'var(--ink-muted)', textDecoration: 'underline' }}>Terms of Service</a>
</p>
      </div>
    </main>
  )
}