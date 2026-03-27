# Medicine Catalog From HIS Design

**Date:** 2026-03-27

**Project:** FDC Nursing Home Management System

**Goal:** Add a medicine catalog management surface under system settings, seed it once from HIS, use that internal catalog as the single source of truth for prescribing, and print prescriptions in a layout that closely matches the provided sample.

## Decisions Already Locked

- Medicine catalog location: `Settings > Danh muc thuoc`
- HIS sync model: one-time import only
- Post-import ownership: Supabase `medicines` table becomes the only source of truth
- Ongoing catalog maintenance: manual create/edit inside the app
- Required imported fields: active ingredient, trade name, unit, route, code
- Display-name rule: always render as `active ingredient (trade name)`
- Prescription print target: near-full A4 layout match to the provided sample
- Missing patient or facility fields on the print form: keep the row and print blank values
- HIS import execution: external script on an internal machine or bastion, not from the production UI

## Current Codebase Context

- Settings currently expose only users, pricing, and facility info in [src/features/settings/pages/SettingsPage.tsx](C:/Users/Minh/Desktop/VDL/src/features/settings/pages/SettingsPage.tsx).
- Medicine management exists today only as a modal launched from the resident prescription surface in [src/features/prescriptions/components/PrescriptionList.tsx](C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/PrescriptionList.tsx) and implemented in [src/features/prescriptions/components/MedicineManager.tsx](C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/MedicineManager.tsx).
- Prescription form suggestions currently read from `usePrescriptionsStore().medicines` and use `medicine.name` as the freeform display string in [src/features/prescriptions/components/PrescriptionForm.tsx](C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/PrescriptionForm.tsx).
- The current printable prescription template is a simple table layout in [src/features/prescriptions/utils/printTemplates.ts](C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/printTemplates.ts) and does not match the required sample.
- The current `medicines` shape only stores `name`, `active_ingredient`, `unit`, `default_dosage`, and `price` in [src/stores/prescriptionStore.ts](C:/Users/Minh/Desktop/VDL/src/stores/prescriptionStore.ts) and [src/types/medical.ts](C:/Users/Minh/Desktop/VDL/src/types/medical.ts).

## HIS Source Findings

Direct inspection of the provided read-only PostgreSQL endpoint showed:

- `public.tb_dm_03_danhmucthuoc` is present but empty in this environment.
- `public.tb_service` contains live drug-like rows and is the practical one-time import source.
- The relevant columns from `tb_service` are:
  - `servicecode`: code
  - `servicename`: trade name
  - `listmedicinehoatchat`: active ingredient
  - `serviceunit`: unit
  - `dm_medicine_duongdung`: route
  - optional helper columns: `serviceid`, `medicine_hamluong`, `medicine_quycachdonggoi`

Observed data quality:

- ~794 usable medicine codes remain after filtering out empty or obviously invalid rows.
- `servicecode` is not globally unique at the raw-row level.
- Only 21 codes produce multiple distinct signatures after reducing rows to `(trade_name, active_name, unit, route)`.
- Only 2 latest-by-code records are missing a route.
- `serviceunit` is materially better populated than `donvisudung` and should be the imported unit source.

## Recommended Data Model

The `medicines` table should be expanded so the app can preserve source fields and derive the display label consistently.

### Stored fields

- `id`: existing internal UUID
- `code`: imported HIS code or manually assigned internal code
- `name`: canonical display name, always derived as `active_ingredient (trade_name)`
- `trade_name`: source trade name
- `active_ingredient`: source active ingredient
- `unit`: source or manually maintained unit
- `route`: source or manually maintained route
- `default_dosage`: optional prescribing helper, unchanged
- `price`: optional finance helper, unchanged
- `source`: enum-like text, `HIS_IMPORT` or `MANUAL`
- `his_service_id`: nullable source trace field from HIS
- `created_at`: existing
- `updated_at`: new or standardized

### Derived-name contract

`name` should never be edited directly by the user. It should be regenerated whenever `trade_name` or `active_ingredient` changes.

Rules:

1. If both values exist, format `active_ingredient (trade_name)`.
2. If only `active_ingredient` exists, use it.
3. If only `trade_name` exists, use it.
4. Trim whitespace and collapse obvious empty punctuation cases.

This keeps prescribing, searching, and printing aligned with the sample prescription format.

## One-Time HIS Import Design

The import must be an explicit external operation, not an in-app button.

### Script

Add `scripts/import-his-medicines.mjs`.

Responsibilities:

- connect to HIS PostgreSQL with read-only credentials from environment variables
- query `public.tb_service`
- normalize source rows
- deduplicate by `servicecode`
- write conflict diagnostics for ambiguous codes
- upsert clean rows into Supabase `medicines`

### Query and filtering

Import candidates must satisfy:

- non-empty `servicecode`
- non-empty `servicename`
- non-empty `listmedicinehoatchat`
- active ingredient is not a known junk placeholder such as `.`

### Deduplication

Use this two-step strategy:

1. Normalize each row into `(code, trade_name, active_ingredient, unit, route, serviceid)`.
2. Select the newest row per `code` using highest `serviceid`.

For codes with more than one distinct signature:

- still select the newest row for import
- also write the full competing records to a conflict report file

This design keeps the import deterministic while leaving an audit trail for the 21 known ambiguous codes.

