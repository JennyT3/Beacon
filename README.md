# Beacon — Liquidation Alert System for Blend Capital on Stellar

Real-time monitoring and alert system that protects Blend lending protocol users on Stellar from liquidation risks by providing actionable notifications via app, Telegram, and email.

---

## 🎥 Demo & Repo

- Video demo: 
- Repository: https://github.com/JennyT3/Beacon

---
## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
=======


**Beacon solves this** by:

- Monitoring health factors across Blend isolated pools
- Sending **real-time alerts** (in-app, Telegram, or email)
- Offering **actionable tips** to restore health (e.g. add collateral)
- Explaining how Blend and liquidation logic works


## 🧠 How It Works

### 1. Connect Wallet
Beacon supports Freighter and Albedo. Users connect to view their Blend positions.

### 2. Position Polling
Using the `@blend-capital/blend-sdk`, we fetch collateral and debt data every 5 seconds.

```
const pool = await Pool.load({ rpcUrl, passphrase }, POOL_ID);
const user = await pool.loadUser(publicKey);
```


###  3. Calculate Health Factor 

const hf = debt === 0n ? Infinity : Number((collateral * 100n) / debt);
We classify:

🟢 Healthy: HF > 150%

🟡 Warning: 120% < HF ≤ 150%

🔴 Critical: HF ≤ 120%

4. Trigger Alerts
We use react-hot-toast and Telegram/email bots to warn users instantly.

```
toast.error("⚠️ USDC position at risk: HF 118%");
```
# 🧱 Blend Protocol Compatibility
Beacon is built on top of Blend V2, fully aligned with its key concepts:

✅ Isolated Lending Pools: Each pool is monitored independently

✅ Flash Loan Support: Beacon warns only if the final HF is risky

✅ Backstop-Aware: Supports pool status (Active, On Ice, Frozen)

✅ Supports Standard & Owned Pools

✅ Matches Emission and Reward Zone logic



# 🧪 Tech Stack
Layer	Tool / Library
Frontend	React, TypeScript, Tailwind CSS
Wallets	Freighter, Albedo
Data Fetching	SWR (with automatic polling)
SDKs	@blend-capital/blend-sdk, stellar-sdk
Notifications	react-hot-toast, Telegram Bot API

# 🛠️ Project Setup
```
git clone https://github.com/beacon-alerts/beacon-blend.git
cd beacon-blend
npm install
npm run dev
```

## 🧩 Roadmap
- Telegram authentication linked to public keys
- Progressive Web App (PWA) support
- Gamified onboarding to learn Blend concepts and earn badges
- DAO-managed alert dashboards for owned pools


## 🎓 Educational Value
Beacon includes inline education explaining:
What is collateralization?
How are health factors calculated?
How does Blend’s liquidation mechanism work (Dutch auctions, partial fills)?
What are backstop modules and how do they affect risk?


Made with ❤️ by team Beacon during the Blend x Stellar Hackathon
>>>>>>> 331d8b18516a964c3e1497719de232b00c805b6d
