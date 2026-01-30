import { useState, useEffect, useCallback } from 'react';
import { leadsApi } from '../api/client';

export function useLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await leadsApi.getAll();
      setLeads(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const createLead = async (data) => {
    const newLead = await leadsApi.create(data);
    setLeads((prev) => [newLead, ...prev]);
    return newLead;
  };

  const updateLead = async (id, data) => {
    const updated = await leadsApi.update(id, data);
    setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)));
    return updated;
  };

  const deleteLead = async (id) => {
    await leadsApi.delete(id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

  return {
    leads,
    loading,
    error,
    refetch: fetchLeads,
    createLead,
    updateLead,
    deleteLead,
  };
}

export function useLead(id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLead = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await leadsApi.getById(id);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  const refreshNearbySales = async () => {
    const result = await leadsApi.refreshNearbySales(id);
    await fetchLead(); // Refetch to get updated data
    return result;
  };

  const refreshValue = async () => {
    const result = await leadsApi.refreshValue(id);
    await fetchLead();
    return result;
  };

  return {
    lead: data?.lead,
    latestValue: data?.latestValue,
    valueHistory: data?.valueHistory || [],
    recentSales: data?.recentSales || [],
    loading,
    error,
    refetch: fetchLead,
    refreshNearbySales,
    refreshValue,
  };
}
