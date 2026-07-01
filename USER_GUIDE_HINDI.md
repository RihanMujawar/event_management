# Event Management System Use Karne Ke Steps

Ye guide project ko run karne, login karne, event create karne, ticket book karne, QR check-in karne aur analytics dekhne ke liye hai.

## 1. Project Start Kaise Kare

Backend start kare:

```bash
cd backend
npm install
npm start
```

Frontend start kare:

```bash
cd frontend
npm install
npm start
```

Browser me open kare:

```text
http://localhost:3000
```

Backend API:

```text
http://localhost:3001
```

## 2. Environment Setup

Backend folder me `.env` file honi chahiye:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=3001
```

Frontend me optional `.env`:

```env
REACT_APP_API_URL=http://localhost:3001
```

## 3. User Register Aur Login

1. Website open kare.
2. `Sign Up` par click kare.
3. Name, email, phone, password fill kare.
4. Register hone ke baad `Login` kare.
5. New user default `attendee` role me create hota hai.

## 4. Roles Kaise Use Kare

| Role | Kaam |
|---|---|
| Attendee | Events browse, ticket book, QR ticket dekh sakta hai |
| Organizer | Event create/manage, dashboard, QR scan kar sakta hai |
| Admin | Sabhi events, users, analytics aur check-in manage kar sakta hai |

Organizer/Admin test karne ke liye MongoDB me user ka `role` change kare:

```text
attendee -> organizer
attendee -> admin
```

## 5. Event Create Karne Ke Steps

1. Organizer/Admin account se login kare.
2. Navbar me `Create Event` click kare.
3. Event title, description, date, time, venue, category, capacity, price fill kare.
4. Submit kare.
5. Event `/events` page par show hoga.

## 6. Ticket Book Karne Ke Steps

1. Attendee account se login kare.
2. Navbar me `Events` open kare.
3. Event choose kare.
4. `Book` ya payment option par click kare.
5. Quantity select kare.
6. Demo card form me koi bhi card-like details fill kare.
7. Payment complete hone ke baad ticket create ho jayega.

## 7. QR Ticket Dekhne Ke Steps

1. Attendee login kare.
2. Navbar me `My Tickets` click kare.
3. Ticket ke saamne `Show QR` click kare.
4. Venue par ye QR code organizer/admin ko dikhaye.

## 8. QR Check-in Karne Ke Steps

1. Organizer/Admin login kare.
2. Navbar me `Scan QR` open kare.
3. `Start Camera` click kare.
4. Attendee ka QR scan kare.
5. Valid ticket show hone par `Confirm Check-In` click kare.
6. Camera issue ho to manual ticket ID enter karke `Verify` kare.

## 9. Analytics Dashboard Use Karne Ke Steps

1. Organizer/Admin login kare.
2. Navbar me `Dashboard` click kare.
3. Yahan total events, tickets sold, revenue, check-ins, category chart aur recent bookings dikhenge.
4. Organizer ko apne events ka data dikhega.
5. Admin ko full platform ka data dikhega.

## 10. Admin User Management

1. Admin account se login kare.
2. Navbar me `Manage Users` click kare.
3. Users list dekhe ya manage kare.

## 11. Important Notes

- Payment real payment gateway nahi hai; ye demo/fake payment flow hai.
- QR check-in ke liye camera permission allow karni hogi.
- Backend aur frontend dono server running hone chahiye.
- MongoDB connection sahi nahi hoga to events/tickets/login data work nahi karega.
