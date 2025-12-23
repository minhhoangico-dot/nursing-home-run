export const calculateCareLevel = (score: number): 1 | 2 | 3 | 4 => {
  if (score <= 10) return 1;
  if (score <= 20) return 2;
  if (score <= 30) return 3;
  return 4;
};

export const getCareLevelDescription = (level: number): string => {
  switch (level) {
    case 1: return 'Tự phục vụ hoàn toàn';
    case 2: return 'Hỗ trợ một phần sinh hoạt';
    case 3: return 'Hỗ trợ thường xuyên';
    case 4: return 'Chăm sóc toàn diện 24/7';
    default: return 'Chưa xác định';
  }
};

export const getCareLevelColor = (level: number): string => {
  switch (level) {
    case 1: return 'bg-green-100 text-green-700 border-green-200';
    case 2: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 3: return 'bg-orange-100 text-orange-700 border-orange-200';
    case 4: return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-slate-100 text-slate-600';
  }
};