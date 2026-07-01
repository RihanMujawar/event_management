# Event Management System Documentation

## Feature Status

| Feature | Status | Where it is implemented |
|---|---|---|
| Event Creation | Done | React form at `/create-event`, backend `POST /events` |
| Ticket Booking | Done | Event cards route users to payment, tickets saved in MongoDB |
| QR Check-in | Done | `/my-tickets` shows QR, `/scan-qr` scans/verifies/checks in |
| Payment Integration | Demo payment done | Fake payment intent and confirmation under `/api` |
| Analytics Dashboard | Done | `/dashboard` with bookings, revenue, check-ins, categories |

## Technology Stack

- Frontend: HTML, CSS, JavaScript, React
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Auth: JWT and bcrypt
- QR: `qrcode.react` for ticket QR display, `html5-qrcode` for scanning
- Analytics: Recharts

## Roles

| Role | Access |
|---|---|
| Admin | Manage all events, users, analytics, QR check-in |
| Organizer | Create/manage own events, analytics, QR check-in |
| Attendee | Browse events, book tickets, view QR codes |

New registered users become attendees by default. To test admin or organizer screens, update the user's `role` in MongoDB to `admin` or `organizer`.

## Main Pages

- `/` - Modern home page
- `/events` - Browse, search, filter, and book events
- `/create-event` - Event creation for admin/organizer
- `/payment` - Demo payment form
- `/my-tickets` - Ticket list with QR codes
- `/scan-qr` - Camera scanner and manual ticket verification
- `/dashboard` - Analytics dashboard
- `/admin/users` - Admin user management

## API Summary

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/register` | Register attendee |
| `POST` | `/login` | Login and receive JWT |
| `GET` | `/events` | Public event list |
| `POST` | `/events` | Create event |
| `PUT` | `/events/:id` | Update event |
| `DELETE` | `/events/:id` | Delete event |
| `POST` | `/api/create-payment-intent` | Start demo payment |
| `POST` | `/api/confirm-payment` | Confirm payment and create tickets |
| `GET` | `/api/tickets` | Get logged-in user's tickets |
| `GET` | `/api/verify-ticket/:ticketId` | Verify QR/manual ticket ID |
| `PUT` | `/api/tickets/:id/checkin` | Mark ticket checked in |
| `GET` | `/api/analytics/dashboard` | Dashboard metrics |
| `GET` | `/user/list` | Admin-only user list |
| `DELETE` | `/user/:id` | Admin-only user delete |

## Setup

Backend:

```bash
cd backend
npm install
npm start
```

Frontend:

```bash
cd frontend
npm install
npm start
```

Backend `.env`:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=3001
```

Frontend optional `.env`:

```env
REACT_APP_API_URL=http://localhost:3001
```

## Notes

- Payment is intentionally a fake/demo credit card flow. It accepts any card-like input and creates tickets after confirmation.
- QR check-in now returns the ticket MongoDB `_id` from verification so the scanner can complete check-in correctly.
- The UI has been refreshed with cleaner cards, improved navigation, responsive layouts, and a modern color system.
- Step-by-step Hindi usage guide is available in `USER_GUIDE_HINDI.md`.
