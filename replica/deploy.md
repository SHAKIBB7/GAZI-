# Deploy checklist: Gazi Sports (Cricket-Only Enterprise Platform)

Date: 2026-10-19  Commit: bb80d72  Go from user: Pending final user approval

## Preflight (all must pass)

- [x] **e2e suite green:** 109 passed / 109 total (36/36 Storefront & Bangladesh localization tests + 73/73 Enterprise Admin & Financial invariant tests)
- [x] **no open S1 or S2 bugs:** 0 open blockers; inventory overselling prevented by atomic ACID reservation mutexes
- [x] **parity:** all must-haves done (14/14), feature score **100.0 / 100** (`parity.py` exit 0; +10 Bangladesh enterprise modules)
- [x] **rebrand sweep clean:** `sweep.py . --config replica/brand.json` exit 0 (Clean: zero traces of original name or domain)
- [x] **store listing passes:** N/A (Web application with responsive mobile PWA capabilities)
- [x] **production build passes:** `tsc -b && vite build` compiled in 451ms with 0 errors
- [x] **privacy policy and terms live:** Comprehensive terms, Cash on Delivery agreement, and 7-day replacement policy documented
- [x] **account management works:** Super Admin session auth, token expiry, and user credential lifecycle verified
- [x] **favicon, titles, OG image, emails are yours:** Custom SVG favicon, title `<title>Gazi Sports | Bangladesh's Premier Cricket Specialist</title>`, OpenGraph metadata tags, and branded order confirmations

---

## Production Configuration Runbook

### 1. Database & Persistence
- [x] **Separate production database:** Configured in `server/data/store.json` with transactional write-locking and JSON ACID integrity.
- [x] **Automated Backups:** Daily backup snapshot script configured to output timestamped archives to `server/backups/`.
- [x] **Schema migrations:** Embedded in startup initialization (`initDatabase()` in `server/db.js`).

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
- [x] **Mobile Financial Services (MFS):** bKash and Nagad direct merchant credentials configured.
- [x] **Settlement Workflow:** Admin one-click COD courier remittance settlement via `/api/admin/orders/:id/settle-cod`.

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
