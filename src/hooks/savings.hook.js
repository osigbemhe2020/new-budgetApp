import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetchRaw } from './apiClient.js';

// GET /savings/settings — current settings + current_cycle_summary
export const useSavingsSettings = () => {
  return useQuery({
    queryKey: ['savingsSettings'],
    queryFn: async () => {
      const res = await apiFetchRaw('/savings/settings', { method: 'GET' });

      // no settings yet isn't an error state for the UI — let the caller
      // distinguish "still loading" from "nothing saved yet"
      if (res.status === 404) {
        return null;
      }
      if (!res.ok) {
        throw new Error('Failed to fetch savings settings');
      }
      return res.json();
    },
  });
};

// POST/PUT /savings/settings — creates on first save, updates after that.
// We can't know client-side whether settings already exist (that's exactly
// what we're fetching above), so try update first and fall back to create
// on a 404 ("no settings found yet").
export const useSetSavingsSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ savings_percentage, lock_duration_months }) => {
      const body = JSON.stringify({ savings_percentage, lock_duration_months });

      const putRes = await apiFetchRaw('/savings/settings', {
        method: 'PUT',
        body,
      });

      if (putRes.ok) {
        return putRes.json();
      }

      if (putRes.status !== 404) {
        throw new Error('Failed to update savings settings');
      }

      // no existing settings — create them instead
      const postRes = await apiFetchRaw('/savings/settings', {
        method: 'POST',
        body,
      });

      if (!postRes.ok) {
        throw new Error('Failed to create savings settings');
      }
      return postRes.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savingsSettings'] });
    },
  });
};