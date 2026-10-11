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



