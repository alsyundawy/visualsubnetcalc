# Visual Subnet Calculator — Modernized & Hardened Edition

[![Release](https://img.shields.io/github/v/release/alsyundawy/visualsubnetcalc?style=for-the-badge&color=007acc&logo=github)](https://github.com/alsyundawy/visualsubnetcalc/releases/tag/v1.4.3)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![CodeQL Security](https://img.shields.io/badge/CodeQL-0%20Alerts%20%7C%20Passing-success?style=for-the-badge&logo=githubactions)](https://github.com/alsyundawy/visualsubnetcalc/security/code-scanning)
[![Trunk Linters](https://img.shields.io/badge/Trunk%20Check-14%20Linters%20Clean-brightgreen?style=for-the-badge&logo=checkmarx)](https://trunk.io)
[![WCAG](https://img.shields.io/badge/WCAG%202.2-Level%20AA%20Compliant-blue?style=for-the-badge&logo=w3c)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![Tests](https://img.shields.io/badge/Playwright%20E2E-118%20Passing-success?style=for-the-badge&logo=playwright)](https://playwright.dev)
[![Responsive](https://img.shields.io/badge/Responsive-VGA%20to%202K-purple?style=for-the-badge)](https://github.com/alsyundawy/visualsubnetcalc)
[![Donate PayPal](https://img.shields.io/badge/Donate-PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.me/alsyundawy)

> **An interactive, accessible, visual IPv4 & IPv6 CIDR subnet planning engine for network engineers, cloud architects, and DevOps professionals.**
> Optimized and maintained by **[`HARRY DERTIN SUTISNA (@alsyundawy)`](https://github.com/alsyundawy)** — Built upon foundational work by **[`@ckabalan`](https://github.com/ckabalan)**, **[`@bl4ckfir3`](https://github.com/bl4ckfir3)**, and **[`@davidc`](https://github.com/davidc)**.
>
> 📖 **[`Architecture & Integration Notes (DOCNOTE.md)`](DOCNOTE.md)** &nbsp;|&nbsp; 📜 **[`Full Release Changelog (CHANGELOG.md)`](CHANGELOG.md)** &nbsp;|&nbsp; 💖 **[`Support via PayPal`](https://www.paypal.me/alsyundawy)** &nbsp;|&nbsp; 🚀 **[`Releases`](https://github.com/alsyundawy/visualsubnetcalc/releases)**

---

## 🧭 Navigation

- [`📸 Interactive Preview`](#-interactive-preview)
- [`🌟 Why This Modernized Edition?`](#-why-this-modernized-edition)
- [`✨ Key Features`](#-key-features)
- [`🌐 IPv6 Architecture & Allocation Tiers`](#-ipv6-architecture--allocation-tiers)
- [`☁️ Cloud Provider Subnet Profiles & Cloud Subnet Notes`](#️-cloud-provider-subnet-profiles--cloud-subnet-notes)
- [`📦 Multi-Format Import & Export (JSON, CSV, Plain Text)`](#-multi-format-import--export-json-csv-plain-text)
- [`🚀 Deployment & Installation Guide`](#-deployment--installation-guide)
  - [`🐳 Running with Docker`](#-running-with-docker)
  - [`🖥️ Running without Docker (Bare-Metal / Native Host)`](#️-running-without-docker-bare-metal--native-host)
  - [`🔒 Production Deployment: Nginx + Certbot (SSL) + Custom Domain`](#-production-deployment-nginx--certbot-ssl--custom-domain)
- [`🛠️ Local Development & Testing`](#️-local-development--testing)
- [`📊 Quality Assurance & Verification Gates`](#-quality-assurance--verification-gates)
- [`📋 Engineering Standards, Best Practices & RFC 2119 Rules`](#-engineering-standards-best-practices--rfc-2119-rules)
- [`📚 Documentation & Engineering Notes`](#-documentation--engineering-notes)
- [`📜 Version History & Changelog`](#-version-history--changelog)
- [`🤝 Credits & Original Authors`](#-credits--original-authors)
- [`📬 Maintainer & Contact`](#-maintainer--contact)
- [`💖 Support & Donation`](#-support--donation)
- [`📄 License`](#-license)

---

## 📸 Interactive Preview

![Visual Subnet Calculator Demonstration](src/demo.gif)

Visual Subnet Calculator eliminates academic subnet math and replaces it with intuitive, visual network design. Quickly partition CIDR blocks, allocate subnets for microservices or VPC tiers, apply custom color labels, and share your entire topology with colleagues via URL fragments — **with zero server-side data retention**.

---

## 🌟 Why This Modernized Edition?

> 💡 _For deep architectural blueprints, dependency SRI hashes, and ecosystem integration details, see [`DOCNOTE.md`](DOCNOTE.md). For granular version-by-version release history, see [`CHANGELOG.md`](CHANGELOG.md)._

This edition (**v1.4.3+**) represents a complete architectural, security, accessibility, and visual overhaul of the project:

### 🛡️ 1. Zero-Defect Security & CodeQL Remediation

- **DOM XSS Remediation (`js/xss-through-dom`)**: Fully resolved GitHub CodeQL Alert #5 by isolating network boundary correction into a dedicated helper and replacing jQuery HTML interpretation sinks with safe `.text()` text node assignments.
- **Context-Aware Sanitization**: Integrated strict HTML entity escaping (`escapeHtml()`) across LZ-String URL decoders and configuration imports to neutralize reflected and stored script injection risks.
- **Immutable CI/CD Supply Chain**: Applied commit SHA pinning (`pinact`) across all GitHub Actions workflows and enforced strict top-level least-privilege permissions (`permissions: contents: read`).
- **Container Hardening**: Built with non-root execution (`USER 101` in `nginxinc/nginx-unprivileged`), automated healthcheck probes, and read-only container compatibility.

### ♿ 2. WCAG 2.2 Level AA Accessibility

- **Autofill Compliance**: Added distinct, unique `id` and `name` attributes to all form controls, dynamic table row inputs (`#note_*`), and import textareas.
- **Form Controls & Labels**: Provided explicit, semantic `<label>` elements and accessible `title` attributes for all form controls (including hidden file inputs), meeting strict HTML linter and screen-reader standards.
- **WCAG H32 Form Standards**: Configured the primary action button (`#btn_go`) as `type="submit"` with client-side event interception, ensuring full compliance without undesirable page reloads.
- **Semantic Table Architecture**: Embedded screen-reader-only `<caption class="visually-hidden">` describing CIDR hierarchies, and preserved native `<th scope="col">` column header semantics.
- **Keyboard Navigation**: Provided full keyboard support (`Enter` and `Space` triggers), `tabindex="0"`, and `role="button"` on the interactive color palette swatches.

### 📱 3. Universal Responsive Scaling (VGA to 2K)

- **Multi-Device Support**: Engineered modular CSS media queries adapting dynamically to screens ranging from legacy **VGA (640×480)**, smartphones (**iPhone, Samsung, Xiaomi, Android**), tablets (**iPad in portrait & landscape**), laptops (**MacBook**), and high-resolution **2K / Ultrawide monitors (2560px)**.
- **Screen Space Preservation**: Redesigned header bars, compacted alert banners, and scaled SVG icons to maximize visible table workspace and prevent unnecessary vertical scrolling.
- **Sticky Maintainer Footer**: Built an elegant footer (`#app_footer`) using CSS Flexbox layout (`min-height: 100dvh`, `margin-top: auto`), permanently anchored at the viewport bottom across all pages including 404 views.

### ⚡ 4. High-Performance Engineering

- **Constant-Time Bitwise Masking ($O(1)$)**: Optimized foundational network address calculation `get_network(networkInput, netSize)` from an iterative loop to a single constant-time bitwise mask operation:
  $$\text{mask} = (0\text{xffffffff} \ll (32 - \text{netSize})) \ggg 0$$
- **128-Bit Lossless Math (`BigInt`)**: Precision arithmetic for IPv6 calculations without IEEE 754 floating-point overflow, combined with strict IETF RFC 5952 canonical formatting (leading zero suppression and `::` compression).
- **ES6+ Idiomatic Codebase**: Clean arrow functions, `for...of` iterators, and spread syntax replacing legacy ES5 patterns across calculation and parsing routines.

---

## ✨ Key Features

- **Dual-Stack IPv4 & IPv6 Subnetting Engine**: Seamlessly switch between IPv4 CIDR blocks (`10.0.0.0/16`) and IPv6 prefix hierarchies (`2001:db8::/32`) with dedicated, accessible toolbar controls (`#ip_version_toolbar`).
- **Interactive IPv4 Prefix Presets**: Quick-select common CIDR sizes from **/16** up to **/32** (17 presets total: `/16` through `/32`) with real-time bidirectional synchronization between preset buttons and the prefix length input field, wrapped in a mobile-responsive toolbar (`#ipv4_tier_info`). Default: `/16` (`10.0.0.0/16`).
- **Interactive IPv6 Prefix Presets**: Comprehensive 12-preset toolbar from **/32** up to **/128** with one-click selection:
  - **/32** _(Default)_: ISP / LIR Allocation ($65,536 \times /48$ or $4.29\text{B} \times /64$)
  - **/48**: Enterprise Site Allocation ($65,536 \times /64$ SLAAC subnets)
  - **/56**: Branch Office / Multi-VPC Allocation ($256 \times /64$ subnets)
  - **/60**: Small Office / Multi-Subnet Allocation ($16 \times /64$ subnets)
  - **/64**: Standard Local Network / SLAAC Subnet ($18.4 \times 10^{18}$ host IPs)
  - **/80**: Micro-segmentation / Cloud Service Boundary ($2.81 \times 10^{14}$ host IPs)
  - **/96**: IPv4-Mapped & Translation Boundary ($4.29\text{B}$ host IPs)
  - **/112**: Isolated Device Cluster / Sub-delegation ($65,536$ host IPs)
  - **/120**: Industrial & Sensor Network Sub-delegation ($256$ host IPs)
  - **/124**: Inter-Router Small Group Sub-delegation ($16$ host IPs)
  - **/127**: Point-to-Point Router Inter-Link (RFC 6164 standard, 2 host IPs)
  - **/128**: Single Host / Loopback Interface (RFC 4291 standard, 1 host IP)
- **Multi-Format Import & Export Engine**: Full data interchange supporting **RFC 4180 CSV spreadsheets**, **aligned Plain Text tables**, and **hierarchical JSON configurations** with 1-click format switcher buttons, clipboard copy with visual feedback, and direct file download/upload (`.json`, `.csv`, `.txt`).
- **Minimal Supernet Tree Reconstruction**: Intelligent parser detecting minimum enclosing supernets and assembling flat CSV/TXT subnet lists into full interactive binary hierarchy trees with restored notes and color swatches.
- **RFC 6164 Point-to-Point Router Inter-Links**: Direct support for `/127` subnets used in router-to-router point-to-point infrastructure to prevent ping-pong amplification attacks, with interactive splitting into two `/128` host IPs.
- **SLAAC & Host Boundary Protection**: Strict adherence to RFC 4291 and RFC 7421, protecting `/64` and `/128` leaf subnets against invalid over-splitting with clear educational guidance modals.
- **Visual Tree Splitting & Merging**: Subdivide any IPv4 or IPv6 CIDR block with a single click, or join adjacent sister subnets back into their parent block.
- **Specialized Cloud Modes**: Built-in subnetting profiles for **Standard RFC 1918**, **AWS VPC**, **Azure VNet**, **Google Cloud (GCP) VPC**, and **Oracle Cloud (OCI)** that automatically account for vendor-reserved IP addresses.
- **Accessible Color Coding**: Assign distinct pastel colors to subnets to visually segment tiers (e.g., DMZ, Web, Application, Database, Management).
- **Overhauled Interactive FAQ Accordion**: Comprehensive in-app documentation featuring 10 collapsible guides with one-click Expand/Collapse All controls, cloud provider reservation matrices (Standard, AWS, Azure, OCI), IPv6 tier guides, split/join mechanics, color coding workflows, and privacy guarantees.
- **Font Awesome Free v7.3.1 Icons**: Replaced all interface graphics with high-contrast, scalable Font Awesome icons across header, bottom navigation, modals, and sticky footer.
- **Comprehensive Subnet Metrics**: Instant readout of Network Address, Range of Addresses, Usable Host Range / Interface IDs, Netmask, and Subnet Capacity.
- **Zero-Storage Privacy**: Designs are serialized and compressed into the browser's URL hash via LZ-String, or exported to local files. No accounts, cookies, or backend databases are required.
- **Dynamic Search & Filtering**: Rapidly isolate specific subnets in large CIDR blocks using prefix or note filters.

---

## 🌐 IPv6 Architecture & Allocation Tiers

Standard IPv4 binary splitting ($/N \to /N+1$) is impractical for IPv6 due to the astronomical $2^{128}$ address space. Visual Subnet Calculator adopts the standard network engineering tier hierarchy established by IETF RFC 6177, RFC 4291, and RFC 6164:

$$\text{/32 (ISP/LIR)} \longrightarrow \text{/48 (Enterprise Site)} \longrightarrow \text{/56 (Branch/VPC)} \longrightarrow \text{/60 (Dept)} \longrightarrow \text{/64 (SLAAC)} \quad\Big|\quad \text{/127 (P2P)} \longrightarrow \text{/128 (Host)}$$

| Preset Tier         | Bit Step   | Subnet Multiplication Factor           | Host Capacity / Usable IPs        | Operational Scope & Architectural Role                                | RFC Standard        |
| :------------------ | :--------- | :------------------------------------- | :-------------------------------- | :-------------------------------------------------------------------- | :------------------ |
| **/32** _(Default)_ | $+4$ bits  | $16 \times /36$ ($65,536 \times /48$)  | $4.29\text{B} \times /64$ subnets | Regional Internet Registry (RIR) allocation to ISP / Large Enterprise | RFC 6177            |
| **/48**             | $+8$ bits  | $256 \times /56$ ($65,536 \times /64$) | $65,536 \times /64$ subnets       | ISP allocation to Enterprise Site / Corporate Data Center             | RFC 6177            |
| **/56**             | $+4$ bits  | $16 \times /60$ ($256 \times /64$)     | $256 \times /64$ subnets          | Enterprise allocation to Branch Office / Campus / Multi-VPC           | RFC 6177            |
| **/60**             | $+4$ bits  | $16 \times /64$ subnets                | $16 \times /64$ subnets           | Branch assignment to Small Office / Departmental VLAN                 | RFC 6177            |
| **/64**             | Leaf / Sub | Standard Leaf Subnet                   | $18.4\text{Q}$ ($2^{64}$) IPs     | Standard Local Network / VLAN (SLAAC Autoconfiguration)               | RFC 4291 / RFC 7421 |
| **/80**             | $+16$ bits | $65,536 \times /96$ subnets            | $2.81 \times 10^{14}$ host IPs    | Micro-segmentation / Cloud Service Boundary                           | RFC 4291            |
| **/96**             | $+16$ bits | $65,536 \times /112$ subnets           | $4.29\text{B}$ host IPs           | IPv4-to-IPv6 Translation / IPv4-Embedded Addresses                    | RFC 6052            |
| **/112**            | $+8$ bits  | $256 \times /120$ subnets              | $65,536$ host IPs                 | Isolated Device Cluster / Specialized Sub-delegation                  | RFC 4291            |
| **/120**            | $+4$ bits  | $16 \times /124$ subnets               | $256$ host IPs                    | Industrial / Sensor Network Sub-delegation                            | RFC 4291            |
| **/124**            | $+3$ bits  | $8 \times /127$ subnets                | $16$ host IPs                     | Inter-Router Small Group Sub-delegation                               | RFC 4291            |
| **/127**            | $+1$ bit   | $2 \times /128$ subnets                | 2 IPs (P2P Link)                  | Point-to-Point Router Inter-Links (Prevents ping-pong attacks)        | RFC 6164            |
| **/128**            | Leaf       | Single Host / Loopback Leaf            | 1 IP (Single Host)                | Loopback Interface / Single Server Host Address                       | RFC 4291            |

---

## ☁️ Cloud Provider Subnet Profiles & Cloud Subnet Notes

Different cloud infrastructure providers reserve specific addresses in each subnet for internal routing, DNS, and gateway infrastructure. Visual Subnet Calculator natively accounts for these vendor reservations, adjusting usable host ranges and displaying clear breakdown tooltips.

### 📊 Cloud Reservation Comparison Matrix

| Cloud Profile          | Smallest Subnet |     Reserved IPs     | Reserved IP Roles Breakdown                                                                 | Reference Documentation                                                                                                                                                         |
| :--------------------- | :-------------: | :------------------: | :------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Standard**           |      `/32`      | **2** _(size ≤ /30)_ | Network Address (`.0`), Broadcast Address (`.last`)                                         | [`RFC 1918`](https://datatracker.ietf.org/doc/html/rfc1918) / [`RFC 4632`](https://datatracker.ietf.org/doc/html/rfc4632)                                                       |
| **AWS VPC**            |      `/28`      |        **5**         | Network (`.0`), VPC Router (`.1`), VPC DNS (`.2`), Future Use (`.3`), Broadcast (`.last`)   | [`AWS VPC Subnet Sizing`](https://docs.aws.amazon.com/vpc/latest/userguide/subnet-sizing.html)                                                                                  |
| **Azure VNet**         |      `/29`      |        **5**         | Network (`.0`), Default Gateway (`.1`), Azure DNS Mapping (`.2`, `.3`), Broadcast (`.last`) | [`Azure VNet Restrictions`](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-faq#are-there-any-restrictions-on-using-ip-addresses-within-these-subnets) |
| **Google Cloud (GCP)** |      `/29`      |        **4**         | Network (`.0`), Default Gateway (`.1`), Future Use (`.last - 1`), Broadcast (`.last`)       | [`Google Cloud VPC Subnets`](https://cloud.google.com/vpc/docs/subnets#reserved_ip_addresses_in_ipv4_subnets)                                                                   |
| **Oracle Cloud (OCI)** |      `/30`      |        **3**         | Network (`.0`), Default Gateway (`.1`), Broadcast (`.last`)                                 | [`OCI Reserved IP Addresses`](https://docs.oracle.com/en-us/iaas/Content/Network/Concepts/overview.htm#Reserved__reserved_subnet)                                               |

### 🌐 Standard RFC 1918 / RFC 4632 Mode

- **Smallest Subnet**: `/32` (Single host / loopback interface)
- **Reserved Addresses (for size ≤ /30)**: 2 addresses
  - **Network Address**: `network + 0` (Base network identifier)
  - **Broadcast Address**: `last address` (`network + size - 1`)
- **Usable Host Range**: `network + 1` to `last_address - 1` (for size ≤ /30). For `/31` point-to-point router links (RFC 3021), both addresses are usable without dedicated network or broadcast addresses. For `/32`, exactly 1 host address is available.

### 🟧 Amazon Web Services (AWS) VPC Mode

- **Smallest Subnet**: `/28` (16 total addresses, 11 usable)
- **Reserved Addresses**: 5 addresses per subnet
  - `network + 0`: **Network address** (Identifies the subnet CIDR block)
  - `network + 1`: **VPC router** (Reserved by AWS for default gateway routing)
  - `network + 2`: **VPC DNS** (Reserved by AWS for AmazonProvidedDNS / Route 53 Resolver)
  - `network + 3`: **Future use** (Reserved by AWS for upcoming internal capabilities)
  - `last address`: **Network broadcast** (AWS VPC does not support broadcast, but reserves this address)
- **Usable Host Range**: `network + 4` to `last_address - 1`

### 🟦 Microsoft Azure Virtual Network (VNet) Mode

- **Smallest Subnet**: `/29` (8 total addresses, 3 usable)
- **Reserved Addresses**: 5 addresses per subnet
  - `network + 0`: **Network address** (Identifies the subnet CIDR block)
  - `network + 1`: **Default gateway** (Reserved by Azure for routing out of the subnet)
  - `network + 2`: **Azure DNS** (Maps Azure DNS IPs to the VNet address space)
  - `network + 3`: **Azure DNS** (Secondary redundant mapping for Azure DNS resolution)
  - `last address`: **Network broadcast** (Reserved by Azure)
- **Usable Host Range**: `network + 4` to `last_address - 1`

### 🟥 Google Cloud Platform (GCP) VPC Mode

- **Smallest Subnet**: `/29` (8 total addresses, 4 usable)
- **Reserved Addresses**: 4 addresses per subnet
  - `network + 0`: **Network address** (Identifies the subnet CIDR block)
  - `network + 1`: **Default gateway** (Used by Google Cloud to route traffic within the VPC network)
  - `last_address - 1`: **Reserved for future use** (Second-to-last IP, reserved by Google for upcoming features)
  - `last address`: **Network broadcast** (Google Cloud VPC does not support broadcast, but reserves this address)
- **Usable Host Range**: `network + 2` to `last_address - 2` (Notice that unlike AWS and Azure which reserve `.2` and `.3` at the lower boundary, Google Cloud reserves `.1` at the beginning and `last - 1` at the upper boundary)

### 🔴 Oracle Cloud Infrastructure (OCI) Mode

- **Smallest Subnet**: `/30` (4 total addresses, 1 usable)
- **Reserved Addresses**: 3 addresses per subnet
  - `network + 0`: **Network address** (Identifies the subnet CIDR block)
  - `network + 1`: **Default gateway** (Reserved by OCI for the subnet's virtual router IP)
  - `last address`: **Network broadcast** (Reserved by OCI)
- **Usable Host Range**: `network + 2` to `last_address - 1`

---

## 📦 Multi-Format Import & Export (JSON, CSV, Plain Text)

Visual Subnet Calculator v1.4.3 provides a powerful multi-format data interchange engine accessible via the **Import / Export** modal (`#importExportModal`):

```text
                       ┌──────────────────────────────────────────────┐
                       │     Visual Subnet Calculator Tree Model      │
                       └──────────────────────┬───────────────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         ▼                         ▼
         ┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
         │     JSON Format     │   │   CSV (RFC 4180)    │   │  Plain Text Table   │
         │  Full State & Tree  │   │ Spreadsheet Ready   │   │  Docs & PR Reviews  │
         └─────────────────────┘   └─────────────────────┘   └─────────────────────┘
```

### Supported Data Formats

1. **JSON (`.json`)**: Complete configuration snapshot preserving base network CIDR, operational mode (`Standard`, `AWS`, `Azure`, `OCI`), active IP version (`IPv4` or `IPv6`), custom subnet notes, and color swatches.
2. **CSV (`.csv`)**: Strict RFC 4180 compliant comma-separated values format, quote-escaped for instant compatibility with Microsoft Excel, LibreOffice Calc, and Google Sheets:
   ```csv
   "Subnet Address","Range of Addresses","Usable IPs","Hosts","Note","Color"
   "10.0.0.0/18","10.0.0.0 - 10.0.63.255","10.0.0.1 - 10.0.63.254","16382","Production VPC","#cbf078"
   "10.0.64.0/18","10.0.64.0 - 10.0.127.255","10.0.64.1 - 10.0.127.254","16382","Staging VPC","#f8f398"
   ```
3. **Plain Text (`.txt`)**: Dynamically aligned ASCII text tables with metadata comments, ideal for pasting directly into Git pull requests, network topology runbooks, or terminal console outputs:
   ```text
   # Visual Subnet Calculator Export
   # Base Network: 10.0.0.0/16 | Mode: Standard | Format: Plain Text
   # Exported on: 2026-09-16T13:27:18.000Z

   Subnet Address   Range of Addresses          Usable IPs                  Hosts   Note            Color
   10.0.0.0/18      10.0.0.0 - 10.0.63.255      10.0.0.1 - 10.0.63.254      16382   Production VPC  #cbf078
   10.0.64.0/18     10.0.64.0 - 10.0.127.255    10.0.64.1 - 10.0.127.254    16382   Staging VPC     #f8f398
   ```

### Operational Actions

- **1-Click Format Switcher**: Toggle instantly between `JSON`, `CSV`, and `Plain Text` format tabs.
- **Quick Copy (`#btn_copy_export`)**: Copies formatted text to the clipboard with animated "Copied!" confirmation.
- **Direct File Download (`#btn_download_export`)**: Generates an in-memory `Blob` and triggers automatic browser download named `subnet-calc-[network].[ext]`.
- **File Upload (`#btn_upload_file`)**: Loads local `.json`, `.csv`, or `.txt` files directly into the calculator via HTML5 `FileReader` API with zero server interaction.
- **Smart Tree Assembly**: Automatically parses arbitrary CIDR lists, tab-delimited tables, or CSV rows, computes the minimal enclosing supernet via bitwise XOR math, and recursively reconstructs the visual subnet tree.

---

## 🚀 Deployment & Installation Guide

Visual Subnet Calculator is a 100% static, client-side web application. It can be hosted with exceptional speed and minimal resource consumption using Docker containers, local development runtimes, or production web servers (Nginx, Caddy, Apache).

---

### 🐳 Running with Docker

Running Visual Subnet Calculator via Docker provides an isolated, zero-dependency deployment that runs with non-root security privileges (`USER 101`).

#### Method 1: Quick Run with Docker CLI

Pull and run the pre-built image directly:

```bash
# Run container in background on port 8080
docker run -d \
  --name visualsubnetcalc \
  --restart unless-stopped \
  -p 8080:8080 \
  ckabalan/visualsubnetcalc:latest
```

Access the application in your browser at `http://localhost:8080`.

#### Method 2: Build Locally from Source

To build and run the latest image directly from this repository:

```bash
# 1. Clone the repository
git clone https://github.com/alsyundawy/visualsubnetcalc.git
cd visualsubnetcalc

# 2. Build the production Docker image using the multi-stage Dockerfile
docker build -t visualsubnetcalc:1.4.3 .

# 3. Run the hardened container
docker run -d \
  --name visualsubnetcalc \
  --restart unless-stopped \
  -p 8080:8080 \
  visualsubnetcalc:1.4.3
```

#### Method 3: Production Docker Compose (`docker-compose.yml`)

For production environments or multi-container stacks, create a `docker-compose.yml` file:

```yaml
version: "3.8"

services:
  visualsubnetcalc:
    image: ckabalan/visualsubnetcalc:latest
    # Or build locally:
    # build:
    #   context: .
    #   dockerfile: Dockerfile
    container_name: visualsubnetcalc
    restart: unless-stopped
    ports:
      # Bind to 127.0.0.1 when using an Nginx reverse proxy on the host
      - "127.0.0.1:8080:8080"
      # Or expose directly to external traffic if no reverse proxy is used:
      # - "8080:8080"
    security_opt:
      - no-new-privileges:true
    healthcheck:
      test:
        [
          "CMD",
          "sh",
          "-c",
          "wget --no-verbose --tries=1 --spider http://127.0.0.1:8080/ || exit 1",
        ]
      interval: 30s
      timeout: 3s
      start_period: 5s
      retries: 3
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    networks:
      - web_net

networks:
  web_net:
    driver: bridge
```

Launch the service with Docker Compose:

```bash
# Start container in detached mode
docker compose up -d

# Verify container status and healthcheck probe
docker compose ps

# View application access logs
docker compose logs -f
```

---

### 🖥️ Running without Docker (Bare-Metal / Native Host)

If you prefer not to use Docker, Visual Subnet Calculator can run on any host with Node.js, Python, or a standard web server.

#### Method 1: Node.js & npm (Development & Local Testing)

**System Requirements**:

- **Operating System**: Linux (Ubuntu 22.04/24.04 LTS, Debian 11/12), macOS (Sonoma, Sequoia), or Windows 10/11 with WSL2
- **Minimum Node.js Version**: **Node.js `v18.0.0+ LTS`** (Hydrogen) — Required for native ECMAScript Modules (ESM), lossless 128-bit `BigInt` bitwise math, and Web Crypto API.
- **Optimal / Recommended Node.js Version**: **Node.js `v20.x` / `v22.x Active LTS`** (Iron / Jod) — Delivers peak performance through the latest V8 JIT engine, lowest memory footprint, and native speed for headless Playwright test suites.
- **Package Manager**: **npm `10.x+`** (or pnpm `9.x+`, yarn `4.x+`)

```bash
# 1. Clone repository
git clone https://github.com/alsyundawy/visualsubnetcalc.git
cd visualsubnetcalc/src

# 2. Install dependencies
npm install

# 3. Compile assets & SCSS stylesheets
npm run build

# 4. Launch local HTTP server on http://127.0.0.1:8080
npm start
```

#### Method 2: Python 3 Built-in HTTP Server (Zero Extra Dependencies)

On any server or workstation where Python 3 is installed, you can serve the pre-compiled `dist/` directory immediately without installing npm or Node.js:

```bash
# Clone the repository
git clone https://github.com/alsyundawy/visualsubnetcalc.git
cd visualsubnetcalc

# Launch built-in HTTP server bound to localhost port 8080
python3 -m http.server 8080 --directory dist --bind 127.0.0.1
```

Open `http://127.0.0.1:8080` in your web browser.

#### Method 3: Direct Native Nginx Static Site (High Performance)

For production Linux servers (Ubuntu/Debian) where you want Nginx to serve the static assets directly without a container:

```bash
# 1. Install Nginx
sudo apt update
sudo apt install -y nginx

# 2. Clone repository and copy dist files to web root
git clone https://github.com/alsyundawy/visualsubnetcalc.git
sudo mkdir -p /var/www/visualsubnetcalc
sudo cp -r visualsubnetcalc/dist/* /var/www/visualsubnetcalc/

# 3. Set proper directory permissions
sudo chown -R www-data:www-data /var/www/visualsubnetcalc
sudo chmod -R 755 /var/www/visualsubnetcalc
```

See the [`Nginx Configuration`](#-production-deployment-nginx--certbot-ssl--custom-domain) section below for the complete virtual host configuration block.

#### Method 4: Caddy Server (Modern with Automatic HTTPS)

If you use [`Caddy`](https://caddyserver.com/), creating a high-performance, automatic-HTTPS server takes just 3 lines in your `/etc/caddy/Caddyfile`:

```caddyfile
subnet.yourdomain.com {
    root * /var/www/visualsubnetcalc
    file_server
    encode gzip zstd
}
```

Restart Caddy with `sudo systemctl reload caddy`, and Let's Encrypt certificates are acquired automatically!

---

### 🔒 Production Deployment: Nginx + Certbot (SSL) + Custom Domain

This guide walks you through deploying Visual Subnet Calculator to production under your own custom domain (e.g., `subnet.yourdomain.com` or `subnet.alsyundawy.com`) with automated Let's Encrypt SSL/TLS certificates and hardened security headers.

#### Step 1: Configure DNS Records

At your domain registrar or DNS management console (Cloudflare, Route53, Namecheap, etc.), create an **A Record** (and optionally an **AAAA Record** for IPv6):

| Record Type | Hostname / Name | Target / Value             | TTL        |
| :---------- | :-------------- | :------------------------- | :--------- |
| **A**       | `subnet`        | `YOUR_SERVER_IPV4_ADDRESS` | 300 / Auto |
| **AAAA**    | `subnet`        | `YOUR_SERVER_IPV6_ADDRESS` | 300 / Auto |

Verify DNS propagation from your terminal:

```bash
dig +short subnet.yourdomain.com
```

#### Step 2: Configure System Firewall (UFW)

Ensure incoming HTTP (port 80) and HTTPS (port 443) traffic is permitted:

```bash
# Allow HTTP and HTTPS traffic through the firewall
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'

# Reload firewall to apply changes
sudo ufw reload
```

#### Step 3: Configure Production Nginx Server Block

Choose either **Pattern A (Reverse Proxy to Docker Container)** or **Pattern B (Direct Static File Hosting)**:

Create `/etc/nginx/sites-available/visualsubnetcalc.conf`:

```nginx
# /etc/nginx/sites-available/visualsubnetcalc.conf

# 1. HTTP Configuration (Initial block for domain verification & SSL redirect)
server {
    listen 80;
    listen [::]:80;
    server_name subnet.yourdomain.com;

    # Allow Let's Encrypt ACME challenge files
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        try_files $uri =404;
    }

    # Redirect all HTTP requests to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

# 2. HTTPS Production Server Block
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name subnet.yourdomain.com;

    # SSL Certificate Paths (Managed by Certbot in Step 4)
    ssl_certificate /etc/letsencrypt/live/subnet.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/subnet.yourdomain.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Hardened Security Headers (OWASP & Best Practices)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data:; connect-src 'self';" always;

    # Gzip Compression Optimization
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    # ------------------------------------------------------------------------
    # OPTION A: Reverse Proxy to Docker Container running on 127.0.0.1:8080
    # ------------------------------------------------------------------------
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_read_timeout 60s;
    }

    # ------------------------------------------------------------------------
    # OPTION B: Direct Static File Serving (Uncomment if NOT using Docker)
    # ------------------------------------------------------------------------
    # root /var/www/visualsubnetcalc;
    # index index.html;
    # error_page 404 /404.html;
    #
    # location / {
    #     try_files $uri $uri/ /index.html =404;
    # }
    #
    # # Aggressive caching for immutable static assets (CSS, JS, Fonts, Images)
    # location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    #     expires 30d;
    #     add_header Cache-Control "public, no-transform";
    # }
}
```

Enable the configuration and verify syntax:

```bash
# Create symlink to sites-enabled
sudo ln -sf /etc/nginx/sites-available/visualsubnetcalc.conf /etc/nginx/sites-enabled/

# Test Nginx syntax
sudo nginx -t
```

#### Step 4: Install Certbot & Acquire Let's Encrypt SSL Certificate

Install Certbot and the Nginx plugin:

```bash
# On Ubuntu / Debian:
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

Acquire and install the SSL certificate:

```bash
# Automatically configure SSL in Nginx
sudo certbot --nginx -d subnet.yourdomain.com --agree-tos --email admin@yourdomain.com --redirect
```

Certbot will automatically obtain the certificate, configure the SSL directives in `/etc/nginx/sites-available/visualsubnetcalc.conf`, and reload Nginx.

#### Step 5: Verify Automated SSL Certificate Renewal

Let's Encrypt certificates are valid for 90 days. Certbot installs a systemd timer that automatically checks and renews certificates twice daily:

```bash
# Test the renewal process with a dry-run
sudo certbot renew --dry-run

# Verify the active Certbot systemd timer
sudo systemctl status certbot.timer
```

#### Step 6: Post-Deployment Verification

Verify your production deployment using `curl`:

```bash
# Verify HTTP redirects to HTTPS with 301
curl -I http://subnet.yourdomain.com

# Verify HTTPS returns HTTP/2 200 OK with security headers
curl -I https://subnet.yourdomain.com
```

---

## 🛠️ Local Development & Testing

### 1. Development Server Runtimes

```bash
# Enter the src directory
cd visualsubnetcalc/src

# Install dependencies
npm install

# Compile SCSS stylesheets and bundle distribution assets
npm run build

# Launch the local HTTP development server on http://localhost:8080
npm start
```

### 2. Automated Playwright E2E Test Suite

Visual Subnet Calculator includes a comprehensive Playwright test suite covering IPv4 calculations, IPv6 128-bit tiers, cloud modes, UI interactions, and multi-format CSV/Plain Text/JSON import/export across Chromium and Firefox:

```bash
# Execute all 114 end-to-end tests across Chromium and Firefox
npm test

# Run tests with UI test runner
npx playwright test --ui

# Run specific test file
npx playwright test tests/import-export.spec.ts
```

### 3. Local HTTPS with Development Certificates (Optional)

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

## 📊 Quality Assurance & Verification Gates

Every release of this modernized edition undergoes rigorous verification across multiple automated testing pipelines:

| Quality Gate               | Tool / Engine                          | Target Scope                                              | Status                                     |
| :------------------------- | :------------------------------------- | :-------------------------------------------------------- | :----------------------------------------- |
| **Comprehensive Linting**  | [`Trunk Check`](https://trunk.io)      | 14 Linters (`prettier`, `yamllint`, `markdownlint`, etc.) | **PASSED (68/68 files clean)**             |
| **HTML5 Validation**       | `html-validate`                        | Native HTML standards, accessibility & semantic tags      | **PASSED (0 errors, 0 warnings)**          |
| **Browser E2E Testing**    | [`Playwright`](https://playwright.dev) | Chromium & Firefox end-to-end user workflows              | **PASSED (118/118 tests)**                 |
| **Security Scanning**      | GitHub CodeQL                          | DOM XSS and source-to-sink vulnerability analysis         | **PASSED (0 alerts)**                      |
| **IaC & Container Policy** | `checkov` & `hadolint`                 | Dockerfile & AWS CloudFormation best practices            | **PASSED (CIS & Best Practice Compliant)** |

---

## 📋 Engineering Standards, Best Practices & RFC 2119 Rules

### 📑 Executive Summary

Visual Subnet Calculator is an industrial-grade, client-side visual IP planning engine designed for high-availability enterprise networks, cloud topologies (AWS VPC, Azure VNet, OCI), and dual-stack IPv4/IPv6 architectures. To guarantee deterministic computation, zero data leakage, and resilient performance, engineering workflows adhere strictly to formal criteria defined below.

### 📐 RFC 2119 / RFC 8174 Engineering Criteria

The key words **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, **MAY**, and **AVOID** in this document are to be interpreted as described in [`BCP 14`](https://datatracker.ietf.org/doc/html/bcp14), [`RFC 2119`](https://datatracker.ietf.org/doc/html/rfc2119), and [`RFC 8174`](https://datatracker.ietf.org/doc/html/rfc8174).

#### 🔴 MUST (Mandatory Invariants)

- **MUST Execute Purely Client-Side**: All subnet splits, joins, format conversions, and state encodings MUST occur strictly within the client's local browser runtime. No topology data, CIDR blocks, or notes may ever be transmitted to an external server.
- **MUST Use 128-Bit Lossless Math (`BigInt`) for IPv6**: Calculations across IPv6 address spaces MUST use JavaScript native `BigInt` arithmetic. Implementations MUST NOT cast 128-bit integers to IEEE 754 floating-point `Number` types.
- **MUST Sanitize Dynamic HTML Inputs**: All user-supplied notes, labels, and imported configurations MUST undergo character entity sanitization (`escapeHtml()`) before DOM interpolation to prevent Cross-Site Scripting (XSS).
- **MUST Isolate Modal Alerts via Safe Text Sinks**: Dynamic boundary alerts MUST bind data using safe text nodes (`.text()`), eliminating DOM XSS sinks (remediating CodeQL Alert #5).
- **MUST Enforce RFC 4180 Formatting for CSV**: CSV serialization MUST escape quotes as `""` and wrap all fields with double quotes.
- **MUST Provide Accessible Form Labels**: Every interactive control, including hidden file inputs (`#importFileInput`), MUST be associated with a semantic `<label>` and descriptive `title` attribute meeting WCAG 2.2 Level AA.
- **MUST Run Containers with Unprivileged User (Non-Root)**: Docker production environments MUST execute under numeric unprivileged user context (`USER 101` in `nginxinc/nginx-unprivileged`).

#### 🟡 SHOULD (Strong Recommendations)

- **SHOULD Use LZ-String Compression for URL Sharing**: Network engineers SHOULD serialize and distribute topology state via LZ-String URL hashes (`#?c=...`) for instant, serverless peer sharing.
- **SHOULD Enforce Production HTTPS with HSTS**: Production deployments SHOULD configure TLSv1.2/v1.3, automated Let's Encrypt certificates (Certbot), and an HSTS header (`max-age=31536000; includeSubDomains; preload`).
- **SHOULD Configure Container Healthcheck Probes**: Docker instances SHOULD declare active HTTP healthcheck probes (`wget --spider http://127.0.0.1:8080/`) to facilitate automated container restarts.
- **SHOULD Apply Color-Coded Tiering**: Architects SHOULD segment multi-tier infrastructure (e.g., DMZ, Web, App, DB, Management) using distinct color swatches for rapid visual auditing.
- **SHOULD Preserve Backward-Compatible JSON Schemas**: New configuration exports SHOULD maintain legacy key ordering to preserve interoperability with older parsers.

#### 🟢 MAY (Permissible Options)

- **MAY Export to Formatted Plain Text**: Users MAY download or copy ASCII aligned plain text tables for direct inclusion in Git pull requests, RFC runbooks, or markdown engineering journals.
- **MAY Use Python 3 or Caddy for Rapid Deployments**: Teams MAY leverage Python's built-in HTTP server for zero-install air-gapped testing, or Caddy for automatic zero-configuration TLS.
- **MAY Allocate Subnets Down to /127 for Point-to-Point Links**: Network engineers MAY split IPv6 allocations down to `/127` specifically for inter-router point-to-point links conforming to RFC 6164.

#### ⛔ AVOID (Strict Anti-Patterns)

- **AVOID Inline HTML Style Attributes**: Developers MUST NOT introduce inline `style="..."` attributes; all visual presentations MUST adhere to scoped CSS classes in `dist/css/main.css`.
- **AVOID Floating-Point Mathematics for IPv6**: Developers MUST NOT cast IPv6 address hextets to JavaScript standard `Number` types for bit-shift operations.
- **AVOID Unsanitized `innerHTML` or `.html()` Sinks**: Never feed raw URL parameters, JSON payloads, or DOM values directly into HTML parser sinks.
- **AVOID Arbitrary Sub-Splitting Below /64 for SLAAC Subnets**: End users and automation scripts MUST NOT divide standard SLAAC local networks past `/64` without explicit architectural justification (RFC 7421).
- **AVOID Global CSS Selector Pollution**: Styling rules MUST NOT target unscoped base element tags (e.g., bare `input` or `label`) that leak into third-party modal or navbar containers.

---

### 🏆 Architectural & Network Engineering Best Practices

1. **Hierarchy-First IP Planning**:
   - Begin with the largest realistic parent allocation (e.g., IPv4 `/16` or IPv6 `/32`–`/48`).
   - Partition hierarchically along operational boundaries (Availability Zones, VPC subnets, or security perimeters) rather than arbitrary address boundaries.
2. **Cloud Reservation Awareness**:
   - Always activate the specific cloud mode (**AWS VPC**, **Azure VNet**, or **Oracle Cloud OCI**) during cloud topology design to prevent provisioning errors caused by vendor-reserved addresses (such as AWS reserving `.0`, `.1`, `.2`, `.3`, and `.255`).
3. **Defense-in-Depth Web Hosting**:
   - Pair reverse proxy containers with a hardened host Nginx server enforcing HTTP-to-HTTPS redirects, Gzip/Brotli compression, and immutable asset caching (`Cache-Control: public, no-transform; max-age=2592000`).
4. **Air-Gapped & Offline Readiness**:
   - Because Visual Subnet Calculator bundles all assets (Bootstrap, jQuery, Font Awesome, LZ-String) locally with Subresource Integrity hashes, verify that air-gapped deployments can run completely disconnected from public CDNs.

---

## 📚 Documentation & Engineering Notes

Comprehensive technical documentation, architectural specifications, security considerations, and ecosystem integration guides are maintained in **[`DOCNOTE.md`](DOCNOTE.md)**. Key topics covered include:

- **Core Architecture Layers**: Detailed breakdown of Structure (`dist/index.html`), Presentation (`dist/css/main.css`), Logic (`dist/js/main.js`), and vendor-specific Cloud Subnet Profiles.
- **Dependency Matrix & SRI Cryptographic Hashes**: Full verification table detailing Subresource Integrity SHA384 hashes for Bootstrap 5.3.8, jQuery 3.7.1, jQuery Validate 1.21.0, and vendored LZ-String 1.5.0.
- **Multi-Format Import & Export Engine**: Data models, RFC 4180 CSV serialization, dynamically aligned Plain Text tables, and minimal supernet calculation ($32 - \lfloor \log_2(\text{xor}) + 1 \rfloor$) for automatic tree reconstruction.
- **Performance Engineering**: Constant-time $O(1)$ bitwise network calculation mask and modern ES6+ idiomatic JavaScript modernization.
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

👉 **Read the complete technical specification**: **[`DOCNOTE.md`](DOCNOTE.md)**

---

## 📜 Version History & Changelog

Every notable release, security remediation, accessibility improvement, and framework upgrade is documented in **[`CHANGELOG.md`](CHANGELOG.md)** following the [`Keep a Changelog`](https://keepachangelog.com/en/1.1.0/) format and [`Semantic Versioning`](https://semver.org/spec/v2.0.0.html).

### Recent Release Highlights

- **[`v1.4.3 (Latest Release)`](CHANGELOG.md#143---2026-09-17)**:
  - ☁️ **Google Cloud (GCP) VPC Subnet Reservation Mode**: Integrated GCP cloud reservation profile in Tools dropdown (`#dropdown_gcp`) reserving 4 IP addresses per subnet (`network + 0` Network ID, `network + 1` Default Gateway, `broadcast - 1` reserved for future use, and `broadcast - 0` Broadcast). Enforces minimum `/29` subnet boundary and computes deterministic usable range (`network + 2` to `last_address - 2`).
  - 🌐 **Hierarchical IPv6 Tier Progression & Safety Bounds**: Refined and optimized `getNextIpv6Tier()` and `splitIpv6Network()` to guarantee bounded $O(1)$ memory usage and strictly safe subnet splitting. Enforces clean nibble transitions (+4 bits) across enterprise, branch, and micro-segmentation tiers, preserves `/64` as an immutable SLAAC leaf boundary (RFC 4291 / RFC 7421), and enables granular point-to-point sub-delegation (`/112 -> /120 -> /124 -> /127 -> /128`).
  - 🔢 **IPv6 Capacity Arithmetic Bugfix**: Corrected quadrillion divisor in `getIpv6Capacity()` from `10^18` to `10^15`.
  - 🛡️ **CSS Injection & Type Hardening**: Strict regex validation on table row background colors via `sanitizeColor()`, and hardened type safety in `escapeHtml()`.
  - 🧪 **E2E Test Suite Expansion**: 118 passing Playwright E2E tests across Chromium and Firefox.
- **[`v1.4.2`](CHANGELOG.md#142---2026-09-16)**:
  - 📦 **Multi-Format Import & Export Engine**: Full data interchange supporting RFC 4180 CSV spreadsheets, aligned Plain Text ASCII tables, and hierarchical JSON configurations with 1-click format switcher buttons (`#btn_format_json`, `#btn_format_csv`, `#btn_format_txt`).
  - 💾 **Client-Side File Upload & Download**: In-memory `Blob` generation triggering direct file downloads (`#btn_download_export`) and HTML5 `FileReader` loading (`#btn_upload_file`, `#importFileInput`) for `.json`, `.csv`, and `.txt` files.
  - 📋 **Quick Clipboard Copy**: Copy button (`#btn_copy_export`) with transient "Copied!" visual feedback.
  - ⚡ **$O(1)$ Constant-Time Bitwise Mask Optimization**: Foundational IPv4 network calculation `get_network()` optimized from an iterative loop to a constant-time bitwise mask (`(0xffffffff << (32 - netSize)) >>> 0`).
  - 🌐 **Dual-Stack IPv4 & IPv6 Subnetting Engine**: Seamlessly switch between IPv4 and IPv6 modes via the accessible `#ip_version_toolbar` segmented buttons.
  - ⚡ **Interactive IPv4 Prefix Presets Toolbar**: Quick-select common CIDR sizes from `/16` up to `/32` (17 presets) with two-way synchronization, accessible buttons, and responsive wrapping chips (`#ipv4_tier_info`). Default: `/16` (`10.0.0.0/16`).
  - 🎯 **Interactive IPv6 Prefix Presets Toolbar**: Full 12-preset toolbar for `/32` (default), `/48`, `/56`, `/60`, `/64`, `/80`, `/96`, `/112`, `/120`, `/124`, `/127`, and `/128`, with real-time two-way synchronization between preset buttons and the prefix length input field (`#ipv6_tier_info`).
  - 🔢 **128-Bit Lossless Math (`BigInt`)**: Precision arithmetic for IPv6 calculations without IEEE 754 floating-point overflow, combined with strict IETF RFC 5952 canonical formatting (leading zero suppression and `::` compression).
  - ⚡ **RFC 6164 Point-to-Point Router Inter-Links**: Direct support for `/127` subnets with interactive splitting into two `/128` host subnets, and host boundary protection preventing invalid `/128` splitting.
  - 🛡️ **SLAAC Boundary Protection**: Implements RFC 4291 / RFC 7421 standards, designating `/64` as non-splittable leaf subnets with educational modal guidance.
  - 🎨 **Header Layout Modernization**: Refactored navigation bar into semantic `<header id="app_header">` with clean flex alignment and Font Awesome `fa-network-wired` brand mark.
  - 📖 **Interactive FAQ Accordion**: 10 comprehensive architectural guides with one-click Expand/Collapse All controls.
  - 📱 **Responsive Viewport Parity**: Scoped table styling (`#calc.ipv6-mode`) and synchronized mobile column header visibility under `< 576px`.
  - 🧪 **Comprehensive Automated Testing**: 114 passing Playwright E2E tests across Chromium and Firefox.
- **[`v1.4.1`](CHANGELOG.md#141---2026-09-16)**:
  - 🛡️ **Security**: CodeQL Alert #5 (`js/xss-through-dom`) remediated via `.text()` text node insertion in boundary warning modal; context-aware HTML entity sanitization (`escapeHtml()`) across URL decoders and JSON imports.
  - ♿ **Accessibility**: WCAG 2.2 Level AA compliance; unique `id` and `name` attributes across all form inputs for browser autofill; WCAG H32 `<button type="submit">` form trigger; screen-reader `<caption class="visually-hidden">` and semantic `<th scope="col">` column headers; full keyboard color palette navigation.
  - 📱 **Responsive Design**: Modular CSS media queries scaling from VGA (640×480), mobile devices, and tablets up to 2K / Ultrawide displays (2560px).
  - 🔍 **SEO & Web Standards**: Schema.org JSON-LD `WebApplication` structured data, Open Graph card definitions, and 100% `html-validate` compliance.
  - ⚡ **Dependencies**: Upgraded to Bootstrap 5.3.8 (SRI verified) and Playwright 1.63.0 E2E testing framework.
- **[`v1.4.0`](CHANGELOG.md#140---2026-09-15)**:
  - ☁️ Multi-cloud usable IP calculations for AWS VPC, Azure VNet, and Oracle Cloud Infrastructure (OCI).
  - 🔗 Compressed URL sharing with LZ-String state encoding; JSON configuration import/export.
- **v1.3.x & Earlier**:
  - Foundational visual subnetting table tree, interactive split/join engine, and Docker containerization.

👉 **Browse the full release changelog**: **[`CHANGELOG.md`](CHANGELOG.md)**

---

## 🤝 Credits & Original Authors

Visual Subnet Calculator is built upon the collaborative spirit of the open-source community. Sincere appreciation and credit are extended to:

- 👤 **Caesar Kabalan ([`@ckabalan`](https://github.com/ckabalan))** — _Original Creator and Lead Architect of Visual Subnet Calculator._ Created the initial modern web implementation, interactive UI tree model, cloud mode profiles, and container packaging.
- 👤 **Florian M. ([`@bl4ckfir3`](https://github.com/bl4ckfir3))** — _Core Feature Contributor._ Designed and contributed the Oracle Cloud Infrastructure (OCI) subnet calculations and profile rules ([`PR #30`](https://github.com/ckabalan/visualsubnetcalc/pull/30)).
- 👤 **David C ([`@davidc`](https://github.com/davidc))** — _Inspiration & Concept Pioneer._ Authored the original open-source visual subnetting concept ([`davidc/subnets`](https://github.com/davidc/subnets)) that inspired the modern tool.
- 👤 **HARRY DERTIN SUTISNA ([`@alsyundawy`](https://github.com/alsyundawy))** — _Modernized & Hardened Edition Maintainer._ Spearheaded the comprehensive security hardening (CodeQL DOM XSS remediation), WCAG 2.2 AA accessibility compliance, universal responsive scaling (VGA to 2K), dual-stack IPv4/IPv6 architecture, multi-format import/export engine, $O(1)$ bitwise mask optimization, SEO structured data, modern dependency upgrades, and release engineering for `v1.4.3+`.
- 🎨 **Iconography**: Split icon designed by [`Freepik`](https://www.flaticon.com/authors/freepik) from [`Flaticon`](https://www.flaticon.com/), and [`Font Awesome Free`](https://fontawesome.com/) by Fonticons, Inc.

---

## 📬 Maintainer & Contact

For questions, feature requests, security disclosures, or collaboration:

- **Lead Maintainer & Engineering**: **HARRY DERTIN SUTISNA** — [`ALSYUNDAWY IT SOLUTION`](https://alsyundawy.com)
- **Official Website**: [`https://alsyundawy.com`](https://alsyundawy.com) (ALSYUNDAWY IT SOLUTION)
- **GitHub Profile**: [`https://github.com/alsyundawy`](https://github.com/alsyundawy)
- **X (Twitter)**: [`@alsyundawy`](https://x.com/alsyundawy)
- **Telegram**: [`@alsyundawy`](https://t.me/alsyundawy)
- **Email**: [`alsyundawy@gmail.com`](mailto:alsyundawy@gmail.com)
- **Repository**: [`https://github.com/alsyundawy/visualsubnetcalc`](https://github.com/alsyundawy/visualsubnetcalc)
- **Sponsorship / Donation**: [`PayPal Donate`](https://paypal.me/alsyundawy)

---

## 💖 Support & Donation

If **Visual Subnet Calculator** has helped you design, optimize, or troubleshoot your network architectures, consider supporting its continuous maintenance, security audits, and hosting infrastructure:

### 💳 International Support: PayPal

[![Donate with PayPal](https://img.shields.io/badge/Donate-PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.me/alsyundawy)

- **PayPal Link**: [`https://www.paypal.me/alsyundawy`](https://www.paypal.me/alsyundawy)

### 🇮🇩 Indonesian & Regional Support: QRIS (Quick Response Code Indonesian Standard)

Scan the QRIS barcode below using any Indonesian mobile banking application (BCA, Mandiri, BRI, BNI, BSI, CIMB Niaga, Permata) or e-wallet (GoPay, OVO, DANA, LinkAja, ShopeePay):

![QRIS Donation Barcode - ALSYUNDAWY](https://github.com/user-attachments/assets/a0126f28-6dde-43da-ba14-d7c9a27de0df)

- **Merchant / Account Name**: **ALSYUNDAWY**
- **NMID**: **`ID1020021153676`**
- **Direct Barcode Asset Link**: [`https://github.com/user-attachments/assets/a0126f28-6dde-43da-ba14-d7c9a27de0df`](https://github.com/user-attachments/assets/a0126f28-6dde-43da-ba14-d7c9a27de0df)
- **Direct WhatsApp Confirmation**: [`https://wa.me/6285658515212`](https://wa.me/6285658515212) (`+62 856-5851-5212`)

Your generosity directly supports open-source development, security hardening, and future tooling for the network engineering community.

---

## 📄 License

Visual Subnet Calculator is licensed under the [`MIT License`](https://opensource.org/licenses/MIT).
Feel free to use, modify, and distribute it for personal and enterprise network engineering workflows.
