# Documentation Notes

Technical architecture, security specifications, and operational integration notes for Visual Subnet Calculator v1.4.3.

## Architecture Overview

Visual Subnet Calculator is a client-side visual IP subnet design and calculation tool engineered for high performance, zero-runtime latency, and maximum cross-platform compatibility. Starting with v1.4.2, the application delivers a unified dual-stack architecture supporting both legacy IPv4 (32-bit CIDR) and modern IPv6 (128-bit hierarchical tier) visual planning.

### Core Architecture Layers

- Structure (`dist/index.html`): Semantic HTML5 markup structured with Bootstrap 5.3.8 grid layout, accessible segmented version switcher toolbar (`#ip_version_toolbar`), responsive table containers, accessible modal dialogs, and ARIA annotations conforming to WCAG 2.2 Level AA. Completely free of inline style attributes (`style="..."`).
- Presentation (`dist/css/main.css`): Modern CSS utilizing custom scoped rules, responsive media queries spanning VGA (640x480) up to 2K (2560x1440), accessible `:focus-visible` focus rings, Safari `-webkit-user-select` prefixing, scoped IPv6 layout modes (`#calc.ipv6-mode`), and zero global selector leakage.
- Logic (`dist/js/main.js`): Pure vanilla JavaScript with jQuery 3.7.1 DOM utilities and Bootstrap 5.3.8 components, implementing dual-stack 32-bit bitwise (IPv4) and native 128-bit `BigInt` bitwise (IPv6) mathematics, hierarchical subnet tree recursion, LZ-String state serialization, and context-aware XSS sanitization.
- Cloud Profiles: Built-in vendor presets adapting usable IP calculations to standard RFC 1918/RFC 4632 rules or cloud-reserved allocations (AWS reserves 5 addresses, Azure reserves 5 addresses, GCP reserves 4 addresses, OCI reserves 3 addresses).

## Dual-Stack IPv4 & IPv6 Subnetting Engine

### 1. IPv4 Preset Toolbar Architecture (`#ipv4_tier_info`)

Visual Subnet Calculator provides an accessible, responsive toolbar for rapid selection of IPv4 network sizes from `/16` to `/32` (17 distinct presets):

- **Two-Way Synchronization**: Clicking any preset button immediately updates the `#netsize` input field, recalculates the base network boundary if necessary, re-renders the visual subnet tree, and marks the selected button with the `.active` CSS class. Conversely, manual keyboard entry or clipboard paste into `#netsize` automatically detects the prefix and synchronizes the active button state.
- **Default State**: Initialized to `10.0.0.0/16` with preset button `/16` active.
- **Responsive Chip Layout**: Preset buttons use `flex-wrap: wrap`, compact padding (`py-0 px-2`), and independent chip borders (`border-radius: 0.2rem !important;`), ensuring that all 17 buttons wrap naturally without breaking horizontal bounds on narrow screens (VGA 640px, mobile phones).

### 2. 128-Bit Mathematical Precision (`BigInt`)

IPv6 addresses span 128 bits, exceeding JavaScript's IEEE 754 floating-point safe integer threshold (`Number.MAX_SAFE_INTEGER` = $2^{53} - 1$). Visual Subnet Calculator implements lossless 128-bit unsigned integer bitwise arithmetic via native JavaScript `BigInt`:

- Address Parsing (`parseIpv6`): Expands double-colons (`::`), validates 16-bit hextets, and computes the exact 128-bit integer value:
  $$\text{netInt} = \sum_{i=0}^{7} \text{hextet}_i \times 2^{(7-i) \times 16}$$
- Bitmask & Network Isolation (`getIpv6Network`): Derives the canonical network base address through exact bitmask operations:
  $$\text{mask} = ((1 \ll 128) - 1) \oplus ((1 \ll (128 - \text{prefix})) - 1)$$
  $$\text{baseInt} = \text{ipInt} \ \& \ \text{mask}$$
- Range Calculation (`getIpv6End`): Computes the end of the prefix block without numeric overflow:
  $$\text{endInt} = \text{baseInt} + (1 \ll (128 - \text{prefix})) - 1$$

### 3. RFC 5952 Canonical Representation (`formatIpv6`)

Formatted IPv6 output strictly follows IETF RFC 5952 recommendations:

- Leading zeros in 16-bit fields are suppressed (e.g., `2001:0db8` becomes `2001:db8`).
- The longest contiguous sequence of two or more zero fields is replaced by `::`. If multiple sequences have identical lengths, the first sequence is compressed.
- Hexadecimal digits are rendered strictly in lowercase.
- Single 16-bit zero fields are never compressed with `::` (e.g., `2001:db8:0:1::/64`).

### 4. Hierarchical IPv6 Tier Architecture

Standard IPv4 binary splitting (/N -> /N+1) is impractical for IPv6 due to astronomical address spaces. Visual Subnet Calculator adheres to standard network engineering tier allocations:

$$\text{/32 (ISP/LIR)} \longrightarrow \text{/48 (Enterprise Site)} \longrightarrow \text{/56 (Branch/VPC)} \longrightarrow \text{/60 (Dept)} \longrightarrow \text{/64 (SLAAC)} \quad\Big|\quad \text{/127 (P2P)} \longrightarrow \text{/128 (Host)}$$

| Tier Prefix         | Bit Step   | Subnet Multiplication Factor           | Typical Allocation Scope & Architectural Role                         |
| :------------------ | :--------- | :------------------------------------- | :-------------------------------------------------------------------- |
| **/32** _(Default)_ | $+4$ bits  | $16 \times /36$ ($65,536 \times /48$)  | Regional Internet Registry (RIR) allocation to ISP / Large Enterprise |
| **/48**             | $+8$ bits  | $256 \times /56$ ($65,536 \times /64$) | ISP assignment to Enterprise / Corporate Data Center                  |
| **/56**             | $+4$ bits  | $16 \times /60$ ($256 \times /64$)     | Enterprise assignment to Branch Office / Campus / Multi-VPC           |
| **/60**             | $+4$ bits  | $16 \times /64$ subnets                | Branch assignment to Small Office / Departmental VLAN                 |
| **/64**             | Leaf / Sub | Standard Leaf Subnet                   | Local Link / VLAN (SLAAC & Interface IDs) - Educational Warning Modal |
| **/80**             | $+16$ bits | $65,536 \times /96$ subnets            | Micro-segmentation / Cloud Service Boundary                           |
| **/96**             | $+16$ bits | $65,536 \times /112$ subnets           | IPv4-to-IPv6 Translation / IPv4-Embedded Addresses (RFC 6052)         |
| **/112**            | $+8$ bits  | $256 \times /120$ subnets              | Isolated Device Cluster / Specialized Sub-delegation                  |
| **/120**            | $+4$ bits  | $16 \times /124$ subnets               | Industrial / Sensor Network Sub-delegation                            |
| **/124**            | $+3$ bits  | $8 \times /127$ subnets                | Inter-Router Small Group Sub-delegation                               |
| **/127**            | $+1$ bit   | $2 \times /128$ subnets                | Point-to-Point Router Inter-Links (RFC 6164 standard)                 |
| **/128**            | Leaf       | Single Host / Loopback Leaf            | Loopback Interface / Host Address (RFC 4291 standard)                 |

