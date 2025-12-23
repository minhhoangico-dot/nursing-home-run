import { create } from 'zustand';
import { InventoryItem, InventoryTransaction, PurchaseRequest } from '../types';
import { db } from '../services/databaseService';

interface InventoryState {
    inventory: InventoryItem[];
    transactions: InventoryTransaction[];
    purchaseRequests: PurchaseRequest[];
    isLoading: boolean;
    isSyncing: boolean;
    error: string | null;

    fetchInventoryData: () => Promise<void>;
    addTransaction: (t: InventoryTransaction) => Promise<void>;
    addPurchaseRequest: (r: PurchaseRequest) => Promise<void>;
    addInventoryItem: (item: InventoryItem) => Promise<void>;
    updateInventory: (items: InventoryItem[]) => Promise<void>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
    inventory: [],
    transactions: [],
    purchaseRequests: [],
    isLoading: false,
    isSyncing: false,
    error: null,

    fetchInventoryData: async () => {
        set({ isLoading: true });
        try {
            const [inv, trx, reqs] = await Promise.all([
                db.inventory.getAll(),
                db.inventory.getTransactions(),
                db.inventory.getPurchaseRequests()
            ]);
            set({ inventory: inv, transactions: trx, purchaseRequests: reqs, isLoading: false });
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    addInventoryItem: async (item) => {
        set({ isSyncing: true });
        try {
            await db.inventory.upsert(item);
            set(state => ({ inventory: [...state.inventory, item], isSyncing: false }));
        } catch (error) {
            set({ error: (error as Error).message, isSyncing: false });
        }
    },

    addTransaction: async (t) => {
        set({ isSyncing: true });
        try {
            await db.inventory.addTransaction(t);
            // Also update inventory stock locally
            set(state => {
                const updatedInventory = state.inventory.map(item => {
                    if (item.id === t.itemId) {
                        const change = t.type === 'IN' ? t.quantity : -t.quantity;
                        return { ...item, stock: item.stock + change };
                    }
                    return item;
                });
                // Sync updated items to DB? The original App.tsx did this.
                // We should probably rely on backend or do explicit update.
                updatedInventory.forEach(item => {
                    if (item.id === t.itemId) db.inventory.upsert(item).catch(console.error);
                });

                return {
                    transactions: [t, ...state.transactions],
                    inventory: updatedInventory,
                    isSyncing: false
                };
            });
        } catch (error) {
            set({ error: (error as Error).message, isSyncing: false });
        }
    },

    addPurchaseRequest: async (r) => {
        set({ isSyncing: true });
        try {
            await db.inventory.upsertPurchaseRequest(r);
            set(state => ({ purchaseRequests: [r, ...state.purchaseRequests], isSyncing: false }));
        } catch (error) {
            set({ error: (error as Error).message, isSyncing: false });
        }
    },

    updateInventory: async (items) => {
        set({ isSyncing: true });
        try {
            await db.inventory.bulkUpsert(items);
            set({ inventory: items, isSyncing: false });
        } catch (error) {
            set({ error: (error as Error).message, isSyncing: false });
        }
    }
}));
