# Velvra

A subscription content platform (an OnlyFans-style app) with a distinct brand name.
Creators post free and pay-per-view content; fans subscribe monthly or unlock
individual posts. **All payments in this build are simulated (dummy) — no real
payment processor is integrated.**

- **Backend**: Spring Boot 3 (Java 17), MySQL, Spring Security + JWT, Flyway migrations
- **Frontend**: Next.js 16 (App Router, TypeScript), Tailwind CSS

## Features

- Email/username + password auth (JWT), roles: `FAN`, `CREATOR`, `ADMIN`
- Creator profiles: avatar, cover image, bio, category, subscription price
- Posts with image/video media, free or locked behind a pay-per-view price
- Subscriptions (30-day, simulated payment) and per-post PPV unlocks
- Feed of posts from creators you're subscribed to
- Likes, comments, follows
- Notifications (new subscriber, like, comment, follower, post unlocked)
- Admin panel: platform stats, user list, enable/disable users
- Media is stored on local disk and served from the backend (`/media/**`) —
  swappable later for a CDN like Cloudinary since it sits behind a small
  `StorageService` interface

## Quickest way to run it: Docker

If you have Docker Desktop (or Docker Engine + Compose) installed, this is the
whole setup:

```bash
docker compose up --build
```

That builds and starts MySQL, the backend, and the frontend together, wired
to talk to each other. Once it's up (the first build takes a few minutes),
open **http://localhost:3000**. Data persists in Docker volumes across restarts;
`docker compose down -v` wipes it clean.

Seeded admin account: **`admin`** / **`Admin@123`**.

To stop everything: `docker compose down` (add `-v` to also delete the database
and uploaded media volumes).

### Running on different ports

If 3000 or 8080 are already taken, copy `.env.example` to `.env` and set
`FRONTEND_PORT` / `BACKEND_PORT` there:

```bash
cp .env.example .env
# edit .env: set FRONTEND_PORT=4000 (or whatever you need)
docker compose up --build
```

Then open `http://localhost:4000` (or whatever you set `FRONTEND_PORT` to).

**Use the `.env` file, not an inline `FRONTEND_PORT=4000 docker compose up`.**
The backend's CORS allow-list is derived from `FRONTEND_PORT`, and Docker
Compose only applies an inline env var to the exact command it's attached to.
If you later run a scoped command like `docker compose up --build backend`
(e.g. to pick up a backend code change) without repeating `FRONTEND_PORT=4000`,
the backend gets recreated with CORS defaulting back to port 3000 while your
frontend is still on 4000 — registration and login then fail in the browser
with a CORS error, even though `curl` against the backend still works fine.
A `.env` file is read on every invocation automatically, so this can't happen.

## Running without Docker

### Prerequisites

- Java 17+, Maven
- Node.js 20+
- MySQL 8 (or MariaDB) running locally

### 1. Database

Create a database and user (defaults match `backend/src/main/resources/application.yml`):

```sql
CREATE DATABASE velvra;
```

The backend defaults to `root` / `root` on `localhost:3306` — override with env
vars (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`) if different.
Flyway creates the schema automatically on startup, and seeds the same demo
admin account (`admin` / `Admin@123`).

### 2. Backend

```bash
cd backend
mvn spring-boot:run
```

Runs on `http://localhost:8080`. Uploaded media is written to `./uploads`
(configurable via `UPLOAD_DIR`) and served at `/media/**`. To use a different
port: `SERVER_PORT=9090 mvn spring-boot:run`.

### 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local   # points at http://localhost:8080 by default
npm install
npm run dev
```

Runs on `http://localhost:3000` by default. To use a different port:
`npm run dev -- -p 4000` (and update `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
if you also changed the backend's port).

## Trying it out

1. Sign up as a **creator**, go to **Studio**, and publish a free post and a
   locked (pay-per-view) post.
2. Log out, sign up as a **fan**, go to **Explore**, open the creator's profile,
   and hit **Subscribe** — you'll see a "Simulated Payment" modal (no real card
   is charged). Subscribing unlocks all of that creator's posts.
3. Register a second fan account (without subscribing) to see the pay-per-view
   paywall and the "Unlock for $X" flow instead.
4. Log in as `admin` / `Admin@123` to see platform-wide stats and manage users.

## What's still a placeholder

Per the initial scope, these are intentionally simplified and would need real
integrations before any production use:

- **Payments** are simulated — swap `PaymentService` for a real processor
  (e.g. Stripe Connect, which is the standard choice for marketplace-style
  payouts to creators).
- **Media storage** is local disk — swap `StorageService`'s implementation for
  Cloudinary or S3 for production-grade CDN delivery, transcoding, and thumbnails.
- **Email verification, password reset, 2FA** are not implemented.
- No content moderation, ID/age verification, or reporting tools.
