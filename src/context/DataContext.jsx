import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { contacts as mockContacts } from '../data/contacts';
import { leadsApi, notificationsApi, dashboardApi } from '../api/client';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

// Set to true to use real API, false for mock data
const USE_REAL_API = import.meta.env.VITE_USE_REAL_API === 'true';

// Transform mock contact to lead format
function mockContactToLead(contact) {
  return {
    id: String(contact.id),
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    propertyAddress: contact.address?.street || '',
    propertyCity: contact.address?.city || '',
    temperature: contact.temperature,
    leadType: contact.labels?.type || 'buying',
    notifyNearbySales: contact.marketAlerts?.enabled ?? true,
    notifyValueChanges: contact.marketAlerts?.enabled ?? true,
    searchRadiusMiles: contact.marketAlerts?.radius || 0.5,
    alertFrequency: contact.marketAlerts?.frequency || 'weekly',
    notes: contact.notes,
    // Keep original data for compatibility
    _original: contact,
  };
}

// Transform mock contact to include all data
function mockContactWithDetails(contact) {
  return {
    lead: mockContactToLead(contact),
    latestValue: null,
    valueHistory: [],
    recentSales: (contact.recentSales || []).map((sale) => ({
      id: sale.id,
      address: sale.address,
      closePrice: sale.price,
      closeDate: sale.soldDate,
      distanceMiles: sale.distance,
      bedrooms: sale.beds,
      bathrooms: sale.baths,
      squareFeet: sale.sqft,
    })),
  };
}

export function DataProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [contacts, setContacts] = useState(mockContacts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch leads from API or use mock data
  const fetchLeads = useCallback(async () => {
    if (!USE_REAL_API) {
      setContacts(mockContacts);
      return;
    }

    if (!isAuthenticated) {
      setContacts([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const leads = await leadsApi.getAll();
      // Transform API leads back to contact format for compatibility
      const transformedContacts = leads.map((lead) => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        lastActivity: 'Recently updated',
        lastActivityType: 'System',
        temperature: lead.temperature || 'warm',
        labels: {
          type: lead.leadType || 'buying',
          priceRange: lead.priceRangeLow && lead.priceRangeHigh
            ? `$${(lead.priceRangeLow / 1000).toFixed(0)}K - $${(lead.priceRangeHigh / 1000).toFixed(0)}K`
            : null,
        },
        address: {
          street: lead.propertyAddress,
          city: lead.propertyCity,
        },
        notes: lead.notes,
        marketAlerts: {
          enabled: lead.notifyNearbySales,
          frequency: lead.alertFrequency || 'weekly',
          radius: lead.searchRadiusMiles || 0.5,
        },
        recentSales: [], // Will be fetched separately
        suggestedActions: [], // Not from API yet
        _apiData: lead, // Keep original API data
      }));
      setContacts(transformedContacts);
    } catch (err) {
      setError(err.message);
      // Fall back to mock data on error
      setContacts(mockContacts);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Get contact by ID
  const getContact = useCallback((id) => {
    return contacts.find((c) => String(c.id) === String(id));
  }, [contacts]);

  // Get contact with full details (including nearby sales)
  const getContactWithDetails = useCallback(async (id) => {
    const contact = getContact(id);
    if (!contact) return null;

    if (!USE_REAL_API || !isAuthenticated) {
      return mockContactWithDetails(contact);
    }

    try {
      const details = await leadsApi.getById(id);
      return details;
    } catch (err) {
      console.error('Failed to fetch contact details:', err);
      return mockContactWithDetails(contact);
    }
  }, [getContact, isAuthenticated]);

  // Update contact/lead
  const updateContact = useCallback(async (id, updates) => {
    if (USE_REAL_API && isAuthenticated) {
      try {
        await leadsApi.update(id, updates);
      } catch (err) {
        console.error('Failed to update lead:', err);
      }
    }

    setContacts((prev) =>
      prev.map((c) =>
        String(c.id) === String(id) ? { ...c, ...updates } : c
      )
    );
  }, [isAuthenticated]);

  // Update market alert settings
  const updateMarketAlerts = useCallback(async (id, alertSettings) => {
    const updates = {
      notifyNearbySales: alertSettings.enabled,
      alertFrequency: alertSettings.frequency,
      searchRadiusMiles: alertSettings.radius,
    };

    if (USE_REAL_API && isAuthenticated) {
      try {
        await leadsApi.update(id, updates);
      } catch (err) {
        console.error('Failed to update alert settings:', err);
      }
    }

    setContacts((prev) =>
      prev.map((c) =>
        String(c.id) === String(id)
          ? { ...c, marketAlerts: alertSettings }
          : c
      )
    );
  }, [isAuthenticated]);

  // Refresh nearby sales for a contact
  const refreshNearbySales = useCallback(async (id) => {
    if (!USE_REAL_API || !isAuthenticated) {
      console.log('Mock: Would refresh nearby sales for', id);
      return { newSalesCount: 0, sales: [] };
    }

    try {
      const result = await leadsApi.refreshNearbySales(id);
      // Refetch to update local state
      await fetchLeads();
      return result;
    } catch (err) {
      console.error('Failed to refresh nearby sales:', err);
      throw err;
    }
  }, [isAuthenticated, fetchLeads]);

  // Create new contact/lead
  const createContact = useCallback(async (data) => {
    if (USE_REAL_API && isAuthenticated) {
      try {
        const newLead = await leadsApi.create(data);
        await fetchLeads();
        return newLead;
      } catch (err) {
        console.error('Failed to create lead:', err);
        throw err;
      }
    }

    // Mock create
    const newContact = {
      id: Date.now(),
      ...data,
      lastActivity: 'Just now',
      lastActivityType: 'Added',
      temperature: data.temperature || 'warm',
      labels: { type: data.leadType || 'buying' },
      address: { street: data.propertyAddress, city: data.propertyCity },
      marketAlerts: { enabled: true, frequency: 'weekly', radius: 0.5 },
      recentSales: [],
      suggestedActions: [],
    };
    setContacts((prev) => [newContact, ...prev]);
    return newContact;
  }, [isAuthenticated, fetchLeads]);

  // Delete contact/lead
  const deleteContact = useCallback(async (id) => {
    if (USE_REAL_API && isAuthenticated) {
      try {
        await leadsApi.delete(id);
      } catch (err) {
        console.error('Failed to delete lead:', err);
        throw err;
      }
    }

    setContacts((prev) => prev.filter((c) => String(c.id) !== String(id)));
  }, [isAuthenticated]);

  const value = {
    contacts,
    loading,
    error,
    isUsingRealApi: USE_REAL_API && isAuthenticated,
    refetch: fetchLeads,
    getContact,
    getContactWithDetails,
    updateContact,
    updateMarketAlerts,
    refreshNearbySales,
    createContact,
    deleteContact,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
