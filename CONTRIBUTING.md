# Contributing to GAZI Sports

First off, thank you for considering contributing to GAZI Sports! We are building Bangladesh's premier enterprise cricket e-commerce and retail management platform.

Please take a moment to review this document in order to make the contribution process easy and effective for everyone involved.

---

## 🧭 Code of Conduct

This project and everyone participating in it is governed by the [GAZI Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to `dev@gazisports.com`.

---

## 🛠 Development Workflow

### 1. Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher
- **Git**

### 2. Setting Up Locally
```bash
# Clone the repository
git clone https://github.com/SHAKIBB7/GAZI-.git
cd GAZI-

# Install dependencies cleanly
npm install

# Setup environment variables
cp .env.example .env
```

### 3. Running Development Instances
```bash
# Start frontend Vite server (Runs on http://localhost:3000)
npm run dev

# Start backend Express API server in a separate terminal (Runs on http://localhost:4000)
npm run server
```

---

## 🌿 Branching Strategy

We follow a structured branch naming convention:

| Prefix | Usage | Example |
|---|---|---|
| `feat/` | New features or enhancements | `feat/willow-grade-filter` |
| `fix/` | Bug fixes | `fix/cod-settlement-timestamp` |
| `perf/` | Performance optimizations | `perf/inventory-ledger-indexing` |
| `refactor/` | Code refactoring without behavior change | `refactor/checkout-validation` |
| `test/` | Adding or updating tests | `test/order-restock-suite` |
| `docs/` | Documentation changes | `docs/api-reference-endpoints` |

---

## 📝 Commit Message Conventions

We strictly enforce **Conventional Commits**:

```text
<type>(<scope>): <short description in present tense>

[optional body explaining rationale]

[optional footer(s) such as Closes #123]
```

### Types:
- `feat`: A new user-facing or platform capability.
- `fix`: A bug fix.
- `docs`: Documentation updates.
- `style`: Changes that do not affect the meaning of the code (formatting, white-space).
- `refactor`: Code change that neither fixes a bug nor adds a feature.
- `perf`: Code change that improves performance.
- `test`: Adding missing tests or correcting existing tests.
- `chore`: Build process, dependencies, or auxiliary tool updates.

**Examples:**
- `feat(catalog): add willow grade and grain count filters`
- `fix(ledger): ensure FIFO balance calculation on cancellation restock`
- `test(admin): add end-to-end verification for supplier PO receipt`

---

## 🧪 Quality Assurance & Pre-Flight Checks

Before opening a Pull Request, verify that all quality gates pass locally:

```bash
# 1. Run linter
npm run lint

# 2. Compile TypeScript & build production bundle
npm run build

# 3. Run complete automated test suite
npm run test
```

All Pull Requests must pass the continuous integration checks before being merged into `main`.
