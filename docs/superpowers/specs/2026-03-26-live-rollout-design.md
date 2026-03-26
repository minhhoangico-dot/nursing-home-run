# Live Rollout Design

**Date:** 2026-03-26

**Project:** FDC Nursing Home Management System

**Goal:** Retire or refactor modules one phase at a time, deploy each completed phase directly to production, pause for user verification, and keep rollback fast enough that production experimentation is safe.

## Decisions Already Locked

- Rollout style: conservative serial rollout
- Release unit: one small related phase per deploy
- Deployment target: production immediately after each completed phase
- Verification gate: user checks the live site after each deploy before the next phase starts
- Rollback method: Cloudflare Worker version rollback
- Retirement scope: retire `dashboard` only
- Keep-and-refactor scope: `shift-handover`, `schedule`, `activities`, `diabetes-monitoring`, `inventory`
- Exposure rule: a kept hidden module is only exposed in the sidebar after its own refactor phase is complete

## Why This Rollout Shape

The codebase has two kinds of risk at the same time: shell-level exposure mismatches and backend/schema drift. Deploying broad changes would make it hard to know whether a regression came from navigation, permissions, service contracts, or feature-specific logic. A serial rollout reduces that ambiguity. Each production deploy should answer one narrow question, and each rollback should be cheap.

## Rollout Principles

1. Never combine unrelated changes in the same production phase.
2. Do not expose a module in navigation until its own route, role rules, and core workflow are internally consistent.
3. Prefer retiring dead code over preserving disconnected modules.
4. Run local verification before every production deploy.
5. After each production deploy, stop and wait for explicit user approval or rollback instruction.
6. If a phase fails live verification, rollback first and debug second.

## Phase Structure

Every rollout phase follows the same sequence:

1. Implement only the changes in that phase.
2. Run local build verification with `cmd /c npm run build`.
3. Deploy to production with the Cloudflare Worker deploy path.
4. Give the user a short live-check checklist focused on that phase only.
5. Wait for one of three outcomes:
   - approve and continue
   - report issues and rollback
   - report issues and hold for fix planning

## Rollback Contract

Rollback must use the most recent healthy Cloudflare Worker version rather than ad hoc code changes. The workflow is:

1. identify the newly deployed version
2. keep the previous version id available before asking the user to verify
3. if the user rejects the phase, rollback that version immediately
4. confirm the rollback with a fresh production check before resuming work

## Proposed Rollout Phases

### Phase 0: Baseline And Rollback Readiness

Purpose: confirm the deploy path and rollback mechanics before touching behavior.

Scope:
- verify Cloudflare deploy command and current worker status
- record the current deployed version as the rollback baseline
- define the per-phase live-check template

No user-facing behavior change should happen in this phase.

### Phase 1: Shell Consistency, Dashboard Retirement, And Maintenance Stabilization

Purpose: clean the app shell without exposing new hidden modules.

Scope:
- retire `dashboard`
- align route, sidebar, and title behavior for already visible modules
- fix dead-end role mismatches for `settings`, `finance`, and `maintenance`
- complete the minimum viable maintenance workflow for the already-exposed maintenance surface
- connect the room-level maintenance action to a real maintenance flow
- keep `shift-handover`, `schedule`, `activities`, `diabetes-monitoring`, and `inventory` hidden for now

Success criteria:
- every visible sidebar entry is reachable by the roles that can see it
- exposed maintenance paths are no longer toast-only or button-only dead ends
- no hidden module becomes newly visible
- dashboard code is either fully retired or clearly isolated from the live shell

### Phase 2: Shift Handover Contract Cleanup And Exposure

Purpose: resolve the backend split before exposing the module.

Scope:
- choose one canonical shift-handover table/service contract
- remove the legacy/live contract split
- validate the page against the surviving contract
- expose `shift-handover` in the sidebar only after the contract is stable

Success criteria:
- one data contract only
- route, store, and service all point to the same backend shape
- module is visible only when safe

### Phase 3: Schedule Exposure

Purpose: expose `schedule` after confirming its own route/role/workflow integrity.

Scope:
- review and correct route/sidebar role consistency
- expose `schedule` in the sidebar
- verify no other modules are affected

Success criteria:
- schedule is discoverable for intended roles
- schedule live checks pass with no shell regressions

### Phase 4: Activities Exposure

Purpose: expose `activities` after its navigation and workflow checks are complete.

Scope:
- expose `activities` in the sidebar
- confirm its store preload and page actions behave correctly

Success criteria:
- activities is discoverable and functional
- no side effects on resident or shell flows

### Phase 5: Diabetes Page Completion And Exposure

Purpose: expose the standalone diabetes module without breaking the existing monitoring screens that already depend on diabetes logic.

Scope:
- finish diabetes page wiring
- decide the fate of `PrintBloodSugarForm`
- expose `diabetes-monitoring` in the sidebar only after the page works

Success criteria:
- standalone diabetes page works
- existing monitoring screens still work
- print behavior is either real or removed

### Phase 6: Inventory Exposure

Purpose: expose inventory after carefully validating existing dependencies.

Scope:
- align inventory role policy
- expose the module in the sidebar
- confirm visible consumers like header and resident detail remain stable

Success criteria:
- inventory is visible to intended roles
- existing inventory-dependent visible screens remain intact

### Phase 7: Clinical Integrity Cleanup

Purpose: fix hidden data-model issues that are already affecting visible workflows.

Scope:
- weight tracking save-refresh bug
- prescription source-of-truth decision
- care-log retirement or restoration
- nutrition resident-derived vs persisted-module decision

Success criteria:
- resident-detail-related workflows are internally consistent
- no duplicate or conflicting data ownership remains

### Phase 8: Finance And Reporting Cleanup

Purpose: remove placeholder logic from finance-facing screens and forms.

Scope:
- align finance role policy
- replace static price logic with persisted service prices
- replace resident finance placeholders with real ledger-derived data
- connect print forms to live schedule and nutrition data

Success criteria:
- finance screens use real data paths
- print outputs are backed by live app state rather than placeholders

### Phase 9: Documentation And Deployment Truth

Purpose: make the repository’s documentation match the real production platform.

Scope:
- make Cloudflare the explicit source of truth if that remains the live platform
- remove or deprecate conflicting Netlify guidance

Success criteria:
- setup and deployment docs match the actual production path

## Verification Strategy

For each phase, the verification handoff should contain:

- production URL to check
- roles to test
- pages to click
- expected visible behavior
- specific rollback triggers

Verification should be short and phase-specific. The user should not have to rediscover the intended result.

## Non-Goals

- no broad refactor of unrelated modules
- no hidden module exposure before its own phase
- no backend migration bundling that spans unrelated features
- no automatic continuation after deploy without user confirmation

## Open Decisions Reserved For Later Phases

These are intentionally deferred until their phase begins:

- whether `PrintBloodSugarForm` stays or is removed
- whether `CareLogSection` is restored or retired
- whether nutrition remains resident-derived or becomes a standalone persisted module
- the final prescription source-of-truth model

Those decisions should be made immediately before implementation of their respective phase, not earlier.
