export default function TermsPage() {
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
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '2.2rem', letterSpacing: '-0.04em', color: 'var(--ink)', marginBottom: '8px' }}>Terms of Service</h1>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem' }}>Last updated: March 28, 2026</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', color: 'var(--ink-soft)', lineHeight: 1.8, fontSize: '0.95rem' }}>

          <section>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '12px' }}>1. Acceptance of terms</h2>
            <p>By accessing or using Adrift ("the Service") at adrift-app.com, you agree to be bound by these Terms of Service. If you don't agree, please don't use the Service. We may update these terms occasionally — continued use means you accept the changes.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '12px' }}>2. What Adrift is</h2>
            <p>Adrift is a personal travel planning tool. It helps you organize bookings, itineraries, and trip details. Adrift is <strong>not</strong> a travel agency, booking platform, or insurance provider. We do not make bookings on your behalf or guarantee the accuracy of information extracted from your documents.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '12px' }}>3. Your account</h2>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>You must be 13 or older to use Adrift.</li>
              <li>You are responsible for maintaining the security of your account.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
              <li>You must provide accurate information when creating your account.</li>
              <li>One person may not maintain multiple free accounts.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '12px' }}>4. Acceptable use</h2>
            <p style={{ marginBottom: '12px' }}>You agree not to:</p>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Use the Service for any unlawful purpose</li>
              <li>Upload malicious files or attempt to compromise the Service</li>
              <li>Attempt to access other users' data</li>
              <li>Scrape or systematically extract data from the Service</li>
              <li>Resell or commercially exploit the Service without permission</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '12px' }}>5. Your content</h2>
            <p>You own all content you upload to Adrift (trip data, booking details, screenshots). By using the Service, you grant us a limited license to store and process your content solely to provide the Service. We do not claim ownership of your data and will never use it for advertising or sell it to third parties.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '12px' }}>6. AI extraction disclaimer</h2>
            <p>Our AI-powered booking extraction feature uses Anthropic Claude to read and interpret confirmation documents. While we strive for accuracy, <strong>extracted information may contain errors</strong>. Always verify critical booking details (dates, confirmation codes, prices) directly with your booking provider. Adrift is not liable for any losses arising from inaccurate AI extraction.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '12px' }}>7. Shared content</h2>
            <p>When you share an activity link or invite someone to your trip, that content becomes accessible to the people you share it with. You are responsible for what you choose to share. Do not share sensitive personal or financial information via public share links.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '12px' }}>8. Service availability</h2>
            <p>We aim to keep Adrift available at all times but cannot guarantee uninterrupted access. We may modify, suspend, or discontinue the Service at any time. We are not liable for any loss or inconvenience caused by Service interruptions.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '12px' }}>9. Limitation of liability</h2>
            <p>Adrift is provided "as is" without warranties of any kind. To the maximum extent permitted by law, we are not liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including but not limited to missed flights, incorrect bookings, or data loss.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '12px' }}>10. Termination</h2>
            <p>You may delete your account at any time from your dashboard settings. We may suspend or terminate accounts that violate these terms. Upon termination, your data will be deleted within 30 days.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '12px' }}>11. Governing law</h2>
            <p>These terms are governed by the laws of the State of California, United States. Any disputes will be resolved in the courts of Los Angeles County, California.</p>
          </section>

          <section style={{ background: 'var(--card)', border: '1px solid var(--sand-dark)', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '8px' }}>Questions?</h2>
            <p>If you have questions about these terms, contact us.</p>
            <a href="mailto:adriftapplegal@gmail.com" style={{ display: 'inline-block', marginTop: '12px', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.85rem', background: 'var(--terracotta)', color: 'var(--white)', padding: '10px 20px', borderRadius: '999px', textDecoration: 'none' }}>
              adriftapplegal@gmail.com
            </a>
          </section>

        </div>
      </div>
    </main>
  )
}