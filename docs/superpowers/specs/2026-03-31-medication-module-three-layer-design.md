# Medication Module Three-Layer Design

**Date:** 2026-03-31

**Project:** FDC Nursing Home Management System

**Goal:** Redesign the medication module into three clear layers so doctors can prescribe and adjust medications quickly with a full-detail form, nurses can print one aggregated active-medication sheet for execution, and family-facing clinic prescriptions continue to print in the legacy single-prescription format.

## Locked Decisions

- Primary user: doctor
- Secondary operational user: nurse
- Prescription entry style: full-detail form, not a heavily simplified quick form
- Main medication screen focus: active prescriptions are the center of the workspace
- Main medication screen layout: each active prescription is shown as a card with quick actions
- Single-prescription print target: legacy clinic prescription layout
- Aggregated print target: one merged active-medication printout for nursing execution
- Aggregated print source: all medications from active prescriptions for one resident
- Active status: derived by the system, not manually entered as the source of truth
- Exhaustion warning threshold: `near end` means theoretical remaining supply is `<= 2 days`
- Editing support: active prescriptions must support direct adjustment
- Duplication support: doctors must be able to duplicate an older prescription into a new one
- Medicine selection: doctors search from a shared drug master list with autocomplete
- Medicine catalog maintenance: users can add a new medicine when needed

## Problem Statement

The current medication module has grown through several incremental fixes and now has three recurring failure modes:

1. core prescribing actions can disappear when unrelated module work is deployed
2. prescription editing behavior is inconsistent because the UI and store are centered on create-only flows
3. the module mixes source data, prescription documents, and derived active-medication logic in the same surfaces

This is especially risky in a nursing-home context with approximately 50-100 residents, where each resident may have multiple concurrent prescriptions and doctors need to adjust them frequently. The module needs to support:

- fast but full-detail prescribing for doctors
- reliable operational printing for nurses
- stable separation between document data and active-medication calculations

## Current Codebase Context

- The resident medication surface currently renders [PrescriptionList.tsx](C:\Users\Minh\Desktop\VDL\src\features\prescriptions\components\PrescriptionList.tsx).
- Prescription entry and editing behavior currently live in [PrescriptionForm.tsx](C:\Users\Minh\Desktop\VDL\src\features\prescriptions\components\PrescriptionForm.tsx).
- Medicine lookup and maintenance currently live in [MedicineManager.tsx](C:\Users\Minh\Desktop\VDL\src\features\prescriptions\components\MedicineManager.tsx).
- Medication data and actions currently live in [prescriptionStore.ts](C:\Users\Minh\Desktop\VDL\src\stores\prescriptionStore.ts).
- Prescription and medication types currently live in [medical.ts](C:\Users\Minh\Desktop\VDL\src\types\medical.ts).
- Printing currently lives in [printTemplates.ts](C:\Users\Minh\Desktop\VDL\src\features\prescriptions\utils\printTemplates.ts).

Recent work already restored some missing behaviors:

- active prescriptions are shown again as a separate section
- single-prescription print was reconnected for active prescriptions
- direct adjustment for active prescriptions has been reintroduced

But the current design is still implementation-first rather than workflow-first. The module needs a stable structural redesign.

## User And Workflow Context

### Doctors

Doctors are the primary users. They need:

- a full-detail medication form
- autocomplete from a prepared medicine catalog
- quick adjustment of active prescriptions
- the ability to duplicate older prescriptions instead of re-entering everything
- clear visibility into what is active right now and what is close to running out

### Nurses

Nurses need:

- a single operational printout of everything a resident is currently taking
- medications grouped or sortable by time of administration
- stable, readable output that can be used during rounds

### Family / External Use

Family-facing or clinic-facing communication still needs:

- one single prescription print in the clinic format already approved

## Design Summary

The medication module will be split into three explicit layers:

1. `Drug Master Layer`
2. `Prescription Editor Layer`
3. `Active Medication View Layer`

Each layer has one primary responsibility:

- the drug master owns the canonical medicine catalog
- the prescription editor owns prescription documents and medication lines
- the active-medication view owns all derived operational calculations and aggregated nursing output

This separation prevents the current pattern where active-use calculations, document rendering, and catalog lookup all drift together.

## Layer 1: Drug Master Layer

### Responsibility

Provide one shared, searchable medicine catalog for all prescription entry.

### Required Data

Each medicine record should support:

- display name
- trade name
- active ingredient
- unit
- strength
- route
- therapeutic group
- default dosage or common usage helper
- optional source marker such as imported vs manual

This expands the practical use of the earlier medicine-catalog design while keeping the catalog as the single source of truth for medicine lookup.

### UX Requirements

- doctors type a few characters and receive autocomplete results
- results should be searchable by medicine name and active ingredient
- selecting a medicine should prefill helpful defaults where available
- adding a missing medicine should be possible from the prescribing flow without navigating far away

### UI Surface

The existing medicine manager should evolve into a more durable drug-master surface rather than a side utility. It can still be launched quickly from the prescribing workflow, but conceptually it belongs to the module foundation, not to a specific prescription.

