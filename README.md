<div align="center">

# 🏏 GAZI Sports — Enterprise Cricket Platform

**Next-Generation Cricket E-Commerce, Multi-Channel Catalog & Retail Management Suite**

[![CI Pipeline](https://github.com/SHAKIBB7/GAZI-/actions/workflows/ci.yml/badge.svg)](https://github.com/SHAKIBB7/GAZI-/actions/workflows/ci.yml)
[![Tests Passing](https://img.shields.io/badge/Tests-109%20Passed-22c55e.svg?style=flat-square&logo=jest)](tests/)
[![React Version](https://img.shields.io/badge/React-19.3.1-61dafb.svg?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0.2-3178c6.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3.4-646cff.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4.3.3-38bdf8.svg?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express-5.3.0-000000.svg?style=flat-square&logo=express)](https://expressjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

<p align="center">
  <a href="#-key-features">Key Features</a> •
  <a href="#-architecture--tech-stack">Architecture</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-inventory--financial-engine">Inventory & Financials</a> •
  <a href="#-api-reference">API Reference</a> •
  <a href="#-testing--verification">Testing</a> •
  <a href="#-deployment">Deployment</a>
</p>

---

</div>

## 📖 Overview

**GAZI Sports** is a specialized, production-grade cricket e-commerce and retail operations management platform built for cricket gear distributors, professional cricket players, and sports retail enterprises. 

Unlike generic e-commerce templates, GAZI is tailored specifically to the nuanced physics and equipment demands of cricket:
- **Cricket Bat Specifics**: Filter and inspect by **Willow Grade** (*Limited Edition Grade 1+ English Willow, Grade 1, Grade 2, Grade 3, Kashmir Willow*), grain counts, handle types, balance points, and edge profiles.
- **Full Gear Spectrum**: Protection (batting gloves, legguards, thigh guards, helmets), spiked footwear, wicketkeeping gear, match balls, and customized kitbags.
- **Bangladesh-Native Commerce**: Complete localization with Bangladeshi Taka (`৳` BDT) monetary engine, district-tier shipping logic, 8 administrative divisions, and mobile number normalization (GP, Robi, Banglalink, Airtel, Teletalk).
- **Enterprise Retail Suite**: Complete back-office command center handling double-entry inventory ledger movements, supplier purchase orders, physical stock count reconciliations, and P&L financial reports.

---

## ✨ Key Features

### 🛍️ 1. Customer Storefront & Catalog
- **Interactive Equipment Catalog**: High-performance grid with real-time stock availability chips, dynamic pricing, and brand filtering (*Gunn & Moore, Gray-Nicolls, Kookaburra, Newbery, DSC, SS, SG, New Balance, Salix, Chase, Adidas, Puma*).
- **Smart Filter Engine**: Instant multi-attribute filtering across category, brand, stock level, price bracket, and willow grade.
- **Fast Express Checkout**: Streamlined checkout featuring automatic subtotal discount logic (`CRICKET10`, `TIGERS10`), delivery fee calculations based on Dhaka vs. Out-of-Dhaka zones, and support for Cash on Delivery (COD) and Bangladesh MFS (bKash/Nagad).
- **Logistics Order Tracking**: Customers receive distinct order numbers (`GZ-BD-...`) and tracking IDs (`GZ-TRK-...`) with live delivery timeline updates.

### 🛡️ 2. Enterprise Admin Command Center
- **Stock & Inventory Ledger**: Real-time ledger recording every single stock movement (`initial_stock`, `stock_in`, `order_deduction`, `cancellation_restock`, `damaged`, `reconciliation`).
- **Physical Count Reconciliation**: Periodic warehouse audit tool that highlights variances between shelf counts and recorded stock, logging adjustment reasons for accountability.
- **Order Lifecycle Management**: Transition orders through structured states (`Pending` &rarr; `Processing` &rarr; `Dispatched` &rarr; `Delivered` / `Cancelled`). Cancellations automatically restore inventory to the ledger.
- **Supplier & Purchase Order System**: Manage vendor records, issue Purchase Orders (POs), and receive stock batches with auto-recalculated Weighted Average Cost (WAC).
- **Financial Analytics & P&L**: Live income statements tracking Gross Sales, Discounts, Net Sales, Cost of Goods Sold (COGS), Operating Expenses, and Net Profit. Exportable to CSV.
- **Tamper-Evident Audit Trail**: Every sensitive operation (price adjustment, stock write-off, refund, role elevation) is timestamped and cryptographically indexed.

---

## 🏗 Architecture & Tech Stack

```mermaid
graph TD
    subgraph Client ["Client Tier (Browser / Mobile)"]
        UI["React 19 + TypeScript"]
        Router["Vite 8 Single-Page Architecture"]
        Tailwind["Tailwind CSS v4 Design System"]
        Lucide["Lucide Enterprise Icon Set"]
    end

    subgraph API ["Backend API Layer (Node.js & Express 5)"]
        Server["Express Server (:4000)"]
        AuthMiddleware["JWT Authentication & RBAC"]
        Security["Helmet + Rate Limiting + CORS"]
        Routes["RESTful Route Controllers (/api)"]
    end

    subgraph Storage ["Persistence & Data Layer"]
        DB["db.js Atomic Transaction Engine"]
        Ledger["JSON Data Store (Atomic Temp Writes)"]
        Backups["Snapshot Backup Directory"]
    end

    UI -->|HTTP / REST (JSON)| Server
    Server --> Security
    Security --> AuthMiddleware
    AuthMiddleware --> Routes
    Routes --> DB
    DB --> Ledger
    DB --> Backups
```

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19, TypeScript, Vite 8 |
| **Styling & Components** | Tailwind CSS v4, Lucide React, Clsx, Tailwind Merge |
| **Backend & Routing** | Node.js v20+, Express.js 5, CORS, Dotenv |
| **Security & Protection** | Helmet, Express Rate Limit, JWT, Password Hashing |
| **Data Engine & Persistence** | Transactional file datastore with atomic file writes and automatic backup snapshots |
| **Code Quality & CI** | Oxlint, TypeScript Compiler (`tsc -b`), GitHub Actions CI |

---

## 📂 Repository Directory Layout

```text
GAZI-/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md             # Standardized bug reporting template
│   │   └── feature_request.md        # Feature suggestion template
│   ├── workflows/
│   │   └── ci.yml                    # Automated CI/CD pipeline (Lint, Build, Test)
│   └── pull_request_template.md      # Pull request checklist & review template
├── dist/                             # Compiled production assets (generated on build)
├── public/                           # Static assets, branding, and cricket graphics
├── replica/                          # Baseline dataset, feature schemas & design tokens
├── server/
│   ├── backups/                      # Automatic snapshot backups
│   ├── data/                         # Active JSON persistence datastores
│   │   ├── admins.json               # System administrators & role assignments
│   │   ├── audit_logs.json           # Immutable chronological audit logs
│   │   ├── expenses.json             # Operating overhead expenditures
│   │   ├── inventory_ledger.json     # Double-entry inventory movement ledger
│   │   ├── orders.json               # Customer purchase orders & state machine
│   │   ├── products.json             # Complete cricket equipment catalog
│   │   ├── purchases.json            # Supplier purchase order records
│   │   └── suppliers.json            # Manufacturer & vendor profiles
│   ├── routes/                       # Modular Express route handlers
│   │   ├── adminAuditLogs.js         # Audit inquiry endpoints
│   │   ├── adminAuth.js              # Admin authentication & session verification
│   │   ├── adminExpenses.js          # Operating expenses tracking
│   │   ├── adminInventory.js         # Stock adjustment & ledger routes
│   │   ├── adminOrders.js            # Order management & COD settlement
│   │   ├── adminProducts.js          # Product CRUD, willow grades & stock
│   │   ├── adminReports.js           # P&L, sales, COGS & CSV export
│   │   └── adminSuppliers.js         # Supplier PO intake & WAC recalculation
│   ├── auth.js                       # JWT authentication middleware & token helpers
│   ├── db.js                         # Atomic file persistence engine & backup runner
│   └── server.js                     # Main Express application & API router
├── src/
│   ├── admin/                        # Admin Portal screens & sub-tabs
│   │   ├── tabs/                     # Dashboard, Orders, Products, Inventory, Reports
│   │   └── AdminDashboard.tsx        # Command center layout & navigation
│   ├── components/                   # Reusable UI components (Navbar, Cart, ProductCard)
│   ├── context/                      # React State Contexts (Cart, Store, Auth)
│   ├── types/                        # Core TypeScript domain models & interfaces
│   ├── utils/                        # Currency formatters, validation regex, helpers
│   ├── App.tsx                       # Root React component & layout shell
│   ├── index.css                     # Global styles & Tailwind CSS v4 directives
│   └── main.tsx                      # Vite React 19 bootstrap entrypoint
├── tests/
│   ├── verify-replica.cjs            # Bangladesh localization & cricket invariants test suite
│   └── verify-enterprise-admin.cjs   # Admin suite, ledger, and financials test suite
├── .env.example                      # Production environment template
├── .gitignore                        # Comprehensive Git ignore rules
├── CHANGELOG.md                      # Detailed release history & versioning notes
├── CODE_OF_CONDUCT.md                # Contributor Covenant Code of Conduct
├── CONTRIBUTING.md                   # Contribution workflow & commit conventions
├── LICENSE                           # MIT Open Source License
├── package.json                      # Project metadata, dependencies & scripts
├── README.md                         # Project documentation
└── vite.config.ts                    # Vite build & plugin configuration
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: `v18.x` or `v20.x` (LTS recommended)
- **npm**: `v10.x` or higher
- **Git**

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/SHAKIBB7/GAZI-.git
cd GAZI-

# Install dependencies
npm install

# Setup environment configuration
cp .env.example .env
```

### 3. Running in Development
You will run both the frontend Vite development server and backend Express server:

```bash
# Terminal 1: Start frontend client (http://localhost:3000)
npm run dev

# Terminal 2: Start backend API server (http://localhost:4000)
npm run server
```

Open [http://localhost:3000](http://localhost:3000) in your browser to explore the storefront.  
Navigate to the Admin Portal via `/admin` (Default Super Admin: `admin@gazisports.com`).

---

## 🧪 Testing & Verification

The platform includes an extensive automated test suite covering 109 individual invariant checks:

```bash
# Run the entire test suite
npm run test
```

### What the test suite covers:
1. **Cricket-Only Catalog**: Validates that zero non-cricket items exist and prices conform to verified BDT scales.
2. **Bangladesh Address & Phone Validation Engine**: Tests all 5 major Bangladeshi telecom operator prefixes, E.164 normalization, and district coverage.
3. **Monetary & Logistics Rules**: Tests ৳ BDT comma formatting, tiered shipping rules (inside vs outside Dhaka), and promo discount calculations.
4. **Checkout & Order Safety**: Prevents overselling, validates atomic stock deductions, and checks order ID generation.
5. **Inventory Ledger & Audits**: Verifies movement types (`stock_in`, `damaged`, `reconciliation`), balances, and restock on cancellation.
6. **Financial Invariants**: Ensures `Gross Sales - Discounts - Refunds = Net Sales` and `Net Sales - COGS = Gross Profit`.

```text
================================================================
📊 FINAL VERIFICATION REPORT: 109 PASSED, 0 FAILED (100% GREEN)
================================================================
```

---

## 🔌 API Reference

### Storefront Endpoints
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/products` | Retrieve all cricket products with stock indicators |
| `GET` | `/api/products/:id` | Retrieve single product specifications & media |
| `POST` | `/api/checkout` | Process customer checkout, reserve stock & generate tracking |
| `GET` | `/api/orders/track/:trackingId` | Track shipment status by tracking ID |

### Admin Endpoints (Protected by JWT)
| Method | Route | Description |
|---|---|---|
| `POST` | `/api/admin/auth/login` | Authenticate administrative user & issue JWT |
| `GET` | `/api/admin/auth/me` | Verify current session and role permissions |
| `GET` | `/api/admin/inventory/ledger` | Inspect chronological stock ledger movements |
| `POST` | `/api/admin/inventory/adjust` | Record manual adjustment (+stock in, -damaged, etc.) |
| `POST` | `/api/admin/inventory/reconcile` | Perform physical warehouse count reconciliation |
| `GET` | `/api/admin/orders` | Paginated order inquiry with status filters |
| `PATCH` | `/api/admin/orders/:id/status` | Update fulfillment status or cancel & restock |
| `POST` | `/api/admin/orders/:id/settle-cod` | Mark Cash on Delivery order as settled and paid |
| `GET` | `/api/admin/reports/profit-loss` | Query dynamic P&L financial statement |
| `GET` | `/api/admin/reports/export-csv` | Download financial CSV export |
| `GET` | `/api/admin/audit-logs` | Query immutable administrative audit trail |

---

## 🚢 Deployment

### Vercel / Netlify (Frontend)
The frontend builds to static, optimized assets via Vite:
```bash
npm run build
```
Deploy the generated `dist/` directory directly to Vercel or Netlify. Configure `VITE_API_URL` to point to your live backend URL.

### VPS / Docker / PM2 (Backend)
Run the Express backend with process management for high availability:
```bash
# Install PM2 globally
npm install -g pm2

# Start backend under PM2
pm2 start server/server.js --name "gazi-backend"

# Ensure PM2 restarts on server reboot
pm2 startup
pm2 save
```

---

## 🤝 Contributing

Contributions make the open-source cricket community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please review our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting pull requests.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feat/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feat/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">
  <sub>Built with passion for cricket by <a href="https://github.com/SHAKIBB7">SHAKIBB7</a> and the GAZI Sports Engineering Team.</sub>
</div>
