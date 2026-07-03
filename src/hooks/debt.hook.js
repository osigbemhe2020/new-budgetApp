import { useQuery } from "@tanstack/react-query";
import { apiFetch } from './apiClient.js';

// GET /debts/active — pending debts + total_owed (principal + interest,
// summed across all pending debts, not just the current cycle)
export const useActiveDebts = () => {
  return useQuery({
    queryKey: ['activeDebts'],
    queryFn: async () => {
      return apiFetch('/debts/active', { method: 'GET' });
    },
  });
};