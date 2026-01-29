export default function SaleCard({ sale, contactName, onShare }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDistance = (miles) => {
    if (miles < 0.1) return '< 0.1 mi';
    return `${miles.toFixed(1)} mi`;
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      border: '1px solid #e2e8f0',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>
            {sale.address}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#10b981',
            }}>
              {formatPrice(sale.price)}
            </span>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>•</span>
            <span style={{ fontSize: 12, color: '#64748b' }}>
              {formatDistance(sale.distance)} away
            </span>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>•</span>
            <span style={{ fontSize: 12, color: '#64748b' }}>
              {formatDate(sale.soldDate)}
            </span>
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div style={{
        display: 'flex',
        gap: 12,
        marginBottom: 12,
        padding: '8px 0',
        borderTop: '1px solid #f1f5f9',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#64748b' }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          {sale.beds} bd
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#64748b' }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
          {sale.baths} ba
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#64748b' }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          {sale.sqft.toLocaleString()} sqft
        </div>
      </div>

      {/* Share Button */}
      <button
        onClick={() => onShare(sale)}
        style={{
          width: '100%',
          padding: '10px 16px',
          background: '#f1f5f9',
          border: 'none',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 500,
          color: '#3b82f6',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          transition: 'all 0.2s ease',
        }}
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share with {contactName}
      </button>
    </div>
  );
}
