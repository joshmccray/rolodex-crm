import { useState } from 'react';

export default function LandingPage({ onEnterApp }) {
  const [email, setEmail] = useState('');

  const handleGetStarted = (e) => {
    e.preventDefault();
    onEnterApp();
  };

  return (
    <div style={styles.page}>
      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>TS</div>
            <span style={styles.logoText}>TwoStory</span>
          </div>
          <div style={styles.navLinks} className="landing-nav-links">
            <a href="#features" style={styles.navLink}>Features</a>
            <a href="#pricing" style={styles.navLink}>Pricing</a>
            <button onClick={onEnterApp} style={styles.navButton}>
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero} className="landing-hero">
        <div style={styles.heroContent} className="landing-hero-content">
          <div style={styles.badge}>Built for Real Estate Agents</div>
          <h1 style={styles.heroTitle} className="landing-hero-title">
            Never miss a chance to connect with your clients
          </h1>
          <p style={styles.heroSubtitle}>
            TwoStory monitors the market around your contacts' homes and drafts
            personalized messages when nearby sales happen. Stay top-of-mind without
            the busywork.
          </p>
          <form onSubmit={handleGetStarted} style={styles.heroForm} className="landing-hero-form">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={styles.heroInput}
            />
            <button type="submit" style={styles.heroButton}>
              Get Started Free
            </button>
          </form>
          <p style={styles.heroNote}>No credit card required. Free for up to 50 contacts.</p>
        </div>

        {/* Hero Image/Preview */}
        <div style={styles.heroPreview} className="landing-hero-preview">
          <div style={styles.phoneFrame}>
            <div style={styles.phoneNotch} />
            <div style={styles.phoneScreen}>
              {/* Mock app preview */}
              <div style={styles.mockHeader}>
                <div style={styles.mockTitle}>Suggested Actions</div>
                <div style={styles.mockBadge}>3</div>
              </div>
              <div style={styles.mockCard}>
                <div style={styles.mockCardHeader}>
                  <div style={styles.mockAvatar}>SM</div>
                  <div>
                    <div style={styles.mockName}>Sarah Mitchell</div>
                    <div style={styles.mockMeta}>Home sold nearby for $425K</div>
                  </div>
                </div>
                <div style={styles.mockMessage}>
                  "Hi Sarah! A home just sold near you on Oak Street for $425,000..."
                </div>
                <div style={styles.mockActions}>
                  <div style={styles.mockBtnGhost}>Edit</div>
                  <div style={styles.mockBtnPrimary}>Send</div>
                </div>
              </div>
              <div style={{ ...styles.mockCard, opacity: 0.6 }}>
                <div style={styles.mockCardHeader}>
                  <div style={styles.mockAvatar}>JD</div>
                  <div>
                    <div style={styles.mockName}>John Davis</div>
                    <div style={styles.mockMeta}>Annual check-in</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section style={styles.socialProof}>
        <p style={styles.socialProofText}>Trusted by agents at</p>
        <div style={styles.logos} className="landing-logos">
          <span style={styles.companyLogo}>Keller Williams</span>
          <span style={styles.companyLogo}>RE/MAX</span>
          <span style={styles.companyLogo}>Coldwell Banker</span>
          <span style={styles.companyLogo}>Century 21</span>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={styles.features}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle} className="landing-section-title">Everything you need to stay connected</h2>
          <p style={styles.sectionSubtitle}>
            Turn market activity into meaningful conversations with past clients
          </p>
        </div>

        <div style={styles.featureGrid} className="landing-feature-grid">
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 style={styles.featureTitle}>Market Monitoring</h3>
            <p style={styles.featureDesc}>
              Automatically track sales within 1 mile of every contact's home.
              Get notified instantly when something sells nearby.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 style={styles.featureTitle}>AI-Drafted Messages</h3>
            <p style={styles.featureDesc}>
              Every alert comes with a ready-to-send message personalized to your
              client and the specific sale. Just review and send.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 style={styles.featureTitle}>Property Valuations</h3>
            <p style={styles.featureDesc}>
              Track estimated values for your contacts' homes using the same data
              appraisers use. Share updates that matter.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 style={styles.featureTitle}>Team Workspaces</h3>
            <p style={styles.featureDesc}>
              Set up your brokerage with shared MLS access. Each agent gets their
              own contacts while sharing the data connection.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={styles.howItWorks}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>How it works</h2>
          <p style={styles.sectionSubtitle}>
            Get started in minutes, not hours
          </p>
        </div>

        <div style={styles.steps} className="landing-steps">
          <div style={styles.step}>
            <div style={styles.stepNumber}>1</div>
            <h3 style={styles.stepTitle}>Import your contacts</h3>
            <p style={styles.stepDesc}>
              Add past clients with their home addresses. Import from a spreadsheet
              or add them one by one.
            </p>
          </div>
          <div style={styles.stepConnector} className="landing-step-connector" />
          <div style={styles.step}>
            <div style={styles.stepNumber}>2</div>
            <h3 style={styles.stepTitle}>We monitor the market</h3>
            <p style={styles.stepDesc}>
              TwoStory watches for sales near each contact using MLS data. You'll
              get notified when something relevant happens.
            </p>
          </div>
          <div style={styles.stepConnector} className="landing-step-connector" />
          <div style={styles.step}>
            <div style={styles.stepNumber}>3</div>
            <h3 style={styles.stepTitle}>Review and send</h3>
            <p style={styles.stepDesc}>
              Each alert includes a draft message. Edit if you want, then send via
              text or email with one tap.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={styles.pricing}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Simple, transparent pricing</h2>
          <p style={styles.sectionSubtitle}>
            Start free, upgrade when you're ready
          </p>
        </div>

        <div style={styles.pricingGrid} className="landing-pricing-grid">
          <div style={styles.pricingCard}>
            <div style={styles.pricingHeader}>
              <h3 style={styles.pricingTier}>Starter</h3>
              <div style={styles.pricingPrice}>
                <span style={styles.pricingAmount}>$0</span>
                <span style={styles.pricingPeriod}>/month</span>
              </div>
            </div>
            <ul style={styles.pricingFeatures}>
              <li style={styles.pricingFeature}>
                <CheckIcon /> Up to 50 contacts
              </li>
              <li style={styles.pricingFeature}>
                <CheckIcon /> Market alerts
              </li>
              <li style={styles.pricingFeature}>
                <CheckIcon /> AI message drafts
              </li>
              <li style={styles.pricingFeature}>
                <CheckIcon /> Email support
              </li>
            </ul>
            <button onClick={onEnterApp} style={styles.pricingButtonOutline}>
              Get Started
            </button>
          </div>

          <div style={{ ...styles.pricingCard, ...styles.pricingCardFeatured }}>
            <div style={styles.pricingPopular}>Most Popular</div>
            <div style={styles.pricingHeader}>
              <h3 style={styles.pricingTier}>Pro</h3>
              <div style={styles.pricingPrice}>
                <span style={styles.pricingAmount}>$29</span>
                <span style={styles.pricingPeriod}>/month</span>
              </div>
            </div>
            <ul style={styles.pricingFeatures}>
              <li style={styles.pricingFeature}>
                <CheckIcon /> Unlimited contacts
              </li>
              <li style={styles.pricingFeature}>
                <CheckIcon /> Property valuations
              </li>
              <li style={styles.pricingFeature}>
                <CheckIcon /> Custom alert radius
              </li>
              <li style={styles.pricingFeature}>
                <CheckIcon /> Priority support
              </li>
              <li style={styles.pricingFeature}>
                <CheckIcon /> Export reports
              </li>
            </ul>
            <button onClick={onEnterApp} style={styles.pricingButtonPrimary}>
              Start Free Trial
            </button>
          </div>

          <div style={styles.pricingCard}>
            <div style={styles.pricingHeader}>
              <h3 style={styles.pricingTier}>Team</h3>
              <div style={styles.pricingPrice}>
                <span style={styles.pricingAmount}>$79</span>
                <span style={styles.pricingPeriod}>/month</span>
              </div>
            </div>
            <ul style={styles.pricingFeatures}>
              <li style={styles.pricingFeature}>
                <CheckIcon /> Everything in Pro
              </li>
              <li style={styles.pricingFeature}>
                <CheckIcon /> Up to 10 agents
              </li>
              <li style={styles.pricingFeature}>
                <CheckIcon /> Shared MLS connection
              </li>
              <li style={styles.pricingFeature}>
                <CheckIcon /> Admin dashboard
              </li>
              <li style={styles.pricingFeature}>
                <CheckIcon /> API access
              </li>
            </ul>
            <button onClick={onEnterApp} style={styles.pricingButtonOutline}>
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Ready to stay connected?</h2>
        <p style={styles.ctaSubtitle}>
          Join hundreds of agents who never miss a touchpoint opportunity.
        </p>
        <button onClick={onEnterApp} style={styles.ctaButton}>
          Get Started Free
        </button>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerInner} className="landing-footer-inner">
          <div style={styles.footerBrand}>
            <div style={styles.logo}>
              <div style={styles.logoIcon}>TS</div>
              <span style={styles.logoText}>TwoStory</span>
            </div>
            <p style={styles.footerTagline}>
              Market intelligence for real estate relationships.
            </p>
          </div>
          <div style={styles.footerLinks} className="landing-footer-links">
            <div style={styles.footerColumn}>
              <h4 style={styles.footerHeading}>Product</h4>
              <a href="#features" style={styles.footerLink}>Features</a>
              <a href="#pricing" style={styles.footerLink}>Pricing</a>
              <a href="#" style={styles.footerLink}>Integrations</a>
            </div>
            <div style={styles.footerColumn}>
              <h4 style={styles.footerHeading}>Company</h4>
              <a href="#" style={styles.footerLink}>About</a>
              <a href="#" style={styles.footerLink}>Blog</a>
              <a href="#" style={styles.footerLink}>Careers</a>
            </div>
            <div style={styles.footerColumn}>
              <h4 style={styles.footerHeading}>Support</h4>
              <a href="#" style={styles.footerLink}>Help Center</a>
              <a href="#" style={styles.footerLink}>Contact</a>
              <a href="#" style={styles.footerLink}>Privacy</a>
            </div>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p style={styles.footerCopyright}>
            © 2025 TwoStory. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="#10b981" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#ffffff',
  },

  // Navigation
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid #f1f5f9',
    zIndex: 100,
  },
  navInner: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 36,
    height: 36,
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontFamily: "'DM Serif Display', serif",
    fontSize: 18,
  },
  logoText: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 22,
    color: '#1e293b',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: 32,
  },
  navLink: {
    color: '#64748b',
    textDecoration: 'none',
    fontSize: 15,
    fontWeight: 500,
  },
  navButton: {
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },

  // Hero
  hero: {
    paddingTop: 120,
    paddingBottom: 80,
    maxWidth: 1200,
    margin: '0 auto',
    padding: '120px 24px 80px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 64,
    alignItems: 'center',
  },
  heroContent: {
    maxWidth: 560,
  },
  badge: {
    display: 'inline-block',
    background: '#eff6ff',
    color: '#3b82f6',
    padding: '6px 14px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 24,
  },
  heroTitle: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 52,
    lineHeight: 1.1,
    color: '#1e293b',
    margin: '0 0 24px 0',
  },
  heroSubtitle: {
    fontSize: 18,
    lineHeight: 1.6,
    color: '#64748b',
    margin: '0 0 32px 0',
  },
  heroForm: {
    display: 'flex',
    gap: 12,
    marginBottom: 16,
  },
  heroInput: {
    flex: 1,
    padding: '14px 18px',
    border: '1.5px solid #e2e8f0',
    borderRadius: 10,
    fontSize: 16,
    fontFamily: 'inherit',
  },
  heroButton: {
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    color: 'white',
    border: 'none',
    padding: '14px 28px',
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
  },
  heroNote: {
    fontSize: 13,
    color: '#94a3b8',
    margin: 0,
  },
  heroPreview: {
    display: 'flex',
    justifyContent: 'center',
  },
  phoneFrame: {
    width: 300,
    height: 600,
    background: '#1e293b',
    borderRadius: 40,
    padding: 12,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  phoneNotch: {
    width: 120,
    height: 28,
    background: '#1e293b',
    borderRadius: 20,
    margin: '0 auto 12px',
  },
  phoneScreen: {
    background: '#f8fafc',
    borderRadius: 28,
    height: 'calc(100% - 40px)',
    padding: 16,
    overflow: 'hidden',
  },
  mockHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  mockTitle: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 20,
    color: '#1e293b',
  },
  mockBadge: {
    background: '#ef4444',
    color: 'white',
    fontSize: 11,
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 10,
  },
  mockCard: {
    background: 'white',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    border: '1px solid #e2e8f0',
    borderLeft: '3px solid #f59e0b',
  },
  mockCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  mockAvatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 600,
  },
  mockName: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1e293b',
  },
  mockMeta: {
    fontSize: 11,
    color: '#94a3b8',
  },
  mockMessage: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 1.5,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  mockActions: {
    display: 'flex',
    gap: 8,
  },
  mockBtnGhost: {
    flex: 1,
    padding: '8px',
    background: '#f1f5f9',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    color: '#64748b',
    textAlign: 'center',
  },
  mockBtnPrimary: {
    flex: 1,
    padding: '8px',
    background: '#10b981',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    color: 'white',
    textAlign: 'center',
  },

  // Social Proof
  socialProof: {
    background: '#f8fafc',
    padding: '40px 24px',
    textAlign: 'center',
  },
  socialProofText: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 20,
  },
  logos: {
    display: 'flex',
    justifyContent: 'center',
    gap: 48,
    flexWrap: 'wrap',
  },
  companyLogo: {
    fontSize: 18,
    fontWeight: 600,
    color: '#cbd5e1',
  },

  // Features
  features: {
    padding: '100px 24px',
    maxWidth: 1200,
    margin: '0 auto',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: 64,
  },
  sectionTitle: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 40,
    color: '#1e293b',
    margin: '0 0 16px 0',
  },
  sectionSubtitle: {
    fontSize: 18,
    color: '#64748b',
    margin: 0,
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 32,
  },
  featureCard: {
    background: '#f8fafc',
    borderRadius: 16,
    padding: 32,
  },
  featureIcon: {
    width: 56,
    height: 56,
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: '#1e293b',
    margin: '0 0 12px 0',
  },
  featureDesc: {
    fontSize: 15,
    lineHeight: 1.6,
    color: '#64748b',
    margin: 0,
  },

  // How It Works
  howItWorks: {
    background: '#1e293b',
    padding: '100px 24px',
  },
  steps: {
    maxWidth: 900,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 0,
  },
  step: {
    flex: 1,
    textAlign: 'center',
  },
  stepNumber: {
    width: 48,
    height: 48,
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: 20,
    fontWeight: 700,
    margin: '0 auto 20px',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: 'white',
    margin: '0 0 12px 0',
  },
  stepDesc: {
    fontSize: 14,
    lineHeight: 1.6,
    color: '#94a3b8',
    margin: 0,
    padding: '0 16px',
  },
  stepConnector: {
    width: 100,
    height: 2,
    background: '#334155',
    marginTop: 24,
  },

  // Pricing
  pricing: {
    padding: '100px 24px',
    maxWidth: 1200,
    margin: '0 auto',
  },
  pricingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 24,
    maxWidth: 1000,
    margin: '0 auto',
  },
  pricingCard: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: 16,
    padding: 32,
    position: 'relative',
  },
  pricingCardFeatured: {
    border: '2px solid #3b82f6',
    boxShadow: '0 10px 40px rgba(59, 130, 246, 0.15)',
  },
  pricingPopular: {
    position: 'absolute',
    top: -12,
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    color: 'white',
    padding: '6px 16px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
  },
  pricingHeader: {
    textAlign: 'center',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottom: '1px solid #f1f5f9',
  },
  pricingTier: {
    fontSize: 18,
    fontWeight: 600,
    color: '#64748b',
    margin: '0 0 8px 0',
  },
  pricingPrice: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 4,
  },
  pricingAmount: {
    fontSize: 48,
    fontWeight: 700,
    color: '#1e293b',
  },
  pricingPeriod: {
    fontSize: 16,
    color: '#94a3b8',
  },
  pricingFeatures: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 32px 0',
  },
  pricingFeature: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 0',
    fontSize: 15,
    color: '#475569',
  },
  pricingButtonPrimary: {
    width: '100%',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    color: 'white',
    border: 'none',
    padding: '14px 24px',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  pricingButtonOutline: {
    width: '100%',
    background: 'white',
    color: '#3b82f6',
    border: '2px solid #3b82f6',
    padding: '12px 24px',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },

  // CTA
  cta: {
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    padding: '80px 24px',
    textAlign: 'center',
  },
  ctaTitle: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 36,
    color: 'white',
    margin: '0 0 16px 0',
  },
  ctaSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    margin: '0 0 32px 0',
  },
  ctaButton: {
    background: 'white',
    color: '#3b82f6',
    border: 'none',
    padding: '16px 32px',
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },

  // Footer
  footer: {
    background: '#1e293b',
    padding: '64px 24px 32px',
  },
  footerInner: {
    maxWidth: 1200,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '2fr 3fr',
    gap: 64,
    paddingBottom: 48,
    borderBottom: '1px solid #334155',
  },
  footerBrand: {},
  footerTagline: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 1.6,
    marginTop: 16,
  },
  footerLinks: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 32,
  },
  footerColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  footerHeading: {
    fontSize: 14,
    fontWeight: 600,
    color: 'white',
    margin: '0 0 8px 0',
  },
  footerLink: {
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: 14,
  },
  footerBottom: {
    maxWidth: 1200,
    margin: '0 auto',
    paddingTop: 32,
  },
  footerCopyright: {
    color: '#64748b',
    fontSize: 13,
    margin: 0,
  },
};
