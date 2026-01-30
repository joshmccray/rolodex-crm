import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage({ onNavigateToLogin }) {
  const { register, error, loading } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
  });
  const [localError, setLocalError] = useState('');

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setLocalError('');
  };

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setLocalError('Please fill in all fields');
      return;
    }
    if (!formData.email.includes('@')) {
      setLocalError('Please enter a valid email');
      return;
    }
    setStep(2);
  };

  const handleStep2 = async (e) => {
    e.preventDefault();

    if (!formData.password || !formData.confirmPassword) {
      setLocalError('Please enter and confirm your password');
      return;
    }
    if (formData.password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    if (!formData.organizationName) {
      setLocalError('Please enter your brokerage name');
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        organizationName: formData.organizationName,
      });
    } catch (err) {
      setLocalError(err.message || 'Registration failed');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Logo */}
        <div style={styles.logoContainer}>
          <div style={styles.logo}>TS</div>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>
            {step === 1 ? 'Step 1 of 2: Your info' : 'Step 2 of 2: Security & brokerage'}
          </p>
        </div>

        {/* Step indicator */}
        <div style={styles.stepIndicator}>
          <div style={{ ...styles.stepDot, background: '#3b82f6' }} />
          <div style={{ ...styles.stepLine, background: step === 2 ? '#3b82f6' : '#e2e8f0' }} />
          <div style={{ ...styles.stepDot, background: step === 2 ? '#3b82f6' : '#e2e8f0' }} />
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <form onSubmit={handleStep1} style={styles.form}>
            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  placeholder="John"
                  className="message-input"
                  style={styles.input}
                  autoComplete="given-name"
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  placeholder="Smith"
                  className="message-input"
                  style={styles.input}
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="you@example.com"
                className="message-input"
                style={styles.input}
                autoComplete="email"
              />
            </div>

            {localError && (
              <div style={styles.error}>{localError}</div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={styles.submitBtn}
            >
              Continue
            </button>
          </form>
        )}

        {/* Step 2: Password & Organization */}
        {step === 2 && (
          <form onSubmit={handleStep2} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
                placeholder="At least 8 characters"
                className="message-input"
                style={styles.input}
                autoComplete="new-password"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                placeholder="Confirm your password"
                className="message-input"
                style={styles.input}
                autoComplete="new-password"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Brokerage Name</label>
              <input
                type="text"
                value={formData.organizationName}
                onChange={(e) => updateField('organizationName', e.target.value)}
                placeholder="e.g., Keller Williams Downtown"
                className="message-input"
                style={styles.input}
                autoComplete="organization"
              />
              <span style={styles.hint}>This creates your team workspace</span>
            </div>

            {(localError || error) && (
              <div style={styles.error}>{localError || error}</div>
            )}

            <div style={styles.buttonRow}>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn btn-ghost"
                style={styles.backBtn}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={styles.submitBtn}
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        {/* Login Link */}
        <div style={styles.footer}>
          <span style={styles.footerText}>Already have an account?</span>
          <button
            onClick={onNavigateToLogin}
            style={styles.linkBtn}
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
  },
  content: {
    width: '100%',
    maxWidth: 440,
    background: 'white',
    borderRadius: 20,
    padding: 32,
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
  },
  logoContainer: {
    textAlign: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 56,
    height: 56,
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontFamily: "'DM Serif Display', serif",
    fontSize: 24,
    margin: '0 auto 16px',
  },
  title: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 24,
    color: '#1e293b',
    margin: '0 0 8px 0',
  },
  subtitle: {
    color: '#64748b',
    fontSize: 14,
    margin: 0,
  },
  stepIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
    marginBottom: 28,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    transition: 'background 0.2s ease',
  },
  stepLine: {
    width: 60,
    height: 2,
    transition: 'background 0.2s ease',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  row: {
    display: 'flex',
    gap: 12,
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: 500,
    color: '#374151',
  },
  input: {
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  error: {
    background: '#fef2f2',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: 10,
    fontSize: 14,
  },
  buttonRow: {
    display: 'flex',
    gap: 12,
    marginTop: 8,
  },
  backBtn: {
    flex: '0 0 auto',
    padding: '14px 20px',
  },
  submitBtn: {
    flex: 1,
    padding: '14px 20px',
    fontSize: 16,
  },
  footer: {
    marginTop: 24,
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
  },
  linkBtn: {
    background: 'none',
    border: 'none',
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    padding: 0,
    fontFamily: 'inherit',
  },
};
