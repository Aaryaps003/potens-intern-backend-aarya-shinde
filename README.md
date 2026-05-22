# Potens Tamper-Evident Log Service

A lightweight append-only logging service built for the Potens 2026 Backend Internship Take-Home Assignment.

The goal of this project was to design a system where logs can never be silently modified or deleted. Every log entry is cryptographically linked to the previous entry using SHA-256 hashing, making the entire chain self-verifiable and tamper-evident.

---

##  FEATURES

**Core Features**
* Append-only logging system
* SHA-256 hash chaining
* Full-chain verification
* Filtered JSON export
* API key authentication
* Structured request logging using Pino
* Rate limiting on write operations
* PostgreSQL-backed persistence

**Stretch Features Implemented**
* CLI verification command (`npm run verify`)

---

##  TECH STACK

* Node.js
* Express.js
* PostgreSQL (Neon)
* Prisma ORM
* Pino Logger
* express-rate-limit
* dotenv

---

##  PROJECT STRUCTURE

```text
src/
├── controllers/
├── middleware/
├── routes/
├── services/
├── utils/
├── scripts/
└── app.js
```

---

##  HOW TO RUN THE PROJECT

### 1. Clone Repository
```bash
git clone https://github.com/Aaryaps003/potens-intern-backend-aarya-shinde.git
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create .env File
Create a `.env` file in the root directory.

**Example:**
```env
DATABASE_URL="your_neon_database_url"
API_KEY="super-secret-dev-key"
PORT=3000
```
> **Note:** Ensure your PostgreSQL connection string includes `?sslmode=require`.

### 4. Run Database Migrations
```bash
npx prisma migrate dev --name init
```

### 5. Start Development Server
```bash
npm run dev
```
*Server runs on: http://localhost:3000*

---

##  AUTHENTICATION

Protected routes require the `x-api-key` header.

**Example:**
```http
x-api-key: super-secret-dev-key
```

---

##  API ENDPOINTS

### `POST /log`
Creates a new append-only log entry.

**Request Body:**
```json
{
  "actor": "Aarya",
  "action": "BUS_DISPATCHED",
  "payload": {
    "route": "Pune-Nashik"
  }
}
```

**What Happens Internally:**
1. Latest log entry is fetched.
2. Previous hash is extracted.
3. New SHA-256 hash is generated.
4. Entry is stored permanently.

### `GET /log/:id`
Returns a log entry along with verification status.

**Example Response:**
```json
{
  "id": 5,
  "actor": "Aarya",
  "verified": true
}
```

### `GET /verify`
Scans the entire chain and verifies integrity.

**Success Response:**
```json
{
  "status": "PASS"
}
```

**Failure Response:**
```json
{
  "status": "FAIL",
  "broken_entry_id": 8
}
```

### `GET /export`
Exports filtered logs as JSON.

**Supported Query Parameters:**
* `?actor=`
* `?startDate=`
* `?endDate=`

**Example:**
```http
/export?actor=Aarya
```

---

##  DESIGN & ARCHITECTURAL DECISIONS

The biggest thing I focused on while building this service was integrity.

While thinking about the problem, I used a simple analogy in my head:

**Imagine a string of pearls.** If the pearls are just lying separately, someone can replace or modify one pearl and nobody would know. But once every pearl is connected through a single thread, changing one pearl affects the entire chain structure.

That became the core idea behind this project.

Each log entry stores:
* Its own SHA-256 hash.
* The hash of the previous log entry.

This creates a linked chain where modifying even a single historical record causes the verification process to fail for every entry after it.

### 1. Why PostgreSQL (Neon) instead of SQLite
Although SQLite was allowed in the assignment, I chose PostgreSQL because append-only chains become sensitive under concurrent writes.

If two requests arrive at nearly the same time, both could potentially read the same latest hash and generate conflicting next entries. PostgreSQL gave me better control over constraints and concurrency handling while still being lightweight enough for a take-home project.

I used Neon because it simplified setup and allowed the project to run without requiring local database installation or Docker setup.

### 2. Preventing Chain Forks
One issue I identified early was accidental chain forking. If two log entries are generated simultaneously using the same `previous_hash`, the integrity chain becomes invalid.

To prevent this:
* I added a `UNIQUE` constraint on `previous_hash`.
* Wrapped inserts in retry logic.
* Regenerated hashes when collisions occurred.

This allowed the chain to remain linear and tamper-evident even under concurrent requests.

### 3. Timestamp Consistency
For hashing consistency, I used Unix epoch timestamps (`Date.now()`) instead of relying entirely on database timestamps. 

This ensures the exact same numerical value is available during verification, avoiding timezone or precision mismatches between Node.js and PostgreSQL.

### 4. Dynamic & Safe Export Queries
The `/export` endpoint supports filtering by actor, start date, and end date. I implemented this using parameterized dynamic query construction to safely support optional filters while preventing SQL injection risks.

---

##  VERIFICATION LOGIC

The `/verify` endpoint recalculates every log hash sequentially.

For each entry:
1. Previous hash linkage is checked.
2. Current hash is recomputed.
3. Stored and generated hashes are compared.

If any mismatch occurs:
* The chain is marked invalid.
* Verification stops.
* The first broken entry ID is returned.

This makes tampering mathematically detectable.

---

##  LOGGING & SECURITY

**Structured Logging**
Implemented using `pino`. Logs include incoming requests, auth failures, verification failures, and internal errors.

**Rate Limiting**
Implemented on `POST /log` to prevent spam or abuse.

**Authentication**
Simple API-key middleware added for protected access.

---

##  CLI VERIFICATION

Run full-chain verification directly from the terminal:

```bash
npm run verify
```

This performs the same integrity scan as the `/verify` API endpoint.

---

##  COMPLETION STATUS

**Core Requirements**
- [x] `POST /log`
- [x] `GET /log/:id`
- [x] `GET /verify`
- [x] `GET /export`
- [x] Structured logging
- [x] Rate limiting
- [x] API key authentication
- [x] Database migrations checked in

**Stretch Goals**
- [x] CLI verification command
- [ ] Docker Compose
- [ ] Merkle-tree batching

---

##  WHAT I WOULD BUILD NEXT

If I had more time, I would implement Merkle-tree batching for faster verification on extremely large datasets. 

Currently, verification is an O(N) operation because every row must be checked sequentially. 

My next approach would be:
1. Batch logs into blocks.
2. Generate a Merkle Root for each block.
3. Verify block-level hashes instead of scanning every row.

This would significantly improve performance for 100k+ log entries.

I would also:
* Add JWT-based authentication.
* Add signed export files.
* Add audit dashboards.
* Add immutable backup snapshots.

---

##  AI USE LOG

In accordance with Rule 6 from the assignment brief:

* **Tool Used:** Gemini
* **Approximate Usage:** ~25 conversational turns
* **Purpose:** Used as a pair-programming assistant to:
  * Troubleshoot Windows terminal issues.
  * Debug Node.js dependency setup.
  * Resolve Prisma/PostgreSQL migration issues.
  * Discuss architectural tradeoffs.
  * Refine README structure and documentation clarity.

*No code was blindly copied. All final implementation decisions, architecture choices, and debugging validation were manually reviewed and understood before integration.*

---

##  AUTHOR

**Aarya Shinde**
*Built as part of the Potens Backend Internship Take-Home Assignment 2026.*