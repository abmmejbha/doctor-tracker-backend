# Doctor Tracker - Backend API

**Doctor Tracker API** is a RESTful service built with Node.js, Express and MongoDB that powers the Doctor Tracker admin portal. It provides JWT authentication, doctor and patient management with search, filtering and pagination, and a dashboard endpoint that computes analytics with MongoDB aggregation pipelines.

- **Live API:** https://doctor-tracker-backend-gly8.onrender.com/api (health check: `/api/health`)
- **Frontend repo (with screenshots):** https://github.com/abmmejbha/doctor-tracker-frontend
- **Live app:** https://doctor-tracker-frontend-xi.vercel.app
- **Demo login:** `admin@doctortracker.com` / `Admin@123`

> Hosted on Render's free tier; the first request after idle may take 30-50 seconds.

## Setup Guide

1. Clone and install:
   ```bash
   git clone https://github.com/abmmejbha/doctor-tracker-backend.git
   cd doctor-tracker-backend
   npm install
   ```
2. Create the env file:
   ```bash
   cp .env.example .env
   ```
   | Variable | Description |
   |---|---|
   | `PORT` | Server port (default 5000) |
   | `MONGO_URI` | MongoDB connection string including database name, e.g. `mongodb+srv://user:pass@cluster.mongodb.net/doctor-tracker` |
   | `JWT_SECRET` | Long random string used to sign tokens |
   | `CLIENT_URL` | Allowed CORS origins, comma separated, e.g. `http://localhost:3000,https://your-app.vercel.app` |
3. Create the admin user and demo data:
   ```bash
   npm run seed        # admin@doctortracker.com / Admin@123
   npm run seed:data   # 20 doctors, 200 patients (replaces existing doctors/patients)
   ```
4. Run:
   ```bash
   npm run dev
   ```

## System Architecture

```mermaid
flowchart LR
  C[Next.js client] -->|REST + JWT| R[Routes]
  R --> M[Middleware: helmet, cors, auth, validation]
  M --> K[Controllers]
  K --> S[Mongoose models]
  S --> D[(MongoDB Atlas)]
  K -.errors.-> E[Central error handler]
```

```
src/
  config/       database connection
  models/       User, Doctor, Patient (+ indexes)
  controllers/  auth, doctor, patient, dashboard
  routes/       route definitions and validation rules
  middleware/   auth (JWT), validate, errorHandler
  utils/        query helpers (pagination, date range, regex escape)
```

**Request flow:** a request passes `helmet`/`cors`, then the route's `protect` middleware verifies the JWT, then `express-validator` rules run, then the controller queries MongoDB and returns JSON. Any thrown error ends in one central handler that maps duplicate keys to `409`, bad ids to `400` and everything else to `500`.

## API Reference

All routes except login require `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Log in, returns token + user |
| GET | `/api/auth/me` | Current user |
| GET | `/api/doctors` | List doctors. Query: `search, specialization, from, to, page, limit` |
| POST | `/api/doctors` | Create doctor |
| GET | `/api/doctors/specializations` | Distinct specializations (filter options) |
| GET | `/api/doctors/:id` | Single doctor |
| GET | `/api/doctors/:id/patients` | Patients of a doctor (paginated, searchable) |
| POST | `/api/doctors/:id/patients` | Add patient under a doctor |
| GET | `/api/patients` | List patients. Query: `search, condition, doctor, from, to, page, limit` |
| GET | `/api/patients/conditions` | Distinct conditions |
| PUT | `/api/patients/:id` | Edit patient |
| DELETE | `/api/patients/:id` | Delete patient |
| GET | `/api/dashboard/stats` | Totals, patients per doctor, condition breakdown, daily counts (`days` param) |

## Technical Decisions

### 1. Reference-based data model with compound indexes
A patient stores its `doctor` id instead of the doctor holding an array of patients. Documents stay small and unbounded arrays are avoided, and patients can be queried independently (global patient page) or per doctor with the same code. Indexes are designed around real query shapes: `{doctor, createdAt}`, `{condition, createdAt}`, `{specialization, createdAt}` and `{createdAt}`, so filter-then-sort queries and the dashboard's date-range `$match` use an index instead of scanning the collection.

### 2. Aggregation pipelines and parallel queries for analytics and lists
Dashboard numbers are produced inside MongoDB with `$match` (first, so indexes apply) → `$group` → `$sort` → `$limit` → `$lookup`, so only small result sets travel over the network. Independent queries (page data + total count, or the six dashboard queries) run concurrently with `Promise.all`, so latency is that of the slowest query rather than the sum. List endpoints cap `limit` at 50, escape user input before building regexes, and use `.lean()` for faster read-only responses. Trade-off: regex search is not index-optimal at very large scale; a text or Atlas Search index would be the next step.

## Security Notes
Passwords are hashed with bcrypt and excluded from queries by default (`select: false`); `helmet` sets secure headers; CORS is restricted to configured origins; inputs are validated with `express-validator`.