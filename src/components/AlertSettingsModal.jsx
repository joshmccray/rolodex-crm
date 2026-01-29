import { useState, useEffect } from 'react';
import { alertFrequencyOptions, alertRadiusOptions, getDefaultFrequency } from '../data/contacts';

export default function AlertSettingsModal({ contact, onClose, onSave }) {
  const currentSettings = contact.marketAlerts || {
    enabled: false,
    frequency: getDefaultFrequency(contact.labels.timeline),
    radius: 0.5,
  };

  const [enabled, setEnabled] = useState(currentSettings.enabled);
  const [frequency, setFrequency] = useState(currentSettings.frequency);
  const [radius, setRadius] = useState(currentSettings.radius);

  useEffect(() => {
    setEnabled(currentSettings.enabled);
    setFrequency(currentSettings.frequency);
    setRadius(currentSettings.radius);
  }, [contact.id]);

  const handleSave = () => {
    onSave({
      enabled,
      frequency,
      radius,
      lastSent: currentSettings.lastSent,
    });
    onClose();
  };

  const suggestedFrequency = getDefaultFrequency(contact.labels.timeline);

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content">
        <div className="modal-handle" />

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', margin: 0 }}>
            Market Alert Settings
          </h2>
          <p style={{ fontSize: 14, color: '#64748b', margin: '4px 0 0' }}>
            Configure alerts for {contact.name}
          </p>
        </div>

        {/* Enable/Disable Toggle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          background: enabled ? '#f0fdf4' : '#f8fafc',
          borderRadius: 12,
          marginBottom: 20,
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: '#1e293b' }}>
              Enable Market Alerts
            </div>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              Send nearby sale notifications
            </div>
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
            style={{
              width: 52,
              height: 28,
              borderRadius: 14,
              background: enabled ? '#10b981' : '#d1d5db',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.2s ease',
            }}
          >
            <div style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'white',
              position: 'absolute',
              top: 2,
              left: enabled ? 26 : 2,
              transition: 'left 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </button>
        </div>

        {/* Frequency Selector */}
        <div style={{ marginBottom: 20, opacity: enabled ? 1 : 0.5, pointerEvents: enabled ? 'auto' : 'none' }}>
          <label style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 500,
            color: '#475569',
            marginBottom: 8,
          }}>
            Alert Frequency
            {frequency !== suggestedFrequency && (
              <span style={{ fontWeight: 400, color: '#94a3b8', marginLeft: 8 }}>
                (Suggested: {alertFrequencyOptions.find(o => o.value === suggestedFrequency)?.label})
              </span>
            )}
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {alertFrequencyOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setFrequency(option.value)}
                style={{
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: frequency === option.value ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                  background: frequency === option.value ? '#eff6ff' : 'white',
                  color: frequency === option.value ? '#3b82f6' : '#475569',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Radius Selector */}
        <div style={{ marginBottom: 24, opacity: enabled ? 1 : 0.5, pointerEvents: enabled ? 'auto' : 'none' }}>
          <label style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 500,
            color: '#475569',
            marginBottom: 8,
          }}>
            Search Radius
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {alertRadiusOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setRadius(option.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: radius === option.value ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                  background: radius === option.value ? '#eff6ff' : 'white',
                  color: radius === option.value ? '#3b82f6' : '#475569',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        {enabled && (
          <div style={{
            padding: '12px 14px',
            background: '#fefce8',
            borderRadius: 10,
            marginBottom: 20,
            display: 'flex',
            gap: 10,
          }}>
            <svg width="18" height="18" fill="none" stroke="#ca8a04" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div style={{ fontSize: 13, color: '#854d0e', lineHeight: 1.5 }}>
              {contact.name} will receive alerts about homes sold within {alertRadiusOptions.find(o => o.value === radius)?.label} of their address, sent {frequency === 'instant' ? 'instantly' : frequency}.
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className="btn btn-ghost"
            onClick={onClose}
            style={{ flex: 0 }}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            style={{ flex: 1 }}
          >
            Save Settings
          </button>
        </div>
      </div>
    </>
  );
}
