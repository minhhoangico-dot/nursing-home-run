# Development Decisions Log

## Date: 2025-12-24

### Decision 1: Project Root Identification
- **Context**: Confusion regarding project root path (`minhhoangico-dot/nursing-home-run` vs `Desktop/VDL`).
- **Decision**: Identified `c:\Users\Minh\Desktop\VDL` as the actual project root containing `package.json` and `src`.
- **Rationale**: `list_dir` confirmed the structure. Will ignore the nested `minhhoangico-dot` folder created by previous error.

### Decision 2: Autonomous Execution
- **Context**: Overnight autonomous session.
- **Decision**: Will proceed ensuring all files are strictly within `c:\Users\Minh\Desktop\VDL`.

### Decision 3: Module Implementation
- **Context**: Implementing core features: Shift Handover, Diabetes, Procedures, Weight Tracking.
- **Decision**: Used feature-based directory structure (src/features/*).
- **Rationale**: Keeps code organized and modular.

### Decision 4: Charting Library
- **Context**: Need specific charts for Diabetes and Weight tracking.
- **Decision**: Selected recharts for visualization.
- **Rationale**: Lightweight, React-based, and flexible.

### Decision 5: Error Handling
- **Context**: Need global error handling.
- **Decision**: Implemented ErrorBoundary component to wrap AppRoutes.
- **Rationale**: Prevents white screen of death and offers reload option.

### Decision 6: Dashboard Integration
- **Context**: Role-based dashboards need to show relevant new data.
- **Decision**: Updated DoctorDashboard to show high glucose alerts.
- **Rationale**: Provides immediate value and monitoring capabilities to medical staff.

