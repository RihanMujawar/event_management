# Event Management System

A full-stack event management platform with event creation, ticket booking, QR check-in, payment integration, and analytics dashboard.

## Features

### Attendee Features
- Register/Login with JWT authentication
- Browse events with search, category, and date filters
- Book tickets via the payment flow (fake credit card)
- View tickets with QR codes in "My Tickets"
- Cancel bookings
- Edit profile

### Organizer Features
- Create and manage own events
- View analytics dashboard (revenue, bookings, occupancy, charts)
- Scan QR codes at the venue for attendee check-in
- Manual ticket verification by ID

### Admin Features
- All organizer capabilities across all events
- User management (view/delete users)
- Full platform analytics

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Framer Motion (animations)
- Recharts (analytics charts)
- React Router v6 (protected routes)
- Lucide React (icons)
- QRCode.react (QR generation)
- html5-qrcode (QR scanning)
- Axios
- react-hot-toast

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- bcrypt (password hashing)
- QR code generation (on booking)

## Installation & Setup

1. Clone the repository
```bash
git clone https://github.com/your-username/Event-Management-System.git
cd Event-Management-System
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Configure environment variables
Create a `.env` file in the backend directory with:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=3001
```

4. Install frontend dependencies
```bash
cd frontend
npm install
```

5. Run the application
```bash
# Start backend server (from backend directory)
npm start

# Start frontend development server (from frontend directory)
npm start
```

The application will be available at `http://localhost:3000`

## User Roles

| Role | Capabilities |
|------|-------------|
| **Attendee** | Browse events, book tickets, view QR codes, edit profile |
| **Organizer** | Create/manage own events, analytics dashboard, QR scanning |
| **Admin** | Full access to all events, user management, platform analytics |

New users register as **Attendee** by default. Roles can be changed in the database.

## Project Structure

```
├── backend/
│   ├── controller/
│   │   ├── eventRoute.js        # Event CRUD, booking
│   │   ├── userController.js    # Profile management
│   │   ├── paymentRoute.js      # Payments, tickets, QR, check-in
│   │   └── analyticsRoute.js    # Dashboard analytics
│   ├── model/
│   │   ├── eventSchema.js
│   │   ├── ticketSchema.js      # Tickets with QR data & check-in
│   │   ├── userSchema.js
│   │   └── feedbackSchema.js
│   └── index.js
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── Dashboard/       # AnalyticsDashboard (charts)
│       │   ├── Event/           # EventList, EventCard, EventForm, etc.
│       │   ├── Home/
│       │   ├── Login/
│       │   ├── Navbar/
│       │   ├── Payment/         # PaymentForm (fake credit card)
│       │   ├── Protected/       # Route guards per role
│       │   ├── ScanQR/          # Camera QR scanner + check-in
│       │   ├── Tickets/         # MyTickets with QR code display
│       │   └── UserProfile/
│       └── App.js               # All routes with role guards
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Login, returns JWT |

### Events
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/events` | Public | List all events |
| GET | `/events/:id` | JWT | Single event details |
| POST | `/events` | Admin/Organizer | Create event |
| PUT | `/events/:id` | Admin/Organizer | Update event |
| DELETE | `/events/:id` | Admin/Organizer | Delete event |
| POST | `/events/:id/book` | JWT | Legacy direct booking |
| DELETE | `/events/:id/book` | JWT | Cancel booking |

### Payments & Tickets
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/create-payment-intent` | JWT | Create fake payment intent |
| POST | `/api/confirm-payment` | JWT | Confirm payment, generate tickets |
| GET | `/api/tickets` | JWT | User's tickets |
| GET | `/api/tickets/:id` | JWT | Single ticket details |
| GET | `/api/event/:eventId/tickets` | Organizer/Admin | All tickets for an event |
| GET | `/api/verify-ticket/:ticketId` | Public | Verify ticket by ID |
| PUT | `/api/tickets/:id/checkin` | Organizer/Admin | Mark ticket as checked in |

### Analytics
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/analytics/dashboard` | Organizer/Admin | Dashboard stats & charts |

### User
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/user/profile` | JWT | Get profile |
| PUT | `/user/profile` | JWT | Update profile |
| GET | `/user/booked-events` | JWT | User's booked events |
