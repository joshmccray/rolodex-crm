import { useState } from 'react';
import { contacts } from './data/contacts';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import ActionCard from './components/ActionCard';
import ContactCard from './components/ContactCard';
import ContactDetail from './components/ContactDetail';
import MessageModal from './components/MessageModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('actions');
  const [selectedContact, setSelectedContact] = useState(null);
  const [expandedAction, setExpandedAction] = useState(null);
  const [sentActions, setSentActions] = useState([]);
  const [dismissedActions, setDismissedActions] = useState([]);
  const [showSentToast, setShowSentToast] = useState(false);

  // Compute all pending actions
  const allActions = contacts
    .flatMap(c => c.suggestedActions.map(a => ({ ...a, contact: c })))
    .filter(a => !dismissedActions.includes(a.id) && !sentActions.includes(a.id))
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
    setActiveTab('contact-detail');
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

  return (
    <div style={{ minHeight: '100vh', maxWidth: '100vw', overflow: 'hidden' }}>
      <Header 
        activeTab={activeTab}
        actionCount={allActions.length}
        selectedContact={selectedContact}
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
      </div>

      <BottomNav 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        actionCount={allActions.length}
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
