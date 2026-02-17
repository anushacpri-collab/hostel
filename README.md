# Hostel Entry Authorization Application (QR + Parent Verification)

Production-oriented monorepo implementing hostel leave and gate-entry authorization with strict **parent-child verification before student activation**.

## Folder Structure

```text
hostel/
  backend/
    src/
      app.js
      server.js
      config/
      controllers/
      middleware/
      routes/
      services/
      db/schema.sql
    scripts/seed.js
    .env.example
    package.json
  frontend/
    lib/
      main.dart
      core/
      screens/
      l10n/
    pubspec.yaml
```

## Core Verification Rule Implemented

1. Student registers with `collegeId + parentPhone` (`POST /api/auth/student/register`)
2. Student remains locked: `users.is_active=false` and `students.account_locked=true`
3. Parent logs in using phone (`POST /api/auth/parent/login-phone`)
4. Parent verifies OTP (`POST /api/auth/parent/verify-otp`)
5. On success:
   - Parent `is_active=true`
   - Linked student user `is_active=true`
   - Student `account_locked=false`
6. Until verified, student login returns HTTP `423 Locked` and protected student APIs are blocked by middleware.

## MySQL Schema

Run:

```bash
mysql -u root -p < backend/src/db/schema.sql
```

Tables:
- `users`
- `students`
- `parent_otps`
- `leave_requests`
- `qr_passes`
- `gate_logs`
- `notifications`

## Backend Setup (Node.js + Express)

```bash
cd backend
cp .env.example .env
npm install
npm run start
```

Optional seed for authority/watchman users:

```bash
npm run db:seed
```

## Frontend Setup (Flutter Android + Web)

```bash
cd frontend
flutter pub get
flutter run -d chrome
# or flutter run -d android
```

## REST API Summary

### Auth
- `POST /api/auth/student/register`
- `POST /api/auth/student/login`
- `POST /api/auth/parent/login-phone`
- `POST /api/auth/parent/verify-otp`

### Student (JWT role STUDENT + unlocked)
- `POST /api/student/profile/complete`
- `POST /api/student/leave/apply`
- `GET /api/student/leave`
- `GET /api/student/qr`

### Parent (JWT role PARENT)
- `GET /api/parent/students`
- `POST /api/parent/emergency-extension`

### Deputy Warden / Principal
- `GET /api/authority/leaves`
- `POST /api/authority/deputy/decision`
- `POST /api/authority/principal/decision`
- `GET /api/authority/gate-logs`

### Watchman
- `POST /api/watchman/scan`

## QR Workflow

- Deputy warden approval creates QR token record in `qr_passes` with validity window.
- QR payload is encoded as JSON token and returned as Data URL.
- Watchman sends scanned token to `/api/watchman/scan`.
- Backend validates:
  - token existence
  - time window (`valid_from`, `valid_to`)
  - one-time exit/entry usage
- Access decision is logged in `gate_logs`.

## Parent Notification Workflow

- On leave apply: insert notification for parent user.
- On approval: insert notification for parent user.
- SMS OTP in this build is mocked in backend logs (`[MOCK_SMS]`).

## Security Practices Included

- JWT auth with role-based authorization
- Account lock enforcement middleware
- Helmet + CORS + global rate limiting
- Joi request validation
- Password hashing (`bcryptjs`)
- SQL parameterized queries (`mysql2`)

## Download Link

This environment cannot directly host files publicly. To create a downloadable artifact yourself:

```bash
cd /workspace
zip -r hostel-app.zip hostel
```

This generates `hostel-app.zip`, which you can upload/share.
