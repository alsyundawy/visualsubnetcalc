# Documentation Notes

Technical architecture, security specifications, and operational integration notes for Visual Subnet Calculator v1.4.1.

## Architecture Overview

Visual Subnet Calculator is a client-side visual IP subnet design and calculation tool engineered for high performance, zero-runtime latency, and maximum cross-platform compatibility.

### Core Architecture Layers

- Structure (`dist/index.html`): Semantic HTML5 markup structured with Bootstrap 5.3.8 grid layout, responsive table containers, accessible modal dialogs, and ARIA annotations conforming to WCAG 2.2 Level AA. Completely free of inline style attributes (`style="..."`).
- Presentation (`dist/css/main.css`): Modern CSS utilizing custom scoped rules, responsive media queries spanning VGA (640x480) up to 2K (2560x1440), accessible `:focus-visible` focus rings, Safari `-webkit-user-select` prefixing, and zero global selector leakage.
- Logic (`dist/js/main.js`): Pure vanilla JavaScript with jQuery 3.7.1 DOM utilities and Bootstrap 5.3.8 components, implementing bitwise CIDR mathematics, hierarchical subnet tree recursion, LZ-String state serialization, and XSS sanitization.
- Cloud Profiles: Built-in vendor presets adapting usable IP calculations to standard RFC 1918/RFC 4632 rules or cloud-reserved allocations (AWS reserves 5 addresses, Azure reserves 5 addresses, OCI reserves 3 addresses).

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

- Framework & Library Modernization: Upgraded to Bootstrap 5.3.8 and jQuery 3.7.1 with validated SRI hashes and zero external insecure dependencies.
- Accessibility Hardening (WCAG 2.2 AA): Semantic table captions (`.visually-hidden`), keyboard-navigable color palette swatches with `role="button"` and `tabindex="0"`, semantic `<th scope="col">` column headers, and screen reader-friendly modal descriptions.
- Security Hardening: Context-aware HTML escaping (`escapeHtml()`) on dynamic note rendering to mitigate stored and reflected Cross-Site Scripting (XSS) via maliciously crafted shared URLs.
- CSS Scoping Resolution: Elimination of global selector pollution (`#calc .note label, input`) and eradication of all inline `style="..."` attributes in HTML markup.
- Modal Lifecycle Stabilization: Migration from raw `new bootstrap.Modal()` instantiations to `bootstrap.Modal.getOrCreateInstance()` to eradicate backdrop deadlocks and transition race conditions.
- Strict Linter and CI/CD Compliance: End-to-end repository adherence to Trunk, MegaLinter, Prettier, Markdownlint, and automated Playwright browser test coverage across Chromium, Firefox, and WebKit engines.
- Form Field Autofill & Standard Compliance: All form fields (`#network`, `#netsize`, `#importExportArea`, and every dynamic `#note_*` element) possess unique `id` and `name` attributes with explicit label associations, meeting HTML autofill and WCAG accessibility standards.
- Cross-Browser Standards & Compatibility: Removed deprecated `-webkit-overflow-scrolling` properties and non-standard HTML meta tags (`theme-color`), consolidating PWA theme attributes within `site.webmanifest` for flawless rendering across Firefox, Safari, Chrome, Edge, and Opera.
- SEO & Metadata Architecture: Comprehensive search engine optimization incorporating Schema.org `WebApplication` JSON-LD structured data, Open Graph protocol metadata, Twitter summary cards, canonical links, and crawler instructions referencing `https://github.com/alsyundawy/visualsubnetcalc`.

## Technical Context in ALSYUNDAWY Infrastructure Environment

Visual Subnet Calculator serves as the foundational IP planning engine within the ALSYUNDAWY network engineering and security toolkit. While deployed as an independent client-side application, its CIDR calculations directly feed into adjacent diagnostic and management systems:

- Netplan Generator: CIDR subnet blocks and calculated gateway/broadcast addresses generated here feed directly into production YAML configuration profiles for Ubuntu/Debian network interfaces.
- Ping, Traceroute, and MTR: Subnet boundaries, host ranges, and hop expectations calculated in this tool assist network operators in correlating packet loss and routing anomalies across Intranet/Internet transit links.
- DNS Lookup, Checker, and PTR: Subnet range calculations provide the exact boundaries needed to configure forward and reverse (in-addr.arpa) DNS zone records and validation scripts.
- IPERF3 and Network Diagnostic Tools: Throughput benchmarking topology planning relies on the subnet partitioning designed in Visual Subnet Calculator to evaluate bandwidth between isolated VLANs.
- Nmap and Port Scanning: Network discovery audits and security scans utilize the exact CIDR ranges and usable IP matrices generated by this calculator to define targeted scanning scopes.
- TrustPositif Checker and WHOIS: Public IP blocks and ASN allocations are cross-referenced with internal subnetting plans to maintain regulatory compliance and verify edge routing.
- SSL/TLS and System Security: IP access control lists (ACLs) and reverse proxy upstream configurations (Nginx/HAProxy) depend on verified CIDR network boundaries to enforce zero-trust isolation.

## Security Considerations

- Client-Side Isolation: All calculations occur entirely in the browser runtime. No user data, IP schemas, or notes are transmitted to any backend server.
- XSS Prevention: All dynamic text values inserted into the DOM (including note contents loaded from imported configurations or shared URLs) are strictly sanitized using character entity encoding before string interpolation.
- DOM XSS Prevention (CodeQL Alert #5): Boundary correction inputs from the DOM are strictly isolated in a dedicated `show_boundary_warning_modal()` function utilizing safe `.text()` node bindings, preventing DOM values from flowing into `.html()` or `innerHTML` interpretation sinks.
- Content Security Policy (CSP): The application requires no external script origins beyond local distribution assets, allowing strict `script-src 'self'` policy enforcement in production reverse proxies.
