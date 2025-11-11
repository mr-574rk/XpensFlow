# 💰 XpensFlow — Smart, Secure & Insightful Personal Finance PWA

> **Offline-first. Encrypted. Intelligent. Beautiful.**
>
> XpensFlow is a next-generation **progressive web app (PWA)** that helps you track expenses, budgets, and insights — even **without the internet**.  
> Designed for privacy-first finance, it features **zero-knowledge encryption**, **AI-powered insights**, and a **developer-grade debugging system**.

---

## 🚀 Highlights

✅ **Offline-First:** Works without internet using IndexedDB  
✅ **AES-256 Encryption:** Zero-knowledge encryption model  
✅ **PWA:** Installable as a native app  
✅ **Voice Input:** Add expenses by voice  
✅ **Dark Mode:** Automatic theme switching  
✅ **Analytics:** Interactive charts with Recharts  
✅ **Budget Tracking:** Set and monitor budgets  
✅ **Financial Score:** Gamified financial health insights  
✅ **Export/Import:** Backup and restore securely  
✅ **Responsive:** Works seamlessly across all devices

---

## 🧩 What We Built (12 New Files)

### 🔐 Core Systems (Enterprise-Grade)

#### 🧱 `SecurityManager.js` — Zero-Knowledge Encryption
- PBKDF2 with **310k iterations**
- **AES-GCM 256-bit encryption**
- **SHA-256** integrity checksums
- Auto-lock with configurable timeout
- PIN strength validation  
*(No plaintext data or keys ever leave the device.)*

#### 💾 `DatabaseManager.js` — Encrypted Vault
- Encrypted **IndexedDB wrapper**
- Versioned backups (keeps last 3)
- Automatic cleanup and compaction
- Storage usage tracking
- Data restore functionality

#### 🧠 `IntelligenceEngine.js` — Smart Insights
- 9 types of financial insights
- Statistical anomaly detection
- Month-over-month comparison
- Spending pattern recognition
- Budget compliance tracking

---

### 🎨 Enhanced Components

| File | Description |
|------|--------------|
| `ErrorBoundary.jsx` | Professional error handling and recovery UI |
| `DebugOverlay.jsx` | Live developer console with performance metrics |
| `InsightsDashboard.jsx` | Visualizes trends, anomalies, and savings |
| `OnboardingWizard.jsx` | Intuitive 4-step user onboarding |
| `KeyboardShortcutsHelp.jsx` | In-app modal listing available shortcuts |

---

### ⚡ Power Features

| File | Description |
|------|--------------|
| `useKeyboardShortcuts.js` | 15+ global shortcuts (`Ctrl+K`, `Ctrl+D`, etc.) |
| Integration Guide | Detailed developer setup and usage guide |
| Docs | Comprehensive documentation for all modules |

---

## 💎 Key Innovations

### 🔒 **Security (Bank-Grade)**
- Zero-knowledge encryption — only salt stored
- PBKDF2 key derivation (310,000 iterations)
- AES-GCM 256-bit encryption
- SHA-256 integrity checksums
- Auto-lock after inactivity
- PIN validation (must include letters + numbers)

### 🧠 **Intelligence (Smart as Hell)**
- Spending pattern detection using **z-score analysis**
- Month-over-month comparisons
- Anomaly detection for unusual spending
- Budget compliance tracking
- Spending rhythm analysis (best/worst days)
- Savings potential calculator
- Smart recommendations powered by statistical models

### 🧑‍💻 **Developer Experience**
- Real-time **debug overlay** with performance stats
- **Error boundary** with persistent logs
- 15+ keyboard shortcuts for power users
- Performance & memory monitoring
- Error tracking (last 10 exceptions)
- Auto-lock after inactivity

---

## 🛠️ Tech Stack

| Layer | Technology |
|--------|-------------|
| Frontend | React + Vite + TailwindCSS |
| State | Zustand / Redux Toolkit |
| Storage | Encrypted IndexedDB |
| Encryption | WebCrypto API (AES-GCM + PBKDF2) |
| Charts | Recharts / Chart.js |
| PWA | Service Workers + Manifest |
| Voice Input | Web Speech API |
| Testing | Vitest / React Testing Library |

---

## 🧭 Architecture Overview

src/
├── core/
│ ├── SecurityManager.js
│ ├── DatabaseManager.js
│ └── IntelligenceEngine.js
├── components/
│ ├── ErrorBoundary.jsx
│ ├── DebugOverlay.jsx
│ ├── InsightsDashboard.jsx
│ ├── OnboardingWizard.jsx
│ └── KeyboardShortcutsHelp.jsx
├── hooks/
│ └── useKeyboardShortcuts.js
├── assets/
├── pages/
└── utils/

---

## 🧠 How It Works

1. **Zero-Knowledge Encryption:**  
   - All user data is encrypted locally before storage.  
   - Master key is derived from user PIN using PBKDF2 (310k iterations).  
   - AES-GCM ensures both confidentiality and integrity.

2. **Smart Insights:**  
   - The `IntelligenceEngine` analyzes patterns, flags anomalies, and generates month-over-month analytics.  
   - All insights run *client-side* for privacy.

3. **Offline-First Database:**  
   - The `DatabaseManager` uses an encrypted IndexedDB layer.  
   - Keeps 3 rolling backups with versioning.  
   - Tracks storage usage and cleans stale data.

4. **Auto-Lock:**  
   - App locks automatically after inactivity or when tab is hidden.  
   - Requires PIN re-entry to decrypt data.

---

## 🔧 Setup & Development

```bash
# Clone the repository
git clone https://github.com/mr-574rk/xpensflow.git

# Enter project directory
cd xpensflow

# Install dependencies
npm install

# Start development server
npm run dev
Then open http://localhost:5173 in your browser.

🧪 Testing
bash
Copy code
npm run test
Unit tests for core modules (SecurityManager, DatabaseManager, IntelligenceEngine)

Integration tests for encryption and error boundaries

📦 Build for Production
bash
Copy code
npm run build
npm run preview
🛡️ Security Principles
Zero-knowledge: No sensitive data leaves the user’s device.

Immutable backups: Each backup version is integrity-checked via SHA-256.

Strong encryption: AES-GCM 256-bit + PBKDF2 (310k iterations).

Auto-lock: Session timeout + tab visibility lock.

PIN rules: Enforced strength validation and entropy checks.

🧭 Roadmap
Stage	Features
✅ v1.0	Core encryption, insights, charts
🚧 v1.1	Cloud sync (end-to-end encrypted)
🚀 v2.0	Shared budgets + collaborative finance
🌐 v3.0	AI-powered financial forecasting

🧑‍💼 Contributing
We welcome PRs that:

Improve performance, security, or developer experience

Add new types of insights

Enhance accessibility or UX

Please run all tests and lint before submitting:

bash
Copy code
npm run lint && npm run test
🧾 License
This project is released under the MIT License.
See LICENSE for details.

💬 Credits
Designed & Engineered by [Mr Stark]
📧 [gh0ztsurg3@gmail.com]
🌐 [mr574rk.dev]

💡 “Track smarter. Spend wiser. Stay secure — even offline.”

