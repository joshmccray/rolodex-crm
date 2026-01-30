import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AccountPage() {
  const { user, organization, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const userInitials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'U';

  return (
    <div style={styles.container}>
      {/* Profile Header */}
      <div style={styles.profileCard}>
        <div style={styles.avatar}>
          {userInitials}
        </div>
        <div style={styles.profileInfo}>
          <h2 style={styles.name}>
            {user?.firstName} {user?.lastName}
          </h2>
          <p style={styles.email}>{user?.email}</p>
          <div style={styles.roleBadge}>
            {user?.role === 'owner' ? 'Owner' : user?.role === 'admin' ? 'Admin' : 'Agent'}
          </div>
        </div>
      </div>

      {/* Organization Section */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Brokerage</h3>
        <div style={styles.card}>
          <div style={styles.cardRow}>
            <div style={styles.cardIcon}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div style={styles.cardContent}>
              <div style={styles.cardLabel}>Organization</div>
              <div style={styles.cardValue}>{organization?.name || 'Not set'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Section */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Settings</h3>
        <div style={styles.card}>
          <button style={styles.settingsRow}>
            <div style={styles.settingsIcon}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <span style={styles.settingsText}>Notification Preferences</span>
            <svg width="16" height="16" fill="none" stroke="#94a3b8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div style={styles.divider} />

          <button style={styles.settingsRow}>
            <div style={styles.settingsIcon}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span style={styles.settingsText}>Change Password</span>
            <svg width="16" height="16" fill="none" stroke="#94a3b8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {user?.role === 'owner' && (
            <>
              <div style={styles.divider} />
              <button style={styles.settingsRow}>
                <div style={styles.settingsIcon}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <span style={styles.settingsText}>API Keys (MLS, RentCast)</span>
                <svg width="16" height="16" fill="none" stroke="#94a3b8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <div style={styles.divider} />
              <button style={styles.settingsRow}>
                <div style={styles.settingsIcon}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <span style={styles.settingsText}>Team Members</span>
                <svg width="16" height="16" fill="none" stroke="#94a3b8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Logout Section */}
      <div style={styles.section}>
        <button
          onClick={() => setShowLogoutConfirm(true)}
          style={styles.logoutBtn}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>

      {/* App Info */}
      <div style={styles.appInfo}>
        <span>TwoStory CRM</span>
        <span style={styles.version}>Version 1.0.0</span>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <>
          <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)} />
          <div className="modal-content">
            <div className="modal-handle" />
            <div style={styles.modalBody}>
              <h3 style={styles.modalTitle}>Sign out?</h3>
              <p style={styles.modalText}>
                You'll need to sign in again to access your account.
              </p>
              <div style={styles.modalButtons}>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="btn btn-ghost"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="btn"
                  style={{ ...styles.confirmLogoutBtn, flex: 1 }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: 0,
  },
  profileCard: {
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    padding: 24,
    marginBottom: 24,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    borderRadius: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: 24,
    fontWeight: 600,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    color: 'white',
    fontSize: 20,
    fontWeight: 600,
    margin: '0 0 4px 0',
  },
  email: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    margin: '0 0 8px 0',
  },
  roleBadge: {
    display: 'inline-block',
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    fontSize: 12,
    fontWeight: 500,
    padding: '4px 10px',
    borderRadius: 6,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    margin: '0 0 12px 0',
  },
  card: {
    background: 'white',
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
  },
  cardRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: 16,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b',
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: 500,
    color: '#1e293b',
  },
  settingsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    width: '100%',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b',
  },
  settingsText: {
    flex: 1,
    fontSize: 15,
    color: '#1e293b',
  },
  divider: {
    height: 1,
    background: '#f1f5f9',
    marginLeft: 70,
  },
  logoutBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 12,
    color: '#dc2626',
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  appInfo: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    marginTop: 32,
    paddingBottom: 24,
  },
  version: {
    color: '#cbd5e1',
  },
  modalBody: {
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1e293b',
    margin: '0 0 8px 0',
  },
  modalText: {
    fontSize: 14,
    color: '#64748b',
    margin: '0 0 24px 0',
  },
  modalButtons: {
    display: 'flex',
    gap: 12,
  },
  confirmLogoutBtn: {
    background: '#dc2626',
    color: 'white',
  },
};
