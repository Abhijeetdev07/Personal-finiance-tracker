# Personal Finance Tracker (MERN)

A full‑stack Personal Finance Tracker built with MongoDB, Express, React, and Node.js for recording transactions, managing budgets, and visualizing spending trends.  
It supports authentication, categories, budgets, recurring entries, CSV import/export, and charts.

## Features

- User authentication (sign up, login, JWT session)  
- Add, edit, delete transactions (income/expense), with categories and notes  
- Monthly budgets and alerts when nearing limits  
- Dashboards with charts for spending by category and over time  
- CSV import/export for transactions  
- Dark/light theme and responsive UI  
- Secure configuration via environment variables

## Tech Stack

- Frontend: React + State Management (Context/Redux), React Router, Fetch/Axios  
- Backend: Node.js, Express.js, JWT, bcrypt  
- Database: MongoDB (Mongoose)  
- Tooling: ESLint, Prettier, Jest/Supertest (API), Vite or CRA (choose one)  
- Deployment: Any Node host for API (e.g., Render/Railway) and static host for client (e.g., Vercel/Netlify)


## Getting Started

### Prerequisites
- Node.js (LTS) and a package manager (npm, pnpm, or yarn)  
- MongoDB URI (local or hosted)  
- Git (optional but recommended)


## Testing

- API tests with Jest + Supertest for controllers and routes  
- Unit tests for utilities (formatting amounts, date helpers)  
- Optional E2E test flow: register → login → create transaction → verify totals

## Security & Hardening

- Do not commit .env; use .env.example for safe placeholders  
- Enable CORS only for trusted origins  
- Add rate limiting, Helmet, validation (Joi/Zod)  
- Hash passwords (bcrypt) and sign short‑lived JWTs

## Deployment

- API: Deploy Node/Express; set env vars (MONGODB_URI, JWT_SECRET, ALLOWED_ORIGINS)  
- Client: Build static site and deploy; set API base URL env for production  
- Ensure correct CORS and HTTPS; rotate secrets periodically

## Roadmap

- Recurring transactions scheduler  
- Multi‑currency and FX conversion  
- Shared budgets and households  
- Bank integrations (OFX/PLAID‑like)  
- Advanced analytics and export formats

## Contributing

1) Fork → create feature branch → commit with conventional messages → PR  
2) Add or update tests and docs for new features  
3) Ensure lint passes and CI is green

## License

MIT — see LICENSE for details.

## Acknowledgements

- MERN architecture patterns and common project layouts  
- Community articles and docs on Node, Express, React, and MongoDB






