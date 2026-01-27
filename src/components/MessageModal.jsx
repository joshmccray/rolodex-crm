import { useState, useEffect } from 'react';
import { temperatureConfig } from '../data/contacts';
import { getInitials } from '../utils/helpers';

const quickEdits = [
  { label: '+ Urgency', text: " This one won't last long!" },
  { label: '+ Softer', text: " No pressure — just thought of you." },
  { label: '+ Time', text: " I'm free tomorrow afternoon." },
];

export default function MessageModal({ action, onClose, onSend, onDismiss }) {
  const [message, setMessage] = useState(action.draftMessage);
  const temp = temperatureConfig[action.contact.temperature];

  useEffect(() => {
    setMessage(action.draftMessage);
  }, [action]);

  const charCount = message.length;
  const smsCount = Math.ceil(charCount / 160);

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content">
        <div className="modal-handle" />
        
        {/* Contact Info */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
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
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1e293b' }}>
              {action.contact.name}
            </div>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              {action.property} · {action.propertyPrice}
            </div>
          </div>
        </div>

        {/* Message Editor */}
        <textarea
          className="message-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          autoFocus
        />
        
        {/* Character Count */}
        <div style={{ marginTop: 8, marginBottom: 16 }}>
          <span className={`char-count ${charCount > 300 ? 'warning' : ''} ${charCount > 400 ? 'danger' : ''}`}>
            {charCount} chars
            {charCount > 160 && ` · ${smsCount} SMS`}
          </span>
        </div>

        {/* Quick Edits */}
        <div style={{ marginBottom: 20, overflowX: 'auto', whiteSpace: 'nowrap', margin: '0 -20px', padding: '0 20px 16px' }}>
          <div style={{ display: 'inline-flex', gap: 8 }}>
            {quickEdits.map((edit, i) => (
              <button
                key={i}
                className="quick-edit-btn"
                onClick={() => setMessage(message + edit.text)}
              >
                {edit.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            className="btn btn-ghost"
            onClick={() => onDismiss(action.id)}
            style={{ flex: 0 }}
          >
            Dismiss
          </button>
          <button 
            className="btn btn-success"
            onClick={() => onSend(action.id)}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Send Text
          </button>
        </div>
      </div>
    </>
  );
}
