# Security Policy

## Supported Versions

We take the security of our platforms, software infrastructure, and client systems seriously. Only verified stable production releases are actively monitored and patched. Development sandboxes and legacy alpha builds are not supported.

| Version | Supported          | Notes |
| ------- | ------------------ | ----- |
| 2.x.x   | :white_check_mark: | Active Stable Production Branch |
| 1.x.x   | :x:                | Deprecated. Upgrade to 2.x immediately. |
| < 1.0   | :x:                | Alpha/Beta exploratory builds. Unsupported. |

## Reporting a Vulnerability

If you discover a security vulnerability within a Pacmon Labs system or open-source repository, **do not open a public GitHub issue.** Please follow our coordinated vulnerability disclosure process to protect our user base and infrastructure.

### Submission Channel
Send a detailed cryptographic or plain-text report to our core security address:
* **Email:** `security@pacmon.labs` (or your operational security contact address)
* **Encryption:** For sensitive disclosures, please encrypt your payload using our public PGP key (available in our root directory or keyserver).

### Expected Response Timeline
* **Initial Triage:** Within **48 hours** of receipt, you will receive an acknowledgment email verifying that our team has reproduced or is evaluating the issue.
* **Status Updates:** You will receive status notifications every **72 hours** while a remediation plan is engineered.
* **Patches & Disclosure:** Once a fix is verified, it will be backported to all supported branches. Public disclosure will be coordinated mutually after a stable patch is deployed.

### Disclosure Policy
We adhere to standard **Responsible Disclosure** guidelines. We ask that you give us a minimum of **90 days** to remediate the vulnerability before public exposure, ensuring our clients' systems remain uncompromised.
