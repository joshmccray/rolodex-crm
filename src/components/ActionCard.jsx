import { temperatureConfig, actionTypeConfig } from '../data/contacts';
import { getInitials } from '../utils/helpers';

export default function ActionCard({ action, onClick }) {
  const typeConfig = actionTypeConfig[action.type];
  const temp = temperatureConfig[action.contact.temperature];

  return (
    <div
      className={`action-card ${action.priority}`}
      onClick={onClick}
    >
      {/* Card Header */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: `linear-gradient(135deg, ${temp.color}22, ${temp.color}11)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 15,
          fontWeight: 600,
          color: temp.color,
          flexShrink: 0,
        }}>
          {getInitials(action.contact.name)}
        </div>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#1e293b' }}>
              {action.contact.name}
            </span>
            <div 
              className="temperature-dot"
              style={{ background: temp.color }}
            />
          </div>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            {action.trigger}
          </div>
        </div>
      </div>

      {/* Type Badge & Property */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <span className="tag" style={{
          background: typeConfig.bg,
          color: typeConfig.color,
        }}>
          {typeConfig.icon} {typeConfig.label}
        </span>
        <div className="property-pill">
          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span style={{ fontWeight: 500 }}>{action.property}</span>
        </div>
      </div>

      {/* Message Preview */}
      <div style={{
        background: '#f8fafc',
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        color: '#475569',
        lineHeight: 1.5,
      }}>
        <div style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {action.draftMessage}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
      }}>
        <span style={{ fontSize: 12, color: '#94a3b8' }}>
          {action.timeAgo}
        </span>
        <span style={{ fontSize: 13, color: '#3b82f6', fontWeight: 500 }}>
          Tap to edit →
        </span>
      </div>
    </div>
  );
}
