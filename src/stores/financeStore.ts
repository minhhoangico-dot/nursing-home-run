import { create } from 'zustand';
import { FinancialTransaction, ServicePrice, ServiceUsage } from '../types';
import { db } from '../services/databaseService';

interface FinanceState {
    transactions: FinancialTransaction[];
    servicePrices: ServicePrice[];
    usageRecords: ServiceUsage[];
    isLoading: boolean;
    isSyncing: boolean;
    error: string | null;

    fetchFinanceData: () => Promise<void>;
    addTransaction: (t: FinancialTransaction) => Promise<void>;
    updateServicePrice: (p: ServicePrice) => Promise<void>;
    deleteServicePrice: (id: string) => Promise<void>;
    recordUsage: (u: ServiceUsage) => Promise<void>;
    markAsBilled: (ids: string[]) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
    transactions: [],
    servicePrices: [],
    usageRecords: [],
    isLoading: false,
    isSyncing: false,
    error: null,

    fetchFinanceData: async () => {
        set({ isLoading: true });
        try {
            const [transactions, prices, usage] = await Promise.all([
                db.finance.getTransactions(),
                db.finance.getPrices(),
                db.finance.getUsage()
            ]);
            set({ transactions, servicePrices: prices, usageRecords: usage, isLoading: false });
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    addTransaction: async (t) => {
        set({ isSyncing: true });
        try {
            await db.finance.addTransaction(t);
            set(state => ({ transactions: [t, ...state.transactions], isSyncing: false }));
        } catch (error) {
            set({ error: (error as Error).message, isSyncing: false });
        }
    },

    updateServicePrice: async (p) => {
        set({ isSyncing: true });
        try {
            await db.finance.upsertPrice(p);
            set(state => {
                const exists = state.servicePrices.some(s => s.id === p.id);
                const newPrices = exists
                    ? state.servicePrices.map(s => s.id === p.id ? p : s)
                    : [...state.servicePrices, p];
                return { servicePrices: newPrices, isSyncing: false };
            });
        } catch (error) {
            set({ error: (error as Error).message, isSyncing: false });
        }
    },

    deleteServicePrice: async (id) => {
        set({ isSyncing: true });
        try {
            await db.finance.deletePrice(id);
            set(state => ({ servicePrices: state.servicePrices.filter(s => s.id !== id), isSyncing: false }));
        } catch (error) {
            set({ error: (error as Error).message, isSyncing: false });
        }
    },

    recordUsage: async (u) => {
        set({ isSyncing: true });
        try {
            await db.finance.upsertUsage(u);
            set(state => ({ usageRecords: [u, ...state.usageRecords], isSyncing: false }));
        } catch (error) {
            set({ error: (error as Error).message, isSyncing: false });
        }
    },

    markAsBilled: async (ids) => {
        set({ isSyncing: true });
        try {
            // Optimistic update
            set(state => ({
                usageRecords: state.usageRecords.map(u => ids.includes(u.id) ? { ...u, status: 'Billed' } : u)
            }));

            await Promise.all(ids.map(id => {
                const usage = get().usageRecords.find(u => u.id === id);
                if (usage) {
                    return db.finance.upsertUsage({ ...usage, status: 'Billed' });
                }
                return Promise.resolve();
            }));

            set({ isSyncing: false });
        } catch (error) {
            set({ error: (error as Error).message, isSyncing: false });
            // Could revert here if strict
        }
    }
}));
