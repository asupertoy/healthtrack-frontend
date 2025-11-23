# HealthTrack Frontend

Vue 3 + Vite implementation of the HealthTrack Personal Wellness Platform frontend.

## Features (Phase 3 Requirements Coverage)
- Account Info: view & update basic profile (name, primary email, phone)
- Book Appointment: list and create appointments (UI create form TBD)
- Create Wellness Challenge: list and create challenges
- Monthly Health Summary: fetch monthly aggregated metrics
- Search Records: search health records by filters
- Family Group: view and create user family groups
- Authentication: simple login storing returned user object
- Global Layout: header + sidebar navigation (conditional on login)

## Tech Stack
- Vue 3 Composition API
- Pinia (state management)
- Vue Router 4
- Element Plus (UI components)
- Axios (HTTP client)
- Vite (build tool)

## Project Setup
```sh
npm install
```

### Development
```sh
npm run dev
```
App served at http://localhost:3000 (configurable in `vite.config.js`).

### Production Build
```sh
npm run build
```
Outputs static assets to `dist/`.

### Preview Production Build
```sh
npm run preview
```

## Environment Assumptions
Backend API base URL is `http://localhost:8080/api` (see `src/api/http.js`). Adjust if backend runs elsewhere.

## State Management Overview
Stores located in `src/stores/` encapsulate API calls. Axios interceptor returns `response.data` directly; store actions treat responses as data objects.

## Next Improvements (Suggested)
- Add appointment/challenge creation forms (current minimal input fields).
- Add email/phone/provider management UI to fully meet account spec.
- Implement cancellation workflow and reasons for appointments.
- Add challenge invitations and expiration handling (15-day rule).
- Add progress tracking for challenges.
- Add health metrics entry forms.
- Add simple unit tests (recommend Vitest) for stores.

## Running Tests (Future)
When Vitest added:
```sh
npm run test
```

## Troubleshooting
- If Element Plus components not styled: ensure CSS import in `src/main.js`.
- 404 routes: verify router paths in `src/router/index.js` align with sidebar menu.

## License
Internal academic project; no external license specified.
