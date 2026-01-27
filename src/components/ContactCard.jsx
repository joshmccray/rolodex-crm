import { temperatureConfig } from '../data/contacts';
import { getInitials } from '../utils/helpers';

export default function ContactCard({ contact, pendingActions, onClick }) {
  const temp = temperatureConfig[contact.temperature];

  return (
    <div className="contact-card" onClick={onClick}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: `linear-gradient(135deg, ${temp.color}22, ${temp.color}11)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          fontWeight: 600,
          color: temp.color,
          flexShrink: 0,
          position: 'relative',
        }}>
          {getInitials(contact.name)}
          {pendingActions > 0 && (
            <div style={{
              position: 'absolute',
              top: -4,
              right: -4,
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: '#ef4444',
              color: 'white',
              fontSize: 11,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white',
            }}>
              {pendingActions}
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#1e293b' }}>
              {contact.name}
            </span>
            <div 
              className="temperature-dot"
              style={{ background: temp.color, boxShadow: temp.glow }}
            />
          </div>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
            {contact.lastActivity} · {contact.lastActivityType}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span className="tag" style={{ background: '#f1f5f9', color: '#475569' }}>
              {contact.labels.type === 'buying' ? 'Buyer' : contact.labels.type === 'selling' ? 'Seller' : 'Buy & Sell'}
            </span>
            <span className="tag" style={{ background: '#f1f5f9', color: '#475569' }}>
              {contact.labels.priceRange}
            </span>
          </div>
        </div>

        <svg width="20" height="20" fill="none" stroke="#cbd5e1" viewBox="0 0 24 24" style={{ alignSelf: 'center' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}
