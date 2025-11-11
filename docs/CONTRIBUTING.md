# 🤝 Contributing to XpensFlow

Thank you for your interest in improving **XpensFlow**!  
We’re building a secure, privacy-first personal finance platform — and community contributions make it better.

---

## 💡 Ways to Contribute

You can contribute by:

- 🐛 Reporting bugs  
- 💬 Suggesting new features  
- 🧠 Improving performance or security  
- 🎨 Enhancing the UI/UX  
- 🧾 Writing or improving documentation  
- 🧪 Adding or updating tests  

---

## 🛠️ Local Development Setup

1. **Fork** the repository  
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/mr-574rk/xpensflow.git
   cd xpensflow
Install dependencies:


npm install
Start development server:


npm run dev
Open http://localhost:5173

🧩 Project Structure
src/
 ├── core/                # Core encryption, database, insights engines
 ├── components/          # UI components and dashboards
 ├── hooks/               # Reusable logic and shortcuts
 ├── utils/               # Helper functions
 ├── assets/              # Icons, styles, media
 └── tests/               # Unit and integration tests
✅ Code Guidelines
No duplicated functions — every module should be atomic and reusable.

Follow the existing naming conventions:

Components → PascalCase

Hooks → useCamelCase

Utilities → camelCase

Use TypeScript types or JSDoc for clarity.

All code must pass lint and tests before PR:

npm run lint && npm run test
Keep commits concise and meaningful:


feat: add budget compliance tracker
fix: handle missing encryption key in restore flow
docs: update setup instructions
🧪 Testing
Run the full test suite:


npm run test
Unit tests: SecurityManager, DatabaseManager, IntelligenceEngine

Integration tests: Data flow + encryption

UI tests: Snapshot testing for components

🔐 Security Considerations
When contributing code:

Never log or expose sensitive data

Avoid storing keys, salts, or plaintext data

Use the WebCrypto API instead of custom encryption

Test all encryption paths in SecurityManager.js

Ensure the app auto-locks on tab switch or inactivity

🌍 Commit & Pull Request Workflow
Create a new branch from main:


git checkout -b feature/new-feature-name
Make your changes.

Test locally and ensure lint passes.

Commit and push to your fork.

Create a Pull Request to main with a descriptive title and summary.

