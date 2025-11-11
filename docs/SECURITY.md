# 🔐 Security Policy

## Supported Versions

| Version | Supported          |
|----------|--------------------|
| 1.x.x    | ✅ Supported       |
| 0.x.x    | ❌ Unsupported (alpha/pre-release) |

---

## 🔎 Security Principles

XpensFlow was built with **bank-grade security** as a first-class feature.

- **Zero-knowledge encryption:** User data is encrypted locally. No plaintext or keys ever leave the device.  
- **PBKDF2 key derivation:** 310,000 iterations for strong password hardening.  
- **AES-GCM 256-bit encryption:** Ensures both confidentiality and data integrity.  
- **SHA-256 integrity checks:** Every backup version is verified.  
- **Auto-lock:** Session automatically locks after inactivity or tab switch.  
- **PIN strength validation:** Minimum entropy enforced for security against brute-force attacks.  
- **No external data collection:** No analytics or telemetry are transmitted to servers.

---

## 🪪 Reporting a Vulnerability

If you discover a **vulnerability**, please follow the steps below:

1. **Do not** create a public issue.  
2. Send a detailed report to **gh0ztsurg3@gmail.com
3. Include the following:
   - A detailed description of the vulnerability  
   - Steps to reproduce  
   - Potential impact or affected components  
   - (Optional) Suggested fixes or mitigations  

Our team will respond **within 48 hours** to confirm receipt, and provide a resolution or mitigation timeline within **7 business days**.

---

## 🧱 Responsible Disclosure

- Please test vulnerabilities only on your own data.  
- Do not exploit or disclose to others before a fix is released.  
- We’ll credit you (if desired) in the **Security Hall of Fame** once resolved.

---

## 🧩 Security Architecture Summary

| Layer | Security Mechanism |
|--------|--------------------|
| Encryption | AES-GCM 256-bit |
| Key Derivation | PBKDF2 (310k iterations) |
| Integrity | SHA-256 checksum |
| Storage | Encrypted IndexedDB |
| Backup | Immutable versioned archives |
| Authentication | PIN-based zero-knowledge key unlock |
| Network | HTTPS + optional cloud sync encryption |

---

## 🧠 Future Security Enhancements
- Hardware key (WebAuthn) support for unlock  
- Local biometric unlock (Face/Touch ID)  
- Encrypted cloud backup with multi-device sync  
- End-to-end encrypted sharing between trusted users  

---

### 🧩 A Note on Zero-Knowledge Design

XpensFlow cannot decrypt or access user data — even if legally requested — because **we never store or transmit keys or plaintext data**.  
Encryption, storage, and verification all occur **client-side**.

> Your data belongs to you. Always.
