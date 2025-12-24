# FDC Nursing Home Management System (Hệ thống Quản lý Viện Dưỡng Lão)

This is a comprehensive web application designed for managing a Nursing Home facility (starting with Floor 3). Ideally suited for tablet usage by nursing staff, supervisors, and administrators.

## Features Implemented

### 1. Resident Management
- **Profile**: Detailed resident profiles with demographics, room allocation, and care levels.
- **Medical History**: Track diagnoses, allergies, and monitoring plans.
- **Assessments**: Admission and periodic health assessments.

### 2. Daily Operations
- **Shift Handover**: Structured handover reports between shifts (Morning -> Afternoon -> Night).
- **Incident Reporting**: Log and track incidents (falls, errors, etc.) with severity levels.
- **Schedule Management**: Staff scheduling and task assignment.

### 3. Medical Monitoring
- **Diabetes Monitoring**: Track blood sugar levels (4 times/day + Insulin). Visual charts for trends. High glucose alerts.
- **Vital Signs**: Regular vital sign logging (BP, HR, SpO2, Temp).
- **Weight Tracking**: Monthly weight recording, BMI calculation, and trend analysis.
- **Procedures**: Track medical procedures (dressing change, catheter, etc.) with billing integration.

### 4. Role-Based Dashboards
- **Doctor**: Medical alerts, recent admissions, critical care list.
- **Supervisor (Trưởng tầng)**: Staff overview, shift status, procedures summary.
- **Nurse**: Task lists, care logs.
- **Accountant**: Billing reports, inventory status.

### 5. Print Forms
- Printable PDF-friendly forms for:
  - Procedure Records (Phiếu theo dõi thủ thuật).
  - Weight Tracking (Phiếu theo dõi cân nặng).
  - Shift Handover (Biên bản giao ban).

## Technical Stack
- **Frontend**: React (Vite), TypeScript, TailwindCSS.
- **State Management**: Zustand.
- **Backend/Database**: Supabase (PostgreSQL).
- **Charts**: Recharts.
- **Deployment**: Netlify.

## Installation

1. Clone the repository.
2. Install dependencies: `npm install`.
3. Set up `.env` with Supabase URL and Key.
4. Run locally: `npm run dev`.

## Deployment
Changes are automatically deployed to Netlify on push to the `main` branch.

## Recent Updates (Dec 2024)
- Added Diabetes Monitoring Module.
- Added Medical Procedure Billing Grid.
- Added Weight Tracking and BMI Analysis.
- Enhanced Dashboard with Medical Alerts.
- Implemented Global Error Handling.