## Layer 2: Prescription Editor Layer

### Responsibility

Own the prescription document itself:

- header fields
- line items
- lifecycle actions

### Prescription Header Fields

Each prescription should support:

- prescription name or type
- prescription date
- doctor
- diagnosis
- resident
- overall notes

### Prescription Line Fields

Each medication line should support:

- medicine selected from drug master
- dosage
- frequency text for clinician display
- time-of-day selections: `Sang`, `Trua`, `Chieu`, `Toi`
- special instructions such as before food / after food
- start date
- end date or `continuous`
- quantity supplied
- normalized `administrations_per_day`

### Supply Calculation Contract

The module needs one deterministic quantity model for active-state and near-end warnings.

The locked rule is:

- every medication line stores `quantity_supplied`
- every medication line stores `administrations_per_day`
- `administrations_per_day` is the calculation source of truth
- `administrations_per_day` is derived from explicit time-of-day selections by default
- `frequency text` is clinician-facing display text and must stay consistent with `administrations_per_day`, but it is not the source of truth for supply math
- if the UI later supports more structured dosing math, it may refine this value, but this numeric field remains the calculation input

Initial formula:

- `administrations_per_day = max(1, count(selected_times_of_day))`
- `estimated_days_supply = floor(quantity_supplied / administrations_per_day)`
- `start_date` counts as day 1 of supply
- `estimated_exhaustion_date = start_date + max(estimated_days_supply - 1, 0) calendar days`
- `remaining_days` is calculated as whole resident-local calendar days from `today` through `estimated_exhaustion_date`, inclusive
- comparisons use the resident-local date in timezone `Asia/Saigon`
- `near_end = remaining_days <= 2` and `remaining_days > 0`
- `exhausted = remaining_days <= 0`

This is intentionally a practical operational model, not a pharmacology engine. The warning exists to tell staff a prescription likely needs review or refill soon.

### Lifecycle Actions

Each prescription card must support:

- `Dieu chinh`
- `Nhan ban`
- `Tam ngung`
- `Ket thuc`
- `In don`

### Editing Model

Direct edit is required for active prescriptions because the user explicitly asked for frequent adjustment. Duplicate-to-new is also required because it is still the safest path for larger regimen changes and recurring prescriptions.

The system should support both:

- `Dieu chinh`: edits the current prescription
- `Nhan ban`: creates a new prescription based on an existing one

### History Preservation Rule

`Dieu chinh` must not silently destroy the prior medical record state.

The locked rule is:

- the active prescription record remains the editable current record
- every adjustment writes an audit snapshot of the previous header and line items before the update is applied
- the UI can still present `Dieu chinh` as direct editing, but the data layer must preserve a recoverable version history
- snapshots are append-only and versioned per prescription
- version numbers increment monotonically starting from `1`
- each snapshot stores: prescription id, version number, snapshot timestamp, actor, header payload, full line-item payload, and change reason if entered
- `Dieu chinh` creates a new snapshot before saving the edited current version
- `Tam ngung` and `Ket thuc` also create snapshots before the status change is applied
- `Nhan ban` does not append to the source prescription history; it creates a new prescription record with a reference to `duplicated_from_prescription_id`

This keeps the doctor workflow fast without losing traceability.

### Status Model

User-visible statuses remain:

- `Dang dung`
- `Tam ngung`
- `Da ket thuc`

But the system should not depend on a manually selected active state alone. Whether a medication line is actually active must be derived from:

- prescription lifecycle state
- item start date
- item end date or continuous flag
- current date

### Quantity And Supply Logic

For each medication line, the system should derive an estimated exhaustion date from:

- quantity supplied
- dosage / daily frequency model

When exact medical math cannot be perfectly normalized from free text, the UI should still support a practical estimated-days-supply model so the system can calculate:

- active
- near end
- exhausted

`Near end` starts when remaining supply is `<= 2 days`.

This warning is operational and does not replace medical judgment.

## Layer 3: Active Medication View Layer

### Responsibility

Show the real operational medication picture for one resident by deriving currently active medication lines across all active prescriptions.

### Derived View Rules

The active-medication view should:

- include medication lines from prescriptions that are not paused or ended
- include only medication lines whose date range is currently active, or which are marked continuous
- mark medication lines as `near end` when theoretical remaining supply is `<= 2 days`
- mark medication lines as exhausted when the calculated remaining supply is `<= 0`

### Main Screen Layout

The main resident medication screen should center the active-prescription cards.

Top-level structure:

1. action bar
2. active prescription cards
3. active-medication summary view
4. prescription history

The active-prescription cards are the primary focus because the doctor explicitly wants this mental model.

### Active Prescription Card Contents

Each card should show:

- prescription code or label
- diagnosis
- doctor
- prescription date
- item count
- current derived status
- near-end warning if any item is close to exhaustion

Each card should include quick actions:

- `Dieu chinh`
- `Nhan ban`
- `Tam ngung`
- `Ket thuc`
- `In don`

### Aggregated Active Medication View

This is a resident-level merged view of all active medications from all active prescriptions.

It should support:

