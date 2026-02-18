# Hostel Entry Authorization Application (QR + Parent Verification)

Production-ready monorepo implementing hostel leave authorization and gate entry/exit control with **strict parent-child verification before student account activation**.

## ✅ Tech Stack (Implemented)

- **Frontend:** Flutter (Android + Flutter Web), Dart, responsive Material 3 UI, English + Tamil labels
- **Backend:** Node.js + Express.js (modular controllers/services/routes)
- **Database:** MySQL (`mysql2` + SQL schema)
- **QR:** ZXing-compatible payload flow (`@zxing/library` for scanning/validation support + `qrcode` generation)
- **Security:** JWT RBAC, bcrypt hashing, Joi validation, Helmet, rate limiting, CORS

---

## 1) Core Business Rule (Parent Verification Lock) – Enforced

### Registration and activation lifecycle

1. Student registers with **college ID + parent phone**.
2. Student account is created in **LOCKED** state (`users.is_active = false`, `students.account_locked = true`).
3. Parent logs in using **only linked phone number**.
4. Parent verifies OTP.
5. On OTP success:
   - parent account becomes active,
   - linked student account becomes active,
   - student lock removed.
6. Until then, student login is restricted (HTTP `423 Locked`) and student-protected routes are blocked.

---

## 2) Folder Structure

```text
hostel/
  backend/
    .env.example
    package.json
    scripts/
      seed.js
    src/
      app.js
      server.js
      config/
        env.js
        db.js
      controllers/
        authController.js
        studentController.js
        parentController.js
        authorityController.js
        watchmanController.js
      middleware/
        authMiddleware.js
        studentGate.js
        errorMiddleware.js
      routes/
        authRoutes.js
        studentRoutes.js
        parentRoutes.js
        authorityRoutes.js
        watchmanRoutes.js
      services/
        authService.js
        otpService.js
        qrService.js
        notificationService.js
      utils/
        asyncHandler.js
        httpError.js
      db/
        schema.sql
  frontend/
    pubspec.yaml
    lib/
      main.dart
      core/
        api_client.dart
        app_state.dart
      l10n/
        strings.dart
      screens/
        auth/login_selector_screen.dart
        student/student_register_screen.dart
        student/student_qr_screen.dart
        parent/parent_login_screen.dart
        dashboard/deputy_dashboard_screen.dart
        watchman/watchman_scan_screen.dart
  README.md
```

---

## 3) MySQL Database Schema

Create DB and import schema:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS hostel_auth"
mysql -u root -p hostel_auth < backend/src/db/schema.sql
```

### Main tables

- `users` (roles: STUDENT, PARENT, DEPUTY_WARDEN, PRINCIPAL, WATCHMAN)
- `students` (parent linkage, account lock, profile flags)
- `parent_otps` (OTP + expiry + verification state)
- `leave_requests` (workflow states incl. principal escalation)
- `qr_passes` (token + validity + usage flags)
- `gate_logs` (entry/exit decisions)
- `notifications` (digital notification history)

---

## 4) Backend Setup (Node.js + Express)

```bash
cd backend
cp .env.example .env
npm install
npm run start
```

### Optional seed users

```bash
npm run db:seed
```

This creates role users like Deputy Warden / Principal / Watchman for dashboard testing.

### Sample `.env`

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=change_this_super_secret_key
JWT_EXPIRES_IN=12h
OTP_TTL_MINUTES=10
QR_TTL_MINUTES=30

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=hostel_auth
```

---

## 5) Flutter Setup (Android + Web)

```bash
cd frontend
flutter pub get
flutter run -d chrome     # web dashboard + role screens
# OR
flutter run -d android    # mobile flow
```

---

## 6) REST APIs (Role-wise)

### Auth

- `POST /api/auth/student/register`
- `POST /api/auth/student/login`
- `POST /api/auth/parent/login-phone`
- `POST /api/auth/parent/verify-otp`
- `POST /api/auth/staff/login`

### Student (JWT `STUDENT` + unlocked)

- `POST /api/student/profile/complete`
- `POST /api/student/leave/apply`
- `GET /api/student/leave`
- `GET /api/student/qr`

### Parent (JWT `PARENT`)

- `GET /api/parent/students`
- `POST /api/parent/emergency-extension`

### Deputy Warden / Principal

- `GET /api/authority/leaves`
- `POST /api/authority/deputy/decision`
- `POST /api/authority/principal/decision`
- `POST /api/authority/emergency/decision`
- `GET /api/authority/gate-logs`

### Watchman

- `POST /api/watchman/scan`

---

## 7) QR Generation + Gate Validation Workflow

1. Student submits leave.
2. Deputy Warden approves.
3. Backend creates QR token record in `qr_passes` and returns QR Data URL.
4. Watchman scans QR and calls `/api/watchman/scan`.
5. Backend validates:
   - token exists,
   - valid within leave + QR window,
   - usage rules (exit then entry, no replay),
   - leave status approved.
6. Result stored in `gate_logs` (allow/deny + reason).

---

## 8) Parent Notification Workflow

- On leave apply: parent gets notification record.
- On approval: parent gets notification record.
- OTP sending is mockable in development (`[MOCK_SMS]` logs) and can be replaced with Twilio/Fast2SMS.

---

## 9) Security Controls Included

- JWT auth + role-based middleware
- Student lock guard middleware
- Joi input validation
- bcrypt password hashing
- SQL parameterization (`mysql2` prepared statements)
- Helmet hardening
- Rate limiting
- CORS support
- Centralized error handling

---

## 10) API Quick Test Flow (cURL)

### 1. Student registration

```bash
curl -X POST http://localhost:5000/api/auth/student/register \
  -H "Content-Type: application/json" \
  -d '{"collegeId":"CSE1001","name":"Arun","department":"CSE","parentPhone":"9876543210","password":"Secret123"}'
```

### 2. Parent login phone

```bash
curl -X POST http://localhost:5000/api/auth/parent/login-phone \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210"}'
```

### 3. Parent OTP verify

```bash
curl -X POST http://localhost:5000/api/auth/parent/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","otp":"123456"}'
```

### 4. Student login after activation

```bash
curl -X POST http://localhost:5000/api/auth/student/login \
  -H "Content-Type: application/json" \
  -d '{"collegeId":"CSE1001","password":"Secret123"}'
```

---

## 11) Step-by-step to push/run from GitHub

### A. Create repository and push

```bash
cd /workspace/hostel
git init
git add .
git commit -m "Initial hostel entry authorization app"
git branch -M main
git remote add origin https://github.com/<your-username>/hostel-entry-authorization.git
git push -u origin main
```

### B. Clone on a new machine

```bash
git clone https://github.com/<your-username>/hostel-entry-authorization.git
cd hostel-entry-authorization
```

### C. Run backend

```bash
cd backend
cp .env.example .env
# update .env with your MySQL credentials
npm install
npm run start
```

### D. Run frontend

```bash
cd ../frontend
flutter pub get
flutter run -d chrome
```

### E. Production recommendation

- deploy backend behind Nginx + PM2,
- move secrets to env/secret manager,
- use managed MySQL with backups,
- integrate real SMS provider,
- enable HTTPS and stricter CORS origin whitelisting.

---

## 12) Downloadable artifact

This environment cannot host public files directly, but you can generate a shareable zip:

```bash
cd /workspace
zip -r hostel-entry-authorization.zip hostel
```

Upload this zip to GitHub Releases / Google Drive / S3 and share the link.

## 13) All files included

This repository already contains all backend and frontend source files needed to run the application end-to-end locally.
