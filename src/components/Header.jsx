export default function Header({ activeTab, actionCount, selectedContact, onBack }) {
  if (activeTab === 'contact-detail' && selectedContact) {
    return (
      <div className="header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button className="back-btn" onClick={onBack}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Contacts
          </button>
          <a href={`tel:${selectedContact.phone}`} style={{ 
            background: '#10b981', 
            color: 'white', 
            padding: '8px 16px', 
            borderRadius: 8, 
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="header">
      <h1 style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: 24,
        fontWeight: 400,
        color: '#1e293b',
        margin: 0,
      }}>
        {activeTab === 'actions' ? 'Suggested Actions' : 'Contacts'}
        {activeTab === 'actions' && actionCount > 0 && (
          <span style={{
            background: '#ef4444',
            color: 'white',
            fontSize: 12,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 10,
            marginLeft: 10,
            verticalAlign: 'middle',
          }}>{actionCount}</span>
        )}
      </h1>
      <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>
        {activeTab === 'actions' 
          ? 'AI-drafted messages ready to send'
          : 'All contacts'
        }
      </p>
    </div>
  );
}
