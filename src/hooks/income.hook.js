import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from './apiClient.js';

export const useIncomes = () => {
    return useQuery({
        queryKey: ['incomes'],
        queryFn: async () => {
            const data = await apiFetch('/income', { method: 'GET' });
            return data.incomes || [];
        }
    });
};

export const useAddIncome = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ name, amount }) => {
            return apiFetch('/income/add', {
                method: 'POST',
                body: JSON.stringify({ name, amount }),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['incomes'] });
        }
    });
};

export const useUpdateIncome = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, name, amount }) => {
            return apiFetch(`/income/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ name, amount }),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['incomes'] });
        }
    });
};

export const useDeleteIncome = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            return apiFetch(`/income/${id}`, { method: 'DELETE' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['incomes'] });
        }
    });
};