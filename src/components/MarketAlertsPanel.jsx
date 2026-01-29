import { temperatureConfig, alertFrequencyOptions, alertRadiusOptions } from '../data/contacts';
import { getInitials } from '../utils/helpers';
import SaleCard from './SaleCard';

export default function MarketAlertsPanel({
  contact,
  onShareSale,
  onToggleAlerts,
  onUpdateSettings,
  onOpenSettings
}) {
  const temp = temperatureConfig[contact.temperature];
  const recentSales = contact.recentSales || [];
  const alertSettings = contact.marketAlerts || { enabled: false, frequency: 'weekly', radius: 0.5 };

  const getFrequencyLabel = (value) => {
    const option = alertFrequencyOptions.find(o => o.value === value);
    return option ? option.label : value;
  };

  const getRadiusLabel = (value) => {
    const option = alertRadiusOptions.find(o => o.value === value);
    return option ? option.label : `${value} mi`;
  };

  return (
    <div>
      {/* Contact Header */}
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        border: '1px solid #e2e8f0',
      }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
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
          }}>
            {getInitials(contact.name)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>
              {contact.name}
            </div>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              {contact.address.street}, {contact.address.city}
            </div>
          </div>
        </div>

        {/* Alert Settings Summary */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px',
          background: alertSettings.enabled ? '#f0fdf4' : '#f8fafc',
          borderRadius: 10,
          marginBottom: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: alertSettings.enabled ? '#10b981' : '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="18" height="18" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#1e293b' }}>
                Market Alerts {alertSettings.enabled ? 'On' : 'Off'}
              </div>
              {alertSettings.enabled && (
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  {getFrequencyLabel(alertSettings.frequency)} • {getRadiusLabel(alertSettings.radius)} radius
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onOpenSettings}
            style={{
              padding: '8px 14px',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              color: '#3b82f6',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
        </div>
      </div>

      {/* Recent Sales Section */}
      <div style={{ marginBottom: 12 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}>
          <h3 style={{
            fontSize: 14,
            fontWeight: 600,
            color: '#64748b',
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Recent Sales Nearby
          </h3>
          <span style={{
            fontSize: 12,
            color: '#94a3b8',
          }}>
            {recentSales.length} found
          </span>
        </div>

        {recentSales.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: 32,
            textAlign: 'center',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}>
              <svg width="24" height="24" fill="none" stroke="#94a3b8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>
              No recent sales
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>
              We'll notify you when homes sell near this contact
            </div>
          </div>
        ) : (
          recentSales.map(sale => (
            <SaleCard
              key={sale.id}
              sale={sale}
              contactName={contact.name.split(' ')[0]}
              onShare={onShareSale}
            />
          ))
        )}
      </div>
    </div>
  );
}