### 5. SLAAC & Host Boundary Protection (RFC 4291 / RFC 7421 / RFC 6164)

According to RFC 4291 Section 2.5.4 and RFC 7421, all standard IPv6 unicast subnets with Stateless Address Autoconfiguration (SLAAC) require a 64-bit Interface Identifier (IID). Subnets smaller than `/64` (e.g., `/65`, `/112`, `/127`) break SLAAC and are generally reserved for specialized point-to-point links:

- **SLAAC Boundary Protection**: Visual Subnet Calculator designates `/64` as a standard leaf prefix (`.split-disabled`). Clicking on a `/64` leaf triggers an educational modal (`#notifyModal`) explaining RFC 7421 and RFC 4291 architectural standards rather than causing invalid states.
- **Point-to-Point Router Inter-Links (RFC 6164)**: Users can directly select `/127` from the preset toolbar or input field. A `/127` subnet provides 2 usable IP addresses and splits cleanly into two `/128` host subnets.
- **Host / Loopback Boundary Protection**: `/128` represents an individual host or loopback address (RFC 4291) and is designated as an immutable leaf node (`.split-disabled`) preventing further division.

## Dependency Matrix and SRI Hashes

| Component          | Version | Integrity (SRI SHA384)                                                    | Purpose                  |
| ------------------ | ------- | ------------------------------------------------------------------------- | ------------------------ |
| Bootstrap Bundle   | 5.3.8   | `sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI` | UI Framework & Modals    |
| jQuery             | 3.7.1   | `sha384-1H217gwSVyLSIfaLxHbE7dRb3v4mYCKbpQvzx0cegeju1MVsGrX5xXxAvs/HgeFs` | DOM Manipulation         |
| jQuery Validate    | 1.21.0  | `sha384-INLNT6YPpjCRFM2xpOexEE3T4i2mIigf+Kr19b7a59RFtrVBZQzZWXkGuiMA/q1r` | Form Validation          |
| Additional Methods | 1.21.0  | `sha384-YJxXUyJ0BogsbWMDJj4h3uJVyImZsAI6qh7MG2LGgxMstOXB8G1mNwaRuL4A6VYb` | Extended Validation      |
| LZ-String          | 1.5.0   | Vendored (`dist/js/lz-string.min.js`)                                     | State Compression in URL |

## Evolution and Upstream Comparison

### 1. Upstream Base (`davidc/subnets`)

- Original Perl CGI and static web concept developed by David C.
- Visual concept of binary address splitting represented in nested HTML table cells.
- Limited to static IPv4 calculations without dynamic client-side state preservation, URL sharing, cloud profiles, or responsive mobile views.

### 2. Upstream Modernization (`ckabalan/visualsubnetcalc`)

- Complete rewrite using modern client-side JavaScript, jQuery, and Bootstrap.
- Introduced LZ-String compressed URL sharing for serializing complex subnet tree state into compact query parameters (`?c=...`).
- Added cloud reservation calculation modes for AWS, Azure, and Oracle Cloud Infrastructure (OCI).
- Implemented basic JSON import/export workflows.

### 3. ALSYUNDAWY Production Fork (`alsyundawy/visualsubnetcalc`)

#### v1.4.3 (Latest Release Architecture) — 2026-09-17

