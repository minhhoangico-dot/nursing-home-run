# Medication Module Redesign

**Date:** 2026-03-30

**Project:** FDC Nursing Home Management System

**Goal:** Redesign the resident medication module so doctors can prescribe and adjust medications quickly with minimal clicks, while nurses can reliably print both a single prescription and a daily active-medication summary that is easy to execute.

## Decisions Already Locked

- Primary user: doctor
- Secondary operational user: nurse
- Medication screen priority: show the active-medication summary first
- Medication workspace layout: summary on top, prescription cards below
- Prescription editing surface: full page, not modal or slide-over
- Prescription model in UI: one generic `đơn thuốc`, no prescription type/category field
- Duplicate active medicines from different prescriptions: keep separate rows and show source prescription
- Editing behavior: support both direct edit and duplicate-to-new, with duplicate-to-new as the safer default path
- Line-item start date: defaults to prescription creation date
- End date: calculated per medication line, not per prescription header
- Quantity and days supply: bidirectional calculation
- Drug search: searchable by medicine name or active ingredient
- Drug autocomplete result: primary line is medicine name; secondary line shows strength, active ingredient, and route
- Nursing printouts: emphasize medicine name only; active ingredient should not be the primary printed label
- Active-medication screen layout: one table with `Sáng / Trưa / Chiều / Tối` columns
- Active-medication print layout: split into `Sáng / Trưa / Chiều / Tối` sections for nursing execution

## Current Codebase Context

- The resident medication tab currently renders [src/features/prescriptions/components/PrescriptionList.tsx](C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/PrescriptionList.tsx), which combines:
  - a top section called `Thuốc đang dùng`
  - a modal entry point for prescribing
  - a history list for completed/cancelled prescriptions
- Prescription entry is currently a modal in [src/features/prescriptions/components/PrescriptionForm.tsx](C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/PrescriptionForm.tsx).
- Drug catalog management is currently a modal in [src/features/prescriptions/components/MedicineManager.tsx](C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/MedicineManager.tsx).
- The prescription store in [src/stores/prescriptionStore.ts](C:/Users/Minh/Desktop/VDL/src/stores/prescriptionStore.ts) currently supports only create, fetch, complete, cancel, and simple medicine CRUD.
- The current medical types in [src/types/medical.ts](C:/Users/Minh/Desktop/VDL/src/types/medical.ts) keep key dosing concepts collapsed into broad string fields such as `dosage` and `frequency`.
- Printing is currently handled in [src/features/prescriptions/utils/printTemplates.ts](C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/printTemplates.ts), with:
  - one single-prescription print
  - one daily medication sheet print
- The current print layouts do not yet match the intended nursing-facing workflow or the approved simplified medicine-name-first display rule.

## User And Workflow Context

The medication module serves a nursing-home workflow with approximately 50-100 active residents. A single resident may have multiple concurrent prescriptions, such as:

- a chronic internal-medicine prescription
- a specialist-adjusted prescription
- a supplement or short-term supportive prescription

Doctors need to:

- see what the resident is actively taking right now
- create a new prescription quickly
- adjust medications frequently without retyping old content
- duplicate a previous prescription to make a safer revision

Nurses need to:

- print a clean per-prescription form when needed
- print one operational summary of all currently active medications
- avoid confusion from active-ingredient-heavy displays

## UX Principles

1. Put the operational summary before the document history.
2. Keep the prescribing flow linear and page-based rather than modal-driven.
3. Favor autocomplete, defaults, and keyboard-friendly tab order over dense manual entry.
4. Keep the resident medication workspace understandable at a glance on both desktop and tablet.
5. Preserve prescription-level traceability even when showing an aggregated active-medication summary.
6. Do not over-structure the prescription header with fields the workflow does not need.

## Medication Workspace Design

The resident `Thuốc` tab should become a dedicated medication workspace rather than a mixed modal launcher.

### Screen structure

Top to bottom:

1. action bar
2. active-medication summary table
3. active prescription cards
4. paused/completed prescription history

### Action bar

The action bar should expose the few actions that matter most:

- `Kê đơn mới`
- `In tổng hợp thuốc đang dùng`
- `Danh mục thuốc`

This keeps the top of the screen operational and doctor-oriented.

### Active-medication summary table

This is the first thing the user sees.

Each row represents one active medication line, not one prescription and not a merged medicine identity across prescriptions.

Columns:

- `Tên thuốc`
- `Liều dùng`
- `Sáng`
- `Trưa`
- `Chiều`
- `Tối`
- `Ghi chú`
- `Kê từ đơn`
- `Bắt đầu`
- `Kết thúc`
- `Cảnh báo`

Behavior:

- if the same medicine name exists in two active prescriptions, render two rows
- always show the source prescription code or identifier
- mark medications that are near end date as `sắp hết`
- surface expired or inconsistent lines to the doctor, but keep the table focused on lines currently considered active

### Prescription cards

Below the summary table, show each active prescription as a card.

Each card should display:

- prescription code
- prescribing doctor
- prescription date
- number of medication lines
- status
- summary warning badges such as `có thuốc sắp hết`

Primary card actions:

- `Sửa`
- `Nhân bản`
- `Tạm ngưng` or `Kết thúc`
- `In đơn`

The card view keeps multi-prescription workflows understandable without forcing the user into a table-first mental model.

### History section

Paused and completed prescriptions should remain visible but visually secondary.

The history section should favor:

- quick review
- re-printing
- duplicate-as-new

It should not compete visually with currently active care.

## Drug Master List Design

The system should maintain a drug master list that powers autocomplete and default values.

### Stored catalog fields

The catalog should support at least:

- medicine display name
- active ingredient
- strength
- unit
- route
- drug group
- default dose hint
- default frequency hint

### Search behavior

Autocomplete must match against:

- medicine name
- active ingredient

### Result rendering

Autocomplete results should show:

- line 1: medicine name
- line 2: strength, active ingredient, and route

This keeps the doctor-oriented selection safe without making nursing output complex.

### Quick add

If the desired medicine is missing, the prescribing flow should allow a lightweight `add to master list` action without fully leaving the workflow context.

The recommended pattern is:

- trigger quick add from the prescription page
- open a short form
- save and return to the same medication row

## Prescription Page Design

Prescription creation and editing should move to a full page rather than a modal.

### Routes

Recommended routes:

- `/residents/:residentId/medications/new`
- `/residents/:residentId/medications/:prescriptionId/edit`
- `/residents/:residentId/medications/:prescriptionId/duplicate`

### Header block

The top of the prescription page should show resident context clearly:

- resident name
- room/bed
- age
- allergy summary
- quick link back to the medication workspace

### Prescription header fields

Keep the header simple:

- prescription code
- prescription date
- prescribing doctor
- overall notes

Do not add a prescription type/category field.

### Medication line editor

Each medication line should support:

- medicine selector
- dose per administration
- administrations per day
- time-of-day toggles: `Sáng`, `Trưa`, `Chiều`, `Tối`
- special instructions
- quantity dispensed
- days supply
- start date
- end date
- `dùng liên tục`

### Entry and navigation speed

The page should optimize for speed:

- selecting the first matching autocomplete item with keyboard
- predictable tab order across columns
- add-line and duplicate-line actions
- prefilled defaults from the selected drug catalog row where available

## Prescription Editing Behavior

The system should support both editing paths.

### Direct edit

Use when:

- fixing small mistakes
- correcting data that should not create a new therapeutic version

### Duplicate to new

Use when:

- adjusting an active regimen
- changing doses or times substantially
- replacing an old prescription with a revised one

Recommended behavior:

1. duplicate the selected prescription into a new editable draft
2. let the doctor modify the new version
3. when saving the new prescription as active, ask whether to:
   - end the previous prescription
   - pause the previous prescription
   - keep both active

This preserves history while still supporting real-world overlap when needed.

## Data Model Design

The current model should be made more explicit so calculations are stable and summary generation is deterministic.

### Prescription header

Recommended header shape:

- `id`
- `code`
- `residentId`
- `doctorId`
- `doctorName`
- `prescriptionDate`
- `status`
- `notes`

### Prescription item

Recommended line-item shape:

- `id`
- `prescriptionId`
- `medicineId`
- `medicineName`
- `activeIngredientSnapshot`
- `strengthSnapshot`
- `routeSnapshot`
- `dosePerTime`
- `timesPerDay`
- `timesOfDay`
- `specialInstructions`
- `quantityDispensed`
- `daysSupply`
- `startDate`
- `endDate`
- `isContinuous`

### Snapshot rule

Prescription items must snapshot the visible prescribing data at the time of prescribing. Historical prescriptions should not change their printed or visible content when the master list changes later.

## Calculation Contract

The system should not try to derive dates from a vague free-text `dosage` string alone.

Instead, the calculation contract should be explicit.

### Defaults

- `startDate` defaults to the prescription creation date
- `endDate` is per line item

### Bidirectional relationship

The UI should allow editing either:

- quantity dispensed
- days supply

and recalculate the other value using the dosing structure.

### Continuous use

If `dùng liên tục` is enabled:

- end date is unset or visually treated as open-ended
- days supply may be blank or informational only
- the line remains active until the doctor changes or ends it

## Active-Medication Summary Rules

