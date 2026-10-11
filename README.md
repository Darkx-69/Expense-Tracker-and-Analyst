# BROKE BUT FUNCTIONAL — SURVIVE THE MONTH
> **Tagline:** *₹10,000. 30 days. Every decision counts.*

A modern, high-precision personal finance web application and interactive decision simulator tailored for Gen Z students and young adults navigating a constrained ₹10,000 monthly budget.

Built for hackathon evaluation and automated AI evaluator bots with **zero authentication**, **zero backend dependencies**, **deterministic financial logic**, and **browser persistence**.

---

## ⚡ Quickstart: How to Run Locally

### 1. Prerequisites
- **Node.js**: v18.0.0+ or v20+ / v22+
- **npm**: v9.0.0+

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Local Development Server
```bash
npm run dev
```
Open your browser and visit:
👉 **[http://localhost:5173](http://localhost:5173)**

The dashboard appears immediately with deterministic demo data preloaded. No login, credentials, or backend setup is required.

### 4. Run Automated Tests
```bash
npm run test
```
Executes all 21 unit and integration tests covering the financial engine, integer paise math, decision simulator isolation, advance day loop, and component rendering.

### 5. Type Checking & Code Verification
```bash
npm run typecheck
npm run lint
```

### 6. Build & Preview Production Bundle
```bash
npm run build
npm run preview
```

---

## 🚀 How to Deploy on GitHub

### Option A: Deploy to GitHub Pages (Automated via GitHub Actions)

This repository includes a ready-to-run GitHub Actions workflow at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) that automatically runs tests, builds the production bundle, handles SPA 404 routing, and deploys to GitHub Pages upon push.

#### Step 1: Push Code to GitHub
Open your terminal in the project directory (`c:\Users\Umaad\Desktop\coding\Hackathon`):

```bash
# 1. Initialize git (if not already done)
git init

# 2. Stage all files
git add .

# 3. Create your initial commit
git commit -m "feat: complete Broke But Functional web app"

# 4. Set the default branch to main
git branch -M main

# 5. Link your GitHub repository (replace with your actual GitHub repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git

# 6. Push to GitHub
git push -u origin main
```

#### Step 2: Enable GitHub Pages in Repository Settings
1. Open your repository on **GitHub**.
2. Click on the **Settings** tab.
3. In the left sidebar, click on **Pages** (under the "Code and automation" section).
4. Under **Build and deployment** -> **Source**, select **GitHub Actions** from the dropdown menu (instead of "Deploy from a branch").
5. That's it! GitHub Actions will automatically run the `.github/workflows/deploy.yml` workflow and publish your site at:
   `https://<YOUR_USERNAME>.github.io/<YOUR_REPOSITORY_NAME>/`

---

### Option B: Deploy to Vercel or Netlify (Zero Config)

Because this is a standard Vite + React single-page application with client-side routing, you can also deploy it with zero configuration to Vercel or Netlify:

#### Deploy to Vercel:
1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **Add New Project** -> **Import Git Repository**.
3. Select this repository.
4. Framework Preset will auto-detect as **Vite**.
5. Click **Deploy**. Your app will be live with HTTPS in under 60 seconds!

