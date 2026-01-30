import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ onNavigateToRegister }) {
  const { login, error, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Please enter both email and password');
      return;
    }

    try {
      await login(email, password);
    } catch (err) {
      setLocalError(err.message || 'Login failed');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Logo */}
        <div style={styles.logoContainer}>
          <div style={styles.logo}>TS</div>
          <h1 style={styles.title}>TwoStory</h1>
          <p style={styles.subtitle}>Real estate CRM for agents</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="message-input"
              style={styles.input}
              autoComplete="email"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="message-input"
              style={styles.input}
              autoComplete="current-password"
            />
          </div>

          {(localError || error) && (
            <div style={styles.error}>
              {localError || error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Register Link */}
        <div style={styles.footer}>
          <span style={styles.footerText}>Don't have an account?</span>
          <button
            onClick={onNavigateToRegister}
            style={styles.linkBtn}
          >
            Create one
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
    maxWidth: 400,
    background: 'white',
    borderRadius: 20,
    padding: 32,
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
  },
  logoContainer: {
    textAlign: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 64,
    height: 64,
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    borderRadius: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontFamily: "'DM Serif Display', serif",
    fontSize: 28,
    margin: '0 auto 16px',
  },
  title: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 28,
    color: '#1e293b',
    margin: '0 0 8px 0',
  },
  subtitle: {
    color: '#64748b',
    fontSize: 14,
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: 500,
    color: '#374151',
  },
  input: {
    fontSize: 16,
  },
  error: {
    background: '#fef2f2',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: 10,
    fontSize: 14,
  },
  submitBtn: {
    width: '100%',
    padding: '14px 20px',
    fontSize: 16,
    marginTop: 8,
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
