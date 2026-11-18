# EnglishYaari - Backend Developer Assignment

A production-ready REST API application built with **Node.js, TypeScript, Express.js, MongoDB, and Mongoose** for the EnglishYaari session booking platform.

---

## 📑 Table of Contents
- [Objective & Architecture](#objective--architecture)
- [System Design Highlights](#system-design-highlights)
- [MongoDB Aggregation Pipelines](#mongodb-aggregation-pipelines)
- [Database Schemas & Indexing Strategy](#database-schemas--indexing-strategy)
- [API Endpoints Reference](#api-endpoints-reference)
- [Getting Started](#getting-started)
- [Database Seeding](#database-seeding)
- [Postman Collection](#postman-collection)
- [Error Handling & Response Format](#error-handling--response-format)

---

## 🎯 Objective & Architecture

The application enables English learners to browse and book 1-on-1 English training sessions with teachers, and review their upcoming and completed session history.

### Layered (3-Tier) Architecture
The codebase strictly adheres to Separation of Concerns (SoC) and Clean Code principles:

```
src/
├── config/             # Database connection & runtime configurations
├── constants/          # Enums (SessionStatus)
├── controllers/        # HTTP request/response handlers
├── middlewares/        # Zod validation & centralized error handling
├── models/             # Mongoose schemas with TypeScript interfaces & compound indexes
├── routes/             # RESTful API route definitions
├── scripts/            # Database seed script for quick verification
├── services/           # Core business logic, atomic updates, and aggregation pipelines
├── utils/              # Custom AppError, response wrapper, async handler, and date helpers
├── app.ts              # Express application bootstrap
└── server.ts           # HTTP server startup & database initialization
```

---

## ⚡ System Design Highlights

### 1. Concurrency Control (Preventing Double Booking)
- **Problem:** If two users attempt to book the same `AVAILABLE` session simultaneously, traditional read-then-write logic creates a race condition where both users get confirmed.
- **Solution:** We implement atomic MongoDB operations using `findOneAndUpdate`:
  ```typescript
  const updatedSession = await Session.findOneAndUpdate(
    { _id: sessionId, status: SessionStatus.AVAILABLE },
    { $set: { status: SessionStatus.BOOKED, userId: userObjectId } },
    { new: true }
  );
  ```
  MongoDB locks the document at the engine level. Only the first request can transition the state; concurrent requests receive a `409 Conflict`.

### 2. Timezone-Safe Date Boundaries
- Client requests query sessions using `dateTimestamp` (epoch milliseconds or ISO strings).
- We compute explicit UTC day boundaries (`00:00:00.000` to `23:59:59.999`) to guarantee zero timezone bleed across different client locales.

---

## 🔬 MongoDB Aggregation Pipelines

As per mandatory requirements, complex queries are powered by MongoDB Aggregation Pipelines:

### 1. Available Sessions (`GET /sessions/available?dateTimestamp={timestamp}`)
- **`$match`**: Filters documents with `status: 'AVAILABLE'` and `startTime` within the 24-hour target date. Hits the compound index `{ status: 1, startTime: 1 }` first.
- **`$lookup`**: Joins the `teachers` collection using `teacherId`.
- **`$unwind`**: Flattens the joined teacher array into a clean object.
- **`$project`**: Shapes the payload to expose necessary teacher metadata (name, specialization, experience) without leaking internal database fields.
- **`$sort`**: Orders chronologically by `startTime: 1`.

### 2. User Session List (`GET /users/:id/sessions`)
- **`$match`**: Matches sessions by `userId`.
- **`$lookup` & `$unwind`**: Joins associated teacher metadata.
- **`$facet`**: Executes multi-faceted sub-pipelines in a single database roundtrip:
  - **`upcomingSessions`**: Filters `status: 'BOOKED'`, sorted chronologically.
  - **`completedSessions`**: Filters `status: 'COMPLETED'`, sorted reverse-chronologically by `completedAt`.

---

## 🗄️ Database Schemas & Indexing Strategy

### 1. User Schema (`src/models/user.model.ts`)
- `fullName`: String (required, trimmed)
- `email`: String (required, unique, lowercase, indexed)
- `phone`: String (required, trimmed)
- `timestamps`: `createdAt`, `updatedAt`

### 2. Teacher Schema (`src/models/teacher.model.ts`)
- `fullName`: String (required, trimmed)
- `email`: String (required, unique, lowercase, indexed)
- `specialization`: String (required, trimmed)
- `experience`: Number (required, years of experience)
- `timestamps`: `createdAt`, `updatedAt`

### 3. Session Schema (`src/models/session.model.ts`)
- `teacherId`: ObjectId (ref: `Teacher`, required, indexed)
- `userId`: ObjectId | null (ref: `User`, default: null, indexed)
- `startTime`: Date (required)
- `endTime`: Date (required)
- `status`: Enum (`AVAILABLE` | `BOOKED` | `COMPLETED`, default: `AVAILABLE`)
- `completedAt`: Date | null (default: null)
- `timestamps`: `createdAt`, `updatedAt`

**Compound Indexes:**
- `{ status: 1, startTime: 1 }`: Optimizes API 3 availability queries by converting collection scans into B-tree index scans (**IXSCAN**).
- `{ userId: 1, status: 1 }`: Optimizes API 6 history lookups per user.

---

## 📡 API Endpoints Reference

Base URL: `http://localhost:5001` (or configured `PORT`)

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `POST` | `/users` | Create a new user (unique email) | `201`, `400`, `409` |
| `POST` | `/teachers` | Create a new teacher | `201`, `400`, `409` |
| `GET` | `/teachers` | List all teachers | `200` |
| `POST` | `/sessions` | Create teacher session (`endTime > startTime`, validates teacher) | `201`, `400`, `404`, `409` |
| `GET` | `/sessions/available?dateTimestamp={ts}` | Available sessions on date (Aggregation Pipeline) | `200`, `400` |
| `POST` | `/sessions/:id/book` | Book session for a user (Atomic) | `200`, `400`, `404`, `409` |
| `PATCH` | `/sessions/:id/complete` | Mark session as completed (Atomic) | `200`, `400`, `404`, `409` |
| `GET` | `/users/:id/sessions` | User's Upcoming & Completed sessions (`$facet` Aggregation) | `200`, `400`, `404` |
| `GET` | `/health` | Server health check | `200` |

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+ recommended)
- MongoDB (Local instance or MongoDB Atlas connection URI)

### 2. Installation
```bash
git clone https://github.com/Gaurav-meena95/englishyaari-backend.git
cd englishyaari-backend
npm install
```

### 3. Environment Setup
Copy the `.env.example` file to create `.env`:
```bash
cp .env.example .env
```
Update `.env` with your settings:
```env
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/englishyaari?retryWrites=true&w=majority
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Build and Run in Production Mode
```bash
npm run build
npm start
```

---

## 🌱 Database Seeding

To quickly test the APIs with populated data (users, teachers, and sessions for today):
```bash
npm run seed
```
This populates sample records ready for immediate booking, completing, and history viewing.

---

## 📮 Postman Collection

A complete, pre-configured Postman Collection is included at:
`./postman_collection.json`

### How to use:
1. Open Postman.
2. Click **Import** and select `postman_collection.json`.
3. Set the `baseUrl` collection variable (default: `http://localhost:5001`).
4. Requests automatically persist `userId`, `teacherId`, and `sessionId` into collection variables upon creation.

---

## 🛡️ Error Handling & Response Format

All responses follow a predictable JSON contract:

### Success Response (`200 OK`, `201 Created`):
```json
{
  "success": true,
  "message": "Session created successfully",
  "data": { ... }
}
```

### Error Response (`400 Bad Request`, `404 Not Found`, `409 Conflict`, `500 Server Error`):
```json
{
  "success": false,
  "message": "A user with this email already exists"
}
```
