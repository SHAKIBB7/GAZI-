# Changelog

All notable changes to the **GAZI Sports Enterprise Cricket Platform** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-10-19

### Added
- **Cricket Brand Filtering**: Quick filter on Admin Products tab for Gunn & Moore, Gray-Nicolls, Kookaburra, Newbery, DSC, SS, SG, New Balance, Salix, Chase, Adidas, and Puma.
- **Willow Grading Datalist**: Quick autocomplete for English Willow bat grading (Grade 1+, Grade 1, Grade 2, Grade 3, Kashmir Willow).
- **Pagination Context**: Enhanced order pagination indicators displaying `Showing X of Y orders (Page N of M)`.
- **Automated CI/CD**: Added GitHub Actions pipeline validating Oxlint, TypeScript compilation, Vite production build, and the 109 automated backend/frontend test suite.
- **Standardized Repository Governance**: Integrated Issue templates, PR templates, Contributing guidelines, Code of Conduct, and Security policy.

### Fixed
- Resolved merge conflicts and harmonized project documentation with remote repository.
- Fixed inventory ledger stock deduction and cancellation restock balance tracking.

---

## [1.0.0] - 2026-10-19

### Added
- **Full-Stack Architecture Migration**: Built high-speed frontend on Vite + React 19 + TypeScript + Tailwind CSS with Express.js REST API.
- **Cricket-Only Purge**: Dedicated exclusively to cricket equipment, bats, protective gear, balls, footwear, and apparel.
- **Bangladesh Localization**: Full Bangladeshi Taka (`৳` BDT) currency formatting with comma placement and 8 administrative divisions.
- **Bangladeshi Phone & Address Validation**: Strict regex engine supporting all major Bangladeshi telecommunication operators (GP, Robi, Banglalink, Airtel, Teletalk) with canonical E.164 normalization.
- **Enterprise Inventory Ledger**: Concurrency-safe atomic file persistence with transactional snapshot backups, restock movement auditing, and physical reconciliation audits.
- **Complete Admin Operations Suite**: Real-time management across Products, Orders, Inventory, Suppliers, Purchase Orders, Operating Expenses, and Profit & Loss reports.
- **109 Automated Tests**: Comprehensive invariant verification suite guaranteeing data consistency and financial calculations.
