# Engineering & Architecture Notes — Visual Subnet Calculator

Technical design notes, algorithmic specifications, data structures, and serialization mechanics for Visual Subnet Calculator v1.4.3.

---

## 🧭 Overview & Contents

1. [`Historical State Serialization Explorations`](#1-historical-state-serialization-explorations)
2. [`Production State Serialization: LZ-String & URL Hashes`](#2-production-state-serialization-lz-string--url-hashes)
3. [`Multi-Format Data Interchange Architecture (v1.4.2)`](#3-multi-format-data-interchange-architecture-v142)
4. [`Minimal Supernet Calculation & Tree Reconstruction Algorithm`](#4-minimal-supernet-calculation--tree-reconstruction-algorithm)
5. [`Dual-Stack Mathematical Foundations (IPv4 vs IPv6 BigInt)`](#5-dual-stack-mathematical-foundations-ipv4-vs-ipv6-bigint)
6. [`Constant-Time Bitwise Mask Optimization O(1)`](#6-constant-time-bitwise-mask-optimization-o1)
7. [`DOM Performance, Security Hardening & Accessibility Standards`](#7-dom-performance-security-hardening--accessibility-standards)
8. [`Technical Summary, RFC 2119 Criteria & Engineering Best Practices`](#8-technical-summary-rfc-2119-criteria--engineering-best-practices)
9. [`Maintainer Attribution & Ecosystem Context`](#9-maintainer-attribution--ecosystem-context)

---

## 1. Historical State Serialization Explorations

During the early conceptual design of Visual Subnet Calculator, storing complex binary tree partitions into compact URL strings was explored through several mathematical models:

### 1.1 Offset-Based Binary Storage

The initial proposal tracked the base network address (e.g., `10.0.0.0/8`) and represented all divided subnets as integer offsets from that base address:

- **Base network offset**: Integer range $0$ to $4,294,967,296$ ($2^{32}$).
  - Best case: $0$ (a subnet starting at the identical network address, such as `10.0.0.0/24`).
  - Worst case: $255.255.255.255$ ($2^{32}-1$).
- **Prefix mask**: Range $0$ to $32$ (encoded in 5 bits).
- **Bitwise packing**: Combining both values into a $(32 + 5 = 37)$ bit binary string, padded to 40 bits (5 bytes), and converted to URL-safe Base64.

_Limitation_: While effective for compact subnets clustered near the base address, offsets grow substantially when partitioning large parent blocks (e.g., a `/24` near the upper boundary of a `/8`), negating URL length savings.

### 1.2 Coordinate System (Relative Subnet Indexing)

To eliminate large integer offsets, relative index coordinates within enclosing prefixes were evaluated:

$$\text{Subnet Index} = \frac{\text{Target Subnet Address} - \text{Base Network Address}}{\text{Address Capacity of Target Prefix}}$$

For example, representing `10.166.64.0/20` inside `10.0.0.0/8`:

- Decimal of `10.0.0.0` = $167,772,160$
- Decimal of `10.166.64.0` = $178,667,520$
- Delta: $178,667,520 - 167,772,160 = 10,895,360$
- A `/20` block spans $4,096$ addresses:
  $$\frac{10,895,360}{4,096} = 2660$$
- Result: `10.166.64.0` is the 2,660th `/20` inside `10.0.0.0/8`.

_Proposed compact syntax_: `[Nth Subnet as Integer][Prefix Size as Base32]`. For instance, the 0th `/24` in a `/20` is encoded as `00`, and the 5th `/28` as `54`.

While elegant, storing dynamic metadata (labels, notes, custom pastel colors, cloud profiles, and IPv6 tiers) required a more resilient and extensible data model.

---

## 2. Production State Serialization: LZ-String & URL Hashes

Visual Subnet Calculator replaced custom coordinate packing with high-density, losslessly compressed JSON state using **LZ-String**:

```text
┌──────────────────────────┐       JSON.stringify       ┌─────────────────────────┐
│ Interactive Subnet Tree  │ ─────────────────────────> │   Raw JSON Object       │
│  (Map, Notes, Colors)    │                            │  (Hierarchical Keys)    │
└──────────────────────────┘                            └────────────┬────────────┘
                                                                     │
                                                      LZ-String      │
                                                      compressTo-    │
                                                      EncodedURI-    ▼
                                                      Component ┌─────────────────────────┐
                                                                │  Compressed URL Hash    │
                                                                │  https://.../#?c=Mo...  │
                                                                └─────────────────────────┘
```

### 2.1 State Schema Specifications

The state tree represents partitioned CIDR blocks as nested recursive objects:

```json
{
  "10.0.0.0/16": {
    "10.0.0.0/17": {
      "10.0.0.0/18": {
        "_note": "DMZ Tier",
        "_color": "#cbf078"
      },
      "10.0.64.0/18": {
        "_note": "Web Tier",
        "_color": "#f8f398"
      }
    },
    "10.0.128.0/17": {
      "_note": "Database Tier",
      "_color": "#f1b9a9"
    }
  }
}
```

- Subnets with child objects represent partitioned branches.
- Subnets containing `_note` or `_color` properties represent configured leaf subnets.
- Top-level operational metadata (cloud mode, IPv6 flag) is serialized into the root envelope:
  - `mode`: `"Standard"`, `"AWS"`, `"Azure"`, `"GCP"`, or `"OCI"`
  - `ip_version`: `"IPv4"` or `"IPv6"`

### 2.2 Backward Compatibility & Safe Migration

Visual Subnet Calculator implements an automatic migration pipeline across three state formats:

- **URL v1 / Config v1**: Legacy plain JSON format without explicit mode tags.
- **URL v2 / Config v2**: Compressed LZ-String with cloud mode encapsulation.
- **URL v3 (v1.4.2)**: Dual-stack IPv4/IPv6 support with 128-bit address validation and contextual entity sanitization (`escapeHtml()`) to prevent stored DOM XSS.

---

## 3. Multi-Format Data Interchange Architecture (v1.4.2)

Version 1.4.2 introduces a universal data interchange engine supporting CSV spreadsheets, Plain Text documentation tables, and JSON state configurations:

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

### 3.1 CSV Export & Import (RFC 4180 Standard)

Emits comma-separated values formatted for spreadsheet applications (Microsoft Excel, LibreOffice Calc, Google Sheets):

- **Header Structure**: `"Subnet Address","Range of Addresses","Usable IPs","Hosts","Note","Color"`
- **Quoting & Escaping**: All field values are wrapped in double quotes; embedded quotes are escaped as `""`.
- **Sample Record**:
  ```csv
  "Subnet Address","Range of Addresses","Usable IPs","Hosts","Note","Color"
  "10.0.0.0/18","10.0.0.0 - 10.0.63.255","10.0.0.1 - 10.0.63.254","16382","DMZ Tier","#cbf078"
  ```

### 3.2 Plain Text ASCII Aligned Tables

Produces dynamically aligned monospace ASCII tables with metadata comments:

- **Metadata Header**: Preceded by `#` comments detailing base network, mode, format, and ISO timestamp.
- **Dynamic Column Padding**: Evaluates the maximum character width of each column to ensure clean alignment in terminal consoles and Git pull requests.
- **Sample Output**:
  ```text
  # Visual Subnet Calculator Export
  # Base Network: 10.0.0.0/16 | Mode: Standard | Format: Plain Text
  # Exported on: 2026-09-16T13:27:18.000Z

  Subnet Address   Range of Addresses          Usable IPs                  Hosts   Note       Color
  10.0.0.0/18      10.0.0.0 - 10.0.63.255      10.0.0.1 - 10.0.63.254      16382   DMZ Tier   #cbf078
  ```

### 3.3 Client-Side In-Memory File Transfer

- **Download (`#btn_download_export`)**: Generates an in-memory `Blob` with strict MIME types (`text/csv;charset=utf-8;`, `text/plain;charset=utf-8;`, or `application/json`), dynamically creates an anchor element, and triggers programmatic download without server-side intermediate processing.
- **Upload (`#btn_upload_file`, `#importFileInput`)**: Leverages the HTML5 `FileReader` API to read local files directly into memory, auto-detecting format based on file extension (`.csv`, `.txt`, `.json`).

---

## 4. Minimal Supernet Calculation & Tree Reconstruction Algorithm

When importing arbitrary flat lists of subnets (from CSV, tab-delimited text, or raw CIDR lists), Visual Subnet Calculator automatically calculates the **minimum enclosing supernet** and reconstructs the interactive binary hierarchy.

### 4.1 Mathematical Formulation of Minimal Supernet

Given an imported set of $k$ subnets, each with start integer $S_i$ and end integer $E_i$:

$$\text{Global Min} = \min_{1 \le i \le k} S_i, \quad \text{Global Max} = \max_{1 \le i \le k} E_i$$

The bitwise XOR between the minimum and maximum addresses reveals the most significant divergent bit:

$$\Delta = \text{Global Min} \oplus \text{Global Max}$$

The common prefix length is calculated logarithmically:

$$\text{Prefix Length} = \begin{cases} 32 - \lfloor \log_2(\Delta) + 1 \rfloor, & \Delta > 0 \\ 32, & \Delta = 0 \end{cases}$$

The base network address is then derived using a bitwise mask:

$$\text{Base Address} = \text{Global Min} \ \& \ \left( (0\text{xffffffff} \ll (32 - \text{Prefix Length})) \ggg 0 \right)$$

### 4.2 Recursive Tree Reconstruction (`insertSubnetIntoTree`)

Once the base network is established:

1. Subnets are sorted by prefix length ascending (largest blocks first).
2. For each target subnet, the algorithm traverses down the tree starting at the root.
3. If an intermediate node does not match the target subnet size, it is split into two child nodes using `split_network` (IPv4) or `splitIpv6Network` (IPv6).
4. Traversal selects the child whose range encloses the target address.
5. Upon reaching the exact prefix length, custom notes (`_note`) and color tags (`_color`) are attached.

---

## 5. Dual-Stack Mathematical Foundations (IPv4 vs IPv6 BigInt)

### 5.1 IPv4 32-Bit Arithmetic

IPv4 utilizes standard 32-bit unsigned integers:

- Dotted-decimal to integer:
  $$\text{ipInt} = (O_1 \ll 24) + (O_2 \ll 16) + (O_3 \ll 8) + O_4$$
- Unsigned right-shift (`>>> 0`) forces JavaScript's signed 32-bit bitwise representation into unsigned numbers.

### 5.2 IPv6 128-Bit Lossless Math (`BigInt`)

JavaScript numbers exceed IEEE 754 safe integer limits ($2^{53} - 1$) when representing 128-bit IPv6 addresses. Visual Subnet Calculator leverages native `BigInt`:

- **Integer Conversion (`parseIpv6`)**:
  $$\text{netInt} = \sum_{i=0}^{7} \text{hextet}_i \times 2^{(7-i) \times 16}$$
- **Subnet Mask Derivation**:
  $$\text{mask} = ((1\text{n} \ll 128\text{n}) - 1\text{n}) \oplus ((1\text{n} \ll (128\text{n} - \text{prefix})) - 1\text{n})$$
- **Canonical Address Compression (RFC 5952)**:
  1. Leading zeros within 16-bit hextets are suppressed (`2001:0db8` $\to$ `2001:db8`).
  2. The longest contiguous run of two or more zero hextets is replaced with `::`.
  3. Single zero hextets are never compressed.
  4. Output is rendered strictly in lowercase hexadecimal.

### 5.3 RFC 6164 & RFC 7421 Boundary Standards

- **RFC 6164 (/127 Point-to-Point Links)**: Supported directly for router-to-router inter-links, splitting cleanly into two `/128` host addresses.
- **RFC 7421 & RFC 4291 (/64 SLAAC Boundary)**: Subnets at `/64` are designated as leaf nodes (`.split-disabled`). User clicks trigger an educational modal detailing SLAAC interface identifier constraints.

---

## 6. Constant-Time Bitwise Mask Optimization O(1)

In earlier versions, `get_network()` calculated the base network using an iterative bitwise loop:

```javascript
// Legacy O(N) iterative loop:
for (let i = 31 - netSize; i >= 0; i--) {
  ipInt &= ~1 << i;
}
```

In v1.4.2, this routine is optimized to a single $O(1)$ constant-time bitwise mask operation:

```javascript
// Optimized O(1) constant-time mask:
const mask = (0xffffffff << (32 - netSize)) >>> 0;
return int2ip((ipInt & mask) >>> 0);
```

### Complexity Comparison

| Metric                    | Legacy Implementation | v1.4.2 Optimized Mask  | Improvement Factor |
| :------------------------ | :-------------------- | :--------------------- | :----------------- |
| **Time Complexity**       | $O(32 - \text{net})$  | $O(1)$ constant        | Up to $32\times$   |
| **Loop Iterations (/0)**  | 32 iterations         | 0 iterations           | $100\%$ reduction  |
| **Loop Iterations (/16)** | 16 iterations         | 0 iterations           | $100\%$ reduction  |
| **Branching & Latency**   | Dependent on prefix   | Constant deterministic | Zero jitter        |

---

## 7. DOM Performance, Security Hardening & Accessibility Standards

### 7.1 Security Remediation (CodeQL Alert #5)

- **DOM XSS Elimination**: Boundary correction strings are rendered through dedicated helper `show_boundary_warning_modal()` using safe `.text()` node bindings, preventing arbitrary script injection through manipulated URL fragments.
- **Context-Aware Sanitization**: All user-supplied notes undergo strict HTML entity encoding (`escapeHtml()`) prior to table insertion.
- **Content Security Policy (CSP)**: The entire codebase operates with `script-src 'self'` without requiring inline `eval()` or unvetted external scripts.

### 7.2 WCAG 2.2 Level AA Accessibility

- **Form Controls & Labels**: All interactive controls, including `#importFileInput`, possess semantic `<label>` associations and descriptive `title` attributes.
- **Table Semantics**: Data tables feature a hidden `<caption class="visually-hidden">` describing the hierarchical CIDR tree, paired with `<th scope="col">` column headers.
- **Keyboard Navigation**: Color swatches implement `role="button"`, `tabindex="0"`, and `Enter`/`Space` keyboard triggers.

### 7.3 Responsive Token Architecture (VGA to 2K)

```text
Viewport Width (px)
0       480      640            768            992           1200           1920          2560+
├────────┼────────┼──────────────┼──────────────┼─────────────┼──────────────┼─────────────┤
  Mobile   Mobile   VGA Monitor    Tablet (iPad)   Laptop        Desktop HD     FHD Desktop   2K / Ultrawide
  (Narrow) (Wide)   (640x480)      (Portrait)     (MacBook)     (1080p)                       (High Res)
```

- Flexible wrapping chips (`flex-wrap: wrap`) prevent layout overflows on legacy VGA displays.
- Scoped `#calc.ipv6-mode` rules apply automatic word-breaking (`word-break: break-all`) and font scaling (`0.74rem`) on mobile viewports under 576px.

---

## 8. Technical Summary, RFC 2119 Criteria & Engineering Best Practices

### 8.1 Technical Summary

Visual Subnet Calculator (v1.4.3) is an industrial-grade, client-side visual IP planning engine designed for high-availability enterprise network operations, cloud VPC/VNet topologies (AWS, Azure, GCP, OCI), and dual-stack IPv4/IPv6 architectures. Core architectural tenets include:

- **100% Client-Side Determinism**: All subnet splitting, joining, format conversions (JSON, CSV, Plain Text), and state encodings occur entirely within the local browser runtime using $O(1)$ constant-time bitwise operations and 128-bit lossless `BigInt` precision. Zero bytes of topology data egress to external servers.
- **Stateless URL Serialization**: Interactive topologies with nested binary tree structures, custom notes, and pastel color tags serialize into compact, URL-safe hash strings using LZ-String compression (`#?c=...`).
- **Universal Interchange Engine**: Multi-format data pipeline supporting RFC 4180 CSV spreadsheets, dynamically aligned ASCII Plain Text tables, and hierarchical JSON state snapshots with in-memory `Blob` downloading and `FileReader` upload parsing.
- **Zero-Trust Security & Accessibility**: Strict sanitization of dynamic HTML entities (`escapeHtml()`), safe `.text()` node bindings for boundary warning modals (remediating CodeQL Alert #5), full WCAG 2.2 Level AA compliance, and responsive scaling spanning legacy VGA (640x480) up to 2K/Ultrawide displays.

### 8.2 RFC 2119 & RFC 8174 Engineering Invariants

The key words **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, **MAY**, and **AVOID** in this technical specification are to be interpreted as described in [`BCP 14`](https://datatracker.ietf.org/doc/html/bcp14), [`RFC 2119`](https://datatracker.ietf.org/doc/html/rfc2119), and [`RFC 8174`](https://datatracker.ietf.org/doc/html/rfc8174).

#### 🔴 MUST (Mandatory Invariants)

1. **MUST Execute Purely Client-Side**: All subnet splits, joins, format conversions, and state encodings MUST occur strictly within the client's local browser runtime. No topology data, CIDR blocks, or notes may ever be transmitted across the network.
2. **MUST Use 128-Bit Lossless Math (`BigInt`) for IPv6**: Calculations across IPv6 address spaces MUST use native JavaScript `BigInt` arithmetic. Implementations MUST NOT cast 128-bit integer structures to IEEE 754 floating-point `Number` types ($2^{53} - 1$ overflow limit).
3. **MUST Sanitize Dynamic HTML Inputs**: All user-supplied notes, labels, and imported configurations MUST undergo character entity sanitization (`escapeHtml()`) before DOM interpolation to prevent Cross-Site Scripting (XSS).
4. **MUST Isolate Modal Alerts via Safe Text Sinks**: Dynamic boundary alerts and warning modals MUST bind data using safe text nodes (`.text()`), eliminating DOM XSS sinks (remediating CodeQL Alert #5).
5. **MUST Enforce RFC 4180 Formatting for CSV**: CSV serialization MUST escape internal double quotes as `""` and wrap all fields with double quotes to prevent formula injection and column splitting.
6. **MUST Provide Accessible Form Labels**: Every interactive control, including hidden file inputs (`#importFileInput`), MUST be associated with a semantic `<label>` and descriptive `title` attribute meeting WCAG 2.2 Level AA.
7. **MUST Run Containers with Unprivileged User (Non-Root)**: Docker production environments MUST execute under numeric unprivileged user context (`USER 101` in `nginxinc/nginx-unprivileged`).

#### 🟡 SHOULD (Strong Recommendations)

1. **SHOULD Use LZ-String Compression for URL Sharing**: Network engineers SHOULD serialize and distribute topology state via LZ-String URL hashes (`#?c=...`) for instant, serverless peer sharing.
2. **SHOULD Enforce Production HTTPS with HSTS**: Production deployments SHOULD configure TLSv1.2/v1.3, automated Let's Encrypt certificates (Certbot), and an HSTS header (`max-age=31536000; includeSubDomains; preload`).
3. **SHOULD Configure Container Healthcheck Probes**: Docker instances SHOULD declare active HTTP healthcheck probes (`wget --spider http://127.0.0.1:8080/`) to facilitate automated container self-healing.
4. **SHOULD Apply Color-Coded Tiering**: Architects SHOULD segment multi-tier infrastructure (e.g., DMZ, Web, App, DB, Management) using distinct pastel color swatches for rapid visual auditing.
5. **SHOULD Preserve Backward-Compatible JSON Schemas**: New configuration exports SHOULD maintain legacy key ordering to preserve interoperability with older parsers.

#### 🟢 MAY (Permissible Options)

1. **MAY Export to Formatted Plain Text**: Users MAY download or copy ASCII aligned plain text tables for direct inclusion in Git pull requests, RFC runbooks, or markdown engineering journals.
2. **MAY Use Python 3 or Caddy for Rapid Deployments**: Teams MAY leverage Python's built-in HTTP server for zero-install air-gapped testing, or Caddy for automatic zero-configuration TLS.
3. **MAY Allocate Subnets Down to /127 for Point-to-Point Links**: Network engineers MAY split IPv6 allocations down to `/127` specifically for inter-router point-to-point links conforming to RFC 6164.

#### ⛔ AVOID (Strict Anti-Patterns)

1. **AVOID Inline HTML Style Attributes**: Developers MUST NOT introduce inline `style="..."` attributes; all visual presentations MUST adhere to scoped CSS classes in `dist/css/main.css`.
2. **AVOID Floating-Point Mathematics for IPv6**: Developers MUST NOT cast IPv6 address hextets to JavaScript standard `Number` types for bit-shift operations.
3. **AVOID Unsanitized `innerHTML` or `.html()` Sinks**: Never feed raw URL parameters, JSON payloads, or DOM values directly into HTML parser sinks.
4. **AVOID Arbitrary Sub-Splitting Below /64 for SLAAC Subnets**: End users and automation scripts MUST NOT divide standard SLAAC local networks past `/64` without explicit architectural justification (RFC 7421).
5. **AVOID Global CSS Selector Pollution**: Styling rules MUST NOT target unscoped base element tags (e.g., bare `input` or `label`) that leak into third-party modal or navbar containers.

### 8.3 Architectural, Implementation & Security Best Practices

1. **Deterministic Calculation Pipeline**:
   - Always perform network masking before address formatting.
   - Utilize constant-time bitwise operations ($O(1)$) to eliminate CPU cycle variance across varying prefix sizes.
2. **Hierarchy-First Subnet Allocation**:
   - Begin with the largest parent block (e.g., `/16` IPv4 or `/32`–`/48` IPv6).
   - Divide sequentially along operational tiers (Availability Zones, VPC subnets, or security perimeters) rather than arbitrary address ranges.
3. **Cloud Reservation Awareness**:
   - Always activate the targeted cloud profile (**AWS VPC**, **Azure VNet**, **Google Cloud GCP**, or **Oracle Cloud OCI**) during topology design to account for cloud-reserved addresses (such as AWS reserving `.0`, `.1`, `.2`, `.3`, and `.255`).
4. **Defensive DOM Manipulation**:
   - Use jQuery's `.text()` or native `textContent` for dynamic values. When HTML structure is required, sanitize through `escapeHtml()` first.
5. **Air-Gapped & Offline Verification**:
   - All vendor libraries (Bootstrap, jQuery, Font Awesome, LZ-String) are bundled locally in `dist/` with Subresource Integrity (SRI) hashes. Regularly verify that zero external network calls occur during runtime.

---

## 9. Maintainer Attribution & Ecosystem Context

Visual Subnet Calculator is developed and maintained by **HARRY DERTIN SUTISNA (@alsyundawy)** under **ALSYUNDAWY IT SOLUTION**.

### Infrastructure Ecosystem Integration

Visual Subnet Calculator serves as the foundational IP allocation and planning engine for adjacent production network systems:

- **Netplan Automation**: Generating production interface profiles for Ubuntu and Debian hosts.
- **Routing & Diagnostics**: Correlating subnet boundaries with Ping, Traceroute, and MTR diagnostics.
- **DNS Administration**: Defining forward (A/AAAA) and reverse (`in-addr.arpa`, `ip6.arpa`) PTR zone boundaries.
- **Security Audits & Discovery**: Defining target CIDR scopes for Nmap vulnerability scans and network benchmarking.
- **Zero-Trust Access Control**: Establishing subnet-level IP ACLs across Nginx reverse proxies and enterprise gateways.

### Official Resources

- **Official Maintainer Site**: [`https://alsyundawy.com`](https://alsyundawy.com)
- **GitHub Repository**: [`https://github.com/alsyundawy/visualsubnetcalc`](https://github.com/alsyundawy/visualsubnetcalc)
- **Direct Contacts**: X ([`@alsyundawy`](https://x.com/alsyundawy)) | Telegram ([`@alsyundawy`](https://t.me/alsyundawy)) | Email ([`alsyundawy@gmail.com`](mailto:alsyundawy@gmail.com))
- **Financial Support**: [`PayPal Sponsorship`](https://paypal.me/alsyundawy)
