import type { ModuleKey } from '@/src/types/appSettings';

const messages: Record<ModuleKey, { title: string; body: string }> = {
  finance: {
    title: 'Không có quyền truy cập Tài chính',
    body: 'Vai trò hiện tại không có quyền xem module tài chính.',
  },
  residents: {
    title: 'Không có quyền truy cập Hồ sơ NCT',
    body: 'Bạn chỉ có thể mở hồ sơ này khi role được cấp quyền module.',
  },
  rooms: {
    title: 'Không có quyền truy cập Sơ đồ phòng',
    body: 'Role hiện tại không được mở module phòng ở.',
  },
  visitors: {
    title: 'Không có quyền truy cập',
    body: 'Module này đang bị ẩn với role hiện tại.',
  },
  dailyMonitoring: {
    title: 'Không có quyền truy cập',
    body: 'Module này đang bị ẩn với role hiện tại.',
  },
  medications: {
    title: 'Không có quyền truy cập Thuốc',
    body: 'Role hiện tại không được mở quy trình đơn thuốc và thuốc đang dùng.',
  },
  procedures: {
    title: 'Không có quyền truy cập',
    body: 'Module này đang bị ẩn với role hiện tại.',
  },
  nutrition: {
    title: 'Không có quyền truy cập',
    body: 'Module này đang bị ẩn với role hiện tại.',
  },
  maintenance: {
    title: 'Không có quyền truy cập',
    body: 'Module này đang bị ẩn với role hiện tại.',
  },
  incidents: {
    title: 'Không có quyền truy cập',
    body: 'Module này đang bị ẩn với role hiện tại.',
  },
  forms: {
    title: 'Không có quyền truy cập',
    body: 'Module này đang bị ẩn với role hiện tại.',
  },
  weightTracking: {
    title: 'Không có quyền truy cập',
    body: 'Module này đang bị ẩn với role hiện tại.',
  },
  settings: {
    title: 'Không có quyền truy cập',
    body: 'Chỉ ADMIN được mở khu vực cài đặt.',
  },
};

export const RestrictedAccessPanel = ({ moduleKey }: { moduleKey: ModuleKey }) => {
  const message = messages[moduleKey];

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500">
      <h2 className="text-2xl font-bold mb-2">{message.title}</h2>
      <p>{message.body}</p>
    </div>
  );
};