The summary table and the nursing summary print should be built from active medication lines, not from prescription headers alone.

### A line is active when

- the parent prescription is `Đang dùng`
- and one of the following is true:
  - `isContinuous = true`
  - `endDate` is today or in the future

### A line is not active when

- the parent prescription is `Tạm ngưng`
- the parent prescription is `Đã kết thúc`
- or the line is past its end date and not continuous

### Expiry visibility

The workspace should still alert the doctor about medication lines that are close to expiry or recently expired, but those expired lines should not stay in the operational nursing summary as if they were current medications.

## Print Design

The module should support two print modes with different operational goals.

### Print mode A: single prescription

Purpose:

- print one prescription document
- preserve prescription-level context
- support charting and review

Layout goals:

- facility header
- resident information
- prescription metadata
- medicine list from that prescription only
- doctor signature area

Medicine row style:

- primary label: medicine name
- secondary label: concise dose/frequency/time/instruction summary
- quantity shown clearly

The print should remain close to the approved prescription sample layout, but the medication naming should favor nursing comprehension.

### Print mode B: active-medication summary

Purpose:

- operational print for nursing medication administration

Layout:

- four sections:
  - `Sáng`
  - `Trưa`
  - `Chiều`
  - `Tối`

Within each section, list only the medications that belong to that administration time.

Each line should show:

- medicine name
- concise dose summary
- special instruction if relevant
- source prescription in smaller supporting text

Important rule:

- do not merge same-named medications from different prescriptions

This makes the printout function like a daily medication distribution sheet while keeping traceability.

## Status Model

Prescription statuses should remain simple:

- `Đang dùng`
- `Tạm ngưng`
- `Đã kết thúc`

Behavior:

- only `Đang dùng` prescriptions contribute to active summary output
- `Tạm ngưng` and `Đã kết thúc` stay visible in the lower card/history sections

The redesign should not introduce a separate prescription-type taxonomy.

## Responsive Behavior

The module must work well on tablet.

### Desktop/tablet priorities

- wide summary table on larger screens
- clear card actions without hover-only dependency
- stable line editor widths for fast entry

### Mobile/tablet adaptation

- summary table can collapse into stacked cards on narrow screens
- prescription cards remain easy to tap
- sticky bottom action bar on the prescription page helps save and print quickly

## Component And Store Boundaries

Recommended component responsibilities:

- [src/features/prescriptions/components/PrescriptionList.tsx](C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/PrescriptionList.tsx)
  - becomes the medication workspace shell inside resident detail
- new summary-table component
  - active medication aggregation and rendering
- refactored prescription-page component
  - full-page create/edit/duplicate workflow
- refactored medicine manager
  - shared catalog UI for settings and quick-add flows
- refactored print helpers
  - one helper per print mode

Recommended store additions:

- update prescription
- duplicate prescription
- pause prescription
- compute resident active-medication summary
- quick create medicine

## Error Handling And Validation

### Prescribing-time

- do not allow saving a line without a selected medicine name
- if the calculation inputs are incomplete, show the missing field clearly
- if quantity/days cannot be reconciled from the current dose structure, require manual confirmation

### Summary-time

- missing optional metadata must not break summary generation
- unknown route or missing strength should degrade gracefully in the autocomplete secondary line

### Print-time

- null or missing optional fields should render blank, not crash
- the nursing summary print must still render if one line has partial metadata

## Testing Strategy

### Unit-level

- quantity and days-supply bidirectional calculations
- end-date calculation from line-level inputs
- active-line filtering rules
- non-merging of same-name medicines across prescriptions
- grouping into `Sáng / Trưa / Chiều / Tối`

### Component-level

- autocomplete search by medicine name
- autocomplete search by active ingredient
- correct secondary rendering of strength/active ingredient/route
- prescription page line editing flow
- duplicate-prescription workflow

### Print-level

- single prescription print with name-first medication rows
- active summary print grouped into four sections
- active summary preserving separate rows for same-name medicines from different prescriptions

## Non-Goals

- no prescription type taxonomy
- no nurse-facing active-ingredient-heavy print layout
- no forced merge of medications across prescriptions
- no modal-first prescribing workflow
- no redesign of unrelated resident-detail modules in this change

## Success Criteria

- Doctors can see the current active-medication picture immediately on entering the medication tab.
- Doctors can create, edit, and duplicate prescriptions from a full-page workflow with minimal clicks.
- Nurses can print a single prescription and a daily active-medication summary from the same module.
- Drug autocomplete is fast, searchable by name or active ingredient, and reduces wrong selections with a strong secondary line.
- Same-name medicines from different active prescriptions remain operationally distinct in summaries and prints.
- The module works cleanly on tablet without depending on desktop-only hover behavior.
