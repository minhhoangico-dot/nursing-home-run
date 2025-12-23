import { supabase } from '../lib/supabase';
import { FinancialTransaction, ServicePrice, ServiceUsage } from '../types';

export const financeService = {
    getTransactions: async () => {
        const { data, error } = await supabase.from('financial_transactions').select('*').order('date', { ascending: false });
        if (error) throw error;
        return (data || []).map(d => ({ ...d, residentName: d.resident_name, amount: Number(d.amount) })) as FinancialTransaction[];
    },
    addTransaction: async (t: FinancialTransaction) => {
        const { error } = await supabase.from('financial_transactions').insert({
            id: t.id, date: t.date, resident_name: t.residentName, description: t.description,
            amount: t.amount, type: t.type, performer: t.performer, status: t.status
        });
        if (error) throw error;
    },
    bulkUpsertTransactions: async (list: FinancialTransaction[]) => {
        if (!list.length) return;
        const { error } = await supabase.from('financial_transactions').upsert(list.map(t => ({
            id: t.id, date: t.date, resident_name: t.residentName, description: t.description,
            amount: t.amount, type: t.type, performer: t.performer, status: t.status
        })));
        if (error) throw error;
    },
    getPrices: async () => {
        const [roomRes, careRes, mealRes, additionalRes, absenceRes, holidayRes] = await Promise.all([
            supabase.from('room_prices').select('*'),
            supabase.from('care_level_prices').select('*'),
            supabase.from('meal_prices').select('*'),
            supabase.from('additional_services').select('*'),
            supabase.from('absence_deductions').select('*'),
            supabase.from('holiday_surcharges').select('*')
        ]);

        if (roomRes.error) throw roomRes.error;
        if (careRes.error) throw careRes.error;
        if (mealRes.error) throw mealRes.error;
        if (additionalRes.error) throw additionalRes.error;
        if (absenceRes.error) throw absenceRes.error;
        if (holidayRes.error) throw holidayRes.error;

        const prices: ServicePrice[] = [];

        (roomRes.data || []).forEach((r: any) => {
            prices.push({
                id: `ROOM_${r.id}`,
                originalId: r.id,
                name: r.room_type_vi,
                category: 'ROOM',
                price: r.price_monthly,
                unit: 'Tháng',
                billingType: 'FIXED',
                description: r.description,
                code: r.room_type
            });
        });

        (careRes.data || []).forEach((c: any) => {
            prices.push({
                id: `CARE_${c.care_level}_${c.room_type}`,
                originalId: c.id,
                name: `${c.care_level_vi} (${c.room_type === '4-bed' ? 'Phòng 4+' : c.room_type.replace('-bed', ' người')})`,
                category: 'CARE',
                price: c.price_monthly,
                unit: 'Tháng',
                billingType: 'FIXED',
                code: `CL${c.care_level}_${c.room_type}`
            });
        });

        (mealRes.data || []).forEach((m: any) => {
            prices.push({
                id: `MEAL_${m.id}`,
                originalId: m.id,
                name: m.meal_type_vi,
                category: 'MEAL',
                price: m.price_monthly,
                unit: 'Tháng',
                billingType: 'FIXED',
                code: m.meal_type
            });
        });

        (additionalRes.data || []).forEach((s: any) => {
            const isMonthly = s.unit_vi.toLowerCase().includes('tháng');
            let cat: any = 'OTHER';
            if (s.category === 'special_care') cat = 'CARE';
            if (s.category === 'wound_care') cat = 'CARE';
            if (s.category === 'therapy') cat = 'CARE';

            prices.push({
                id: `SVC_${s.code}`,
                originalId: s.id,
                name: s.service_name_vi,
                category: cat,
                price: s.price,
                unit: s.unit_vi,
                billingType: 'ONE_OFF',
                code: s.code
            });
        });

        (absenceRes.data || []).forEach((a: any) => {
            prices.push({
                id: `ABS_${a.absence_type}`,
                originalId: a.id,
                name: a.absence_type_vi,
                category: 'OTHER',
                price: a.deduction_daily,
                unit: 'Ngày',
                billingType: 'ONE_OFF',
                code: a.absence_type
            });
        });

        (holidayRes.data || []).forEach((h: any) => {
            prices.push({
                id: `HOL_${h.holiday_type}`,
                originalId: h.id,
                name: `Phụ thu ${h.holiday_type_vi}`,
                category: 'OTHER',
                price: h.surcharge_daily,
                unit: 'Ngày',
                billingType: 'ONE_OFF',
                code: h.holiday_type
            });
        });

        return prices;
    },
    bulkUpsertPrices: async (list: ServicePrice[]) => { console.warn('Bulk upsert disabled in new schema', list); },
    upsertPrice: async (p: ServicePrice) => { console.warn('Upsert disabled in new schema', p); },
    deletePrice: async (id: string) => { console.warn('Delete disabled in new schema', id); },
    getUsage: async () => {
        const { data, error } = await supabase.from('service_usage').select('*').order('date', { ascending: false });
        if (error) throw error;
        return (data || []).map(d => ({
            id: d.id, residentId: d.resident_id, serviceId: d.service_id, serviceName: d.service_name,
            date: d.date, quantity: d.quantity, unitPrice: Number(d.unit_price),
            totalAmount: Number(d.total_amount), description: d.description, status: d.status
        })) as ServiceUsage[];
    },
    upsertUsage: async (u: ServiceUsage) => {
        const { error } = await supabase.from('service_usage').upsert({
            id: u.id, resident_id: u.residentId, service_id: u.serviceId, service_name: u.serviceName,
            date: u.date, quantity: u.quantity, unit_price: u.unitPrice,
            total_amount: u.totalAmount, description: u.description, status: u.status
        });
        if (error) throw error;
    }
};