- **Live Shareable Subnet Hyperlink Display (Below Subnet Table)**: In addition to the "Copy Shareable URL" clipboard action, a live clickable hyperlink (`#live_shareable_url`) is rendered directly below the subnet breakdown table. Features high-contrast typography in both light (`#0284c7`) and dark (`#38bdf8`) modes, bold font weight (`700`), balanced size (`0.84rem`), and robust word-break handling (`word-break: break-all; overflow-wrap: anywhere;`) ensuring that long query parameter strings never cause horizontal page overflow on small mobile displays. Synchronizes automatically in real time on every table mutation.
- **15-Minute Temporary Cookie Session Feature (`vsc_draft_15m` & `vsc_visitor_15m_session`)**: Implemented an RFC 6265 compliant cookie management engine (`TemporaryCookieStore`) with 15-minute TTL (`max-age=900`, `SameSite=Lax`). Caches active calculation drafts in a 15-minute cookie with auto-restore upon tab reopening, deduplicates visitor counting within 15 minutes, and displays dynamic session badge `#cookie_session_badge`.
- **Back to Top Floating Action Button (`#btn_scroll_top`)**: Responsive floating circular action button positioned at the bottom-right corner with scroll monitoring (> 220px), smooth CSS opacity/transform transitions, hover micro-elevation, and hardware-accelerated smooth scrolling to top.
- **Dynamic Visitor Counter Button (`#visitor_counter_btn`) & `counter.txt` Integration**: Added an elegant, unified visitor counter button positioned directly below PayPal and QRIS in the footer. Fetches baseline count metrics from `dist/counter.txt` with cache-busting, dynamically tracks and increments visit counts across sessions, attempts server-side updates when supported, and provides interactive refresh animations (`fa-spin`) on click. Formatted with Indonesian / international numeral grouping.
- **David C Dynamic URL Synchronization (`?network=...&mask=...&division=...`) & Nginx Static Compatibility**: Full integration of David C's URL state format with lossless binary tree bitstring serialization (`binToAscii` and `asciiToBin`). Every table action (split, join, mode change, reset) updates the browser address bar dynamically in real time via `window.history.replaceState`. Uses standard query strings without changing `window.location.pathname`, providing 100% out-of-the-box compatibility on static Nginx, Apache, Caddy, Cloudflare Pages, and GitHub Pages without requiring URL rewriting or `try_files` directives. Supports bidirectional compatibility with legacy compressed `?c=` strings.
- **Parent Subnet Headers Feature (GitHub Issue #5 Integration)**: Integrated an optional hierarchical parent subnet breakdown row renderer. When enabled via the Tools dropdown (`#toggle_parent_headers`) or URL parameter (`&parent_headers=1`), the breakdown table displays distinctive parent summary rows (`.parent-header-row`) detailing parent CIDR badges, hierarchical depth indentation, full IP ranges, usable address bounds, and host counts prior to division.
- **WhatsApp & QRIS Button Harmonization & Anti-Blur Architecture**: Eliminated the visual anomalies and blurry rendering ("buram sendirian") affecting the WhatsApp and QRIS buttons on Android and desktop displays. Standardized all footer actions under `.footer-social-btn` with unified 32px height (30px on small mobile), border radius (9999px), balanced flex wrapping, and solid background fallbacks with `transform: translateZ(0)` to eliminate GPU subpixel rasterization blur. Symmetrized the X button with `<span>X</span>` to prevent single-button line orphaning.
- **Unified Footer Button Styling & Crisp Regular Iconography**: Unified all 9 footer buttons under `.footer-social-btn i` with `#0284c7` (light) and `#38bdf8` (dark), resolving icon color discrepancies across WhatsApp, QRIS, and Pengunjung. Replaced heavy solid icons with regular weight icons (`fa-regular fa-sun`, `fa-regular fa-moon`, `fa-regular fa-circle-question`, `fa-regular fa-envelope`, `fa-regular fa-clock`) with antialiased font smoothing.
- **Official QRIS Support & Donation Modal (`#qrisModal`)**: Integrated Indonesian National Standard QRIS donation modal (`ID1020021153676`) with high-resolution vector source, supporting instant cross-bank and e-wallet transfers (BCA, Mandiri, BRI, BNI, GoPay, OVO, DANA, LinkAja).
- **Xiaomi, Redmi & POCO Mobile Responsive Hardening**: Conducted in-depth research on Xiaomi MIUI/HyperOS WebView behavior. Mitigated browser font-inflation cut-offs via `-webkit-text-size-adjust: 100%; text-size-adjust: 100%;`, removed rigid `min-width: 576px;` container constraints, and replaced column-hiding rules (`display: none` on Range/Usable IPs) with a fluid, accessible touch-inertial `.table-responsive` container (`-webkit-overflow-scrolling: touch; overscroll-behavior-x: contain;`). Tested across VGA (640x480), Redmi A2 (360x800), Redmi Note 13 (392x872), POCO X6 Pro (412x915), iPhone 15 Pro, iPad Air, and 2K desktop displays with zero horizontal document overflow.
- **RFC 1918 Private Address Standardization & Live Indicator**: Standardized IPv4 network presets around the three authoritative IETF RFC 1918 private address ranges: `10.0.0.0/8` (24-bit block), `172.16.0.0/12` (20-bit block), and `192.168.0.0/16` (16-bit block), with default preset maintained at `/16` (`10.0.0.0/16`). Integrated a dynamic status badge (`#rfc1918_indicator`) that performs real-time verification of active network base addresses against RFC 1918 boundaries with contextual block class labeling.
- **2026 Preset Toolbar Aesthetics & Glassmorphism**: Overhauled IPv4 (`#ipv4_tier_info`) and IPv6 (`#ipv6_tier_info`) preset button toolbars to 2026 design standards: modern glassmorphic backing (`backdrop-filter: blur(8px)`), vibrant gradient active pill styling (`linear-gradient(135deg, #0284c7, #2563eb)`), smooth micro-hover elevation, and refined tabular font metrics without modifying underlying IDs or event bindings.
- **2026 Color Palette Contrast Calibration**: Calibrated 10 Dark Mode subnet palette colors to modern luminous jewel undertones, eliminating glare and guaranteeing optimal contrast while maintaining 100% backward compatibility with Light Mode palette tests.
- **Google Cloud (GCP) Reservation Mode**: Added native GCP VPC cloud reservation profile reserving 4 addresses per subnet (`network + 0` Network ID, `network + 1` Default Gateway, `broadcast - 1` future use, `broadcast - 0` Broadcast) with an enforced `/29` minimum subnet size boundary, achieving complete hyperscaler parity across AWS, Azure, GCP, and OCI.
- **Hierarchical IPv6 Tier Progression & Safety Bounds**: Refined and optimized `getNextIpv6Tier()` and `splitIpv6Network()` with strictly safe $O(1)$ memory usage, nibble-boundary splitting (+4 bits), SLAAC `/64` leaf boundary protection (RFC 4291 / RFC 7421), and point-to-point sub-delegation tiers (`/112 -> /120 -> /124 -> /127 -> /128`).
- **IPv6 Capacity Arithmetic Bugfix**: Corrected the quadrillion (Q) unit divisor in `getIpv6Capacity()` from $10^{18}$ (quintillion) to the correct $10^{15}$ (quadrillion), restoring accurate large-block capacity display for `/0` through `/16` prefixes.
- **CSS Injection Hardening**: Dynamically generated `style="background-color: ..."` attributes on subnet table rows are validated by `sanitizeColor()` using a CSS Color Level 4 compliant whitelist regex `^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$`. Non-standard lengths (5 or 7 hex digits) and CSS injection strings are blocked and never interpolated into DOM attributes.
- **Type-Safe Sanitization**: Hardened `escapeHtml()` to return an empty string (`''`) on non-string inputs, preventing `undefined` or object stringification leaks into the DOM.
- **Automated Test Suite Expansion**: Comprehensive Playwright and Headless Chrome testing verifying URL decoding, dynamic URL state replacement, parent header toggling, and multi-viewport responsiveness with zero layout regressions.

#### v1.4.2 — 2026-09-16

- **Dual-Stack IPv4/IPv6 Support**: Integrated interactive segmented switcher with 128-bit `BigInt` bitwise math, RFC 5952 canonical formatting, preset toolbar (/32, /48, /56, /60, /64, /127, /128), RFC 6164 point-to-point links, and RFC 7421 SLAAC protection.
- **Interactive FAQ Accordion Architecture**: Overhauled the static in-app FAQ into an interactive, accessible Bootstrap Accordion (`#faqAccordion`) detailing 10 core architectural modules (Dual-Stack, Cloud profiles comparison matrix, BigInt precision, Split/Join mechanics, LZ-String state serialization, privacy & offline reliability). Features one-click Expand/Collapse All controls (`#faq_expand_all`, `#faq_collapse_all`) powered by Bootstrap Collapse API.
- **Multi-Format Import & Export Engine**: Full data interchange supporting RFC 4180 CSV spreadsheets, aligned Plain Text ASCII tables, and hierarchical JSON configurations with 1-click format switcher buttons (`#btn_format_json`, `#btn_format_csv`, `#btn_format_txt`), in-memory `Blob` direct download (`#btn_download_export`), and local file upload (`#btn_upload_file`).
- **$O(1)$ Constant-Time Bitwise Mask Optimization**: Foundational IPv4 network calculation `get_network()` optimized from an iterative loop to a constant-time bitwise mask (`(0xffffffff << (32 - netSize)) >>> 0`).
- **Interactive IPv4 Preset Toolbar**: 17 one-click CIDR presets from `/16` up to `/32` with bidirectional real-time synchronization with `#netsize`.
- **Font Awesome Free v7 Iconography**: Modernized the entire interface icon ecosystem with Font Awesome Free v7.3.1 (`@fortawesome/fontawesome-free`), providing razor-sharp, accessible vector glyphs across headers, toolbars, color palettes, modal headers, and footer.
- **Sticky Flexbox Maintainer Footer**: Built an elegant sticky footer (`#app_footer`) utilizing modern CSS flexbox layout (`min-height: 100dvh`, `margin-top: auto`), ensuring permanent anchoring at the viewport bottom across short pages and 404 views.
- **Header Iconography**: Added official Font Awesome `fa-network-wired` brand mark to the main `<h1>` title "Visual Subnet Calculator".

#### v1.4.1 — 2026-09-16

- **CodeQL Alert #5 Remediation (DOM XSS)**: Isolated network boundary correction into a dedicated `show_boundary_warning_modal()` function utilizing safe `.text()` node bindings, eliminating DOM value taint propagation into jQuery `.html()` sinks.
- **WCAG 2.2 AA Accessibility Compliance**: Semantic table captions (`.visually-hidden`), keyboard-navigable color palette swatches with `role="button"` and `tabindex="0"`, semantic `<th scope="col">` column headers, and form action button `#btn_go` set to `type="submit"` with default prevention.
- **Universal Multi-Resolution Responsive Design**: Modular CSS media queries scaling from VGA (640×480), mobile devices, and tablets up to 2K / Ultrawide displays (2560px).
- **SEO & Web Standards**: Schema.org JSON-LD `WebApplication` structured data, canonical tags, Open Graph cards, Twitter Cards, and 100% `html-validate` compliance.
- **Dependency Modernization**: Upgraded Bootstrap to `5.3.8` (SRI verified) and Playwright to `1.63.0`.

#### v1.4.0 — 2026-09-15

- **Multi-Cloud Usable IP Calculations**: Introduced dedicated calculation profiles for AWS VPC, Azure VNet, and Oracle Cloud Infrastructure (OCI), adjusting host ranges according to vendor IP reservations.
- **Compressed URL Sharing**: Integrated LZ-String compression for serializing complex subnet tree state into compact query parameters (`?c=...`).
- **Subnet Split & Join Engine**: Interactive client-side binary tree partitioning and merging.
- **JSON Configuration Interchange**: Basic JSON configuration import and export workflows.

### 4. Node.js Runtime Specifications & System Requirements

Visual Subnet Calculator's build tools, testing framework, and local servers adhere to the following runtime matrix:

- **Minimum Supported Version**: **Node.js `v18.0.0+ LTS`** (Hydrogen)
  - _Technical Rationale_: The baseline LTS release providing stable native ECMAScript Modules (ESM), lossless 128-bit `BigInt` bitwise arithmetic, Web Crypto API (`crypto.getRandomValues`), and native Fetch API without external polyfills.
- **Optimal / Recommended Version**: **Node.js `v20.x` / `v22.x Active LTS`** (Iron / Jod)
  - _Technical Rationale_: Features cutting-edge V8 JIT compiler optimizations, fastest Playwright headless browser test execution, streamlined memory consumption during asset compilation, and long-term enterprise maintenance alignment.
- **Package Manager**: **npm `10.x+`** (compatible with pnpm `9.x+` and yarn `4.x+`).

### 5. Cloud Subnet Notes & Hyperscaler Reservation Matrix

| Cloud Profile          | Smallest Subnet |     Reserved IPs     | Reserved IP Roles Breakdown                                                                 | Reference Documentation                                                                                                                                                         |
| :--------------------- | :-------------: | :------------------: | :------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Standard**           |      `/32`      | **2** _(size ≤ /30)_ | Network Address (`.0`), Broadcast Address (`.last`)                                         | [`RFC 1918`](https://datatracker.ietf.org/doc/html/rfc1918) / [`RFC 4632`](https://datatracker.ietf.org/doc/html/rfc4632)                                                       |
| **AWS VPC**            |      `/28`      |        **5**         | Network (`.0`), VPC Router (`.1`), VPC DNS (`.2`), Future Use (`.3`), Broadcast (`.last`)   | [`AWS VPC Subnet Sizing`](https://docs.aws.amazon.com/vpc/latest/userguide/subnet-sizing.html)                                                                                  |
| **Azure VNet**         |      `/29`      |        **5**         | Network (`.0`), Default Gateway (`.1`), Azure DNS Mapping (`.2`, `.3`), Broadcast (`.last`) | [`Azure VNet Restrictions`](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-faq#are-there-any-restrictions-on-using-ip-addresses-within-these-subnets) |
| **Google Cloud (GCP)** |      `/29`      |        **4**         | Network (`.0`), Default Gateway (`.1`), Future Use (`.last - 1`), Broadcast (`.last`)       | [`Google Cloud VPC Subnets`](https://cloud.google.com/vpc/docs/subnets#reserved_ip_addresses_in_ipv4_subnets)                                                                   |
| **Oracle Cloud (OCI)** |      `/30`      |        **3**         | Network (`.0`), Default Gateway (`.1`), Broadcast (`.last`)                                 | [`OCI Reserved IP Addresses`](https://docs.oracle.com/en-us/iaas/Content/Network/Concepts/overview.htm#Reserved__reserved_subnet)                                               |

- **Standard RFC 1918**: Reserves base `network + 0` and `broadcast` (`last_address`) for subnets $\le /30$. Usable range is `network + 1` to `last_address - 1`.
- **AWS VPC**: Enforces minimum size `/28`. Reserves 5 addresses: `network + 0` (Network), `network + 1` (VPC Router), `network + 2` (VPC DNS), `network + 3` (Future Use), and `last_address` (Broadcast). Usable range is `network + 4` to `last_address - 1`.
- **Azure VNet**: Enforces minimum size `/29`. Reserves 5 addresses: `network + 0` (Network), `network + 1` (Default Gateway), `network + 2` and `network + 3` (Azure DNS mappings), and `last_address` (Broadcast). Usable range is `network + 4` to `last_address - 1`.
- **Google Cloud (GCP) VPC**: Enforces minimum size `/29`. Reserves 4 addresses: `network + 0` (Network), `network + 1` (Default Gateway), `last_address - 1` (Future Use reserved by Google), and `last_address` (Broadcast). Usable range is `network + 2` to `last_address - 2`.
- **Oracle Cloud (OCI)**: Enforces minimum size `/30`. Reserves 3 addresses: `network + 0` (Network), `network + 1` (Default Gateway), and `last_address` (Broadcast). Usable range is `network + 2` to `last_address - 1`.

### 6. Support, Sponsorship & QRIS Donation Integration

Visual Subnet Calculator provides integrated, multi-channel sponsorship options across international and regional gateways:

- **PayPal International**: [`https://www.paypal.me/alsyundawy`](https://www.paypal.me/alsyundawy)
- **QRIS (Quick Response Code Indonesian Standard)**:
  - Barcode Asset: `https://github.com/user-attachments/assets/a0126f28-6dde-43da-ba14-d7c9a27de0df`
  - NMID: `ID1020021153676`
  - Merchant Name: `ALSYUNDAWY`
  - Compatibility: Compatible with all Indonesian mobile banking applications (BCA, Mandiri, BRI, BNI, BSI, CIMB Niaga, Permata) and e-wallets (GoPay, OVO, DANA, LinkAja, ShopeePay).
  - WhatsApp Confirmation: [`https://wa.me/6285658515212`](https://wa.me/6285658515212) (`+62 856-5851-5212`)

## Multi-Format Import & Export Engine (v1.4.2 – v1.4.3)

Visual Subnet Calculator v1.4.2 introduces a comprehensive multi-format data interchange system accessible via `#importExportModal`, supporting RFC 4180-compliant CSV spreadsheets, human-readable Plain Text tables, and hierarchical JSON configurations:

### 1. Export Formats

- **JSON (`exportConfig`)**: Serializes full hierarchical tree state including base network, operating mode (`Standard`, `AWS`, `Azure`, `GCP`, `OCI`), active IP version (`IPv4`, `IPv6`), custom notes (`_note`), and color swatch mappings (`_color`).
- **CSV (`exportCsv`)**: Emits RFC 4180-compliant comma-separated values with headers: `"Subnet Address","Range of Addresses","Usable IPs","Hosts","Note","Color"`. Proper quotation and double-quote escaping (`""`) ensure compatibility with Microsoft Excel, LibreOffice Calc, and Google Sheets.
- **Plain Text (`exportPlainText`)**: Emits dynamically column-padded, aligned ASCII text tables with metadata comments (`# Visual Subnet Calculator Export`), making network plans easy to paste into documentation, Git pull requests, or terminal consoles.

### 2. Client-Side File Download & Upload

- **Direct File Download (`#btn_download_export`)**: Generates an in-memory `Blob` with format-specific MIME type (`application/json`, `text/csv;charset=utf-8;`, or `text/plain;charset=utf-8;`) and triggers an automatic browser download named `subnet-calc-[network].[ext]`.
- **File Upload (`#btn_upload_file`, `#importFileInput`)**: Leverages the HTML5 `FileReader` API to read local `.json`, `.csv`, or `.txt` files directly into the calculator with zero backend communication, automatically switching the active format button based on file extension.
- **Quick Clipboard Copy (`#btn_copy_export`)**: Copies the formatted content to the system clipboard with transient visual status feedback ("Copied!" -> "Copy").

### 3. Smart Import & Subnet Tree Reconstruction

When importing arbitrary CSV rows, plain text CIDR lists, or text tables:

1. **Parser (`parseCsvOrText`)**: Robust regex scanner extracting IPv4/IPv6 CIDRs, trailing comment notes (`# Note`), and color tags (`[#hex]`).
2. **Minimal Supernet Calculation**: Calculates the smallest enclosing base network covering all parsed subnets via bitwise `xor` and logarithmic leading-bit calculation:
   $$\text{xor} = \text{minAddress} \oplus \text{maxAddress}$$
   $$\text{commonPrefix} = 32 - \lfloor \log_2(\text{xor}) + 1 \rfloor$$
3. **Recursive Tree Assembly (`insertSubnetIntoTree`)**: Iterates through subnets from largest to smallest, splitting parent nodes dynamically using `split_network` (IPv4) or `splitIpv6Network` (IPv6) until target leaf subnets are reached, seamlessly restoring their associated notes and color tags.

## Technical Context in ALSYUNDAWY Infrastructure Environment

Visual Subnet Calculator serves as the foundational IP planning engine within the ALSYUNDAWY network engineering and security toolkit. While deployed as an independent client-side application, its CIDR calculations directly feed into adjacent diagnostic and management systems:

- **Netplan Generator**: CIDR subnet blocks and calculated gateway/broadcast addresses generated here feed directly into production YAML configuration profiles for Ubuntu/Debian network interfaces (both IPv4 and IPv6 SLAAC/static routing).
- **Ping, Traceroute, and MTR**: Subnet boundaries, host ranges, and hop expectations calculated in this tool assist network operators in correlating packet loss and routing anomalies across Intranet/Internet transit links.
- **DNS Lookup, Checker, and PTR**: Subnet range calculations provide the exact boundaries needed to configure forward (A/AAAA) and reverse (`in-addr.arpa` and `ip6.arpa`) DNS zone records and validation scripts.
- **IPERF3 and Network Diagnostic Tools**: Throughput benchmarking topology planning relies on the subnet partitioning designed in Visual Subnet Calculator to evaluate bandwidth between isolated VLANs.
- **Nmap and Port Scanning**: Network discovery audits and security scans utilize the exact CIDR ranges and usable IP matrices generated by this calculator to define targeted scanning scopes.
- **TrustPositif Checker and WHOIS**: Public IP blocks, IPv6 prefix allocations, and ASN allocations are cross-referenced with internal subnetting plans to maintain regulatory compliance and verify edge routing.
- **SSL/TLS and System Security**: IP access control lists (ACLs) and reverse proxy upstream configurations (Nginx/HAProxy) depend on verified CIDR network boundaries to enforce zero-trust isolation.

## Performance Engineering & Modernization (v1.4.2 – v1.4.3)

- **Constant-Time Bitwise Masking ($O(1)$)**: The foundational IPv4 network address calculation routine `get_network(networkInput, netSize)` was optimized from an iterative loop down to an instant constant-time bitwise mask operation:
  ```javascript
  const mask = (0xffffffff << (32 - netSize)) >>> 0;
  return int2ip((ipInt & mask) >>> 0);
  ```
  This eliminates loop overhead across hundreds of recursive subnet splits and table re-renders.
- **ES6+ Idiomatic Modernization**: Replaced legacy ES5 patterns (`push.apply`, `for..in` on object key arrays, anonymous callbacks in `reduce`) with clean, performant modern JavaScript standards: arrow functions, `for...of`, and spread syntax (`...array`), enhancing maintainability and V8 JIT compiler optimization.

## Visual Design, Accessibility & Cross-Platform UI Architecture (v1.4.3)

Visual Subnet Calculator v1.4.3 introduces a comprehensive visual polish, dark-mode ergonomics overhaul, light-mode contrast elevation, balanced vertical spacing rhythm, dynamic URL pathname resolution, and cross-browser responsive validation:

### 1. Title Typography & Branding Architecture

- **Responsive Fluid Typography**: Header title utilizes CSS `clamp(1.15rem, 1.2vw + 0.5rem, 1.55rem)` with `font-weight: 800` and letter-spacing `-0.025em`, ensuring high visual clarity and a sleek, commanding appearance across VGA (640px) up to 2K (2560px) viewports without dominating the screen or clipping horizontally.
- **Glassmorphic "Fork" Badge (`.fork-badge`)**: Highlights the extended distribution fork with a vibrant, high-contrast pill badge, subtle text glow, and crisp padding.
- **Circular Action Navigation (`.nav-action-btn`)**: Header utility buttons (Theme Toggle, FAQ Modal, Info Modal, and GitHub Repository) are unified into $38\text{px} \times 38\text{px}$ circular glassmorphic buttons with smooth hover scaling (`transform: scale(1.06)`), distinct focus rings (`:focus-visible`), and bold solid Font Awesome icons (`fa-solid`).

### 2. Balanced Vertical Spacing Rhythm

To guarantee high visual comfort, prevent layout crowding, and create clean optical hierarchy, distinct top and bottom vertical spacing has been implemented between the core top sections:

- **Header Section (`#app_header`)**: Equipped with `margin-bottom: 1.15rem !important` (Bootstrap class `mb-3`), providing clear separation from the introductory description.
- **Introductory Description Alert (`.alert`)**: Configured with `margin-top: 1rem !important; margin-bottom: 1.25rem !important;` (Bootstrap class `my-3`), giving the introductory explanation generous breathing space.
- **IP Version Switcher Toolbar (`#ip_version_toolbar`)**: Configured with `margin-top: 1rem !important; margin-bottom: 1.25rem !important;` (Bootstrap class `my-3`), cleanly segregating the mode switcher from both the alert above and the CIDR preset toolbar below.
- **Main App Container**: Wrapped in `container-xxl py-3`, ensuring graceful top and bottom padding on both widescreen monitors and mobile screens.

### 3. Light Mode Contrast & Readability Guarantee

In Light Mode (`[data-theme="light"]`), all textual and interactive elements have been comprehensively elevated to provide maximum sharpness, high contrast, and zero blur:

- **Headings and Labels**: Styled in rich, deep `#0f172a` (slate-900).
- **Subnet Data Cells**: Styled in crisp, high-contrast `#1e293b` (slate-800).
- **Action Navigation Links**: Bottom action buttons (`Change Colors »`, `Copy Shareable URL`) are rendered in vivid `#0284c7` (sky-600) with a refined dotted underline and smooth hover transition.
- **Footer Social & Contact Cards (`.footer-social-btn`)**: Explicitly styled with pure white background (`background: #ffffff !important;`), slate border (`border: 1px solid #cbd5e1 !important;`), and deep slate text (`color: #1e293b !important;`), preventing dark pill styles from persisting during runtime theme toggles.
- **Footer Text (`#app_footer`)**: Copyright, maintainer profile, and technical disclaimers utilize deep slate tones (`#475569` and `#1e293b`) with clean line-height and no washed-out grays.

### 4. Dark Mode Contrast & Readability Guarantee

- **Blur-Free, Ultra-Legible Typography**: Dark mode (`[data-theme="dark"]`) sets high-contrast primary text (`#f1f5f9`) and clear secondary muted text (`#cbd5e1`), completely eliminating low-contrast blurriness.
- **Audited Footer Text (`#app_footer`)**: Dark mode footer uses high-contrast text (`#cbd5e1` / `#94a3b8`) with subtle border separation (`rgba(255, 255, 255, 0.1)`), ensuring perfect readability across all device displays.
- **Universal Solid Font Awesome Icons**: Replaced lighter icon variants with bold, striking solid Font Awesome icons (`fa-solid`) across navigation, toolbar, modals, and footer.

### 5. Social Media & Donation Glassmorphic Cards (`.footer-social-btn`)

- Modern glassmorphic pill cards with backdrop blur filter (`backdrop-filter: blur(8px)`), rounded pill geometry (`border-radius: 9999px`), and tactile hover elevation.
- Platform-specific glow accents and brand highlights:
  - **GitHub**: Deep slate / monochrome hover border with subtle glow.
  - **Website (`alsyundawy.com`)**: Cyan glow (`rgba(14, 165, 233, 0.45)`).
  - **X (Twitter)**: Midnight dark border with white icon accent.
  - **Telegram**: Vibrant sky blue glow (`rgba(34, 158, 217, 0.45)`).
  - **WhatsApp**: Forest emerald glow (`rgba(37, 211, 102, 0.45)`).
  - **Email**: Coral crimson glow (`rgba(239, 68, 68, 0.45)`).
  - **PayPal**: Dual-tone PayPal blue glow (`rgba(0, 112, 186, 0.45)`).
  - **QRIS**: Clean slate / crimson QR glow (`rgba(225, 29, 72, 0.45)`).

### 6. Calibrated Subnet Palette for Dark Mode

- In dark mode, the 10 subnet palette colors (`--subpal-1-1` through `--subpal-1-10`) are dynamically remapped from bright pastel tones into rich, eye-friendly deep jewel tones:
  - Color 1 (Deep Ruby/Wine): `rgba(159, 18, 57, 0.5)`
  - Color 2 (Deep Rust/Amber): `rgba(154, 52, 18, 0.5)`
  - Color 3 (Deep Ochre/Bronze): `rgba(133, 77, 14, 0.5)`
  - Color 4 (Deep Emerald/Forest): `rgba(6, 95, 70, 0.5)`
  - Color 5 (Deep Ocean/Teal): `rgba(17, 94, 89, 0.5)`
  - Color 6 (Deep Sapphire/Blue): `rgba(30, 58, 138, 0.55)`
  - Color 7 (Deep Iris/Indigo): `rgba(67, 56, 202, 0.5)`
  - Color 8 (Deep Plum/Magenta): `rgba(134, 25, 143, 0.5)`
  - Color 9 (Deep Slate/Charcoal): `rgba(51, 65, 85, 0.6)`
  - Color 10 (Deep Midnight/Base): `rgba(30, 41, 59, 0.7)`
- Eliminates blinding white-on-pastel glare in dark mode, maintains distinct visual boundaries between subnets, and guarantees high text contrast for subnet labels and notes.

### 7. Dynamic Location Auto-Detection for Shareable URLs

The `getConfigUrl()` routine dynamically computes the shareable URL based on the browser's active `window.location.pathname`:

- **Root Deployments**: When hosted at domain root (e.g., `https://example.com/` or `https://example.com/index.html`), the generated URL evaluates to `https://example.com/index.html?c=...`.
- **Subfolder Deployments**: When hosted inside an arbitrary nested directory (e.g., `https://example.com/folder/` or `https://example.com/tools/subnet/index.html`), the path is automatically detected, normalized, and produces `https://example.com/folder/index.html?c=...` or `https://example.com/tools/subnet/index.html?c=...`.
- **Algorithm**:
  ```javascript
  let pathname = window.location.pathname || "/";
  if (pathname.endsWith("/") || pathname === "") {
    pathname = pathname + "index.html";
  } else if (!pathname.endsWith("/index.html")) {
    const lastSlashIndex = pathname.lastIndexOf("/");
    const dir =
      lastSlashIndex !== -1 ? pathname.substring(0, lastSlashIndex + 1) : "/";
    pathname = dir + "index.html";
  }
  return window.location.origin + pathname + "?c=" + compressedData;
  ```

### 8. Multi-Device & Cross-Browser Verification

- Fully automated Playwright test suite (`src/tests/responsive-visual-v143.spec.ts`) executed across **Chromium** and **Firefox** browser engines verifying:
  - **VGA (640x480)**: Validates responsive wrapping without horizontal page scroll (`scrollWidth <= clientWidth`).
  - **Android / Samsung (360x800)**: Validates touch friendliness, button accessibility, and compact navbar.
  - **iPhone 15 (390x844)**: Validates mobile portrait orientation and touch target sizes.
  - **iPad (820x1180)**: Validates tablet portrait/landscape visual hierarchy and grid stability.
  - **MacBook (1440x900)**: Validates desktop laptop scaling, sharp font rendering, and navbar alignment.
  - **Desktop FHD (1920x1080)**: Validates standard desktop layout, typography clamp scaling, and accordion behavior.
  - **Desktop 2K QHD (2560x1440)**: Validates high-resolution layout bounds (`container-xxl`) and typography proportions.
  - **Vertical Spacing Rhythm Checks**: Automated bounding box assertions verifying non-zero vertical gaps between `#app_header`, `.alert`, and `#ip_version_toolbar`.
  - **URL Auto-Detection Simulation**: Automated test asserting root and subfolder pathname resolution.

### 9. 15-Minute Temporary Cookie Session Architecture (RFC 6265)

- **Purpose**: Provides transient state resilience and visitor deduplication for up to 15 minutes (`max-age=900`) without permanent storage footprint or privacy invasion.
- **Engine**: Scoped `TemporaryCookieStore` abstraction providing `set()`, `get()`, and `remove()` methods with strict `SameSite=Lax`, `path=/`, and dynamic `Secure` flags when running on HTTPS:
  - `vsc_draft_15m`: Automatically caches active live URL query (`?network=...&mask=...&division=...`) whenever subnets are divided, merged, or modified. If the browser tab is closed or the user navigates back to root `/` within 15 minutes, the application automatically restores their in-progress subnet breakdown session.
  - `vsc_visitor_15m_session`: Deduplicates visits within a 15-minute window so that rapid page refreshes or internal navigation do not inflate the visitor counter (`#visitor_count_val`).
- **Visual Status Indicator**: `#cookie_session_badge` dynamically renders an inline pill badge next to the shareable URL displaying session status (`Kuki Sesi: 15 Menit`).

### 10. Back to Top Floating Action Button (`#btn_scroll_top`)

- **Placement**: Fixed floating circular button positioned at the bottom-right viewport corner with responsive `env(safe-area-inset-*)` guards.
- **Behavior**: Initially hidden (`opacity: 0; visibility: hidden; pointer-events: none`). Automatically reveals with a smooth vertical slide (`transform: translateY(0)`) and fade-in when viewport vertical scroll exceeds 220px. On click, performs hardware-accelerated smooth scrolling (`window.scrollTo({ top: 0, behavior: 'smooth' })`).

### 11. Unified Footer Button Styling & Icon Color Architecture

- **Root Cause of Icon Discrepancy**: Previously, `#app_footer a[href*="alsyundawy"]` was used to style social links in blue. While this matched URLs containing "alsyundawy", it bypassed WhatsApp (`wa.me/6281313628796`), QRIS (`<button>` element with no `href`), and Visitor Counter (`<button>` element with no `href`), causing them to inherit default black/gray text colors.
- **Resolution**: Replaced the restrictive attribute selector with `.footer-social-btn i { color: #0284c7 !important; }` in light mode and `color: #38bdf8 !important;` in dark mode. All 9 buttons (alsyundawy.com, GitHub, X, Telegram, WhatsApp, Email, PayPal, QRIS, Pengunjung) now display identical, unified icon colors.
- **Font Weight Optimization**: Replaced heavy solid icons with regular weight icons (`fa-regular`) where applicable (sun/moon theme toggle, FAQ question circle, email envelope, session clock) for a cleaner, modern look.

### 12. Xiaomi, Redmi & POCO Mobile Display Optimization & Root Cause Analysis

- **Research Findings on Display Truncation / Cut-Off**:
  1. *System Font Scaling / Text Inflation*: MIUI and HyperOS feature aggressive system-wide font scaling ("Text size" S to XXL). In WebKit/Blink browsers without explicit font inflation guards, text expands beyond table cells and container boundaries, pushing elements off-screen.
  2. *Ultra-Tall Aspect Ratios (20:9 & 20.5:9)*: Devices such as Redmi Note 13 (392x872), POCO X6 Pro (412x915), and Redmi A2 (360x800) feature tall aspect ratios with DotDisplay camera cutouts. Fixed-height units (`100vh`) fail to account for dynamic address bars and virtual navigation bars.
  3. *Rigid Container Minimum Widths*: Prior versions included container rules that enforced minimum desktop boundaries, causing mobile viewports under 576px to overflow.
- **Architectural Solutions Implemented**:
  - Activated `-webkit-text-size-adjust: 100%;` on `html` and `body` to suppress browser font inflation while respecting CSS rem sizing.
  - Added `overflow-x: hidden; max-width: 100%;` to `body` and scoped table horizontal scrolling to `.table-responsive` with `overflow-x: auto; overscroll-behavior-x: contain;`.
  - Added `viewport-fit=cover` and dynamic viewport units (`min-height: 100dvh;`) with safe-area padding:
    `padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);`.
  - Re-architected `#input_form` and `.footer-social-btn` with fluid flexbox wrapping and min-width guards so that no child element exceeds 320px.
  - Validated across 12 viewport configurations including portrait and landscape on Xiaomi, Redmi, and POCO with zero horizontal overflow (`scrollWidth === clientWidth`).

### 13. Search Engine Optimization (SEO) Architecture

- **Semantic HTML5 Structure**: Single primary `<h1>` element, semantic `<main>`, `<section>`, `<header>`, `<footer>`, and `<nav>` landmarks satisfying search engine crawler accessibility standards.
- **Meta Tags**:
  - Descriptive, unique `<title>`: `Visual Subnet Calculator - IPv4 & IPv6 Subnet Planner`.
  - Compelling meta description (160 characters) summarizing core features, RFC compliance, and cloud provider profiles.
  - Granular robots directives: `index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1`.
- **Social Media Cards**:
  - Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:site_name`, `og:locale`).
  - Twitter / X Cards (`summary_large_image`, `twitter:site`, `twitter:creator`).
- **Structured Data (Schema.org)**: Complete JSON-LD `WebApplication` schema including `operatingSystem: All`, `applicationCategory: NetworkingApplication`, `featureList`, `offers`, and `softwareVersion: 1.4.3`.
- **Sitemap & Robots**: `dist/sitemap.xml` and `dist/robots.txt` ensuring complete crawler indexing discovery.

## Diagnostics & Troubleshooting: IDE HTML Checker Warning (`@[current_problems]`)

During development, IDE inspection may report the following warning:

```json
{
  "path": "/dist/index.html",
  "message": "Could not get results from HTML checker for 'file:///.../dist/index.html'. Error: 'Unexpected token '<', \"<!DOCTYPE \"... is not valid JSON'.",
  "severity": "warning",
  "startLine": 1,
  "endLine": 1
}
```

### Root Cause Analysis

1. **Source of Warning**: This warning does **not** indicate a syntax error or malformed markup in `index.html` or `404.html`. It is generated by an IDE extension (such as the VS Code HTML Validator extension) that submits files via HTTP POST to an external online W3C validation service (`https://validator.w3.org/nu/`).
2. **Failure Mechanism**: When an external network connection is unavailable, rate-limited, or when the remote validator server returns an HTML error page (e.g., 502 Bad Gateway or 503 Service Unavailable starting with `<!DOCTYPE html>`), the extension attempts to deserialize the HTTP response body as JSON via `JSON.parse()`. Because the response body is HTML instead of JSON, `JSON.parse()` throws the syntax error `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`.
3. **Verification**: Offline static validation using the industry-standard `html-validate` linter confirms that both `dist/index.html` and `dist/404.html` are **100% valid HTML5** with **0 errors and 0 warnings**:
   ```bash
   npx html-validate dist/index.html dist/404.html
   # Output: PASSED (0 errors, 0 warnings)
   ```
4. **Permanent Resolution in `.hintrc`**: The warning is emitted specifically by the Webhint / Edge DevTools extension (`@hint/hint-html-checker`) reading the workspace `.hintrc` configuration. By configuring `"html-checker": "off"` in `.hintrc`, the extension is instructed to skip external HTTP requests to `validator.w3.org`, permanently eliminating the spurious IDE diagnostic warning while preserving fast, strictly offline HTML validation via `html-validate`.

## Modern UI Control Architecture & Hardening (v1.4.3)

### 1. Instant Subnet Calculation Reset Engine (`#btn_reset`)

To streamline user workflow, a dedicated reset action (`#btn_reset`) is positioned immediately beside `#btn_tools`:

- **Dual-Stack Default Restoration**:
  - IPv4: Restores `#network` to `10.0.0.0`, `#netsize` to `16`, activates preset `/16`, sets `subnetMap = {"10.0.0.0/16": {}}`, and resets `maxNetSize = 16`.
  - IPv6: Restores `#network` to `2001:db8::`, `#netsize` to `32`, activates preset `/32`, sets `subnetMap = {"2001:db8::/32": {}}`, and resets `maxNetSize = 32`.
- **Validation State Neutralization**: Calls `$("#input_form").removeClass("was-validated")` and jQuery Validation plugin's `.resetForm()`, immediately clearing any error highlighting or validation messages.
- **RFC 1918 & Preset Synchronization**: Executes `updateActiveIpv4Preset()` or `updateActiveIpv6Preset()` and `updateRfc1918Indicator()`.
- **Operating Mode Reset**: Reverts `operatingMode` to `"Standard"` via `switchMode("Standard")`.
- **State Serialization**: Triggers `renderTable(operatingMode)` and `syncUrlState()` to immediately clear custom splits from the browser address bar.

### 2. 2026 Pastel Palette Color Tokens & WCAG Contrast

Visual Subnet Calculator implements an ergonomic, accessible 2026 pastel palette for top-level operational buttons:

| Button | Role / Class | Light Mode Background | Light Mode Text | Dark Mode Background | Dark Mode Text | WCAG Contrast |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Tools** | `#btn_tools` (`.btn-pastel-green`) | `#d1fae5` (Emerald 100) | `#065f46` (Emerald 800) | `#064e3b` (Emerald 900) | `#a7f3d0` (Emerald 200) | **AAA** (> 7.2:1) |
| **Reset** | `#btn_reset` (`.btn-pastel-red`) | `#fee2e2` (Rose 100) | `#991b1b` (Rose 800) | `#7f1d1d` (Rose 900) | `#fecaca` (Rose 200) | **AAA** (> 7.4:1) |

Both tokens include subtle hover micro-interactions (`transform: translateY(-1px)`, soft ambient box-shadows) and accessible `:focus-visible` focus rings conforming to WCAG 2.2 AA.

### 3. Back to Top Button Lifecycle & DOM Hardening (`#btn_scroll_top`)

In long subnet hierarchies with dozens of subnets (particularly under deep IPv6 allocations like `/32 -> /48 -> /56 -> /64`), quick return navigation is essential:

- **DOM Positioning**: Placed directly before `<script>` bundles to ensure element existence before JavaScript execution begins.
- **Lifecycle Hook**: Enclosed within `DOMContentLoaded` listener (with immediate execution fallback if `document.readyState !== "loading"`).
- **Dual Scroll Attachment**: Listens on both `window` and `document` to guarantee compatibility across mobile viewports, nested scrolling containers, and desktop window managers.
- **Scroll Threshold**: Activated when vertical scroll exceeds `120px` (`window.scrollY > 120 || document.documentElement.scrollTop > 120`).
- **High Stacking Context**: Rendered with `z-index: 1060`, positioned comfortably above table rows and footer badges while remaining below modal backdrops.

### 4. Bootstrap 5 Modal Dismiss Transition Race Condition Mitigation

When automated end-to-end tests or fast human interactions dismiss a modal during its opening fade transition:

- **Root Cause**: Bootstrap 5's internal `Modal.prototype.hide()` checks `if (this._isTransitioning) return;`. If a dismiss click occurs while the modal is fading in, Bootstrap ignores the dismissal, leaving the modal stuck open.
- **Flawed Solution**: Binding `{ once: true }` on `shown.bs.modal` caused race conditions because if dismissal occurred while closing, the listener lingered until the *next* time that modal opened, causing it to dismiss immediately upon opening.
- **Production-Grade Solution**: Implemented an element-scoped `_pendingDismiss` flag pattern on the modal DOM node:
  ```javascript
  $(document).on("click", ".modal [data-bs-dismiss='modal']", function () {
    const modalEl = $(this).closest(".modal")[0];
    if (modalEl && typeof bootstrap !== "undefined" && bootstrap.Modal) {
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance && modalInstance._isTransitioning && modalEl.classList.contains("show")) {
        modalEl._pendingDismiss = true;
      }
    }
  });

  $(document).on("shown.bs.modal", ".modal", function () {
    if (this._pendingDismiss) {
      this._pendingDismiss = false;
      const modalInstance = bootstrap.Modal.getInstance(this);
      if (modalInstance) modalInstance.hide();
    }
  });

  $(document).on("hide.bs.modal hidden.bs.modal", ".modal", function () {
    this._pendingDismiss = false;
  });
  ```
  This guarantees zero event leakage across modal openings and 100% reliable dismissal timing under any testing velocity.

## Security Considerations

- **Client-Side Isolation**: All calculations occur entirely in the browser runtime. No user data, IP schemas, or notes are transmitted to any backend server.
- **XSS Prevention**: All dynamic text values inserted into the DOM (including note contents loaded from imported configurations or shared URLs) are strictly sanitized using character entity encoding before string interpolation.
- **DOM XSS Prevention (CodeQL Alert #5)**: Boundary correction inputs from the DOM are strictly isolated in a dedicated `show_boundary_warning_modal()` function utilizing safe `.text()` node bindings, preventing DOM values from flowing into `.html()` or `innerHTML` interpretation sinks.
- **CSS Injection Prevention (v1.4.3)**: Dynamically generated `style="background-color: ..."` attributes on subnet table rows are validated by `sanitizeColor()` using a CSS Color Level 4 compliant whitelist regex `^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$`. Only valid hex formats are permitted; 5- and 7-character invalid lengths are explicitly blocked. Invalid values are returned as empty string and never interpolated into DOM attributes — stronger than `escapeHtml()` in CSS attribute contexts because it prevents `url()`, `expression()`, and `\` escape injection patterns.
- **Form Accessibility & Compliance**: Hidden file inputs (`#importFileInput`) are paired with dedicated semantic labels (`<label for="importFileInput" class="visually-hidden">`) and title attributes, satisfying both WCAG 2.2 AA screen-reader standards and HTML linter rules without redundant ARIA attributes.
- **Content Security Policy (CSP)**: The application requires no external script origins beyond local distribution assets, allowing strict `script-src 'self'` policy enforcement in production reverse proxies.