- grouping or sorting by `Sang / Trua / Chieu / Toi`
- visibility of source prescription when needed
- strong readability for nursing execution

### Duplicate-Medicine Rule In The Aggregated View

The aggregated view must not automatically deduplicate overlapping medicines from different active prescriptions.

The locked rule is:

- each active medication line remains a separate executable row
- if two active prescriptions contain the same medicine, both rows stay visible
- the source prescription must be shown on screen and available on the nursing print when duplicate or overlapping medicines exist

This is the safer operational rule because silent deduplication could hide a real active order.

### Deterministic Ordering Rule

The aggregated active-medication view and nursing print must use the same ordering contract:

1. group by time-of-day in this fixed order: `Sang`, `Trua`, `Chieu`, `Toi`
2. within each time-of-day group, sort by medicine display name ascending
3. if display names are equal, sort by prescription start date ascending
4. if still tied, sort by prescription code ascending

When duplicate or overlapping medicines exist:

- each row remains separate
- each row shows its source prescription code
- the nursing print includes the source code in the row subtitle or source column

This view is not the legal prescription document. It is the operational execution view.

## Printing Design

### Print Mode A: Single Prescription

Purpose:

- family-facing
- clinic-facing
- document style

Requirements:

- preserve the existing clinic prescription visual layout
- print a single prescription only
- keep the approved old-format appearance as closely as practical in HTML/CSS

### Print Mode B: Aggregated Active Medication Sheet

Purpose:

- nursing execution
- one resident at a time

Requirements:

- merge all active medications from all active prescriptions
- group or clearly sort by `Sang / Trua / Chieu / Toi`
- be easy to scan during rounds
- prefer medicine-name-first display
- expose enough context to avoid confusion when two similar medicines are active simultaneously

## UX Requirements

### Full-Detail Form

The doctor asked for a full form, so the prescribing editor should not hide necessary medication fields behind aggressive simplification.

### Speed Optimizations

Even with a full form, the workflow must remain quick:

- autocomplete medicine search
- prefilling common defaults from drug master
- keyboard-friendly tab order
- add-line action that keeps focus in the next medication row
- duplicate prescription instead of retyping

### Mobile And Tablet Use

The editor and active-prescription cards must remain usable on tablet:

- cards should stack cleanly
- actions should remain tappable
- the full form should reflow vertically on narrower screens

### Click-Minimization Principle

The user asked for minimal clicks. In practice this means:

- one-screen visibility of active prescriptions
- no unnecessary navigation away from the resident context
- fast duplicate and adjust actions on the card itself
- inline or near-inline access to drug-master additions when a medicine is missing

## Data And State Changes

### Types

The current medication types are too coarse for reliable derived calculations. The prescription-line model should be expanded so item-level dates, continuous usage, quantity, and timing are explicit first-class fields.

### Store Responsibilities

The prescription store should own:

- fetch
- create
- update
- duplicate
- pause
- complete
- drug-master fetch and maintenance

The active-medication view should use selectors or dedicated derivation helpers rather than scattering calculation logic through multiple components.

### Derived Helpers

Introduce one shared derivation layer for:

- `isMedicationLineActive`
- `estimatedExhaustionDate`
- `isNearEnd`
- resident-level merged active medication list

This avoids repeated bugs where UI sections drift and one screen stops matching another.

## Migration Strategy

This redesign should be phased instead of rewritten all at once.

### Phase 1

- stabilize current active-prescription card model
- keep single-prescription print working
- add the missing direct actions consistently

### Phase 2

- expand prescription-line data model for item-level dates and continuous use
- centralize derived active-medication calculations
- add near-end warnings based on the 2-day rule

### Phase 3

- upgrade drug-master search and maintenance flow
- support duplicate-prescription action cleanly
- refine tablet UX

### Phase 4

- finalize aggregated nursing print around the derived active-medication layer

## Risks

- Existing stored prescription lines may not contain enough normalized data for perfect supply calculation.
- Free-text dosage fields can limit exact exhaustion calculations unless the UI adds a more structured daily-usage helper.
- Direct editing of active prescriptions can alter the historical medical record if no audit trail is added.
- Repeated deploys have already shown regression risk in this module, so tests must explicitly cover active-prescription actions and both print modes.

## Testing Strategy

At minimum, automated tests should cover:

- active prescriptions remain visible in the main workspace
- active prescription cards include `Dieu chinh`, `Nhan ban`, and `In don`
- direct adjustment opens the editor with existing prescription values
- duplicate creates a new prescription draft from an old one
- active-medication derivation merges medications across multiple active prescriptions
- near-end warnings appear at `<= 2 days`
- single-prescription print remains on the clinic template
- aggregated nursing print renders merged active medications in time-of-day order

## Out Of Scope

- pharmacy stock deduction or dispensing workflow
- medication administration logging by nurse per dose
- multi-resident ward batch printing
- dosage interaction checking
- external HIS live synchronization

## Recommendation

Proceed with the three-layer architecture and keep the resident medication workspace centered on active prescription cards. This matches the doctor's mental model, preserves the legacy single-prescription print for families, and gives nursing a separate operational output without mixing document and execution concerns.
