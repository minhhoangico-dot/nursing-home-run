import { supabase } from '../lib/supabase';
import { InventoryItem, InventoryTransaction, PurchaseRequest } from '../types';

const mapInventoryToDb = (i: InventoryItem) => ({
    id: i.id,
    name: i.name,
    category: i.category,
    unit: i.unit,
    stock: i.stock,
    min_stock: i.minStock,
    price: i.price
});

const mapInventoryFromDb = (d: any): InventoryItem => ({
    id: d.id,
    name: d.name,
    category: d.category,
    unit: d.unit,
    stock: d.stock,
    minStock: d.min_stock,
    price: Number(d.price)
});

export const inventoryService = {
    getAll: async () => {
        const { data, error } = await supabase.from('inventory').select('*').order('name');
        if (error) throw error;
        return (data || []).map(mapInventoryFromDb);
    },
    upsert: async (item: InventoryItem) => {
        const { error } = await supabase.from('inventory').upsert(mapInventoryToDb(item));
        if (error) throw error;
    },
    bulkUpsert: async (list: InventoryItem[]) => {
        if (!list.length) return;
        const { error } = await supabase.from('inventory').upsert(list.map(mapInventoryToDb));
        if (error) throw error;
    },
    getTransactions: async () => {
        const { data, error } = await supabase.from('inventory_transactions').select('*').order('date', { ascending: false });
        if (error) throw error;
        return (data || []).map(d => ({
            id: d.id, itemId: d.item_id, itemName: d.item_name, type: d.type,
            quantity: d.quantity, date: d.date, performer: d.performer, reason: d.reason
        })) as InventoryTransaction[];
    },
    addTransaction: async (t: InventoryTransaction) => {
        const { error } = await supabase.from('inventory_transactions').insert({
            id: t.id, item_id: t.itemId, item_name: t.itemName, type: t.type,
            quantity: t.quantity, date: t.date, performer: t.performer, reason: t.reason
        });
        if (error) throw error;
    },
    getPurchaseRequests: async () => {
        const { data, error } = await supabase.from('purchase_requests').select('*').order('request_date', { ascending: false });
        if (error) throw error;
        return (data || []).map(d => ({
            ...d, requestDate: d.request_date, estimatedCost: Number(d.estimated_cost)
        })) as PurchaseRequest[];
    },
    upsertPurchaseRequest: async (r: PurchaseRequest) => {
        const { error } = await supabase.from('purchase_requests').upsert({
            ...r, request_date: r.requestDate, estimated_cost: r.estimatedCost
        });
        if (error) throw error;
    }
};
