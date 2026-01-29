export default function BottomNav({ activeTab, onTabChange, actionCount, marketAlertCount }) {
  return (
    <div className="bottom-nav">
      {/* Brand - only visible on desktop via CSS */}
      <div className="nav-brand">
        <span className="nav-brand-icon">TS</span>
        <span className="nav-brand-text">TwoStory</span>
      </div>

      <button
        className={`nav-item ${activeTab === 'actions' ? 'active' : ''}`}
        onClick={() => onTabChange('actions')}
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Actions
        {actionCount > 0 && <span className="nav-badge">{actionCount}</span>}
      </button>
      <button
        className={`nav-item ${activeTab === 'market' ? 'active' : ''}`}
        onClick={() => onTabChange('market')}
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Market
        {marketAlertCount > 0 && <span className="nav-badge">{marketAlertCount}</span>}
      </button>
      <button
        className={`nav-item ${activeTab === 'contacts' || activeTab === 'contact-detail' ? 'active' : ''}`}
        onClick={() => onTabChange('contacts')}
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Contacts
      </button>
    </div>
  );
}
