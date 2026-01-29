import { useState, useEffect } from 'react';
import { temperatureConfig } from '../data/contacts';
import { getInitials } from '../utils/helpers';

const quickEdits = [
  { label: '+ Urgency', text: " Market's moving fast in this area!" },
  { label: '+ Softer', text: " Just thought you'd find this interesting." },
  { label: '+ CTA', text: " Want me to pull the full comps?" },
];

export default function ShareSaleModal({ sale, contact, onClose, onSend }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const isBuyer = contact.labels.type === 'buying' || contact.labels.type === 'both';
  const isSeller = contact.labels.type === 'selling' || contact.labels.type === 'both';

  // Parse contact's price range to calculate percentage
  const getPriceComparison = () => {
    const priceRange = contact.labels.priceRange;
    // Extract numbers from price range like "$450K - $600K"
    const matches = priceRange.match(/\$?([\d,]+)K?\s*-\s*\$?([\d,]+)K?/);
    if (matches) {
      let maxBudget = parseInt(matches[2].replace(/,/g, ''));
      // Handle K suffix
      if (priceRange.includes('K')) {
        maxBudget *= 1000;
      }
      const diff = maxBudget - sale.price;
      const percent = Math.round((diff / maxBudget) * 100);
      if (diff > 0) {
        return `${percent}% under your budget`;
      } else {
        return `${Math.abs(percent)}% over your budget`;
      }
    }
    return null;
  };

  // Generate draft message based on contact type
  const generateDraftMessage = () => {
    const firstName = contact.name.split(' ')[0];
    const priceFormatted = formatPrice(sale.price);

    if (isSeller) {
      // Seller message - focus on their home value
      const estimatedValue = Math.round(sale.price * 1.05); // Assume 5% premium
      return `Hey ${firstName}, your neighbor at ${sale.address} just sold for ${priceFormatted}. Based on your home's features, you could be looking at ${formatPrice(estimatedValue)}+. Want me to run the full comps?`;
    } else {
      // Buyer message - focus on opportunity
      const comparison = getPriceComparison();
      const comparisonText = comparison ? ` — that's ${comparison}` : '';
      return `Hey ${firstName}, ${sale.address} just sold for ${priceFormatted}${comparisonText}. Want to see what's still available in that area?`;
    }
  };

  const [message, setMessage] = useState(generateDraftMessage());
  const temp = temperatureConfig[contact.temperature];

  useEffect(() => {
    setMessage(generateDraftMessage());
  }, [sale, contact]);

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
            {getInitials(contact.name)}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1e293b' }}>
              {contact.name}
            </div>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              {sale.address} · {formatPrice(sale.price)}
            </div>
          </div>
        </div>

        {/* Sale Details Pill */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 16,
          flexWrap: 'wrap',
        }}>
          <span className="property-pill">
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {sale.beds} bd, {sale.baths} ba
          </span>
          <span className="property-pill">
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            {sale.sqft.toLocaleString()} sqft
          </span>
          <span className="property-pill">
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {sale.distance < 0.1 ? '< 0.1' : sale.distance.toFixed(1)} mi away
          </span>
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
            onClick={onClose}
            style={{ flex: 0 }}
          >
            Cancel
          </button>
          <button
            className="btn btn-success"
            onClick={() => onSend(sale.id)}
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
