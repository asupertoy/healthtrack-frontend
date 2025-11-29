# HealthTrack Frontend

Vue 3 + Vite implementation of the HealthTrack Personal Wellness Platform frontend.

## Phase 3 Requirements Coverage
Main Menu:
- Account Info (profile + emails, phone, providers management)
- Book an Appointment (create, list, cancel, delete)
- Create a Wellness Challenge (create, list, join, view participants, leave)
- Monthly Health Summary (total appointments, avg/min/max metrics placeholders, top challenge, most active user)
- Search Records (appointments & health records by filters)
- Sign Out (header logout button)
- Family Group (extra: create groups, add/remove members)

Account Functions:
- Modify personal details (name, primaryEmail, phone)
- Add/remove email address
- Add/remove phone number
- Link/unlink healthcare provider

Summary Functions Implemented:
- Total number of appointments in date range (appointmentStore.countAppointments + search UI)
- Average/min/max of metrics (monthly summary shows avg/min/max placeholders for weight & blood pressure)
- Challenges with most participants (top challenge endpoint consumed)
- Most active users (most active user endpoint consumed)

## Tech Stack
Vue 3 + Pinia + Vue Router + Element Plus + Axios + Vite

## Project Setup
```sh
npm install
```

### Development
```sh
npm run dev
```
Visit http://localhost:3000.

### Production Build
```sh
npm run build
```

### Preview
```sh
npm run preview
```

## Configuration
API base URL: `http://localhost:8080/api` (see `src/api/http.js`). Adjust if backend differs.

## Auth Guard
Simple route guard redirects unauthenticated users to /login based on presence of `token` in localStorage.

## Next Suggested Enhancements
- Implement invitation flow & 15-day expiration UI.
- Primary provider selection & enforcement feedback.
- Progress update interface for challenges.
- Chart visualizations for monthly summary metrics.
- Replace fallback userId=1 logic with strict auth requirement.
- Add unit tests (Vitest) for stores and composables.

## Troubleshooting
- If routes 404: ensure backend running & correct base URL.
- If styles missing: check Element Plus CSS import in `main.js`.

## License
Academic project – internal use.
