import type {
  Incident,
  Prescription,
  ProcedureRecord,
  Resident,
  Role,
  ServiceUsage,
} from '@/src/types';
import type { DailyMonitoringRecord } from '@/src/types/dailyMonitoring';
import { buildActiveMedicationSummary } from '@/src/features/prescriptions/utils/activeMedicationSummary';

export type DashboardTone = 'info' | 'warning' | 'danger' | 'success';

export interface DashboardCard {
  label: string;
  value: number | string;
  caption: string;
  tone: DashboardTone;
}

export interface DashboardAlert {
  title: string;
  body: string;
  to: string;
  tone: DashboardTone;
}

export interface DashboardAction {
  label: string;
  to: string;
}

export interface TodayDashboardSummary {
  title: string;
  subtitle: string;
  cards: DashboardCard[];
  alerts: DashboardAlert[];
  actions: DashboardAction[];
}

export interface TodayDashboardInput {
  role: Role;
  today: string;
  residents: Resident[];
  dailyRecords: DailyMonitoringRecord[];
  procedureRecords: ProcedureRecord[];
  incidents: Incident[];
  usageRecords: ServiceUsage[];
  prescriptions: Prescription[];
}

const ROLE_TITLES: Record<Role, string> = {
  ADMIN: 'Tổng quan hôm nay',
  DOCTOR: 'Bảng theo dõi Bác sĩ',
  SUPERVISOR: 'Bảng điều phối Trưởng tầng',
  ACCOUNTANT: 'Bảng công việc Kế toán',
  NURSE: 'Bảng công việc Điều dưỡng',
  CAREGIVER: 'Bảng công việc Hộ lý',
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);

const getActiveResidents = (residents: Resident[]) =>
  residents.filter((resident) => resident.status === 'Active');

const hasAnyProcedure = (record: ProcedureRecord) =>
  [
    record.injectionCount,
    record.ivDripCount,
    record.gastricTubeCount,
    record.urinaryCatheterCount,
    record.bladderWashCount,
    record.bloodSugarTestCount,
    record.bloodPressureCount,
    record.oxygenTherapyCount,
    record.woundDressingCount,
  ].some((count) => (count ?? 0) > 0) ||
  [
    record.injection,
    record.ivDrip,
    record.gastricTube,
    record.urinaryCatheter,
    record.bladderWash,
    record.bloodSugarTest,
    record.bloodPressure,
    record.oxygenTherapy,
    record.woundDressing,
  ].some(Boolean);

const isClinicalRecordAlert = (record: DailyMonitoringRecord) =>
  (record.blood_sugar ?? 0) >= 180 ||
  (record.temperature ?? 0) >= 38 ||
  (record.sp02 ?? 100) < 94;

const findResidentName = (residents: Resident[], residentId: string) =>
  residents.find((resident) => resident.id === residentId)?.name ?? residentId;

const getSharedMetrics = (input: TodayDashboardInput) => {
  const activeResidents = getActiveResidents(input.residents);
  const todayRecordResidentIds = new Set(
    input.dailyRecords
      .filter((record) => record.record_date === input.today)
      .map((record) => record.resident_id),
  );
  const missingVitalsResidents = activeResidents.filter(
    (resident) => !todayRecordResidentIds.has(resident.id),
  );
  const todayProcedures = input.procedureRecords.filter(
    (record) => record.recordDate === input.today && hasAnyProcedure(record),
  );
  const todayIncidents = input.incidents.filter((incident) => incident.date === input.today);
  const openIncidents = input.incidents.filter(
    (incident) => incident.status === 'New' || incident.status === 'Investigating',
  );
  const debtResidents = input.residents.filter((resident) => resident.balance < 0);
  const unbilledUsage = input.usageRecords.filter((usage) => usage.status === 'Unbilled');
  const activePrescriptions = input.prescriptions.filter(
    (prescription) => prescription.status === 'Active',
  );

  return {
    activeResidents,
    missingVitalsResidents,
    todayProcedures,
    todayIncidents,
    openIncidents,
    debtResidents,
    unbilledUsage,
    activePrescriptions,
  };
};

