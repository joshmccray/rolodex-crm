import { temperatureConfig } from '../data/contacts';
import { getInitials } from '../utils/helpers';

export default function ContactDetail({ contact }) {
  const temp = temperatureConfig[contact.temperature];

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: `linear-gradient(135deg, ${temp.color}22, ${temp.color}11)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          fontWeight: 600,
          color: temp.color,
          margin: '0 auto 12px',
        }}>
          {getInitials(contact.name)}
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 600, color: '#1e293b', margin: 0 }}>
          {contact.name}
        </h2>
        <p style={{ fontSize: 14, color: '#64748b', margin: '4px 0 0' }}>
          {contact.labels.areas.join(', ')}
        </p>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <a href={`tel:${contact.phone}`} className="quick-action">
          <svg width="24" height="24" fill="none" stroke="#10b981" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Call
        </a>
        <a href={`sms:${contact.phone}`} className="quick-action">
          <svg width="24" height="24" fill="none" stroke="#3b82f6" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Text
        </a>
        <a href={`mailto:${contact.email}`} className="quick-action">
          <svg width="24" height="24" fill="none" stroke="#8b5cf6" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Email
        </a>
      </div>

      {/* Details */}
      <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: 16, borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>NOTES</div>
          <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: 0 }}>
            {contact.notes}
          </p>
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 10 }}>DETAILS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <span className="tag" style={{ background: '#f1f5f9', color: '#475569' }}>
              {contact.labels.timeline}
            </span>
            <span className="tag" style={{ background: '#f1f5f9', color: '#475569' }}>
              {contact.labels.priceRange}
            </span>
            {contact.labels.preApproval === 'approved' && (
              <span className="tag" style={{ background: '#f0fdf4', color: '#10b981' }}>
                ✓ Pre-Approved
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
