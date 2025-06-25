# 🛡️ Beacon – Liquidation Alert System for Blend on Stellar

Beacon is a real-time notification and monitoring tool that integrates directly with the **Blend lending protocol on Stellar**. It protects users by tracking their positions and **alerting them when they're at risk of liquidation**.

Built for the **Compose the Future Hackathon** hosted by Stellar and Blend Capital, Beacon is designed to **increase safety, education, and retention** in decentralized lending.

## 🔥 Why Beacon?

Many DeFi users fail to actively monitor their lending positions. When collateralization ratios fall, they can be **liquidated unexpectedly**, losing funds and trust.

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

# 💡 Features
🔄 Live Health Factor Tracking (per pool)
🛎️ In-app, Telegram, and Email Alerts
🧠 UX Tips to Repair Positions (educational layer)
⚙️ Configurable Alert Threshold (future update)
📊 Position Table with Color-Coded Risk
🏦 Minimal & Composable Frontend (React + Tailwind)

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

## 🧩 Future Plans
🔐 Telegram auth with public key mapping
📱 PWA deployment
🧠 Gamified onboarding (learn Blend, earn badges)
⛑️ DAO alert dashboard for owned pools

## 🎓 Educational Value
Beacon includes inline education explaining:
What is collateralization?
How are health factors calculated?
How does Blend’s liquidation mechanism work (Dutch auctions, partial fills)?
What are backstop modules and how do they affect risk?

## 🏁 Submission for Stellar + Blend Hackathon
Category: Risk & Alert Systems
Hackathon: Compose the Future on Stellar
Goal: Make DeFi safer, smarter, and more accessible for Blend users.


Made with ❤️ by team Beacon during the Blend x Stellar Hackathon
