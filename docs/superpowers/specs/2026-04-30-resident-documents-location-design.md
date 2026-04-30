# Resident Documents Location Design

**Date:** 2026-04-30

**Project:** FDC Nursing Home Management System

**Goal:** Move resident identity-document previews back into the existing "Tai lieu dinh kem" position inside the personal-info tab and remove the separate document strip above the tabbed detail area.

## Context

The resident detail page currently shows document previews in two places:

- `ResidentDetailPage` renders `ResidentDocumentsSection` directly below `ResidentBasicInfo`, creating a separate strip above the tabs.
- `ResidentDetail` renders an older "Tai lieu dinh kem" card inside the "Thong tin ca nhan" tab, but that card uses temporary icon-only document state and does not display the persisted resident document images.

This creates duplicated document surfaces. The desired behavior is one document surface in the existing attachment-card location.

## Approved Approach

Use the existing attachment-card position in `ResidentDetail` as the single document surface. Remove the top-level `ResidentDocumentsSection` render from `ResidentDetailPage`. Reuse the signed-url preview behavior from the current document section so real persisted CCCD/BHYT images still display.

## UI Behavior

- The separate document strip above the tabs is not rendered.
- The "Tai lieu dinh kem" card remains in the personal-info tab.
- The card displays these slots:
  - CCCD NCT - mat truoc
  - CCCD NCT - mat sau
  - CCCD bao tro - mat truoc
  - CCCD bao tro - mat sau
  - The BHYT
- Slots with files show image previews when the path is an image and a file icon otherwise.
- Empty slots show the existing "Chua co" state.
- Download/open links use signed URLs from `getResidentDocSignedUrl`.
- The old temporary upload/delete UI is removed from this card because it did not persist real resident documents.

## Testing

Add regression coverage for:

- `ResidentDetailPage` does not render the top-level resident documents strip.
- `ResidentDetail` renders the "Tai lieu dinh kem" card with persisted resident document slots in the personal-info tab.
