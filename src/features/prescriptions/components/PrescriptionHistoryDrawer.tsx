import React from 'react';
import { X } from 'lucide-react';
import type { PrescriptionSnapshot } from '../../../types';

interface PrescriptionHistoryDrawerProps {
  open: boolean;
  snapshots: PrescriptionSnapshot[];
  onClose: () => void;
}

const readItemName = (item: Record<string, unknown>) =>
  String(item.medicine_name ?? item.medicineName ?? item.name ?? '');

const readItemDosage = (item: Record<string, unknown>) =>
  String(item.dosage ?? item.frequency ?? '');

export function PrescriptionHistoryDrawer({
  open,
  snapshots,
  onClose,
}: PrescriptionHistoryDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-black/40">
      <div className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Lich su dieu chinh</h3>
            <p className="mt-1 text-sm text-slate-500">Cac phien ban da luu truoc moi lan thay doi</p>
          </div>
          <button
            type="button"
            aria-label="Dong lich su"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {snapshots.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
              Chua co phien ban lich su
            </div>
          ) : (
            snapshots.map((snapshot) => {
              const items = Array.isArray(snapshot.itemsPayload) ? snapshot.itemsPayload : [];

              return (
                <section key={snapshot.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">Phien ban {snapshot.version}</div>
                      <div className="text-sm text-slate-500">
                        {snapshot.actor || 'Unknown'} - {new Date(snapshot.snapshotAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                    {snapshot.changeReason && (
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                        {snapshot.changeReason}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 text-sm text-slate-700">
                    <span className="font-medium">Chan doan:</span>{' '}
                    {String(snapshot.headerPayload?.diagnosis ?? '') || 'Khong co'}
                  </div>

                  <div className="mt-3 space-y-2">
                    {items.map((item, index) => {
                      const row = item as Record<string, unknown>;
                      return (
                        <div key={`${snapshot.id}-${index}`} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                          <div className="font-medium">{readItemName(row)}</div>
                          <div className="text-slate-500">{readItemDosage(row)}</div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