### CLI behavior

The script should support:

- `--dry-run`: print summary counts and produce conflict output without writing to Supabase
- `--apply`: perform the upsert
- optional output path for the conflict report

### Security

- do not store HIS or Supabase secrets in the repository
- do not embed credentials into docs or code
- the script must read credentials from environment variables only

## Settings UI Design

System settings should gain a new top-level card for the medicine catalog in [src/features/settings/pages/SettingsPage.tsx](C:/Users/Minh/Desktop/VDL/src/features/settings/pages/SettingsPage.tsx).

### Menu entry

Add a new settings tile:

- title: `Danh muc thuoc`
- description: internal prescribing catalog seeded once from HIS

### Catalog page

The catalog management screen should move from the current resident modal into the settings section.

Core behaviors:

- searchable list by code, active ingredient, trade name, and derived display name
- columns:
  - code
  - display name
  - trade name
  - unit
  - route
  - source
- add manual medicine
- edit existing medicine
- optionally delete manually added medicines

The old resident-level launch button should either:

- open the same shared settings-grade manager component, or
- be removed in favor of managing the catalog only in settings

The recommended path is to reuse one shared manager component but mount it from settings as the primary home.

### Source badge

Show source clearly:

- `HIS` for imported rows
- `Manual` for rows added later in the app

This is helpful because the user explicitly wants one-time seeding followed by manual maintenance.

## Prescription Form Design

The prescribing flow in [src/features/prescriptions/components/PrescriptionForm.tsx](C:/Users/Minh/Desktop/VDL/src/features/prescriptions/components/PrescriptionForm.tsx) should consume the new catalog model.

### Selection behavior

- Suggestions should come from `medicines`
- The visible suggestion text should be `medicine.name`
- Selecting a medicine should snapshot:
  - `medicineId`
  - `medicineName` as the derived display name

### Optional autofill

If available, the selected catalog row may also prefill:

- unit-aware dosage hints
- route reference for future UX use

But route does not need to be shown in the prescription item editor yet unless it helps the print layout.

### Snapshot rule

`prescription_items.medicine_name` must remain a literal snapshot string. Historical prescriptions should not change visually if the catalog entry is edited later.

## Prescription Print Design

The prescription printout in [src/features/prescriptions/utils/printTemplates.ts](C:/Users/Minh/Desktop/VDL/src/features/prescriptions/utils/printTemplates.ts) should be replaced with a layout that mirrors the provided sample rather than the current table-centric output.

### Required layout blocks

1. Facility header
2. Barcode or barcode placeholder area on the right
3. Centered `DON THUOC` title
4. Patient identity block
5. Diagnosis row
6. Medicine list with quantity and unit on the right
7. Follow-up date block
8. Notes and reminders block
9. Clinician contact block
10. Signature block with date

### Data behavior

- Facility header uses system facility settings.
- Add `website` to facility settings so the print header can match the sample more closely.
- Patient fields already present should print as-is.
- Missing fields should keep their labels and print blank values.
- `notes` on the prescription header map to the advice or reminder section unless future structured fields are added.

### Medicine-row formatting

Each medicine item should render as:

- line 1: bold `medicineName`
- line 2: italic instructions and usage summary
- right side: quantity and unit

This is intentionally closer to the sample than the current table with dosage and frequency in separate columns.

### Out-of-scope structured fields

The following are not required to become first-class stored fields in this change:

- CCCD or passport
- insurance number
- current address
- weight
- follow-up date
- doctor phone

If those values already exist in current app state, print them. Otherwise keep the printed line but leave the value blank.

## Error Handling

### Import-time

- If HIS connection fails, stop without partial writes.
- If Supabase write fails, surface the failing row count and keep the conflict report.
- If no valid rows are found, abort and report that the HIS query source may be wrong for the target environment.

### UI-time

- Validate manual medicine edits so code, trade name, active ingredient, and unit cannot all be empty or malformed.
- Prevent deleting a medicine still referenced by prescription items, or degrade to soft constraints if deletion is business-approved later.

### Print-time

- Missing optional values must not crash the template.
- Template helpers should coerce nullish values to empty strings.

## Testing Strategy

### Import tests

- row normalization from HIS shape to app shape
- derived display-name generation
- dedupe by newest `serviceid` per code
- conflict-report generation for multi-signature codes
- filtering out junk rows

### App tests

- medicine manager create and edit behavior
- search over code, active ingredient, trade name, and display name
- prescription form selection snapshots the display name correctly

### Print tests

- full-data case
- missing optional patient fields
- medicine rows with long instructions
- medicine rows with missing quantity or missing unit

## Non-Goals

- no recurring HIS synchronization
- no production-time direct network call from Cloudflare to the internal HIS server
- no broad patient-profile schema expansion just to support every printed field
- no redesign of the overall resident workflow outside the medicine catalog and prescription surfaces needed for this change

## Success Criteria

- System settings expose a first-class medicine catalog page.
- A one-time HIS import script can seed the internal catalog from the real available HIS source.
- The catalog stores code, active ingredient, trade name, unit, and route.
- Display names always follow `active ingredient (trade name)`.
- Prescription entry uses the internal catalog, not freeform names.
- Prescription printing is visually close to the provided sample and remains stable when some optional fields are blank.
