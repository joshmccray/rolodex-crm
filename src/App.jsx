import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useData } from './context/DataContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import ActionCard from './components/ActionCard';
import ContactCard from './components/ContactCard';
import ContactDetail from './components/ContactDetail';
import MessageModal from './components/MessageModal';
import MarketAlertsPanel from './components/MarketAlertsPanel';
import AlertSettingsModal from './components/AlertSettingsModal';
import ShareSaleModal from './components/ShareSaleModal';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';

export default function App() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { contacts, updateContact, updateMarketAlerts, loading, error } = useData();
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'

  const [activeTab, setActiveTab] = useState('actions');
  const [selectedContact, setSelectedContact] = useState(null);
  const [expandedAction, setExpandedAction] = useState(null);
  const [sentActions, setSentActions] = useState([]);
  const [dismissedActions, setDismissedActions] = useState([]);
  const [showSentToast, setShowSentToast] = useState(false);

  // Market alerts state
  const [showAlertSettings, setShowAlertSettings] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [sharedSales, setSharedSales] = useState([]);

  // Compute all pending actions
  const allActions = contacts
    .flatMap(c => c.suggestedActions.map(a => ({ ...a, contact: c })))
    .filter(a => !dismissedActions.includes(a.id) && !sentActions.includes(a.id))
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  // Count contacts with market alerts enabled
  const marketAlertCount = contacts.filter(c => c.marketAlerts?.enabled && (c.recentSales?.length || 0) > 0).length;

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
    setActiveTab('contact-detail');
  };

  const handleContactSelectForMarket = (contact) => {
    setSelectedContact(contact);
  };

  const handleSend = (actionId) => {
    setSentActions([...sentActions, actionId]);
    setExpandedAction(null);
    setShowSentToast(true);
    setTimeout(() => setShowSentToast(false), 3000);
  };

  const handleDismiss = (actionId) => {
    setDismissedActions([...dismissedActions, actionId]);
    setExpandedAction(null);
  };

  const getPendingActionsForContact = (contact) => {
    return contact.suggestedActions.filter(
      a => !dismissedActions.includes(a.id) && !sentActions.includes(a.id)
    ).length;
  };

  // Market alert handlers
  const handleUpdateAlertSettings = async (newSettings) => {
    if (!selectedContact) return;
    await updateMarketAlerts(selectedContact.id, newSettings);
    // Update selectedContact too
    setSelectedContact({ ...selectedContact, marketAlerts: newSettings });
  };

  const handleShareSale = (sale) => {
    setSelectedSale(sale);
  };

  const handleSendSaleMessage = (saleId) => {
    setSharedSales([...sharedSales, saleId]);
    setSelectedSale(null);
    setShowSentToast(true);
    setTimeout(() => setShowSentToast(false), 3000);
  };

  // Show auth loading state
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid #e2e8f0',
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <div style={{ color: '#64748b', fontSize: 14 }}>Loading...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Show login/register if not authenticated
  // For now, we'll skip auth check when using mock data
  const useMockData = import.meta.env.VITE_USE_REAL_API !== 'true';
  if (!useMockData && !isAuthenticated) {
    if (authView === 'register') {
      return <RegisterPage onNavigateToLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onNavigateToRegister={() => setAuthView('register')} />;
  }

  // Show loading state for contacts
  if (loading && contacts.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid #e2e8f0',
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <div style={{ color: '#64748b', fontSize: 14 }}>Loading contacts...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', maxWidth: '100vw', overflow: 'hidden' }}>
      <Header
        activeTab={activeTab}
        actionCount={allActions.length}
        marketAlertCount={marketAlertCount}
        selectedContact={activeTab === 'contact-detail' ? selectedContact : null}
        onBack={() => setActiveTab('contacts')}
      />

      <div className="main-content">
        {/* Actions Tab */}
        {activeTab === 'actions' && (
          <>
            {allActions.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
                <div style={{ fontSize: 18, fontWeight: 500, color: '#1e293b', marginBottom: 8 }}>
                  All caught up!
                </div>
                <div style={{ fontSize: 14 }}>
                  No pending actions right now.
                </div>
              </div>
            ) : (
              allActions.map(action => (
                <ActionCard
                  key={action.id}
                  action={action}
                  onClick={() => setExpandedAction(action)}
                />
              ))
            )}
          </>
        )}

        {/* Market Tab */}
        {activeTab === 'market' && (
          <>
            {!selectedContact ? (
              <>
                {/* Contact Selector */}
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#64748b',
                    margin: '0 0 12px 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Select a contact
                  </h3>
                  {contacts.map(contact => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      pendingActions={0}
                      onClick={() => handleContactSelectForMarket(contact)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Back to contact list */}
                <button
                  onClick={() => setSelectedContact(null)}
                  className="back-btn"
                  style={{ marginBottom: 16 }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  All Contacts
                </button>
                <MarketAlertsPanel
                  contact={selectedContact}
                  onShareSale={handleShareSale}
                  onToggleAlerts={() => {}}
                  onUpdateSettings={handleUpdateAlertSettings}
                  onOpenSettings={() => setShowAlertSettings(true)}
                />
              </>
            )}
          </>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          contacts.map(contact => (
            <ContactCard
              key={contact.id}
              contact={contact}
              pendingActions={getPendingActionsForContact(contact)}
              onClick={() => handleContactSelect(contact)}
            />
          ))
        )}

        {/* Contact Detail View */}
        {activeTab === 'contact-detail' && selectedContact && (
          <ContactDetail contact={selectedContact} />
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <AccountPage />
        )}
      </div>

      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'market') {
            // Don't clear selectedContact when leaving market tab
            // to preserve state if user returns
          }
        }}
        actionCount={allActions.length}
        marketAlertCount={marketAlertCount}
      />

      {/* Message Editor Modal */}
      {expandedAction && (
        <MessageModal
          action={expandedAction}
          onClose={() => setExpandedAction(null)}
          onSend={handleSend}
          onDismiss={handleDismiss}
        />
      )}

      {/* Alert Settings Modal */}
      {showAlertSettings && selectedContact && (
        <AlertSettingsModal
          contact={selectedContact}
          onClose={() => setShowAlertSettings(false)}
          onSave={handleUpdateAlertSettings}
        />
      )}

      {/* Share Sale Modal */}
      {selectedSale && selectedContact && (
        <ShareSaleModal
          sale={selectedSale}
          contact={selectedContact}
          onClose={() => setSelectedSale(null)}
          onSend={handleSendSaleMessage}
        />
      )}

      {/* Success Toast */}
      {showSentToast && (
        <div className="toast">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Message sent!
        </div>
      )}
    </div>
  );
}
