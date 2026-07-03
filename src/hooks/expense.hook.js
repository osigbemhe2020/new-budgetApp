import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from './apiClient.js';

// GET /expenses — list + current_cycle summary (total_expense, balance)
export const useExpenses = () => {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      return apiFetch('/expenses', { method: 'GET' });
    },
  });
};

// POST /expenses — create. May come back as a normal expense or, if it
// exceeds the current balance, as debt + (optionally) a partial expense.
// Either way the response carries month_summary, which is what callers
// should trust over any client-side total.
export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ expense_name, amount, category }) => {
      return apiFetch('/expenses', {
        method: 'POST',
        body: JSON.stringify({ expense_name, amount, category }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
};

// DELETE /expenses/:id
export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      return apiFetch(`/expenses/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
};