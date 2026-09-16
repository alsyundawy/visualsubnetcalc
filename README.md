# Visual Subnet Calculator — Modernized & Hardened Edition

[![Release](https://img.shields.io/github/v/release/alsyundawy/visualsubnetcalc?style=for-the-badge&color=007acc&logo=github)](https://github.com/alsyundawy/visualsubnetcalc/releases/tag/v1.4.1)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![CodeQL Security](https://img.shields.io/badge/CodeQL-0%20Alerts%20%7C%20Passing-success?style=for-the-badge&logo=githubactions)](https://github.com/alsyundawy/visualsubnetcalc/security/code-scanning)
[![Trunk Linters](https://img.shields.io/badge/Trunk%20Check-14%20Linters%20Clean-brightgreen?style=for-the-badge&logo=checkmarx)](https://trunk.io)
[![WCAG](https://img.shields.io/badge/WCAG%202.2-Level%20AA%20Compliant-blue?style=for-the-badge&logo=w3c)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![Tests](https://img.shields.io/badge/Playwright%20E2E-36%20Passing-success?style=for-the-badge&logo=playwright)](https://playwright.dev)
[![Responsive](https://img.shields.io/badge/Responsive-VGA%20to%202K-purple?style=for-the-badge)](https://github.com/alsyundawy/visualsubnetcalc)

> **An interactive, accessible, visual IPv4 CIDR subnet planning engine for network engineers, cloud architects, and DevOps professionals.**
> Optimized and maintained by **[@alsyundawy](https://github.com/alsyundawy)** — Built upon foundational work by **[@ckabalan](https://github.com/ckabalan)**, **[@bl4ckfir3](https://github.com/bl4ckfir3)**, and **[@davidc](https://github.com/davidc)**.
>
> 📖 **[Architecture & Integration Notes (DOCNOTE.md)](DOCNOTE.md)** &nbsp;|&nbsp; 📜 **[Full Release Changelog (CHANGELOG.md)](CHANGELOG.md)** &nbsp;|&nbsp; 🚀 **[Releases](https://github.com/alsyundawy/visualsubnetcalc/releases)**

---

## 🧭 Navigation

- [🌟 Why This Modernized Edition?](#-why-this-modernized-edition)
- [✨ Key Features](#-key-features)
- [☁️ Cloud Provider Subnet Profiles](#️-cloud-provider-subnet-profiles)
- [🛠️ Getting Started & Local Development](#️-getting-started--local-development)
- [🐳 Running in Docker](#-running-in-docker)
- [📊 Quality Assurance & Verification Gates](#-quality-assurance--verification-gates)
- [📚 Documentation & Engineering Notes](#-documentation--engineering-notes)
- [📜 Version History & Changelog](#-version-history--changelog)
- [🤝 Credits & Original Authors](#-credits--original-authors)
- [📄 License](#-license)

---

## 📸 Interactive Preview

![Visual Subnet Calculator Demonstration](src/demo.gif)

Visual Subnet Calculator eliminates academic subnet math and replaces it with intuitive, visual network design. Quickly partition CIDR blocks, allocate subnets for microservices or VPC tiers, apply custom color labels, and share your entire topology with colleagues via URL fragments — **with zero server-side data retention**.

---

## 🌟 Why This Modernized Edition?

> 💡 _For deep architectural blueprints, dependency SRI hashes, and ecosystem integration details, see [DOCNOTE.md](DOCNOTE.md). For granular version-by-version release history, see [CHANGELOG.md](CHANGELOG.md)._

This edition (**v1.4.1+**) represents a complete architectural, security, accessibility, and visual overhaul of the project:

### 🛡️ 1. Zero-Defect Security & CodeQL Remediation

- **DOM XSS Remediation (`js/xss-through-dom`)**: Fully resolved GitHub CodeQL Alert #5 by isolating network boundary correction into a dedicated helper and replacing jQuery HTML interpretation sinks with safe `.text()` text node assignments.
- **Context-Aware Sanitization**: Integrated strict HTML entity escaping (`escapeHtml()`) across LZ-String URL decoders and JSON configuration imports to neutralize reflected and stored script injection risks.
- **Immutable CI/CD Supply Chain**: Applied commit SHA pinning (`pinact`) across all GitHub Actions workflows and enforced strict top-level least-privilege permissions (`permissions: contents: read`).
- **Container Hardening**: Transitioned Dockerfile to unprivileged execution with numeric UID (`USER 101`) and automated healthcheck probes.

### ♿ 2. WCAG 2.2 Level AA Accessibility

- **Autofill Compliance**: Added distinct, unique `id` and `name` attributes to all form controls, dynamic table row inputs (`#note_*`), and JSON import textareas.
- **WCAG H32 Form Standards**: Configured the primary action button (`#btn_go`) as `type="submit"` with client-side event interception, ensuring full compliance without undesirable page reloads.
- **Semantic Table Architecture**: Embedded screen-reader-only `<caption class="visually-hidden">` describing CIDR hierarchies, and preserved native `<th scope="col">` column header semantics.
- **Keyboard Navigation**: Provided full keyboard support (`Enter` and `Space` triggers), `tabindex="0"`, and `role="button"` on the interactive color palette swatches.

### 📱 3. Universal Responsive Scaling (VGA to 2K)

- **Multi-Device Support**: Engineered modular CSS media queries adapting dynamically to screens ranging from legacy **VGA (640×480)**, smartphones (**iPhone, Samsung, Xiaomi**), tablets (**iPad in portrait & landscape**), laptops (**MacBook**), and high-resolution **2K / Ultrawide monitors (2560px)**.
- **Screen Space Preservation**: Redesigned header bars, compacted alert banners, and scaled SVG icons (from 48px to 36px) to maximize visible table workspace and prevent unnecessary vertical scrolling.

### 🔍 4. Modern Web Standards & SEO Infrastructure

- **Schema.org Structured Data**: Integrated rich JSON-LD `WebApplication` schema for search engines.
- **Social Graph Optimization**: Included complete Open Graph (`og:*`) and Twitter Card metadata.
- **Clean HTML5**: 100% compliant with `html-validate` standards with zero errors and zero warnings.

---

## ✨ Key Features

- **Visual Tree Splitting & Merging**: Subdivide any IPv4 CIDR block with a single click, or join adjacent sister subnets back into their parent block.
- **Specialized Cloud Modes**: Built-in subnetting profiles for **Standard RFC 1918**, **AWS VPC**, **Azure VNet**, and **Oracle Cloud (OCI)** that automatically account for vendor-reserved IP addresses.
- **Accessible Color Coding**: Assign distinct pastel colors to subnets to visually segment tiers (e.g., DMZ, Web, Application, Database, Management).
- **Comprehensive Subnet Metrics**: Instant readout of:
  - Network Address
  - Usable Host Range
  - Broadcast Address
  - Netmask & Wildcard Mask
  - Usable Host Capacity
  - CIDR Prefix Length
- **Zero-Storage Privacy**: Designs are serialized and compressed into the browser's URL hash via LZ-String, or exported to local JSON. No accounts, cookies, or backend databases are required.
- **Dynamic Search & Filtering**: Rapidly isolate specific subnets in large CIDR blocks using prefix or note filters.

---

## ☁️ Cloud Provider Subnet Profiles

Different cloud infrastructure providers reserve specific addresses in each subnet for internal routing, DNS, and gateway infrastructure:

| Cloud Profile          | Smallest Subnet |     Reserved IPs     | Reserved IP Roles Breakdown                                                                 | Reference Documentation                                                                                                                                                       |
| :--------------------- | :-------------: | :------------------: | :------------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Standard**           |      `/32`      | **2** _(size ≤ /30)_ | Network Address (`.0`), Broadcast Address (`.last`)                                         | [RFC 1918](https://datatracker.ietf.org/doc/html/rfc1918) / [RFC 4632](https://datatracker.ietf.org/doc/html/rfc4632)                                                         |
| **AWS VPC**            |      `/28`      |        **5**         | Network (`.0`), VPC Router (`.1`), VPC DNS (`.2`), Future Use (`.3`), Broadcast (`.last`)   | [AWS VPC Subnet Sizing](https://docs.aws.amazon.com/vpc/latest/userguide/subnet-sizing.html)                                                                                  |
| **Azure VNet**         |      `/29`      |        **5**         | Network (`.0`), Default Gateway (`.1`), Azure DNS Mapping (`.2`, `.3`), Broadcast (`.last`) | [Azure VNet Restrictions](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-faq#are-there-any-restrictions-on-using-ip-addresses-within-these-subnets) |
| **Oracle Cloud (OCI)** |      `/30`      |        **3**         | Network (`.0`), Default Gateway (`.1`), Broadcast (`.last`)                                 | [OCI Reserved IP Addresses](https://docs.oracle.com/en-us/iaas/Content/Network/Concepts/overview.htm#Reserved__reserved_subnet)                                               |

---

## 🛠️ Getting Started & Local Development

### Prerequisites

- [Node.js](https://nodejs.org/) (Version 20 LTS recommended)
- `npm` (Version 10+)
- `git`

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/alsyundawy/visualsubnetcalc.git

# Enter the project directory
cd visualsubnetcalc/src

# Install project dependencies
npm install
```

### 2. Build & Compile Assets

```bash
# Compile SCSS stylesheets and bundle distribution assets
npm run build
```

### 3. Start Development Server

```bash
# Launch the local HTTP development server on http://localhost:8080
npm start
```

Open your browser and navigate to `http://localhost:8080`.

### 4. Run Automated E2E Test Suites

```bash
# Execute Playwright browser test suites across Chromium and Firefox
npx playwright test
```

### 5. Local HTTPS with Certificates (Optional)

_Required for validating the browser Clipboard API (`navigator.clipboard.writeText`), which requires a secure context._

```bash
# Install mkcert (macOS example)
brew install mkcert
mkcert -install

# Generate development certificates
cd src
npm run setup:certs

# Start server with HTTPS on https://localhost:8443
npm run local-secure-start
```

---

## 🐳 Running in Docker

Run Visual Subnet Calculator in an isolated, security-hardened container environment:

```bash
# Run rootless container on local port 8080
docker run -d -p 8080:8080 --name visualsubnetcalc ckabalan/visualsubnetcalc:latest
```

### Docker Container Highlights

- **Rootless Execution**: Runs as non-root user `USER 101` (`nginx`).
- **Automated Healthcheck**: Continuously monitors service availability via built-in healthcheck probe.
- **Ultra-lightweight**: Multi-stage Alpine Linux footprint.

---

## 📊 Quality Assurance & Verification Gates

Every release of this modernized edition undergoes rigorous verification across multiple automated testing pipelines:

| Quality Gate               | Tool / Engine                        | Target Scope                                              | Status                                     |
| :------------------------- | :----------------------------------- | :-------------------------------------------------------- | :----------------------------------------- |
| **Comprehensive Linting**  | [Trunk Check](https://trunk.io)      | 14 Linters (`prettier`, `yamllint`, `markdownlint`, etc.) | **PASSED (62/62 files clean)**             |
| **HTML5 Validation**       | `html-validate`                      | Native HTML standards, accessibility & semantic tags      | **PASSED (0 errors, 0 warnings)**          |
| **Browser E2E Testing**    | [Playwright](https://playwright.dev) | Chromium & Firefox end-to-end user workflows              | **PASSED (36/36 tests)**                   |
| **Security Scanning**      | GitHub CodeQL                        | DOM XSS and source-to-sink vulnerability analysis         | **PASSED (0 alerts)**                      |
| **IaC & Container Policy** | `checkov` & `hadolint`               | Dockerfile & AWS CloudFormation best practices            | **PASSED (CIS & Best Practice Compliant)** |

---

## 📚 Documentation & Engineering Notes

Comprehensive technical documentation, architectural specifications, security considerations, and ecosystem integration guides are maintained in **[DOCNOTE.md](DOCNOTE.md)**. Key topics covered include:

- **Core Architecture Layers**: Detailed breakdown of Structure (`dist/index.html`), Presentation (`dist/css/main.css`), Logic (`dist/js/main.js`), and vendor-specific Cloud Subnet Profiles.
- **Dependency Matrix & SRI Cryptographic Hashes**: Full verification table detailing Subresource Integrity SHA384 hashes for Bootstrap 5.3.8, jQuery 3.7.1, jQuery Validate 1.21.0, and vendored LZ-String 1.5.0.
- **Upstream Evolution Lineage**: Technical chronology comparing the architecture across three generational eras:
  1. _Upstream Base (`davidc/subnets`)_: Original Perl CGI and static nested table splitting concept.
  2. _Upstream Modernization (`ckabalan/visualsubnetcalc`)_: Initial client-side rewrite in jQuery and Bootstrap with URL sharing and cloud modes.
  3. _ALSYUNDAWY Production Edition (`alsyundawy/visualsubnetcalc`)_: Zero-defect security hardening, CodeQL XSS remediation, WCAG 2.2 AA accessibility, responsive scaling (VGA to 2K), SEO structured data, and release engineering.
- **ALSYUNDAWY Infrastructure Integration**: Architectural documentation of how Visual Subnet Calculator serves as the foundational IP planning engine for adjacent production systems:
  - **Netplan Generator**: Translating calculated subnets and gateways into Linux network interface configurations.
  - **Network Diagnostics**: Correlating routing anomalies and hop boundaries across Ping, Traceroute, and MTR.
  - **DNS Zone Configuration**: Exact CIDR boundaries for forward and reverse (`in-addr.arpa`) PTR zone records.
  - **Security Discovery & Audit**: Defining precise target scopes for Nmap scans, IPERF3 throughput benchmarking, and TrustPositif/WHOIS compliance.
  - **Zero-Trust Access Control**: Enforcing subnet-level IP access control lists (ACLs) and reverse proxy routing policies across Nginx and HAProxy.
- **Security & Privacy Model**: Pure client-side execution guarantees, zero data leakage, and strict Content Security Policy (CSP) guidelines.

👉 **Read the complete technical specification**: **[DOCNOTE.md](DOCNOTE.md)**

---

## 📜 Version History & Changelog

Every notable release, security remediation, accessibility improvement, and framework upgrade is documented in **[CHANGELOG.md](CHANGELOG.md)** following the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format and [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### Recent Release Highlights

- **[v1.4.1 (Latest Release)](CHANGELOG.md#141---2026-09-16)**:
  - 🛡️ **Security**: CodeQL Alert #5 (`js/xss-through-dom`) remediated via `.text()` text node insertion in boundary warning modal; context-aware HTML entity sanitization (`escapeHtml()`) across URL decoders and JSON imports.
  - ♿ **Accessibility**: WCAG 2.2 Level AA compliance; unique `id` and `name` attributes across all form inputs for browser autofill; WCAG H32 `<button type="submit">` form trigger; screen-reader `<caption class="visually-hidden">` and semantic `<th scope="col">` column headers; full keyboard color palette navigation.
  - 📱 **Responsive Design**: Modular CSS media queries scaling from VGA (640×480), mobile devices, and tablets up to 2K / Ultrawide displays (2560px).
  - 🔍 **SEO & Web Standards**: Schema.org JSON-LD `WebApplication` structured data, Open Graph card definitions, and 100% `html-validate` compliance.
  - ⚡ **Dependencies**: Upgraded to Bootstrap 5.3.8 (SRI verified) and Playwright 1.63.0 E2E testing framework.
- **[v1.4.0](CHANGELOG.md#140---2026-09-15)**:
  - ☁️ Multi-cloud usable IP calculations for AWS VPC, Azure VNet, and Oracle Cloud Infrastructure (OCI).
  - 🔗 Compressed URL sharing with LZ-String state encoding; JSON configuration import/export.
- **v1.3.x & Earlier**:
  - Foundational visual subnetting table tree, interactive split/join engine, and Docker containerization.

👉 **Browse the full release changelog**: **[CHANGELOG.md](CHANGELOG.md)**

---

## 🤝 Credits & Original Authors

Visual Subnet Calculator is built upon the collaborative spirit of the open-source community. Sincere appreciation and credit are extended to:

- 👤 **Caesar Kabalan ([@ckabalan](https://github.com/ckabalan))** — _Original Creator and Lead Architect of Visual Subnet Calculator._ Created the initial modern web implementation, interactive UI tree model, cloud mode profiles, and container packaging.
- 👤 **Florian M. ([@bl4ckfir3](https://github.com/bl4ckfir3))** — _Core Feature Contributor._ Designed and contributed the Oracle Cloud Infrastructure (OCI) subnet calculations and profile rules ([PR #30](https://github.com/ckabalan/visualsubnetcalc/pull/30)).
- 👤 **David C ([@davidc](https://github.com/davidc))** — _Inspiration & Concept Pioneer._ Authored the original open-source visual subnetting concept ([davidc/subnets](https://github.com/davidc/subnets)) that inspired the modern tool.
- 👤 **Alsyundawy ([@alsyundawy](https://github.com/alsyundawy))** — _Modernized & Hardened Edition Maintainer._ Spearheaded the comprehensive security hardening (CodeQL DOM XSS remediation), WCAG 2.2 AA accessibility compliance, universal responsive scaling (VGA to 2K), SEO structured data, modern dependency upgrades, and release engineering for `v1.4.1+`.
- 🎨 **Iconography**: Split icon designed by [Freepik](https://www.flaticon.com/authors/freepik) from [Flaticon](https://www.flaticon.com/).

---

## 📄 License

Visual Subnet Calculator is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Feel free to use, modify, and distribute it for personal and enterprise network engineering workflows.
