# Resident Fixed Services Finance Design

**Date:** 2026-04-30

**Project:** FDC Nursing Home Management System

**Goal:** Link the service price catalog to resident finance so admission requires fixed service selection and resident finance can adjust those fixed services later.

## Context

Finance currently has a service catalog built from database pricing tables:

- `room_prices` -> `ROOM` fixed services
- `care_level_prices` -> `CARE` fixed services
- `meal_prices` -> `MEAL` fixed services
- `additional_services` -> custom fixed or one-off services

Resident finance currently shows fixed fees using estimated or hard-coded values, while monthly billing and invoice preview still use `INITIAL_PRICES`. The resident finance tab can quick-add one-off service usage, but it does not store which fixed room, meal, and care services a resident is assigned to.

## Approved Approach

Store a fixed-service package per resident. The package is the source of truth for recurring room, meal, and care charges. `service_usage` remains the source for one-off/incurred services.

Each active resident must have at least:

- One `ROOM` fixed service
- One `MEAL` fixed service
- One `CARE` fixed service

The selected fixed-service rows store the chosen catalog service id, display name, category, locked unit price, quantity, and effective date. Later catalog price changes do not automatically change an existing resident package. Staff can update a resident package from the resident finance tab when the new price should apply.

## Data Model

Add a resident fixed-service assignment model with these app fields:

- `id`
- `residentId`
- `serviceId`
- `serviceName`
- `category`: `ROOM`, `MEAL`, `CARE`, or `OTHER`
- `unitPrice`
- `quantity`
- `totalAmount`
- `effectiveFrom`
- `status`: `Active` or `Inactive`

Persistence can use a new database table, for example `resident_fixed_services`. The table should preserve locked unit prices and service names so historical resident packages do not drift when catalog labels or prices change.

Existing residents should be backfilled or lazily initialized from the current catalog when possible:

- Room service from `resident.roomType`
- Care service from `resident.careLevel`
- Meal service from the standard meal catalog row

If a match cannot be found, the resident finance and billing screens should show a visible missing-package warning instead of inventing a hidden price.

## Admission Flow

Admission wizard should load the service catalog and add a fixed-service selection section before final save. It should filter services to fixed billing rows in the required categories.

Validation rules:

- A resident cannot be saved without one selected `ROOM`, `MEAL`, and `CARE` service.
- The selected room service should default from the selected room type when a matching catalog row exists.
- The selected care service should default from the selected care level when a matching catalog row exists.
- The selected meal service should default to the standard meal row when available.

Save order:

1. Save the resident.
2. Save the resident fixed-service assignments for that resident.
3. Treat the resident plus assignments as one logical save in the UI. If assignment save fails after resident persistence, roll back optimistic UI state, surface a user-friendly error, and leave the missing-package warning path available for any partial legacy state.

## Resident Finance Tab

The resident finance tab should show fixed services from the resident package instead of estimated rows. It should let finance users adjust the package:

- Replace the selected service for a required category.
- Add additional fixed services if they are fixed monthly services.
- Remove optional fixed services.
- Prevent removing the last active `ROOM`, `MEAL`, or `CARE` row.

When a service is selected from the catalog, the package row snapshots the current catalog name and price. If staff need a changed catalog price to apply, they choose or refresh the service from this tab.

## Billing And Invoice

Monthly billing and invoice preview should stop using `INITIAL_PRICES` for fixed fees. Fixed fees come from the resident fixed-service package, and incurred fees continue to come from `service_usage`.

The displayed monthly total should be:

`active fixed-service package total + monthly one-off service usage + medication billing rows`

If a resident is missing one of the required fixed categories because of legacy data, billing should show a visible warning and treat the missing category as zero until staff completes the package.

## Testing

Add focused regression coverage for:

- Admission validation blocks saving without at least one `ROOM`, `MEAL`, and `CARE` fixed service.
- Admission save persists fixed-service assignments after saving the resident.
- Resident finance renders assigned fixed services from the resident package.
- Resident finance prevents removing the last required category row.
- Monthly billing calculates fixed charges from resident assignments instead of `INITIAL_PRICES`.
- Invoice preview receives and displays fixed assignment details.