const buildNurseSummary = (
  input: TodayDashboardInput,
  metrics: ReturnType<typeof getSharedMetrics>,
): TodayDashboardSummary => ({
  title: ROLE_TITLES.NURSE,
  subtitle: 'Ưu tiên nhập liệu chăm sóc trong ca hôm nay.',
  cards: [
    {
      label: 'NCT đang chăm sóc',
      value: metrics.activeResidents.length,
      caption: 'Hồ sơ đang hoạt động',
      tone: 'info',
    },
    {
      label: 'Chưa nhập chỉ số',
      value: metrics.missingVitalsResidents.length,
      caption: 'Cần hoàn tất trong ngày',
      tone: metrics.missingVitalsResidents.length ? 'warning' : 'success',
    },
    {
      label: 'Thủ thuật hôm nay',
      value: metrics.todayProcedures.length,
      caption: 'Bản ghi đã phát sinh',
      tone: 'info',
    },
  ],
  alerts: metrics.missingVitalsResidents.slice(0, 5).map((resident) => ({
    title: `${resident.name} chưa có chỉ số hôm nay`,
    body: `Phòng ${resident.room}, giường ${resident.bed}`,
    to: '/daily-monitoring',
    tone: 'warning',
  })),
  actions: [
    { label: 'Nhập chỉ số', to: '/daily-monitoring' },
    { label: 'Cập nhật thủ thuật', to: '/procedures' },
    { label: 'Xem dinh dưỡng', to: '/nutrition' },
  ],
});

const buildDoctorSummary = (
  input: TodayDashboardInput,
  metrics: ReturnType<typeof getSharedMetrics>,
): TodayDashboardSummary => {
  const clinicalAlerts = input.dailyRecords.filter(
    (record) => record.record_date === input.today && isClinicalRecordAlert(record),
  );
  const activeMedicationRows = buildActiveMedicationSummary(metrics.activePrescriptions, {
    asOfDate: input.today,
  });
  const nearEndRows = activeMedicationRows.filter((row) => row.isNearingEndDate);

  return {
    title: ROLE_TITLES.DOCTOR,
    subtitle: 'Theo dõi cảnh báo lâm sàng và thuốc đang hiệu lực.',
    cards: [
      {
        label: 'Cảnh báo lâm sàng',
        value: clinicalAlerts.length,
        caption: 'Đường huyết, SpO2 hoặc nhiệt độ',
        tone: clinicalAlerts.length ? 'danger' : 'success',
      },
      {
        label: 'Thuốc sắp hết',
        value: nearEndRows.length,
        caption: 'Trong 7 ngày tới',
        tone: nearEndRows.length ? 'warning' : 'success',
      },
      {
        label: 'Đơn đang dùng',
        value: metrics.activePrescriptions.length,
        caption: 'Đơn thuốc Active',
        tone: 'info',
      },
    ],
    alerts: [
      ...clinicalAlerts.slice(0, 5).map((record) => ({
        title: `Đường huyết hoặc sinh hiệu cần xem: ${findResidentName(input.residents, record.resident_id)}`,
        body: `Đường huyết ${record.blood_sugar ?? '-'}, nhiệt độ ${record.temperature ?? '-'}, SpO2 ${record.sp02 ?? '-'}`,
        to: `/residents/${record.resident_id}`,
        tone: 'danger' as const,
      })),
      ...nearEndRows.slice(0, 5).map((row) => {
        const sourcePrescription = metrics.activePrescriptions.find(
          (prescription) => prescription.id === row.sourcePrescriptionId,
        );

        return {
          title: `${row.medicineName} sắp hết`,
          body: `${row.sourcePrescriptionCode} kết thúc ${row.sourcePrescriptionEndDate ?? 'chưa rõ'}`,
          to: sourcePrescription ? `/residents/${sourcePrescription.residentId}` : '/medications',
          tone: 'warning' as const,
        };
      }),
    ],
    actions: [
      { label: 'Xem hồ sơ NCT', to: '/residents' },
      { label: 'Theo dõi ngày', to: '/daily-monitoring' },
      { label: 'Thuốc đang dùng', to: '/medications' },
    ],
  };
};

