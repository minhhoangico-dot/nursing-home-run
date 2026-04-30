# Resident Documents Location Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the personal-info tab's "Tai lieu dinh kem" card the only resident document preview surface.

**Architecture:** Reuse the existing signed-url document preview component inside `ResidentDetail` and stop rendering the standalone document strip in `ResidentDetailPage`. Keep the data source as the resident document path fields already present on `Resident`.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, React Testing Library, jsdom, Supabase signed storage URLs

---

## File Structure

### Modify

- `C:/Users/Minh/Desktop/VDL/src/features/residents/components/ResidentDocumentsSection.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/residents/components/ResidentDetail.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/residents/components/ResidentDetail.test.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/residents/pages/ResidentDetailPage.tsx`
- `C:/Users/Minh/Desktop/VDL/src/features/residents/pages/ResidentDetailPage.test.tsx`

## Task 1: Move The Real Document Grid Into ResidentDetail

**Files:**
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/residents/components/ResidentDocumentsSection.tsx`
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/residents/components/ResidentDetail.tsx`
- Test: `C:/Users/Minh/Desktop/VDL/src/features/residents/components/ResidentDetail.test.tsx`

- [ ] **Step 1: Write the failing ResidentDetail test**

Add a test that renders `ResidentDetail` with `idCardFrontPath` and expects the "Tai lieu dinh kem" card plus the "CCCD NCT - mat truoc" slot to be present.

Run: `npx vitest run src/features/residents/components/ResidentDetail.test.tsx`
Expected: FAIL because the old card does not render real persisted document slots through the signed-url grid.

- [ ] **Step 2: Implement the document grid reuse**

Export a reusable `ResidentDocumentsGrid` from `ResidentDocumentsSection.tsx`. Render it inside the existing "Tai lieu dinh kem" card in `ResidentDetail`. Remove temporary local upload/delete document state from `ResidentDetail`.

- [ ] **Step 3: Verify the component test passes**

Run: `npx vitest run src/features/residents/components/ResidentDetail.test.tsx`
Expected: PASS.

## Task 2: Remove The Top-Level Document Strip

**Files:**
- Modify: `C:/Users/Minh/Desktop/VDL/src/features/residents/pages/ResidentDetailPage.tsx`
- Test: `C:/Users/Minh/Desktop/VDL/src/features/residents/pages/ResidentDetailPage.test.tsx`

- [ ] **Step 1: Write the failing page test**

Mock `ResidentDocumentsSection` in `ResidentDetailPage.test.tsx` and assert it is not rendered when a resident detail is present.

Run: `npx vitest run src/features/residents/pages/ResidentDetailPage.test.tsx`
Expected: FAIL because `ResidentDetailPage` still renders the top-level section.

- [ ] **Step 2: Remove the top-level render**

Delete the `ResidentDocumentsSection` import and JSX from `ResidentDetailPage`.

- [ ] **Step 3: Verify the page test passes**

Run: `npx vitest run src/features/residents/pages/ResidentDetailPage.test.tsx`
Expected: PASS.

## Task 3: Final Verification

- [ ] Run `npx vitest run src/features/residents/components/ResidentDetail.test.tsx src/features/residents/pages/ResidentDetailPage.test.tsx`
- [ ] Run `npm run build`
- [ ] Inspect `git diff --check`
