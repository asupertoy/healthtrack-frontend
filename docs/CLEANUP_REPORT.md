# Frontend Cleanup Report

Date: 2025-11-23

Removed unused artifacts:
- `src/components/ConfirmDialog.vue` (unused everywhere)
- `src/stores/themeStore.js` (dark mode feature removed per request)

Retained components (all referenced):
- AppHeader, AppSidebar, AppToasts, LoadingSpinner, SectionCard

Stores in use: userStore, appointmentStore, challengeStore, familyStore, healthStore, notificationStore.

API modules: all exported functions referenced except invitation-related endpoints not yet implemented (future feature).

Follow-up suggestions (optional):
- If confirmation dialogs needed later, reintroduce a lightweight composable instead of full component.
- Introduce tree-shaking / on-demand Element Plus import to shrink bundle.
- Add ESLint + Prettier for consistency.

No functional code removed beyond requested feature scope.

