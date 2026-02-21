# Intern Mentor 2026

Intern Mentor 2026 is a role-based internship preparation platform built on Next.js with Google OAuth, Supabase, and Google Drive. It supports admin task management, student submissions, analytics, and LeetCode progress tracking.

**Key Features**
- Google OAuth login with role-based access (admin vs user).
- Admin dashboard with:
  - Task creation (title, deadline, problem, hints) and attachments.
  - Document uploads to Google Drive.
  - Submission review with approve/reject and admin remarks.
  - User list with removal capability.
  - Performance analytics (active users, completion rate, momentum, weekly progress).
  - LeetCode stats by user handle (unofficial GraphQL).
- Student dashboard with:
  - Tasks + attachments.
  - Answer submissions (link, text, or image upload).
  - Submission status + admin remarks.
  - Daily check-in + streak rewards.
  - Learning materials list (Drive file listing).
  - LeetCode progress + last 5 accepted.
  - Birthday popper (date of birth required).

**Tech Stack**
- Next.js App Router
- NextAuth (Google OAuth)
- Supabase (DB + Storage)
- Google Drive API

---

## Setup

### 1) Install dependencies
```bash
npm install
```

### 2) Environment variables
Create `intern_mentor/.env.local`:
```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
ADMIN_EMAIL_ALLOWLIST=admin@example.com,another.admin@example.com

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=submission-images

# Preferred for Vercel: paste full service account JSON as one-line string
GOOGLE_SERVICE_ACCOUNT_KEY_JSON=

# Optional fallback instead of KEY_JSON
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=

GOOGLE_DRIVE_FOLDER_ID=
```

For Vercel, do not use `GOOGLE_SERVICE_ACCOUNT_KEY_PATH` because runtime cannot access your local disk path.
Set `GOOGLE_SERVICE_ACCOUNT_KEY_JSON` to the full service-account JSON (single-line value) in Vercel Environment Variables.

### 3) Supabase SQL schema
Run in Supabase SQL editor:
```sql
create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text,
  place text,
  date_of_birth date,
  leetcode_id text,
  created_at timestamptz default now(),
  updated_at timestamptz
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  deadline date,
  problem text not null,
  hints text not null,
  attachment_url text,
  attachment_name text,
  created_at timestamptz default now()
);

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  user_name text,
  task_id uuid,
  answer_url text,
  answer_text text,
  answer_image_url text,
  admin_remark text,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists checkins (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  checkin_date date not null,
  created_at timestamptz default now(),
  unique (email, checkin_date)
);
```

### 4) Supabase Storage
Create a public bucket:
```
submission-images
```

### 5) Google OAuth scope
The app requests Drive file access so the admin can upload into their own Drive:
```
https://www.googleapis.com/auth/drive.file
```
After enabling this scope, sign out and sign back in so the token includes Drive permissions.

---

## Run
```bash
npm run dev
```

---

## Notes
- LeetCode stats use the unofficial GraphQL endpoint. This may be rate-limited or blocked by LeetCode.
- Admin analytics are derived from check-ins and submissions.
- If tables or buckets are missing, UI features will appear but data will not persist.
