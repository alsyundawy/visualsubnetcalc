# Changelog

<!-- markdownlint-disable MD024 -->

All notable changes to Visual Subnet Calculator will be documented in this file.

The format is based on [`Keep a Changelog`](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [`Semantic Versioning`](https://semver.org/spec/v2.0.0.html).

## [1.4.3] - 2026-09-17

### Added

- Google Cloud (GCP) VPC Subnet Reservation Mode: integrated GCP cloud reservation profile in Tools dropdown (`#dropdown_gcp`) and calculation engine. Per Google Cloud VPC specifications, GCP reserves 4 addresses per subnet (`network + 0` Network ID, `network + 1` Default Gateway, `broadcast - 1` reserved for future use, and `broadcast - 0` Network Broadcast). Enforces minimum `/29` subnet boundary, computes deterministic usable range (`network + 2` to `last_address - 2`), and integrates with FAQ comparison matrix and Playwright test suites.

### Optimized

- Standard Hierarchical IPv6 Tier Progression & Safety Bounds: refined and optimized `getNextIpv6Tier()` and `splitIpv6Network()` to guarantee bounded $O(1)$ memory usage and strictly safe subnet splitting. Enforces clean nibble transitions (+4 bits) across enterprise, branch, and micro-segmentation tiers, preserves `/64` as an immutable SLAAC leaf boundary (RFC 4291 / RFC 7421) with educational guidance modal, and enables granular point-to-point sub-delegation (`/112 -> /120 -> /124 -> /127 -> /128`) without risk of exponential recursion or browser freeze.

### Fixed

- Fixed critical arithmetic calculation bug in `getIpv6Capacity()`: the quadrillion (Q) unit divisor was incorrectly set to `1000000000000000000` (10^18, quintillion) instead of the correct `1000000000000000` (10^15). This caused capacity values for large IPv6 blocks (`/16` down to `/0`) to display numbers 1,000 times smaller than actual address quantities.
- Fixed CSS injection vulnerability in dynamically generated `style="background-color: ..."` table row attributes: color parameters from URL query strings or imported configurations are now strictly validated by a dedicated `sanitizeColor()` helper using regex `^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$`, strictly permitting valid CSS Color Level 4 hexadecimal formats (#RGB, #RGBA, #RRGGBB, #RRGGBBAA) and blocking non-standard 5- and 7-character hex values or CSS property breakouts.
- Hardened input type safety in `escapeHtml()`: returns an empty string (`''`) whenever receiving non-string inputs, preventing non-string objects or `undefined` from leaking into DOM elements.
- Maintained 100% fidelity to the authentic, established v1.4.2 visual design, layout, color palette, and Bootstrap typography, ensuring zero UI regressions or unauthorized style deviations.

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
