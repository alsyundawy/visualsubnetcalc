# Changelog

<!-- markdownlint-disable MD024 -->

All notable changes to Visual Subnet Calculator will be documented in this file.

The format is based on [`Keep a Changelog`](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [`Semantic Versioning`](https://semver.org/spec/v2.0.0.html).

## [1.4.3] - 2026-09-17

### Added

- Interactive IPv6 `/64` through `/127` Subnet Splitting: Unlocked interactive splitting for `/64` through `/127` prefixes into subsequent tiers (e.g. `/68`, `/72`, `/80`, `/84`, `/88`, `/92`, `/96`, `/112`, and `/127`), enabling granular micro-segmentation down to point-to-point links (RFC 6164) while returning an empty division tree for un-divided subnets to preserve clean canonical URLs.
- RFC-Compliant IPv6 Presets (`/40` & `/52`): Added `/40` (RFC 6052 IPv4/IPv6 translation prefix) and `/52` (RFC 6177 multi-site campus allocation) to the IPv6 preset toolbar (`#ipv6_tier_info`), expanding standard tiers to 14 presets.
- Clean IPv6 URL Serialization (Hyphenated Format): Replaced percent-encoded colons (`%3A`) in IPv6 query parameters with hyphens (`-`), producing clean, human-readable URLs (e.g. `?network=2508-6789--&mask=32`) with seamless bidirectional backward and forward parsing.
- Prominent Header Subtitle (`.app-subtitle-author`): Added elegant author attribution `MODIFIED BY HARRY DERTIN SUTISNA ALSYUNDAWY` below the main `<h1>` title, styled in Google Font `Space Grotesk` with letter-spacing, antialiasing, and crisp contrast in both light and dark modes.
- Standard Default IP Allocations: Configured default IPv4 to `172.16.0.0/16` (RFC 1918 20-bit block) and default IPv6 to `2508:6789::/32`.
- Official GitHub Pages Live Demo Link: Published and linked live demonstration URL at `https://alsyundawy.github.io/visualsubnetcalc/` across all documentation, metadata, and headers.
- Comprehensive DOCNOTE Metadata Headers: Integrated standardized, professional metadata comment headers across all production code files (`dist/index.html`, `dist/404.html`, `dist/css/main.css`, `dist/js/main.js`) documenting architecture, author credentials, contact channels, version 1.4.3, and date.
- Equalized and Modernized Go, Tools, and Reset Action Buttons: Standardized `#btn_go`, `#btn_tools`, and `#btn_reset` with identical proportions, compact modern elegance, and harmonic spacing. Styled Go in vibrant luminous blue with dark contrast (`linear-gradient(135deg, #0284c7, #1d4ed8)`), Tools in emerald green (`#10b981`), and Reset in rose coral (`#f43f5e`).
- Curated 8 Essential Social / Contact Channels: Streamlined footer contact channels to exactly 8 essential platforms (Telegram, WhatsApp, X, Website, Email, GitHub, QRIS, and PayPal) with brand-specific hover glows and clean circular box model.
- Professional, Non-Hyperbolic Project Tagline: Replaced AI-sounding buzzwords with clear, professional terminology: "Interactive IPv4 & IPv6 Subnet Calculator and CIDR Network Design Tool".
- Default Dark Mode on Initial Load: Initialized default theme to Dark Mode (`dark`) on first visit prior to user selection or OS preference overrides, supported by an inline anti-FOUC script.
- Complete English Localization Policy: Audited and verified 100% of production code, HTML, CSS, JavaScript, attributes, ARIA tags, labels, tooltips, modals, badges, and tests are strictly in English (Indonesian documentation strictly isolated to `*-ID.md`).
- Bold and Clear Shareable URL (`.live-url-link`): Upgraded live shareable URL below the subnet table to bold (`font-weight: 700`), crisp letter-spacing (`0.01em`), and balanced size (`0.84rem`), guaranteeing prominent legibility across both light and dark modes while preserving word wrapping.
- 15-Minute Temporary Cookie Session Feature (`vsc_draft_15m` & `vsc_visitor_15m_session`): Implemented an RFC 6265 compliant cookie management engine (`TemporaryCookieStore`) with 15-minute TTL (`max-age=900`, `SameSite=Lax`). Automatically caches user subnet calculation drafts in a 15-minute cookie and auto-restores the session upon reopening or refreshing within 15 minutes. Also establishes a 15-minute visitor deduplication cookie session and adds a live status badge (`#cookie_session_badge`) next to the shareable URL.
- Back to Top Floating Button (`#btn_scroll_top`): Added a responsive, glassmorphic floating circular Back to Top action button in `dist/index.html` and `dist/404.html`. Features automated scroll monitoring (> 120px), fluid CSS opacity/transform transitions, hover micro-elevation, and smooth window scrolling. Hardened DOM-ready initialization to guarantee reliable lifecycle binding across both IPv4 and deep IPv6 subnet divisions.
- Unified Footer Button Styling & Icon Discrepancy Fix: Standardized `.footer-social-btn i` to `#0284c7` (light mode) and `#38bdf8` (dark mode), ensuring identical, harmonic styling across all 8 footer buttons and visitor counter pill.
- Crisp Regular Font Awesome Icons: Replaced heavy, overly thick solid icons with standard/regular weight icons (`fa-regular fa-sun`, `fa-regular fa-moon`, `fa-regular fa-circle-question`, `fa-regular fa-envelope`, `fa-regular fa-clock`) and added CSS text-antialiasing for clean, unbloated visual elegance.
- Dynamic Visitor Counter Button (`#visitor_counter_btn`) & `counter.txt` Integration: Added an interactive visitor counter button located directly below the PayPal / QRIS donation section in the footer across `dist/index.html` and `dist/404.html`. Driven by `dist/counter.txt` as a persistent baseline with dynamic session increments via `localStorage`/`sessionStorage` and automatic server synchronization.
- Live Shareable Subnet Hyperlink (`#live_shareable_url`): In addition to the copy URL action button, rendered a dedicated live hyperlink container directly below the subnet breakdown table. Displays the real-time shareable URL as a clickable, high-contrast, compact hyperlink styled with `word-break: break-all` and `overflow-wrap: anywhere` to prevent mobile horizontal container overflow.
- David C URL Format & Dynamic Live Synchronization (`?network=...&mask=...&division=...`): Fully integrated David C's URL query format with lossless binary tree bitstring serialization (`binToAscii` / `asciiToBin`). Every subnet table split, join, mode change, or reset immediately updates the browser URL address bar in real time via `window.history.replaceState`.
- Parent Subnet Headers Breakdown Feature (GitHub Issue #5 Integration): Added an optional hierarchical parent subnet breakdown row renderer. When enabled via the Tools dropdown (`#toggle_parent_headers`) or URL query (`&parent_headers=1`), the breakdown table displays distinctive parent summary rows (`.parent-header-row`) detailing parent CIDR badges, indentation depth, full IP ranges, usable address bounds, and aggregate host counts prior to division.
- RFC 1918 Private IP Address Presets & Live Indicator: Added quick selection chips for the three official IETF RFC 1918 private address blocks (`10.0.0.0/8`, `172.16.0.0/12`, and `192.168.0.0/16`) while strictly preserving default preset at `/16` (`172.16.0.0/16`). Integrated a dynamic status badge (`#rfc1918_indicator`) that verifies active network addresses against RFC 1918 boundaries in real time.
- Xiaomi, Redmi & POCO Mobile Responsive Suite: Conducted deep research on Xiaomi/MIUI/HyperOS browser rendering quirks (system font scaling inflation, 20:9 aspect ratio, DotDisplay notch cutouts). Integrated `viewport-fit=cover`, `env(safe-area-inset-*)` padding guards, `-webkit-text-size-adjust: 100%`, fluid 2-row layout on `< 576px` screens, `min-width: 0` flex item defaults, and enabled touch momentum scrolling (`-webkit-overflow-scrolling: touch`) across `.table-responsive` without clipping or hiding columns.
- Google Cloud (GCP) VPC Subnet Reservation Mode: Integrated GCP cloud reservation profile in Tools dropdown (`#dropdown_gcp`) and calculation engine. Per Google Cloud VPC specifications, GCP reserves 4 addresses per subnet (`network + 0` Network ID, `network + 1` Default Gateway, `broadcast - 1` reserved for future use, and `broadcast - 0` Network Broadcast). Enforces minimum `/29` subnet boundary, computes deterministic usable range (`network + 2` to `last_address - 2`), and integrates with FAQ comparison matrix.
- Dual-Mode Theme (Light / Dark) Engine: Modern glassmorphic theme architecture styled with sleek dark mode aesthetics inspired by ns1.orion.net.id. Features an interactive Font Awesome header toggle (`#themeToggle`), `localStorage` persistence, anti-FOUC inline script in `<head>`, dynamic `<meta name="theme-color">` synchronization, and fluid theme switching.
- Comprehensive Favicon Suite: Integrated consolidated favicon and application icon set directly from `alsyundawy.com` into `dist/icon/` (SVG, ICO, PNG 16x16 to 512x512, Apple touch icons, Android manifest, Windows mstile).
- Distinctive Fork Badge: Added modern pill badge (`Fork`) across `dist/index.html` and `dist/404.html` with vibrant cyan gradient accent and clean padding.
- Cross-Browser & Multi-Device Verification Suite: Automated Headless Chrome and Playwright test suites verifying responsive viewport profiles (VGA 640x480, Xiaomi Redmi A2 360x800, Redmi Note 13 392x872, POCO X6 Pro 412x915, iPhone 15 Pro, iPad Air, MacBook, Desktop FHD, and Desktop 2K QHD), automated vertical spacing checks, and URL path auto-detection with zero horizontal document overflow.

### Fixed

- CodeQL Alert #6 [High] DOM XSS Remediation: Replaced `.html()` with safe DOM element creation in `updateRfc1918Indicator`, replaced `error[0].innerHTML` with `error.text()` in jQuery validation `errorPlacement`, sanitized interpolated dynamic values with `escapeHtml()` in `addParentHeaderRow`, and removed duplicate `aria-label` override on `#live_shareable_url`.
- Xiaomi, Redmi & POCO Display Cutoff & Font Inflation: Fixed horizontal layout clipping on Xiaomi / Redmi / POCO MIUI and HyperOS browsers caused by restrictive header padding (`padding-right: 6rem;`), flex child item default `min-width: auto`, and WebKit system font inflation by enforcing `-webkit-text-size-adjust: 100%`, `min-width: 0`, and safe-area inset guards.
- Root Un-Divided Subnet URL Synchronization: Fixed `encodeDivisionTree` to return an empty string `""` when the root subnet is undivided, preventing spurious `&division=` parameter pollution in canonical URLs.

### Optimized

- Harmonized WhatsApp & QRIS Button Box Model and Anti-Blur Architecture: Eliminated visual anomalies, rendering discrepancies, and GPU rasterization blur ("buram sendirian") affecting the WhatsApp and QRIS buttons on Android and desktop displays. Standardized `.footer-social-btn` across `<a>` and `<button>` with identical height (`32px`, `30px` on small mobile), border-radius (`9999px`), solid background fallbacks, and hardware acceleration (`transform: translateZ(0)`). Added `<span>X</span>` label to the X button to create symmetrical flex wrapping and prevent single-button line orphaning.
- 2026 Preset Toolbar Aesthetics & Beautification: Re-engineered IPv4 (`#ipv4_tier_info`) and IPv6 (`#ipv6_tier_info`) preset button toolbars to modern 2026 design standards featuring subtle glassmorphic container backing (`backdrop-filter: blur(8px)`), vibrant gradient active pill indicators (`linear-gradient(135deg, #0284c7, #2563eb)`), smooth hover translations, and refined typographic hierarchy without breaking existing IDs, classes, or JS listeners.
- 2026 Palette Contrast Standards: Refined the 10 subnet palette colors for Dark Mode to modern 2026 luminous jewel undertones, eliminating glare and boosting text contrast while maintaining strict 100% backward compatibility for Light Mode palette tests.
- Balanced Vertical Spacing Rhythm: established clean, balanced top and bottom vertical margins between the Main Title Header (`#app_header`), the Description Alert Banner (`.alert`), and the IP Version Switcher Toolbar (`#ip_version_toolbar`), preventing visual crowding and improving layout breathing room across all screen sizes.
- Scaled-Down Fluid Title Typography: scaled `.app-title` font size down to a sleek, compact, and balanced fluid clamp: `clamp(1.15rem, 1.2vw + 0.5rem, 1.55rem)` with `font-weight: 800`, ensuring the title remains bold, prominent, and commanding without dominating smaller viewports.
- Light Mode Legibility & Contrast Overhaul: comprehensively audited and elevated Light Mode (`[data-theme="light"]`) text elements to guarantee bright, sharp, blur-free, and high-contrast readability (`#0f172a` headings and labels, `#1e293b` table data, `#0284c7` bottom action links with dotted underlines, and pure white `#ffffff` footer social cards with deep `#1e293b` text).
- Standard Hierarchical IPv6 Tier Progression & Safety Bounds: refined and optimized `getNextIpv6Tier()` and `splitIpv6Network()` to guarantee bounded $O(1)$ memory usage and strictly safe subnet splitting. Enforces clean nibble transitions (+4 bits) across enterprise, branch, and micro-segmentation tiers, preserves `/64` as an immutable SLAAC leaf boundary (RFC 4291 / RFC 7421) with educational guidance modal, and enables granular point-to-point sub-delegation (`/112 -> /120 -> /124 -> /127 -> /128`) without risk of exponential recursion or browser freeze.
- Dark Mode Text Clarity & Contrast: overhauled all text elements in dark mode to guarantee bright, crisp, blur-free readability (`#f8fafc` headings, `#e2e8f0` body text, `#38bdf8` active links and highlights), with special focus on footer text, badges, and table notes.
- Subnet Palette Swatches for Dark Mode: calibrated 10 harmonious, non-clashing, eye-friendly deep jewel tones for dark mode (`--subpal-1-1` through `--subpal-1-10`) eliminating bright pastel glare while maintaining high text contrast and visual distinction.
- Crisp Regular Iconography: Replaced heavy, overly thick solid icons with standard/regular weight icons (`fa-regular fa-sun`, `fa-regular fa-moon`, `fa-regular fa-circle-question`, `fa-regular fa-envelope`, `fa-regular fa-clock`) with antialiased font smoothing, delivering crisp, unbloated visual elegance.

### Fixed

- Fixed Back to Top Floating Button Initialization Timing: resolved an issue where `#btn_scroll_top` failed to appear in IPv6 mode when scrolling after multiple subnet splits. The button element was previously parsed after the script bundle, causing `document.getElementById("btn_scroll_top")` to return `null` during script execution. Placed the button before `<script>` tags, wrapped listener attachment in `DOMContentLoaded` (with fallback for ready/complete states), lowered the scroll threshold to 120px, and attached listeners to both `window` and `document` to guarantee seamless appearance across all devices and subnet depths.
- Fixed Bootstrap 5 Modal Dismiss Transition Race Condition: resolved an intermittent issue where rapid modal closing (e.g. during automated test execution or quick user clicks) dropped dismiss events because Bootstrap's modal was actively transitioning (`_isTransitioning`). Implemented an element-scoped `_pendingDismiss` flag pattern on modal DOM elements that queues dismissal until `shown.bs.modal` and automatically clears upon `hide` or `hidden`, preventing both dropped clicks and stale listener execution on future modal openings.
- Fixed WhatsApp and QRIS visual rendering inconsistency ("buram sendirian"): eliminated isolated `!important` light-mode rules and backdrop blur artifacts that previously affected only WhatsApp and QRIS. Standardized solid backgrounds and `transform: translateZ(0)` for razor-sharp rendering on all screens.
- Fixed horizontal layout truncation on Xiaomi, Redmi, and POCO mobile devices: resolved MIUI system font inflation clipping via `-webkit-text-size-adjust: 100%`, removed rigid 576px container min-width, and preserved full table columns via touch-inertial `.table-responsive`.
- Fixed critical arithmetic calculation bug in `getIpv6Capacity()`: the quadrillion (Q) unit divisor was incorrectly set to `1000000000000000000` (10^18, quintillion) instead of the correct `1000000000000000` (10^15). This caused capacity values for large IPv6 blocks (`/16` down to `/0`) to display numbers 1,000 times smaller than actual address quantities.
- Fixed CSS injection vulnerability in dynamically generated `style="background-color: ..."` table row attributes: color parameters from URL query strings or imported configurations are now strictly validated by a dedicated `sanitizeColor()` helper using regex `^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$`, strictly permitting valid CSS Color Level 4 hexadecimal formats (#RGB, #RGBA, #RRGGBB, #RRGGBBAA) and blocking non-standard 5- and 7-character hex values or CSS property breakouts.
- Hardened input type safety in `escapeHtml()`: returns an empty string (`''`) whenever receiving non-string inputs, preventing non-string objects or `undefined` from leaking into DOM elements.
- Resolved IDE HTML Checker Warning (`@[current_problems]`): identified that the warning was triggered by the Webhint/Edge DevTools extension (`@hint/hint-html-checker`) attempting to send open HTML files to the external W3C validation API (`https://validator.w3.org/nu/?out=json`), which returned an HTML error page causing `JSON.parse()` syntax errors. Configured `"html-checker": "off"` in `.hintrc`, permanently silencing the spurious IDE warning while maintaining strict 100% offline HTML5 validation via `html-validate`.

### Changed

- Updated `package.json` and `package-lock.json` project version metadata to `1.4.3`.
- Updated Schema.org `WebApplication` structured data `softwareVersion` to `1.4.3`.
- Updated release badges, changelog links, and version references in application footer, FAQ section, and About modal header across `dist/index.html`, `dist/404.html`, `NOTES.md`, and `NOTES-ID.md` to Visual Subnet Calculator `v1.4.3`.

---

## [1.4.2] - 2026-09-16

### Added

- Interactive segmented IP version toolbar (`#ip_version_toolbar`) with semantic `<fieldset>` grouping, hidden `<legend>`, and keyboard-accessible `#btn_ipv4` and `#btn_ipv6` toggles conforming to WCAG 2.2 AA (`aria-pressed`).
- Interactive IPv4 prefix preset toolbar (`#ipv4_tier_info`) featuring 17 one-click CIDR presets from `/16` up to `/32` with real-time two-way synchronization between toolbar buttons and the prefix length input field. Default: `/16` (`10.0.0.0/16`).
- Interactive IPv6 prefix preset toolbar (`#ipv6_tier_info`) with 12 standard network engineering tiers: `/32` (default), `/48`, `/56`, `/60`, `/64`, `/80`, `/96`, `/112`, `/120`, `/124`, `/127`, and `/128`, featuring real-time bidirectional synchronization with the prefix length input field. Default: `/32` (`2001:db8::/32`).
- Overhauled in-app FAQ system into an interactive, accessible Bootstrap Accordion (`#faqAccordion`) detailing 10 comprehensive architectural topics: Overview, Split/Join mechanics, Dual-Stack IPv4/IPv6, Cloud reservation profiles (Standard, AWS, Azure, OCI) with comparison matrix, 10-swatch color coding & notes, LZ-String URL sharing & JSON import/export, client-side privacy & offline reliability, universal device support (VGA to 2K/4K), input shortcuts & validation, and official maintainer contacts.
- Integrated one-click "Expand All" (`#faq_expand_all`) and "Collapse All" (`#faq_collapse_all`) accordion toolbar controls with smooth Bootstrap collapse animations.
- Upgraded entire visual iconography to the latest Font Awesome Free v7 (`@fortawesome/fontawesome-free` v7.3.1) across header navigation, toolbars, color palette, modals, and sticky footer.
- Engineered elegant sticky maintainer footer (`#app_footer`) anchored permanently at the viewport bottom, featuring maintainer profile for HARRY DERTIN SUTISNA (`@alsyundawy`) and ALSYUNDAWY IT SOLUTION (`https://alsyundawy.com`), social media channels (X and Telegram), quick contact channels, and PayPal sponsorship.
- Added high-contrast Font Awesome `fa-network-wired` icon directly preceding the main title "Visual Subnet Calculator" across application headers (`dist/index.html`, `dist/404.html`).
- Enhanced interactive hover and selection effects ("pilihan / SOROT") across the entire interface: subtle table row inspection highlight (`box-shadow: inset` preserving custom subnet pastel colors), active Split and Join interactive cell hover feedback, smooth preset CIDR chip hover with elevation, palette picker selected-color indicator (`.selected-color`), dropdown item hover styling, and custom text selection (`::selection`).
- Universal multi-resolution responsive design with `flex-wrap: wrap`, compact chip padding, and 2px spacing for preset buttons, preventing horizontal layout overflow across VGA (640×480), mobile devices (iPhone, Samsung, Xiaomi, Android), tablets (iPad), laptops (MacBook), and high-resolution 2K/4K displays.
- Comprehensive 128-bit `BigInt` IPv6 subnetting engine (`parseIpv6`, `formatIpv6`, `getIpv6Network`, `getIpv6End`, `getIpv6Capacity`) preventing integer overflow and precision loss.
- Canonical IPv6 address compression strictly following IETF RFC 5952 (zero compression with `::`, suppression of leading zeros, lowercase hexadecimal rendering).
- Standard hierarchical IPv6 tier progression (`/32 -> /48 -> /56 -> /60 -> /64`) and granular sub-delegation steps (`/80 -> /96 -> /112 -> /120 -> /124 -> /127 -> /128`) allowing clean allocation modeling from ISP transit blocks down to local link and point-to-point subnets.
- RFC 6164 point-to-point router inter-link support (`/127`, 2 usable host IPs), with active splitting into individual `/128` host/loopback subnets.
- RFC 4291 host/loopback boundary enforcement (`/128`), designated as an immutable leaf node preventing further splitting.
- Dynamic table adaptation for users starting with any custom or preset tier (`/32`, `/48`, `/56`, `/60`, `/64`, `/80`, `/96`, `/112`, `/120`, `/124`, `/127`, or `/128`).
- SLAAC leaf prefix protection conforming to IETF RFC 4291 and RFC 7421: marks `/64` subnets as non-splittable leaf nodes (`.split-disabled`) and displays an educational boundary notification modal upon click.
- Automatic IP version detection on clipboard paste: pasting an IPv6 CIDR automatically activates IPv6 mode, while pasting an IPv4 CIDR activates IPv4 mode.
- Context-aware dynamic table headers adapting dynamically between IPv4 (`Range of Addresses`, `Usable IPs`, `Hosts`) and IPv6 (`Subnet Range`, `Subnet / Interface ID`, `Subnet Capacity`).
- Scoped responsive CSS layout rules (`#calc.ipv6-mode`) providing optimal font scaling (`0.74rem`), automatic word-breaking (`word-break: break-all`), and horizontal alignment across mobile, tablet, and desktop viewports.
- Multi-format Import & Export Engine (`#importExportModal`) supporting RFC 4180-compliant CSV and aligned Plain Text tables alongside hierarchical JSON configurations.
- Interactive format selector toolbar buttons (`#btn_format_json`, `#btn_format_csv`, `#btn_format_txt`) allowing seamless 1-click switching between JSON, CSV, and Plain Text views.
- Quick Copy button (`#btn_copy_export`) with transient "Copied!" visual status feedback for immediate clipboard export across all formats.
- Direct File Download feature (`#btn_download_export`) exporting `.json`, `.csv`, or `.txt` files directly to the user's computer via standard `Blob` and object URL triggers.
- File Upload integration (`#btn_upload_file`, `#importFileInput`) supporting loading `.json`, `.csv`, and `.txt` files directly into the calculator with automatic format detection.
- Mathematical minimal supernet calculation (`Math.min`, bitwise `xor`, `Math.log2`) and recursive binary tree reconstruction (`insertSubnetIntoTree`) converting flat CSV/TXT CIDR lists into full hierarchical `subnetMap` trees with note and color restoration.
- Expanded automated Playwright test suite in `src/tests/import-export.spec.ts` covering CSV export, Plain Text export, CSV import, and Plain Text import across Chromium and Firefox (114 total passing tests).
- Automated end-to-end Playwright test suite (`src/tests/ipv6-subnet.spec.ts`, `src/tests/subnet-basic.spec.ts`, and `src/tests/ui-usage.spec.ts`) validating toolbar switching, presets, tier splitting, boundary alerts, FAQ accordion interactions, and reverse state preservation across Chromium and Firefox (114 total passing tests).

### Fixed

- Modernized application header layout from `float-end` to semantic flex header (`<header id="app_header">`), resolving layout overlap where dismissible alert banners covered the GitHub repository icon.
- Fixed responsive table header disparity on viewports `< 576px`: synchronized `#rangeHeader` and `#useableHeader` visibility with row data cells to eliminate column mismatch on mobile screens.
- Fixed configuration export key order and conditional `ip_version` property serialization, preserving 100% byte-for-byte backwards compatibility with legacy IPv4 v1/v2 schema parsers.
- Fixed form element accessibility on `#importFileInput` by providing an explicit `<label for="importFileInput" class="visually-hidden">` and `title` attribute, ensuring 100% compliance with HTML form labeling standards and WCAG 2.2 AA without redundant `aria-label` warnings.
- Optimized `get_network()` IPv4 network address calculation from an $O(N)$ loop to an $O(1)$ constant-time bitwise mask calculation (`(0xffffffff << (32 - netSize)) >>> 0`), dramatically accelerating subnet tree mutations and large table recalculations.
- Modernized legacy ES5 patterns across helper routines (`ip2int`, `has_network_sub_keys`, `get_matching_network_list`, `get_property_values`) using ES6 arrow functions, `for...of`, and spread syntax.

### Changed

- Updated Schema.org `WebApplication` structured data `softwareVersion` to `1.4.2`.
- Updated application footer release badge and changelog link to Visual Subnet Calculator `v1.4.2`.

## [1.4.1] - 2026-09-16

### Added

- Semantic table accessibility with `<caption class="visually-hidden">` on the main subnet table.
- Semantic HTML5 table column headers with `<th scope="col">` conforming strictly to WCAG 2.2 AA without non-interactive ARIA role overrides.
- Responsive horizontal scrolling wrapper (`.table-responsive`) enabling smooth scrolling from VGA (640x480) displays up to ultra-wide and 2K screens.
- Full keyboard navigation and ARIA attributes (`tabindex="0"`, `role="button"`, `aria-label`) for color palette pickers and toolbar actions with `Enter` and `Space` key event listeners.
- Safe clipboard copying helper with fallback textarea mechanism for non-secure HTTP contexts and strict browser security models.
- Input HTML sanitization helper (`escapeHtml`) preventing stored and reflected Cross-Site Scripting (XSS) via note attributes in URL parameters and import configs.
- Robust JSON parse error handling for configuration imports with descriptive alert feedback.
- MegaLinter configuration (`.mega-linter.yml`) and YAML linter configuration (`.yamllint.yml`) establishing unified linting governance across repository code.
- Safari and iOS compatibility styles adding `-webkit-user-select: none;` alongside standard `user-select: none;` for interactive split/join cells.
- Standardized form field identifiers: added unique `id` and `name` attributes to note inputs (both static template and dynamic JavaScript row generation) and `importExportArea` textarea while eliminating redundant `for` attributes on parent `<label>` elements.
- Enhanced SEO architecture: integrated Schema.org `WebApplication` JSON-LD structured data, canonical URL tags, Open Graph card definitions, Twitter Cards (`summary_large_image`), and search engine indexing directives.
- Multi-resolution responsive scaling: comprehensive CSS token system with responsive breakpoints covering mobile portrait/landscape, tablets, MacBooks, desktops, and 2K displays (VGA 640x480 to 2560x1440).

### Fixed

- Remediated CodeQL security alert #5 (`js/xss-through-dom`): isolated network boundary correction into a dedicated `show_boundary_warning_modal()` handler using strict `.text()` DOM text node insertion, eliminating DOM value taint propagation into jQuery `.html()` sinks.

- Fixed missing `id` and `name` attributes on form field elements and redundant `for` attributes on parent `<label>` tags.
- Fixed WCAG H32 compliance error by setting `<form id="input_form">` action button `#btn_go` to `type="submit"` with default prevention.
- Fixed HTML validation entity encoding: replaced raw `&` with `&amp;` and trimmed `<title>` length within standard 70-character limits.
- Fixed cross-browser CSS warnings by removing obsolete and non-standard `-webkit-overflow-scrolling: touch;` property from `.table-responsive`.
- Fixed browser compatibility warnings in Firefox and Opera by removing deprecated `<meta name="theme-color">` while maintaining PWA theme configuration in `site.webmanifest`.
- Fixed outdated upstream repository URLs, standardizing all documentation, GitHub icons, issues, and contributor links to `https://github.com/alsyundawy/visualsubnetcalc`.
- Fixed global CSS selector pollution where `#calc .note label, input` inadvertently stretched all text input fields across the application to 100% width.
- Fixed modal lifecycle lockup and backdrop deadlocks by adopting `bootstrap.Modal.getOrCreateInstance()`.
- Fixed boundary correction alert text rendering bug where passing custom warning messages displayed an unformatted `undefined` string.
- Fixed deprecated `window.event.clipboardData` usage in paste event handler with modern event property fallback.
- Fixed bottom navigation toolbar layout clipping on narrow viewports by converting `#bottom_nav` to a flexible wrapping container.
- Fixed color conversion hex string handling in `rgba2hex` for pre-formatted hex inputs.
- Eliminated all inline `style="..."` attributes in `dist/index.html` and `dist/404.html`, extracting static rules to `dist/css/main.css`.
- Fixed ShellCheck SC2086 unquoted variables in GitHub Actions workflow step scripts.

### Changed

- Upgraded Bootstrap to `5.3.8` across local bundle compilation and CDN script tags with Subresource Integrity (SRI) SHA384 hashes.
- Verified and enforced jQuery `3.7.1` and jQuery Validate `1.21.0` with strict SRI verification.
- Bumped GitHub Actions dependencies:
  - `actions/checkout` to `v7.0.1` (`3d3c42e5aac5ba805825da76410c181273ba90b1`)
  - `actions/upload-artifact` to `v7.0.1` (`043fb46d1a93c77aae656e7c1c64a875d1fc6a0a`)
  - `docker/setup-qemu-action` to `v4.3.0` (`1f40c72289eff860ee54a304f1438e3cff362e0a`)
  - `docker/setup-buildx-action` to `v4.3.0` (`37fe631027851001ddb9b187196cc803df7f5f0e`)
  - `docker/metadata-action` to `v6.2.0` (`dc802804100637a589fabce1cb79ff13a1411302`)
- Bumped build dependencies in `src/package.json`:
  - `@types/node` to `^26.5.1`
  - `@playwright/test` to `^1.63.0`
- Updated release links in application footer to Visual Subnet Calculator v1.4.1.
- Optimized color change DOM updates by eliminating redundant string mutations.
- Enforced strict repository-wide linter compliance across all HTML, CSS, JavaScript, and configuration files.

## [1.4.0] - 2026-09-15

### Features

- Multi-cloud usable IP address calculation modes for AWS, Azure, and Oracle Cloud Infrastructure (OCI).
- Cloud-specific reserved IP tooltips and documentation links.
- Compressed URL sharing with LZ-String state encoding.
- Subnet split and join hierarchy tree manipulation.
- JSON configuration import and export capabilities.