const buildSupervisorSummary = (
  input: TodayDashboardInput,
  metrics: ReturnType<typeof getSharedMetrics>,
): TodayDashboardSummary => ({
  title: ROLE_TITLES.SUPERVISOR,
  subtitle: 'Theo dõi sự cố, nhập liệu và khối lượng chăm sóc trong ngày.',
  cards: [
    {
      label: 'Sự cố mới',
      value: metrics.todayIncidents.filter((incident) => incident.status === 'New').length,
      caption: 'Phát sinh hôm nay',
      tone: metrics.todayIncidents.length ? 'danger' : 'success',
    },
    {
      label: 'Sự cố đang xử lý',
      value: metrics.openIncidents.length,
      caption: 'New hoặc Investigating',
      tone: metrics.openIncidents.length ? 'warning' : 'success',
    },
    {
      label: 'Chưa nhập chỉ số',
      value: metrics.missingVitalsResidents.length,
      caption: 'Cần nhắc ca trực',
      tone: metrics.missingVitalsResidents.length ? 'warning' : 'success',
    },
  ],
  alerts: metrics.openIncidents.slice(0, 5).map((incident) => ({
    title: `${incident.severity} - ${incident.type}`,
    body: `${incident.residentName ?? 'Không rõ NCT'} tại ${incident.location}`,
    to: '/incidents',
    tone: incident.severity === 'High' || incident.severity === 'Critical' ? 'danger' : 'warning',
  })),
  actions: [
    { label: 'Xem sự cố', to: '/incidents' },
    { label: 'Sơ đồ phòng', to: '/rooms' },
    { label: 'Theo dõi ngày', to: '/daily-monitoring' },
  ],
});

const buildAccountantSummary = (
  input: TodayDashboardInput,
  metrics: ReturnType<typeof getSharedMetrics>,
): TodayDashboardSummary => {
  const totalDebt = metrics.debtResidents.reduce(
    (sum, resident) => sum + Math.abs(resident.balance),
    0,
  );

  return {
    title: ROLE_TITLES.ACCOUNTANT,
    subtitle: 'Theo dõi công nợ và dịch vụ phát sinh chưa chốt.',
    cards: [
      {
        label: 'NCT đang nợ',
        value: metrics.debtResidents.length,
        caption: formatCurrency(totalDebt),
        tone: metrics.debtResidents.length ? 'danger' : 'success',
      },
      {
        label: 'Dịch vụ chưa chốt',
        value: metrics.unbilledUsage.length,
        caption: 'Cần rà soát trước khi lập phiếu',
        tone: metrics.unbilledUsage.length ? 'warning' : 'success',
      },
      {
        label: 'Phát sinh hôm nay',
        value: metrics.unbilledUsage.filter((usage) => usage.date.slice(0, 10) === input.today).length,
        caption: 'Bản ghi chưa xuất hóa đơn',
        tone: 'info',
      },
    ],
    alerts: metrics.debtResidents.slice(0, 5).map((resident) => ({
      title: `${resident.name} đang nợ ${formatCurrency(Math.abs(resident.balance))}`,
      body: `Phòng ${resident.room}, người nhà ${resident.guardianName}`,
      to: `/residents/${resident.id}`,
      tone: 'danger',
    })),
    actions: [
      { label: 'Mở tài chính', to: '/finance' },
      { label: 'Xem hồ sơ NCT', to: '/residents' },
    ],
  };
};

export function buildTodayDashboard(input: TodayDashboardInput): TodayDashboardSummary {
  const metrics = getSharedMetrics(input);

  if (input.role === 'NURSE' || input.role === 'CAREGIVER') {
    return buildNurseSummary(input, metrics);
  }

  if (input.role === 'DOCTOR') {
    return buildDoctorSummary(input, metrics);
  }

  if (input.role === 'ACCOUNTANT') {
    return buildAccountantSummary(input, metrics);
  }

  return buildSupervisorSummary(input, metrics);
}
