export default function PrivacyPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--sand)', position: 'relative', zIndex: 1 }}>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 32px',
        background: 'rgba(245,239,224,0.93)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--sand-dark)',
      }}>
        <a href="/" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.35rem', color: 'var(--terracotta)', letterSpacing: '-0.03em', textDecoration: 'none' }}>
          Adrift
        </a>
        <a href="/" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.82rem', background: 'var(--ink)', color: 'var(--sand)', padding: '7px 16px', borderRadius: '999px', textDecoration: 'none' }}>
          ← Back
        </a>
      </nav>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--terra-bg)', border: '1px solid var(--terracotta)', borderRadius: '999px', padding: '4px 12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--terracotta)', fontFamily: 'Syne, sans-serif' }}>Legal</span>
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '2.2rem', letterSpacing: '-0.04em', color: 'var(--ink)', marginBottom: '8px' }}>Privacy Policy</h1>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem' }}>Last updated: March 28, 2026</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', color: 'var(--ink-soft)', lineHeight: 1.8, fontSize: '0.95rem' }}>

          <section>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '12px' }}>1. Who we are</h2>
            <p>Adrift ("we", "our", "us") is a travel planning application available at adrift-app.com. We help travelers organize bookings, itineraries, and trip details in one place. If you have questions about this policy, contact us at <a href="mailto:hello@adrift-app.com" style={{ color: 'var(--terracotta)' }}>hello@adrift-app.com</a>.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '12px' }}>2. What data we collect</h2>
            <p style={{ marginBottom: '12px' }}>We collect only what's necessary to provide the service:</p>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>Account information:</strong> Your name and email address from Google when you sign in.</li>
              <li><strong>Trip data:</strong> Trip names, destinations, dates, budgets, and notes you enter.</li>
              <li><strong>Booking data:</strong> Activity details, confirmation codes, and prices you add manually or via screenshot scanning.</li>
              <li><strong>Screenshots:</strong> Images you upload for AI extraction are processed immediately and not stored on our servers.</li>
              <li><strong>Usage data:</strong> Basic analytics to understand how the app is used (page views, feature usage). No personally identifiable information is included.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '12px' }}>3. How we use your data</h2>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>To provide and maintain the Adrift service</li>
              <li>To authenticate you securely via Google OAuth</li>
              <li>To process booking screenshots using AI (Anthropic Claude)</li>
              <li>To send you service-related communications if necessary</li>
              <li>We do <strong>not</strong> sell your data to third parties</li>
              <li>We do <strong>not</strong> use your data for advertising</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '12px' }}>4. Third-party services</h2>
            <p style={{ marginBottom: '12px' }}>We use the following trusted third-party services:</p>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>Supabase:</strong> Database and authentication. Data is stored securely with row-level security enabled.</li>
              <li><strong>Google OAuth:</strong> Sign-in only. We do not access your Google account beyond your name and email.</li>
              <li><strong>Anthropic Claude:</strong> AI processing of booking screenshots. Images are sent for extraction and not retained.</li>
              <li><strong>Vercel:</strong> Hosting and deployment.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '12px' }}>5. Data sharing</h2>
            <p>Your trip data is private by default. You control what you share:</p>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
              <li><strong>Activity share links:</strong> When you share an activity link, anyone with that link can view that activity's details.</li>
              <li><strong>Trip invites:</strong> When you invite someone to a trip, they can view your trip details after accepting.</li>
              <li>We never share your data with third parties for commercial purposes.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '12px' }}>6. Your rights (GDPR & CCPA)</h2>
            <p style={{ marginBottom: '12px' }}>Depending on where you live, you have the right to:</p>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update inaccurate data</li>
              <li><strong>Deletion:</strong> Delete your account and all associated data</li>
              <li><strong>Portability:</strong> Export your data in a readable format</li>
              <li><strong>Objection:</strong> Object to certain types of processing</li>
            </ul>
            <p style={{ marginTop: '12px' }}>To exercise any of these rights, email us at <a href="mailto:hello@adrift-app.com" style={{ color: 'var(--terracotta)' }}>hello@adrift-app.com</a> or use the delete account option in your dashboard settings.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '12px' }}>7. Data retention</h2>
            <p>We retain your data for as long as your account is active. When you delete your account, all your data is permanently deleted within 30 days. Screenshots uploaded for AI processing are not stored after extraction.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '12px' }}>8. Cookies</h2>
            <p>We use essential cookies only — specifically, a session cookie to keep you logged in. We do not use tracking or advertising cookies. By using Adrift, you consent to this essential cookie usage.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '12px' }}>9. Children's privacy</h2>
            <p>Adrift is not directed at children under 13. We do not knowingly collect data from children. If you believe a child has provided us with personal information, contact us and we will delete it.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '12px' }}>10. Changes to this policy</h2>
            <p>We may update this policy occasionally. We'll notify you of significant changes by updating the date at the top of this page. Continued use of Adrift after changes constitutes acceptance.</p>
          </section>

          <section style={{ background: 'var(--card)', border: '1px solid var(--sand-dark)', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '8px' }}>Contact us</h2>
            <p>Questions about this privacy policy? We're happy to help.</p>
            <a href="mailto:hello@adrift-app.com" style={{ display: 'inline-block', marginTop: '12px', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.85rem', background: 'var(--terracotta)', color: 'var(--white)', padding: '10px 20px', borderRadius: '999px', textDecoration: 'none' }}>
              hello@adrift-app.com
            </a>
          </section>

        </div>
      </div>
    </main>
  )
}