#### Deploy to Netlify:
1. Go to [netlify.com](https://netlify.com) and import the repository.
2. Set Build Command: `npm run build`
3. Set Publish Directory: `dist`
4. Click **Deploy site**.

---

## 🌟 Key Features

### 1. Zero Authentication & Immediate Usability
- Opens directly to the fully-functional financial dashboard at `/`.
- No login, registration, email/password, OTP, OAuth, access codes, or onboarding modal walls.
- Preloaded with a deterministic demo dataset (Day 1 of 30, ₹10,000 budget, realistic transactions, upcoming obligations, and subscriptions).
- Prominent **DEMO MODE** indicator and instant **Reset Demo Data** button to restore the original baseline anytime.

### 2. High-Precision Financial Engine (Single Source of Truth)
- Operates internally in **integer paise** (`1 INR = 100 paise`, ₹10,000 = 1,000,000 paise) to prevent IEEE 754 floating-point rounding errors.
- **Available Spendable Cash**: $\text{Starting Budget} + \text{Realized Income} - \text{Paid Expenses} - \text{Protected Savings}$.
- **Safe Daily Allowance**: Dynamically protects upcoming mandatory bills and an emergency reserve buffer before dividing remaining spendable funds across remaining planning days.
- **Projected Month-End Balance**: Tracks forecasted surplus or deficit under scheduled commitments and renewals.
- **Deterministic Scores (0–100)**:
  - **Financial Health Score**: Evaluates budget adherence, solvency runway, month-end stability, and savings progress.
  - **Financial Risk Score**: Flags projected deficits, commitment coverage gaps, and rapid cash burn.
- **Financial Runway**: Simulates remaining survival days based on essential burn velocity.

### 3. Decision Simulator (Signature Feature)
- **10 Preset Scenarios**:
  1. *Buy Noise-Canceling Headphones (₹2,000)*
  2. *Late-Night Gourmet Food Delivery (₹350)*
  3. *Weekend Cafe Outing with Friends (₹800)*
  4. *Mechanical Gaming Keyboard / Mouse (₹1,500)*
  5. *Unexpected Clinic Consultation & Medicine (₹500)*
  6. *Cancel Entertainment Subscription (₹299)*
  7. *Transfer ₹500 into Emergency Vault*
  8. *Receive Side-Gig Freelance Stipend (₹1,000)*
  9. *Daily Chai & Snack Habit (₹60/day for 20 days)*
  10. *Delay Discretionary Purchase to Next Month (₹2,000)*
- **Custom Scenario Builder**: Test custom one-time purchases, recurring expenses, income windfalls, or subscription cuts.
- **Strict Simulation Isolation**: Running simulations **never** mutates canonical user cash until explicitly confirmed.
- **Side-by-Side Comparison**: Live before-and-after differences for Available Balance, Daily Allowance, Month-End Forecast, Health Score, and Risk Score.
- **Apply & Undo**: One-click application with confirmation modal, duplicate prevention, and clean **Undo Decision** reversal.

### 4. 10 Comprehensive Interactive Routes
1. `/` — **Survival Dashboard**: Summary cards, Recharts category spending & daily burn charts, survival runway, and quick actions.
2. `/transactions` — **Transaction Ledger**: Search, filter by Type/Category, sort by Day/Amount, Add/Edit/Delete, and CSV export.
3. `/budget` — **Category Budgets**: 8 editable allocations (Food, Transport, Groceries, Education, Bills, Healthcare, Entertainment, Savings) totaling ₹10,000 with rebalancing alerts.
4. `/commitments` — **Bills & Commitments**: Upcoming and overdue bills. Clicking **Mark as Paid** updates actual cash balance exactly once.
5. `/goals` — **Protected Savings Goals**: Multi-goal vault. Explicit **Reserve Cash** and **Release Cash** flows to safeguard emergency buffers.
6. `/subscriptions` — **Subscription Manager**: Recurring drain tracker, monthly & annualized cost meters, pause, cancel, and simulate cancellation.
7. `/simulator` — **Decision Simulator**: Preset picker, custom builder, before/after metric comparison, and undo history.
8. `/forecast` — **30-Day Cash Trajectory**: Recharts balance trajectory curve featuring Expected, Conservative (+30% spend), and Optimistic (austerity) models with shortfall detection.
9. `/insights` — **Algorithmic Financial Advice**: Rule-based recommendations (overspending alerts, subscription cuts, savings advice) with one-click direct CTAs.
10. `/settings` — **Settings & Data Management**: Local storage inspector, JSON backup export, validated JSON import (via Zod), CSV export, and Reset baseline.
- `*` — **404 Not Found**: Clean fallback page with working redirect to `/`.

### 5. 30-Day Survival Challenge Progression
- Interactive **Advance Day** button progresses simulation time from Day 1 to Day 30.
- Automatically executes scheduled subscriptions on their exact renewal day without duplicate charging.
- Automatically flags due and overdue commitments in daily history logs.
- Reaching Day 30 triggers a celebratory / retrospective **Survival Scorecard** with confetti, final metrics, and Gen Z Archetype badges (*"Prudent Mastermind"*, *"Budget Sensei"*, *"Instant Noodle Survivor"*, or *"Broke Legend"*).

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript (Strict Type Checking)
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS (Dark Fintech Palette: Charcoal `#06090E`, Neon Electric Lime `#22E565`, Amber warnings, Red risk indicators)
- **Icons**: Lucide React
- **Routing**: React Router v7
- **Charts**: Recharts
- **State Management**: Zustand
- **Schema Validation**: Zod
- **Testing**: Vitest + React Testing Library + JSDOM
- **Special Effects**: canvas-confetti

---

## 📁 Project Architecture

```
Hackathon/
├── .github/
│   └── workflows/
│       └── deploy.yml           # Automated GitHub Pages CI/CD workflow
├── public/
├── src/
│   ├── components/
│   │   ├── common/              # Modals: AddExpense, AddIncome, DayAdvancer, MonthEnd
│   │   ├── layout/              # AppShell, Sidebar, Header, MobileNav
│   │   └── ui/                  # Reusable UI primitives: Button, Card, Badge, Modal, Input, Select, ProgressBar
│   ├── data/
│   │   └── initial-data.ts      # Deterministic baseline demo dataset (Day 1, ₹10,000)
│   ├── features/
│   │   ├── dashboard/           # Dashboard overview & Recharts widgets
│   │   ├── transactions/        # Transaction ledger & CSV exporter
│   │   ├── budget/              # Category budget manager & rebalancer
│   │   ├── commitments/         # Due bills & payment reconciler
│   │   ├── goals/               # Savings goal vaults & cash reservation
│   │   ├── subscriptions/       # Subscription drain tracker & cancellation
│   │   ├── simulator/           # Signature Decision Simulator & undo engine
│   │   ├── forecast/            # 30-day multi-scenario forecast curves
│   │   ├── insights/            # Deterministic algorithmic advice & CTAs
│   │   ├── settings/            # JSON import/export & storage manager
│   │   └── not-found/           # 404 fallback page
│   ├── lib/
│   │   ├── financial-engine/    # Pure TypeScript formulas (integer paise math, balance, allowance, forecast, risk, health)
│   │   ├── validation/          # Zod runtime validation schemas
│   │   └── utils.ts             # Formatting & class merging
│   ├── services/
│   │   ├── persistence.ts       # Browser LocalStorage manager with quota & migration safeguards
│   │   └── export.ts            # JSON backup & RFC 4180 CSV generators
│   ├── store/
│   │   └── finance-store.ts     # Zustand store orchestrating actions & recomputations
│   ├── test/
│   │   └── setup.ts             # Vitest test setup and JSDOM mocks
│   ├── tests/
│   │   ├── financial-engine.test.ts  # Unit tests for core formulas & paise math
│   │   ├── store-and-lifecycle.test.ts # Lifecycle, day progression, and undo tests
│   │   └── components.test.tsx      # Integration & test ID verification tests
│   ├── types/
│   │   ├── financial.ts         # Domain types
│   │   └── state.ts             # Application state & history types
│   ├── App.tsx                  # Router definitions
│   ├── main.tsx                 # Entrypoint
│   └── index.css                # Base Tailwind & custom scrollbars
├── index.html                   # HTML template with Google Fonts (Inter, JetBrains Mono)
├── tailwind.config.js           # Fintech design system tokens
├── vite.config.ts               # Vite configuration with Vitest & relative base
├── tsconfig.json                # Project configuration
└── package.json                 # Scripts and dependencies
```

---

## 🤖 Automated Evaluator Compatibility

Automated evaluation bots and headless browser scripts can immediately inspect and test the application using stable `data-testid` selectors:

| Selector | Element Description |
|---|---|
| `data-testid="dashboard-balance"` | Available Spendable Cash display |
| `data-testid="dashboard-daily-allowance"` | Safe Daily Allowance display |
| `data-testid="dashboard-month-end-forecast"` | Projected Month-End Balance display |
| `data-testid="add-expense-button"` | Add Expense action trigger |
| `data-testid="add-income-button"` | Add Income action trigger |
| `data-testid="advance-day-button"` | Advance Simulation Day action trigger |
| `data-testid="open-simulator-button"` | Navigation link to Decision Simulator |
| `data-testid="simulate-decision-button"` | Simulate in Sandbox action trigger |
| `data-testid="apply-decision-button"` | Apply Simulated Decision action trigger |
| `data-testid="reset-scenario-button"` | Reset Simulator sandbox action trigger |
| `data-testid="reset-demo-button"` | Reset Demo Baseline action trigger |
| `data-testid="create-goal-button"` | Create Savings Goal action trigger |
| `data-testid="cancel-subscription-button"` | Cancel Subscription action trigger |
| `data-testid="export-data-button"` | Export JSON backup trigger |
| `data-testid="import-data-button"` | Import JSON backup file input |

---

## 🛡️ Security, Validation & Persistence

- **Zero Secrets / Backend**: Operates purely on the client. No credentials or external API keys are required or exposed.
- **Untrusted Input Protection**: All user entries and uploaded JSON backups are parsed through **Zod schemas** to reject negative values, malformed dates, and corrupted schemas.
- **Quota Safeguards**: Browser `localStorage` writes are wrapped in safe handlers to gracefully handle quota errors.

---

## 📄 License & Hackathon Notice

Developed as a hackathon submission for modern web development. Designed with accessibility (WCAG 2.2 AA considerations), responsive dark fintech styling, and rigorous financial logic.


Deloyed on: [Vercel-Link](https://expense-tracker-and-analyst.vercel.app/)
