import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, resetUnauthorizedGuard } from './apiClient.js';

export function useRegisterMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userData) => {
            return apiFetch('/auth/signup', {
                method: 'POST',
                skipAuth: true,
                body: JSON.stringify(userData),
            });
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}

export function useLogin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ email, password }) => {
            return apiFetch('/auth/login', {
                method: 'POST',
                skipAuth: true,
                body: JSON.stringify({ email, password }),
            });
        },
        onSuccess: () => {
            // a fresh login means any *future* 401 is a new, real session
            // expiring — not a leftover from the dead one we just replaced
            resetUnauthorizedGuard();
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}

export function useProfile() {
    return useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            return apiFetch('/auth/profile', { method: 'GET' });
        },
    });
}

export function useLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            return apiFetch('/auth/logout', { method: 'POST' });
        },
        onSuccess: () => {
            // Clear all cached data on logout so protected data isn't sitting in memory
            queryClient.clear();
        },
    });
}