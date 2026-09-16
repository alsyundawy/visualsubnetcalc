# Documentation Notes

Technical architecture, security specifications, and operational integration notes for Visual Subnet Calculator v1.4.2.

## Architecture Overview

Visual Subnet Calculator is a client-side visual IP subnet design and calculation tool engineered for high performance, zero-runtime latency, and maximum cross-platform compatibility. Starting with v1.4.2, the application delivers a unified dual-stack architecture supporting both legacy IPv4 (32-bit CIDR) and modern IPv6 (128-bit hierarchical tier) visual planning.

### Core Architecture Layers

- Structure (`dist/index.html`): Semantic HTML5 markup structured with Bootstrap 5.3.8 grid layout, accessible segmented version switcher toolbar (`#ip_version_toolbar`), responsive table containers, accessible modal dialogs, and ARIA annotations conforming to WCAG 2.2 Level AA. Completely free of inline style attributes (`style="..."`).
- Presentation (`dist/css/main.css`): Modern CSS utilizing custom scoped rules, responsive media queries spanning VGA (640x480) up to 2K (2560x1440), accessible `:focus-visible` focus rings, Safari `-webkit-user-select` prefixing, scoped IPv6 layout modes (`#calc.ipv6-mode`), and zero global selector leakage.
- Logic (`dist/js/main.js`): Pure vanilla JavaScript with jQuery 3.7.1 DOM utilities and Bootstrap 5.3.8 components, implementing dual-stack 32-bit bitwise (IPv4) and native 128-bit `BigInt` bitwise (IPv6) mathematics, hierarchical subnet tree recursion, LZ-String state serialization, and context-aware XSS sanitization.
- Cloud Profiles: Built-in vendor presets adapting usable IP calculations to standard RFC 1918/RFC 4632 rules or cloud-reserved allocations (AWS reserves 5 addresses, Azure reserves 5 addresses, OCI reserves 3 addresses).

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

- **Dual-Stack IPv4/IPv6 Support (v1.4.2)**: Integrated interactive segmented switcher with 128-bit `BigInt` bitwise math, RFC 5952 canonical formatting, preset toolbar (/32, /48, /56, /60, /64, /127, /128), RFC 6164 point-to-point links, and RFC 7421 SLAAC protection.
- **Interactive FAQ Accordion Architecture**: Overhauled the static in-app FAQ into an interactive, accessible Bootstrap Accordion (`#faqAccordion`) detailing 10 core architectural modules (Dual-Stack, Cloud profiles comparison matrix, BigInt precision, Split/Join mechanics, LZ-String state serialization, privacy & offline reliability). Features one-click Expand/Collapse All controls (`#faq_expand_all`, `#faq_collapse_all`) powered by Bootstrap Collapse API.
- **Font Awesome Free v7 Iconography**: Modernized the entire interface icon ecosystem with Font Awesome Free v7.3.1 (`@fortawesome/fontawesome-free`), providing razor-sharp, accessible vector glyphs across headers, toolbars, color palettes, modal headers, and footer.
- **Sticky Flexbox Maintainer Footer**: Built an elegant sticky footer (`#app_footer`) utilizing modern CSS flexbox layout (`min-height: 100dvh`, `margin-top: auto`), ensuring permanent anchoring at the viewport bottom across short pages and 404 views. Features official maintainer branding for HARRY DERTIN SUTISNA (`@alsyundawy`) and ALSYUNDAWY IT SOLUTION (`https://alsyundawy.com`), quick contact channels (X and Telegram), and PayPal sponsorship.
- **Header Iconography**: Added official Font Awesome `fa-network-wired` brand mark to the main `<h1>` title "Visual Subnet Calculator".
- **Framework & Library Modernization**: Upgraded to Bootstrap 5.3.8 and jQuery 3.7.1 with validated SRI hashes and zero external insecure dependencies.
- **Accessibility Hardening (WCAG 2.2 AA)**: Semantic table captions (`.visually-hidden`), keyboard-navigable color palette swatches with `role="button"` and `tabindex="0"`, semantic `<th scope="col">` column headers, and screen reader-friendly modal descriptions.
- **Security Hardening**: Context-aware HTML escaping (`escapeHtml()`) on dynamic note rendering to mitigate stored and reflected Cross-Site Scripting (XSS) via maliciously crafted shared URLs.
- **CSS Scoping Resolution**: Elimination of global selector pollution (`#calc .note label, input`) and eradication of all inline `style="..."` attributes in HTML markup.
- **Modal Lifecycle Stabilization**: Migration from raw `new bootstrap.Modal()` instantiations to `bootstrap.Modal.getOrCreateInstance()` to eradicate backdrop deadlocks and transition race conditions.
- **Strict Linter and CI/CD Compliance**: End-to-end repository adherence to Trunk, MegaLinter, Prettier, Markdownlint, and automated Playwright browser test coverage across Chromium and Firefox engines (114 passing automated tests).
- **Form Field Autofill & Standard Compliance**: All form fields (`#network`, `#netsize`, `#importExportArea`, and every dynamic `#note_*` element) possess unique `id` and `name` attributes with explicit label associations, meeting HTML autofill and WCAG accessibility standards.
- **Cross-Browser Standards & Compatibility**: Removed deprecated `-webkit-overflow-scrolling` properties and non-standard HTML meta tags (`theme-color`), consolidating PWA theme attributes within `site.webmanifest` for flawless rendering across Firefox, Safari, Chrome, Edge, and Opera.
- **Multi-Resolution Responsive Scaling**: Comprehensive CSS token system with responsive breakpoints covering mobile portrait/landscape, tablets, MacBooks, desktops, and 2K displays (VGA 640x480 to 2560x1440).

