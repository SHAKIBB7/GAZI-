# Deploy checklist: Gazi Sports (Cricket-Only Enterprise Platform)

Date: 2026-10-19  Status: Production-Hardened & Audit Remediated

## Preflight (all must pass)

- [x] **e2e suite green:** 109 passed / 109 total (36/36 Storefront & Bangladesh localization tests + 73/73 Enterprise Admin & Financial invariant tests)
- [x] **no open S1 or S2 bugs:** 0 open blockers; multi-collection atomic FIFO Promise-Queue mutexes eliminate race conditions & overselling
- [x] **production build passes:** `tsc -b && vite build` compiled with 0 errors
- [x] **deployment config:** `vercel.json` configured with SPA fallback & `/api` proxy routing
- [x] **split-domain support:** `VITE_API_URL` dynamically configured with fallback for monolith or separate API host
- [x] **security & rate limiting:** Helmet security headers, SVG upload blocking (Stored XSS prevention), and Express rate limiting (1000 req/15m API, 20 req/15m login)
- [x] **account management:** Admin password change endpoint (`/api/admin/auth/change-password`) with bcrypt hashing and unified JWT secrets
- [x] **database corruption guard:** Hardened `readJsonSafe` rejects corrupted JSON rather than wiping database to `[]`; automated 10-version snapshot rotation to `server/backups/`
- [x] **payment safety:** MFS transactions (bKash/Nagad/Rocket) flagged as `pending_verification` for manual reconciliation before dispatch
- [x] **storefront & admin catalog sync:** Live catalog synchronization between storefront and admin product inventory
- [x] **favicon, titles, OG image:** Custom SVG favicon, `<title>Gazi Sports | Bangladesh's Premier Cricket Specialist</title>`, and OpenGraph metadata tags

---

## Production Configuration Runbook

### 1. Database & Persistence
- [x] **JSON Storage Engine:** Atomic FIFO Promise-Queue mutexes (`withLock` and deadlock-free `withLocks`) in `server/db.js`.
- [x] **Automated Backups:** Automated timestamped backup rotation `createBackupSnapshot()` to `server/backups/` (retains 10 latest snapshots).
- [x] **Safe Initialization:** Schema initialization with corruption halt protection in `server/db.js`.

### 2. Environment Variables (.env.production)
Set the following environment variables in your hosting provider matching `.env.example`:

```bash
NODE_ENV=production
PORT=4000
FRONTEND_PORT=3000
JWT_SECRET=<GENERATE_SECURE_256BIT_SECRET>
ADMIN_DEFAULT_PASSWORD=<SECURE_ADMIN_PASSWORD>
VITE_API_URL=https://api.gazisports.com
BKASH_APP_KEY=<BKASH_MERCHANT_KEY>
BKASH_APP_SECRET=<BKASH_MERCHANT_SECRET>
PATHAO_CLIENT_ID=<PATHAO_MERCHANT_ID>
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@mg.gazisports.com
SMTP_PASS=<SMTP_KEY>
SMTP_FROM="Gazi Sports Orders" <orders@gazisports.com>
```

### 3. Payment & Settlement Integrations
- [x] **Doorstep Cash on Delivery (COD):** Active default for all 64 districts with automated delivery calculation (Dhaka ৳70, Outside Dhaka ৳130, Free above ৳5,000).
- [x] **Mobile Financial Services (MFS):** bKash and Nagad direct transactions flagged `pending_verification` until verified.
- [x] **Settlement Workflow:** Admin one-click COD courier remittance settlement via `/api/admin/orders/:id/settle-cod`.
- [x] **Duplicate Return / Restock Guard:** Idempotency checks preventing double restocking on returned orders.

### 4. Email & Notifications
- [x] Sending domain verified (`gazisports.com`).
- [x] Transactional templates for:
  - Instant Order Confirmation with `GZ-BD-...` order ID and `GZ-TRK-...` tracking number.
  - Dispatch notification with courier tracking link.
  - Sizing replacement confirmation.

---

## Domain & DNS Setup

Primary Domain: `gazisports.com` (Registrar: Namecheap / Cloudflare / GoDaddy)

### Web Traffic Records

| Type | Name | Target / Value | TTL | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` | `76.76.21.21` (or your host's apex IP) | Auto / 300 | Apex domain routing |
| **CNAME** | `www` | `cname.vercel-dns.com` (or host target) | Auto / 300 | Subdomain redirect |
| **CNAME** | `api` | `gazisports-api.fly.dev` (or Render/VPS host) | Auto / 300 | Backend REST API endpoint |

### Email Authentication Records (SPF, DKIM, DMARC)

| Type | Name | Value | Purpose |
| :--- | :--- | :--- | :--- |
| **TXT** | `@` | `v=spf1 include:mailgun.org ~all` | Authorizes outgoing mail servers |
| **CNAME** | `k1._domainkey` | `k1._domainkey.mailgun.org` | DKIM cryptographic email signing |
| **TXT** | `_dmarc` | `v=DMARC1; p=none; rua=mailto:dmarc-reports@gazisports.com` | DMARC anti-spoofing policy |

- [x] **Canonical Host:** `https://gazisports.com` (redirects `http://` and `www.` to apex HTTPS).
- [x] **SSL / HTTPS:** Automatic Let's Encrypt TLS certificate provisioned at host edge.

---

## Watch & Operational Monitoring (Week 1)

- [ ] **Error Tracking:** Sentry SDK active on both frontend Vite client and Node.js backend.
- [ ] **Uptime Monitoring:** BetterUptime / UptimeRobot pinging:
  - Frontend Homepage: `https://gazisports.com/` (HTTP 200 check)
  - Backend API Health: `https://api.gazisports.com/api/health` (Checks JSON `status: "ok"` and `currency: "BDT"`)
- [ ] **Real-time Analytics:** Privacy-friendly, cookie-free analytics (Plausible / PostHog) to monitor conversion funnel.
- [ ] **Live Smoke Test:** Perform 1 real purchase on live production domain:
  - Verify phone validation with `017...` / `+88018...`
  - Verify free shipping threshold logic (৳5,000+)
  - Verify admin order reception and stock deduction
  - Cancel and verify automated restocking in inventory ledger
