# Personal Finiancial Tracker

A simple personal finance tracker with authentication, transactions management, and visual insights (pie and bar charts). Built with a Node/Express backend, MongoDB database, and a React + Vite frontend.

## Features
- Authentication: register, login, JWT-based session, route protection
- Centralized API helper: auto-attaches token; 401 handling with logout + redirect
- Transactions: create, list, edit, delete with confirmation on delete
- Filters and views: desktop table and mobile cards, category filter
- Charts: spending by category (Pie), monthly income vs expense (Bar)
- UX details: floating labels, error states on invalid credentials, consistent input styling

## Tech Stack
- Frontend: React, Vite, Tailwind CSS, react-router, react-chartjs-2, chart.js
- Backend: Node.js, Express, JWT (jsonwebtoken), bcryptjs
- Database: MongoDB with Mongoose

## Project Structure
```
fin-tracker/
├─ backend/
│  ├─ src/ (optional)
│  ├─ middleware/      # auth middleware
│  ├─ models/          # Mongoose models
│  ├─ routes/          # auth, transactions
│  └─ server.js        # Express entry
│
└─ frontend/
   ├─ src/
   │  ├─ components/   # UI components + charts
   │  ├─ pages/        # Login, Register, Dashboard
   │  ├─ utils/        # api.js
   │  ├─ App.jsx
   │  └─ main.jsx
   ├─ index.html
   └─ vite.config.js
```

## Setup Instructions

### Prerequisites
- Node.js 
- MongoDB running locally or a connection string (MongoDB Atlas)

### 1 Backend
1. Open a terminal in `backend/`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in `backend/` with:
   ```env
   MONGODB_URI= ......
   JWT_SECRET= .....
   PORT=5000
   ```
4. Start the server:
   ```bash
   npm start
   ```

### 2 Frontend
1. Open another terminal in `frontend/`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Optionally set API base URL in `frontend/.env` (defaults to `http://localhost:5000/api`):
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
4. Run the dev server:
   ```bash
   npm run dev
   ```

### 3 Usage
1. Visit the app in the browser (Vite prints the URL, typically `http://localhost:5173`).
2. Register a new account. Password must be 8–12 chars with upper, lower, number, and special char.
3. Log in and start adding transactions.
4. Explore charts on the Dashboard.

## Notes
- Deleting a user in the DB will log them out on the next request due to middleware checks.
- All API requests from the frontend go through a centralized helper with automatic JWT and 401 handling.