## Multi-Format Import & Export Engine (v1.4.2)

Visual Subnet Calculator v1.4.2 introduces a comprehensive multi-format data interchange system accessible via `#importExportModal`, supporting RFC 4180-compliant CSV spreadsheets, human-readable Plain Text tables, and hierarchical JSON configurations:

### 1. Export Formats

- **JSON (`exportConfig`)**: Serializes full hierarchical tree state including base network, operating mode (`Standard`, `AWS`, `Azure`, `OCI`), active IP version (`IPv4`, `IPv6`), custom notes (`_note`), and color swatch mappings (`_color`).
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

## Performance Engineering & Modernization (v1.4.2)

- **Constant-Time Bitwise Masking ($O(1)$)**: The foundational IPv4 network address calculation routine `get_network(networkInput, netSize)` was optimized from an iterative loop down to an instant constant-time bitwise mask operation:
  ```javascript
  const mask = (0xffffffff << (32 - netSize)) >>> 0;
  return int2ip((ipInt & mask) >>> 0);
  ```
  This eliminates loop overhead across hundreds of recursive subnet splits and table re-renders.
- **ES6+ Idiomatic Modernization**: Replaced legacy ES5 patterns (`push.apply`, `for..in` on object key arrays, anonymous callbacks in `reduce`) with clean, performant modern JavaScript standards: arrow functions, `for...of`, and spread syntax (`...array`), enhancing maintainability and V8 JIT compiler optimization.

## Security Considerations

- **Client-Side Isolation**: All calculations occur entirely in the browser runtime. No user data, IP schemas, or notes are transmitted to any backend server.
- **XSS Prevention**: All dynamic text values inserted into the DOM (including note contents loaded from imported configurations or shared URLs) are strictly sanitized using character entity encoding before string interpolation.
- **DOM XSS Prevention (CodeQL Alert #5)**: Boundary correction inputs from the DOM are strictly isolated in a dedicated `show_boundary_warning_modal()` function utilizing safe `.text()` node bindings, preventing DOM values from flowing into `.html()` or `innerHTML` interpretation sinks.
- **Form Accessibility & Compliance**: Hidden file inputs (`#importFileInput`) are paired with dedicated semantic labels (`<label for="importFileInput" class="visually-hidden">`) and title attributes, satisfying both WCAG 2.2 AA screen-reader standards and HTML linter rules without redundant ARIA attributes.
- **Content Security Policy (CSP)**: The application requires no external script origins beyond local distribution assets, allowing strict `script-src 'self'` policy enforcement in production reverse proxies.
