# Changelog

All notable changes to Visual Subnet Calculator will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.1] - 2026-09-16

### Added

- Semantic table accessibility with `<caption class="visually-hidden">` on the main subnet table.
- Accessible table cell role attributes (`role="cell"`) on dynamic headers to support automated accessibility auditing and assistive technologies.
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
