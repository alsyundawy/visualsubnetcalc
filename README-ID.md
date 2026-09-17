# Visual Subnet Calculator — Edisi Modern & Diperkeras

[![Rilis](https://img.shields.io/github/v/release/alsyundawy/visualsubnetcalc?style=for-the-badge&color=007acc&logo=github)](https://github.com/alsyundawy/visualsubnetcalc/releases/tag/v1.4.3)
[![Lisensi: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Keamanan CodeQL](https://img.shields.io/badge/CodeQL-0%20Alerts%20%7C%20Passing-success?style=for-the-badge&logo=githubactions)](https://github.com/alsyundawy/visualsubnetcalc/security/code-scanning)
[![Linter Trunk](https://img.shields.io/badge/Trunk%20Check-14%20Linters%20Clean-brightgreen?style=for-the-badge&logo=checkmarx)](https://trunk.io)
[![WCAG](https://img.shields.io/badge/WCAG%202.2-Level%20AA%20Compliant-blue?style=for-the-badge&logo=w3c)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![Pengujian E2E](https://img.shields.io/badge/Playwright%20E2E-162%20Passing-success?style=for-the-badge&logo=playwright)](https://playwright.dev)
[![Responsif](https://img.shields.io/badge/Responsive-VGA%20to%202K-purple?style=for-the-badge)](https://github.com/alsyundawy/visualsubnetcalc)
[![Donasi PayPal](https://img.shields.io/badge/Donate-PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.me/alsyundawy)

> **Mesin perancangan dan kalkulator subnet CIDR visual IPv4 & IPv6 yang interaktif, aksesibel, dan berkinerja tinggi untuk insinyur jaringan, arsitek cloud, serta praktisi DevOps.**
> Dioptimalkan dan dikelola oleh **[`HARRY DERTIN SUTISNA (@alsyundawy)`](https://github.com/alsyundawy)** — Dibangun atas karya perintis oleh **[`@ckabalan`](https://github.com/ckabalan)**, **[`@bl4ckfir3`](https://github.com/bl4ckfir3)**, dan **[`@davidc`](https://github.com/davidc)**.
>
> 📖 **[`Catatan Arsitektur & Integrasi (DOCNOTE-ID.md)`](DOCNOTE-ID.md)** &nbsp;|&nbsp; 📜 **[`Catatan Perubahan Rilis (CHANGELOG-ID.md)`](CHANGELOG-ID.md)** &nbsp;|&nbsp; 💖 **[`Dukung via PayPal`](https://www.paypal.me/alsyundawy)** &nbsp;|&nbsp; 🚀 **[`Daftar Rilis`](https://github.com/alsyundawy/visualsubnetcalc/releases)**

---

## 🧭 Navigasi

- [`📸 Pratinjau Interaktif`](#-pratinjau-interaktif)
- [`🌟 Mengapa Edisi Modern Ini?`](#-mengapa-edisi-modern-ini)
- [`✨ Fitur Utama`](#-fitur-utama)
- [`🌐 Arsitektur IPv6 & Tingkatan Alokasi`](#-arsitektur-ipv6--tingkatan-alokasi)
- [`☁️ Profil Subnet Penyedia Cloud & Catatan Subnet Cloud`](#️-profil-subnet-penyedia-cloud--catatan-subnet-cloud)
- [`📦 Impor & Ekspor Multi-Format (JSON, CSV, Plain Text)`](#-impor--ekspor-multi-format-json-csv-plain-text)
- [`🚀 Panduan Instalasi & Deployment`](#-panduan-instalasi--deployment)
  - [`🐳 Menjalankan dengan Docker`](#-menjalankan-dengan-docker)
  - [`🖥️ Menjalankan Tanpa Docker (Host Asli / Bare-Metal)`](#️-menjalankan-tanpa-docker-host-asli--bare-metal)
  - [`🔒 Deployment Produksi: Nginx + Certbot (SSL) + Domain Kustom`](#-deployment-produksi-nginx--certbot-ssl--domain-kustom)
- [`🛠️ Pengembangan Lokal & Pengujian`](#️-pengembangan-lokal--pengujian)
- [`📊 Jaminan Kualitas & Matriks Verifikasi`](#-jaminan-kualitas--matriks-verifikasi)
- [`📋 Standar Rekayasa, Praktik Terbaik & Kaidah RFC 2119`](#-standar-rekayasa-praktik-terbaik--kaidah-rfc-2119)
- [`📚 Dokumentasi & Catatan Rekayasa`](#-dokumentasi--catatan-rekayasa)
- [`📜 Riwayat Versi & Catatan Perubahan`](#-riwayat-versi--catatan-perubahan)
- [`🤝 Kredit & Penulis Asli`](#-kredit--penulis-asli)
- [`📬 Pengelola & Kontak`](#-pengelola--kontak)
- [`💖 Dukungan & Donasi`](#-dukungan--donasi)
- [`📄 Lisensi`](#-lisensi)

---

## 📸 Pratinjau Interaktif

![Demonstrasi Visual Subnet Calculator](src/demo.gif)

Visual Subnet Calculator menyingkirkan perhitungan subnet akademis yang rumit dan menggantikannya dengan desain topologi jaringan yang intuitif dan visual. Anda dapat dengan cepat mempartisi blok CIDR, mengalokasikan subnet untuk tingkatan microservices atau VPC cloud, memberikan label warna kustom, dan membagikan seluruh struktur topologi kepada kolega melalui fragmen URL — **tanpa penyimpanan data apa pun di sisi server**.

---

## 🌟 Mengapa Edisi Modern Ini?

> 💡 _Untuk spesifikasi arsitektur mendalam, hash integritas SRI dependensi, dan detail integrasi ekosistem, lihat [`DOCNOTE-ID.md`](DOCNOTE-ID.md). Untuk riwayat rilis versi per versi secara terperinci, lihat [`CHANGELOG-ID.md`](CHANGELOG-ID.md)._

Edisi ini (**v1.4.3+**) menghadirkan perombakan menyeluruh pada aspek arsitektur, keamanan, aksesibilitas, performa, dan antarmuka visual:

### 🛡️ 1. Keamanan Bebas Celah & Remediasi CodeQL

- **Remediasi Celah DOM XSS (`js/xss-through-dom`)**: Menyelesaikan peringatan GitHub CodeQL Alert #5 secara menyeluruh dengan mengisolasi masukan batas koreksi jaringan ke fungsi pembantu khusus dan mengganti interpretasi HTML dengan penyisipan teks node `.text()` yang aman.
- **Sanitasi Kontekstual**: Menerapkan penyandian entitas HTML (`escapeHtml()`) pada seluruh dekoder URL LZ-String serta berkas konfigurasi impor guna menetralkan ancaman injeksi skrip tersimpan maupun terefleksi.
- **Rantai Pasok CI/CD Abadi**: Menerapkan penyematan commit SHA (`pinact`) pada seluruh alur kerja GitHub Actions serta menegakkan izin tingkat atas seminimal mungkin (`permissions: contents: read`).
- **Pengerasan Kontainer**: Dibangun dengan hak akses tanpa _root_ (`USER 101` pada `nginxinc/nginx-unprivileged`), probe _healthcheck_ otomatis, dan kompatibilitas kontainer _read-only_.

### ♿ 2. Aksesibilitas WCAG 2.2 Tingkat AA

- **Kepatuhan Autofill Formulir**: Menambahkan atribut `id` dan `name` yang unik dan eksplisit ke semua kontrol formulir, baris input dinamis (`#note_*`), dan textarea impor.
- **Kontrol Formulir & Label Aksesibel**: Menyediakan elemen `<label>` semantik dan atribut `title` yang deskriptif bagi setiap elemen kontrol (termasuk input file tersembunyi), memenuhi standar linter HTML dan pembaca layar.
- **Kepatuhan Standar WCAG H32**: Menetapkan tombol aksi utama (`#btn_go`) sebagai `type="submit"` dengan intersepsi event sisi klien, memastikan kepatuhan penuh tanpa memicu _reload_ halaman yang tidak diinginkan.
- **Arsitektur Tabel Semantik**: Menyertakan elemen `<caption class="visually-hidden">` untuk pembaca layar yang mendeskripsikan hierarki pohon CIDR, dipadukan dengan semantik header kolom `<th scope="col">`.
- **Navigasi Keyboard**: Memberikan dukungan kontrol keyboard penuh (tombol `Enter` dan `Space`), atribut `tabindex="0"`, serta `role="button"` pada palet warna interaktif.

### 📱 3. Skalabilitas Responsif Universal (VGA ke 2K)

- **Dukungan Lintas Perangkat**: Media queries CSS modular yang beradaptasi dinamis pada berbagai resolusi layar, mulai dari monitor **VGA (640×480)**, smartphone (**iPhone, Samsung, Xiaomi, Android**), tablet (**iPad potret & lanskap**), laptop (**MacBook**), hingga monitor **2K / Layar Lebar (2560px+)**.
- **Efisiensi Ruang Layar**: Mendesain ulang bilah header, merapikan spanduk pemberitahuan, serta menyesuaikan skala ikon SVG guna memaksimalkan area kerja tabel dan mencegah pengguliran vertikal yang tidak perlu.
- **Footer Melekat (Sticky Footer)**: Mengembangkan footer permanen (`#app_footer`) berbasis CSS Flexbox (`min-height: 100dvh`, `margin-top: auto`), yang selalu melekat di dasar viewport pada semua halaman termasuk tampilan 404.

### ⚡ 4. Rekayasa Performa Tinggi

- **Masker Bitwise Waktu-Konstan ($O(1)$)**: Mengoptimalkan fungsi perhitungan alamat jaringan dasar `get_network(networkInput, netSize)` dari perulangan iteratif menjadi satu operasi masker bitwise instan:
  $$\text{mask} = (0\text{xffffffff} \ll (32 - \text{netSize})) \ggg 0$$
- **Matematika Presisi 128-Bit (`BigInt`)**: Perhitungan tanpa kehilangan presisi untuk alokasi IPv6 tanpa batasan _floating-point_ IEEE 754, dipadukan dengan format kanonikal IETF RFC 5952 (penekanan angka nol awal dan kompresi `::`).
- **Basis Kode Idiomatik ES6+**: Menggunakan fungsi panah, iterator `for...of`, serta sintaks _spread_ yang bersih guna menggantikan pola lama ES5 di seluruh modul kalkulasi.

---

## ✨ Fitur Utama

- **Mesin Subnetting Dual-Stack IPv4 & IPv6**: Beralih secara mulus antara blok CIDR IPv4 (`10.0.0.0/16`) dan hierarki prefiks IPv6 (`2001:db8::/32`) menggunakan bilah alat pemilih versi yang aksesibel (`#ip_version_toolbar`).
- **Bilah Alat Preset Prefiks IPv4 Interaktif**: Pemilihan instan ukuran jaringan CIDR dari **/16** hingga **/32** (total 17 preset: `/16` sampai `/32`) dengan sinkronisasi dua arah secara _real-time_ antara tombol preset dan kolom input panjang prefiks, dikemas dalam toolbar responsif (`#ipv4_tier_info`). Default: `/16` (`10.0.0.0/16`).
- **Bilah Alat Preset Prefiks IPv6 Interaktif**: Toolbar lengkap 12-preset dari **/32** hingga **/128** dengan pemilihan satu-klik:
  - **/32** _(Bawaan)_: Alokasi ISP / LIR ($65.536 \times /48$ atau $4{,}29\text{M} \times /64$)
  - **/48**: Alokasi Situs Korporat ($65.536 \times /64$ SLAAC)
  - **/56**: Alokasi Kantor Cabang / Multi-VPC ($256 \times /64$)
  - **/60**: Alokasi Kantor Kecil / Multi-Subnet ($16 \times /64$)
  - **/64**: Subnet Jaringan Lokal Standar / SLAAC ($18{,}4 \times 10^{18}$ IP host)
  - **/80**: Batas Mikro-segmentasi / Layanan Cloud ($2{,}81 \times 10^{14}$ IP host)
  - **/96**: Batas Translasi Alamat Tersemat IPv4 ($4{,}29\text{M}$ IP host)
  - **/112**: Klaster Perangkat Terisolasi / Sub-delegasi Khusus ($65.536$ IP host)
  - **/120**: Sub-delegasi Jaringan Industri & Sensor ($256$ IP host)
  - **/124**: Sub-delegasi Kelompok Kecil Antar-Router ($16$ IP host)
  - **/127**: Tautan Antar-Router Point-to-Point (Standar RFC 6164, 2 IP host)
  - **/128**: Antarmuka Loopback / Alamat Host Tunggal (Standar RFC 4291, 1 IP host)
- **Mesin Impor & Ekspor Multi-Format**: Pertukaran data menyeluruh yang mendukung **spreadsheet CSV standar RFC 4180**, **tabel Plain Text rata-kolom**, serta **konfigurasi hierarki JSON** dengan tombol pengalih format satu-klik, penyalinan ke clipboard berumpan balik visual, dan fitur unduh/unggah berkas langsung (`.json`, `.csv`, `.txt`).
- **Rekonstruksi Pohon Subnet Supernet Minimal**: Algoritma cerdas yang mendeteksi supernet penampung minimal via matematika bitwise XOR, secara otomatis menyusun daftar flat subnet CSV/TXT menjadi pohon biner interaktif lengkap dengan catatan teks dan label warna.
- **Tautan Point-to-Point Antar-Router RFC 6164**: Dukungan langsung untuk subnet `/127` yang digunakan pada infrastruktur tautan router guna mencegah serangan amplifikasi _ping-pong_, dengan kemampuan membagi secara interaktif menjadi dua subnet host `/128`.
- **Perlindungan Batas SLAAC & Host**: Kepatuhan penuh terhadap standar RFC 4291 dan RFC 7421, melindungi subnet daun `/64` dan `/128` dari pemecahan yang tidak valid disertai panduan edukatif yang jelas.
- **Pemisahan & Penggabungan Visual (Split & Join)**: Membagi blok CIDR IPv4 atau IPv6 menjadi dua bagian dengan satu klik, atau menggabungkan kembali pasangan subnet yang bersebelahan menjadi blok induknya.
- **Mode Khusus Penyedia Cloud**: Profil bawaan untuk **Standar RFC 1918**, **AWS VPC**, **Azure VNet**, **Google Cloud (GCP) VPC**, dan **Oracle Cloud (OCI)** yang secara otomatis memperhitungkan alamat IP yang dicadangkan oleh vendor cloud.
- **Pemberian Warna yang Aksesibel**: Menetapkan warna-warna pastel yang nyaman di mata pada setiap subnet untuk membedakan tingkatan peran jaringan (misalnya DMZ, Web, Aplikasi, Basis Data, Manajemen).
- **Akordion FAQ Interaktif**: Dokumentasi bawaan yang memuat 10 panduan topik arsitektur terlipat rapi dengan tombol kendali satu-klik "Expand All" dan "Collapse All", matriks perbandingan reservasi cloud, panduan IPv6, mekanisme split/join, alur kerja pewarnaan, dan jaminan privasi.
- **Ikon Font Awesome Free v7.3.1**: Memperbarui seluruh grafis antarmuka dengan ikon vektor Font Awesome yang tajam dan aksesibel pada header, toolbar, modal, dan footer.
- **Metrik Subnet Komprehensif**: Pembacaan instan untuk Alamat Jaringan, Rentang Alamat, Rentang Host yang Dapat Digunakan / Interface ID, Netmask, dan Kapasitas Subnet.
- **Privasi Penuh Sisi Klien**: Desain jaringan dikompresi ke dalam hash URL peramban menggunakan LZ-String, atau diekspor ke file lokal. Tanpa akun pengguna, tanpa kuki (_cookies_), dan tanpa basis data sisi server.
- **Pencarian & Penyaringan Dinamis**: Mengisolasi subnet tertentu secara cepat dalam blok CIDR besar menggunakan filter prefiks atau catatan teks.

---

## 🌐 Arsitektur IPv6 & Tingkatan Alokasi

Pemisahan biner tradisional ala IPv4 ($/N \to /N+1$) tidak praktis untuk IPv6 karena ruang alamat $2^{128}$ yang sangat luas. Visual Subnet Calculator mengadopsi hierarki tingkatan rekayasa jaringan yang ditetapkan oleh IETF RFC 6177, RFC 4291, dan RFC 6164:

$$\text{/32 (ISP/LIR)} \longrightarrow \text{/48 (Situs Korporat)} \longrightarrow \text{/56 (Kantor Cabang/VPC)} \longrightarrow \text{/60 (Departemen)} \longrightarrow \text{/64 (SLAAC)} \quad\Big|\quad \text{/127 (P2P)} \longrightarrow \text{/128 (Host)}$$

| Prefiks Tingkatan  | Langkah Bit | Faktor Pengali Subnet                  | Kapasitas Host / IP Tersedia    | Cakupan Operasional & Peran Arsitektur                              | Standar RFC         |
| :----------------- | :---------- | :------------------------------------- | :------------------------------ | :------------------------------------------------------------------ | :------------------ |
| **/32** _(Bawaan)_ | $+4$ bit    | $16 \times /36$ ($65.536 \times /48$)  | $4{,}29\text{M} \times /64$     | Alokasi Regional Internet Registry (RIR) ke ISP / Korporasi Raksasa | RFC 6177            |
| **/48**            | $+8$ bit    | $256 \times /56$ ($65.536 \times /64$) | $65.536 \times /64$ subnet      | Alokasi ISP ke Situs Korporat / Pusat Data Perusahaan               | RFC 6177            |
| **/56**            | $+4$ bit    | $16 \times /60$ ($256 \times /64$)     | $256 \times /64$ subnet         | Alokasi Korporat ke Kantor Cabang / Kampus / Multi-VPC              | RFC 6177            |
| **/60**            | $+4$ bit    | $16 \times /64$ subnet                 | $16 \times /64$ subnet          | Alokasi Cabang ke Kantor Kecil / VLAN Departemen                    | RFC 6177            |
| **/64**            | Daun / Sub  | Subnet Daun Standar                    | $18{,}4\text{Q}$ ($2^{64}$) IP  | Jaringan Lokal Standar / VLAN (Konfigurasi Otomatis SLAAC)          | RFC 4291 / RFC 7421 |
| **/80**            | $+16$ bit   | $65.536 \times /96$ subnet             | $2{,}81 \times 10^{14}$ IP host | Batas Mikro-segmentasi / Layanan Cloud Terisolasi                   | RFC 4291            |
| **/96**            | $+16$ bit   | $65.536 \times /112$ subnet            | $4{,}29\text{M}$ IP host        | Translasi IPv4-ke-IPv6 / Alamat Tersemat IPv4                       | RFC 6052            |
| **/112**           | $+8$ bit    | $256 \times /120$ subnet               | $65.536$ IP host                | Klaster Perangkat Terisolasi / Sub-delegasi Khusus                  | RFC 4291            |
| **/120**           | $+4$ bit    | $16 \times /124$ subnet                | $256$ IP host                   | Sub-delegasi Jaringan Industri & Sensor                             | RFC 4291            |
| **/124**           | $+3$ bit    | $8 \times /127$ subnet                 | $16$ IP host                    | Sub-delegasi Kelompok Kecil Antar-Router                            | RFC 4291            |
| **/127**           | $+1$ bit    | $2 \times /128$ subnet                 | 2 IP (Tautan P2P)               | Tautan Antar-Router Point-to-Point (Mencegah serangan ping-pong)    | RFC 6164            |
| **/128**           | Daun        | Daun Host Tunggal / Loopback           | 1 IP (Host Tunggal)             | Antarmuka Loopback / Alamat Host Server Tunggal                     | RFC 4291            |

---

## ☁️ Profil Subnet Penyedia Cloud & Catatan Subnet Cloud

Setiap penyedia infrastruktur cloud mencadangkan alamat IP tertentu dalam setiap subnet untuk kebutuhan perutean internal, DNS, dan gateway. Visual Subnet Calculator secara native memperhitungkan reservasi vendor tersebut, menyesuaikan rentang host usable, dan menampilkan rincian tooltip secara transparan.

### 📊 Matriks Perbandingan Reservasi Cloud

| Profil Cloud           | Subnet Terkecil |        IP Dicadangkan        | Rincian Peran Alamat IP yang Dicadangkan                                                             | Dokumentasi Rujukan                                                                                                                                                               |
| :--------------------- | :-------------: | :--------------------------: | :--------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Standar**            |      `/32`      | **2** _(ukuran $\le$ `/30`)_ | Alamat Jaringan (`.0`), Alamat Broadcast (`.last`)                                                   | [`RFC 1918`](https://datatracker.ietf.org/doc/html/rfc1918) / [`RFC 4632`](https://datatracker.ietf.org/doc/html/rfc4632)                                                         |
| **AWS VPC**            |      `/28`      |            **5**             | Network (`.0`), Router VPC (`.1`), DNS VPC (`.2`), Penggunaan Masa Depan (`.3`), Broadcast (`.last`) | [`Ukuran Subnet AWS VPC`](https://docs.aws.amazon.com/vpc/latest/userguide/subnet-sizing.html)                                                                                    |
| **Azure VNet**         |      `/29`      |            **5**             | Network (`.0`), Default Gateway (`.1`), Pemetaan DNS Azure (`.2`, `.3`), Broadcast (`.last`)         | [`Batasan Subnet Azure VNet`](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-faq#are-there-any-restrictions-on-using-ip-addresses-within-these-subnets) |
| **Google Cloud (GCP)** |      `/29`      |            **4**             | Network (`.0`), Default Gateway (`.1`), Penggunaan Masa Depan (`.last - 1`), Broadcast (`.last`)     | [`Subnet Google Cloud VPC`](https://cloud.google.com/vpc/docs/subnets#reserved_ip_addresses_in_ipv4_subnets)                                                                      |
| **Oracle Cloud (OCI)** |      `/30`      |            **3**             | Network (`.0`), Default Gateway (`.1`), Broadcast (`.last`)                                          | [`Alamat IP Dicadangkan OCI`](https://docs.oracle.com/en-us/iaas/Content/Network/Concepts/overview.htm#Reserved__reserved_subnet)                                                 |

### 🌐 Mode Standar RFC 1918 / RFC 4632

- **Subnet Terkecil**: `/32` (Antarmuka host tunggal / loopback)
- **Alamat Dicadangkan (untuk ukuran $\le$ /30)**: 2 alamat
  - **Alamat Jaringan**: `network + 0` (Pengenal dasar jaringan)
  - **Alamat Broadcast**: `alamat terakhir` (`network + size - 1`)
- **Rentang Host Usable**: `network + 1` hingga `last_address - 1` (untuk ukuran $\le$ /30). Untuk tautan point-to-point router `/31` (RFC 3021), kedua alamat dapat digunakan tanpa reservasi network/broadcast terpisah. Untuk `/32`, tersedia tepat 1 alamat host.

### 🟧 Mode Amazon Web Services (AWS) VPC

- **Subnet Terkecil**: `/28` (16 alamat total, 11 usable)
- **Alamat Dicadangkan**: 5 alamat per subnet
  - `network + 0`: **Alamat jaringan** (Mengidentifikasi blok CIDR subnet)
  - `network + 1`: **Router VPC** (Dicadangkan oleh AWS untuk perutean default gateway)
  - `network + 2`: **DNS VPC** (Dicadangkan oleh AWS untuk AmazonProvidedDNS / Route 53 Resolver)
  - `network + 3`: **Penggunaan masa depan** (Dicadangkan oleh AWS untuk kapabilitas internal mendatang)
  - `alamat terakhir`: **Broadcast jaringan** (AWS VPC tidak mendukung broadcast, namun tetap mencadangkan alamat ini)
- **Rentang Host Usable**: `network + 4` hingga `last_address - 1`

### 🟦 Mode Microsoft Azure Virtual Network (VNet)

- **Subnet Terkecil**: `/29` (8 alamat total, 3 usable)
- **Alamat Dicadangkan**: 5 alamat per subnet
  - `network + 0`: **Alamat jaringan** (Mengidentifikasi blok CIDR subnet)
  - `network + 1`: **Default gateway** (Dicadangkan oleh Azure untuk perutean keluar dari subnet)
  - `network + 2`: **DNS Azure** (Memetakan alamat IP DNS Azure ke ruang alamat VNet)
  - `network + 3`: **DNS Azure** (Pemetaan redundan sekunder untuk resolusi DNS Azure)
  - `alamat terakhir`: **Broadcast jaringan** (Dicadangkan oleh Azure)
- **Rentang Host Usable**: `network + 4` hingga `last_address - 1`

### 🟥 Mode Google Cloud Platform (GCP) VPC

- **Subnet Terkecil**: `/29` (8 alamat total, 4 usable)
- **Alamat Dicadangkan**: 4 alamat per subnet
  - `network + 0`: **Alamat jaringan** (Mengidentifikasi blok CIDR subnet)
  - `network + 1`: **Default gateway** (Digunakan oleh Google Cloud untuk merutekan lalu lintas di dalam jaringan VPC)
  - `last_address - 1`: **Penggunaan masa depan** (Alamat kedua dari belakang, dicadangkan oleh Google untuk fitur mendatang)
  - `alamat terakhir`: **Broadcast jaringan** (Google Cloud VPC tidak mendukung broadcast, namun tetap mencadangkan alamat ini)
- **Rentang Host Usable**: `network + 2` hingga `last_address - 2` (Perhatikan bahwa berbeda dari AWS dan Azure yang mencadangkan `.2` dan `.3` di batas awal, Google Cloud mencadangkan `.1` di awal dan `last - 1` di batas akhir)

### 🔴 Mode Oracle Cloud Infrastructure (OCI)

- **Subnet Terkecil**: `/30` (4 alamat total, 1 usable)
- **Alamat Dicadangkan**: 3 alamat per subnet
  - `network + 0`: **Alamat jaringan** (Mengidentifikasi blok CIDR subnet)
  - `network + 1`: **Default gateway** (Dicadangkan oleh OCI untuk IP virtual router subnet)
  - `alamat terakhir`: **Broadcast jaringan** (Dicadangkan oleh OCI)
- **Rentang Host Usable**: `network + 2` hingga `last_address - 1`

---

## 📦 Impor & Ekspor Multi-Format (JSON, CSV, Plain Text)

Visual Subnet Calculator v1.4.3 menyediakan mesin pertukaran data multi-format yang dapat diakses melalui tombol **Import / Export** pada bilah alat atas:

```text
                       ┌──────────────────────────────────────────────┐
                       │   Model Pohon Visual Subnet Calculator       │
                       └──────────────────────┬───────────────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         ▼                         ▼
         ┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
         │     Format JSON     │   │   CSV (RFC 4180)    │   │  Tabel Plain Text   │
         │  Status Penuh Pohon │   │  Siap Spreadsheet   │   │  Dokumen & Review   │
         └─────────────────────┘   └─────────────────────┘   └─────────────────────┘
```

### Format Data yang Didukung

1. **JSON (`.json`)**: Cuplikan konfigurasi lengkap yang menyimpan blok CIDR dasar, mode operasional (`Standard`, `AWS`, `Azure`, `OCI`), versi IP aktif (`IPv4` atau `IPv6`), catatan kustom, dan pemetaan warna.
2. **CSV (`.csv`)**: Format nilai berpemisah koma yang mematuhi standar RFC 4180 dengan kutip ganda, siap dibuka langsung pada Microsoft Excel, LibreOffice Calc, dan Google Sheets:
   ```csv
   "Subnet Address","Range of Addresses","Usable IPs","Hosts","Note","Color"
   "10.0.0.0/18","10.0.0.0 - 10.0.63.255","10.0.0.1 - 10.0.63.254","16382","Production VPC","#cbf078"
   "10.0.64.0/18","10.0.64.0 - 10.0.127.255","10.0.64.1 - 10.0.127.254","16382","Staging VPC","#f8f398"
   ```
3. **Plain Text (`.txt`)**: Tabel teks monospace berkarakter ASCII yang sejajar rapi disertai komentar metadata, sangat cocok untuk ditempelkan langsung pada Pull Request Git, panduan topologi, atau konsol terminal:
   ```text
   # Visual Subnet Calculator Export
   # Base Network: 10.0.0.0/16 | Mode: Standard | Format: Plain Text
   # Exported on: 2026-09-16T13:27:18.000Z

   Subnet Address   Range of Addresses          Usable IPs                  Hosts   Note            Color
   10.0.0.0/18      10.0.0.0 - 10.0.63.255      10.0.0.1 - 10.0.63.254      16382   Production VPC  #cbf078
   10.0.64.0/18     10.0.64.0 - 10.0.127.255    10.0.64.1 - 10.0.127.254    16382   Staging VPC     #f8f398
   ```

### Aksi Operasional

- **Pengalih Format 1-Klik**: Beralih seketika antara tab format `JSON`, `CSV`, dan `Plain Text`.
- **Salin Cepat (`#btn_copy_export`)**: Menyalin teks terformat ke clipboard sistem disertai indikator visual "Copied!".
- **Unduh File Langsung (`#btn_download_export`)**: Menghasilkan objek `Blob` di memori dan memicu unduhan otomatis berkas `subnet-calc-[network].[ext]`.
- **Unggah File (`#btn_upload_file`)**: Membaca berkas lokal `.json`, `.csv`, atau `.txt` secara langsung menggunakan `FileReader` API tanpa mengirimkan data ke server luar.
- **Penyusunan Pohon Pintar**: Membaca daftar CIDR atau baris CSV apa pun, menghitung supernet penampung minimal secara otomatis, dan menyusun kembali hierarki pohon biner interaktif.

---

## 🚀 Panduan Instalasi & Deployment

Visual Subnet Calculator adalah aplikasi web statis 100% sisi klien. Aplikasi ini dapat di-host dengan kecepatan luar biasa dan konsumsi sumber daya minimal menggunakan kontainer Docker, lingkungan pengembangan lokal, maupun web server produksi (Nginx, Caddy, Apache).

---

### 🐳 Menjalankan dengan Docker

Menjalankan Visual Subnet Calculator melalui Docker memberikan lingkungan terisolasi dengan tingkat keamanan tinggi karena berjalan sebagai pengguna non-root (`USER 101`).

#### Metode 1: Menjalankan Cepat via Docker CLI

Tarik dan jalankan image siap pakai secara langsung:

```bash
# Jalankan kontainer di latar belakang pada port 8080
docker run -d \
  --name visualsubnetcalc \
  --restart unless-stopped \
  -p 8080:8080 \
  ckabalan/visualsubnetcalc:latest
```

Buka peramban dan akses aplikasi di `http://localhost:8080`.

#### Metode 2: Build Mandiri dari Kode Sumber

Untuk membangun dan menjalankan image versi terbaru dari repositori ini:

```bash
# 1. Gandakan repositori
git clone https://github.com/alsyundawy/visualsubnetcalc.git
cd visualsubnetcalc

# 2. Bangun image Docker produksi menggunakan Dockerfile multi-stage
docker build -t visualsubnetcalc:1.4.3 .

# 3. Jalankan kontainer yang telah diperkeras
docker run -d \
  --name visualsubnetcalc \
  --restart unless-stopped \
  -p 8080:8080 \
  visualsubnetcalc:1.4.3
```

#### Metode 3: Konfigurasi Docker Compose Produksi (`docker-compose.yml`)

Untuk lingkungan produksi atau stack multi-kontainer, buat berkas `docker-compose.yml`:

```yaml
version: "3.8"

services:
  visualsubnetcalc:
    image: ckabalan/visualsubnetcalc:latest
    # Atau bangun secara lokal:
    # build:
    #   context: .
    #   dockerfile: Dockerfile
    container_name: visualsubnetcalc
    restart: unless-stopped
    ports:
      # Pasangkan ke 127.0.0.1 saat berada di balik reverse proxy Nginx pada host
      - "127.0.0.1:8080:8080"
      # Atau buka ke jaringan publik jika tidak menggunakan reverse proxy:
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

Jalankan layanan dengan Docker Compose:

```bash
# Jalankan kontainer dalam mode detached
docker compose up -d

# Periksa status kontainer dan probe healthcheck
docker compose ps

# Pantau log akses aplikasi
docker compose logs -f
```

---

### 🖥️ Menjalankan Tanpa Docker (Host Asli / Bare-Metal)

Jika Anda tidak menggunakan Docker, Visual Subnet Calculator dapat berjalan pada host mana pun yang memiliki Node.js, Python, atau web server standar.

#### Metode 1: Node.js & npm (Pengembangan & Pengujian Lokal)

**Kebutuhan Sistem**:

- **Sistem Operasi**: Linux (Ubuntu 22.04/24.04 LTS, Debian 11/12), macOS (Sonoma, Sequoia), atau Windows 10/11 dengan WSL2
- **Versi Minimum Node.js**: **Node.js `v18.0.0+ LTS`** (Hydrogen) — Diperlukan untuk modul ECMAScript native (ESM), matematika bitwise `BigInt` 128-bit lossless, dan Web Crypto API.
- **Versi Optimal / Disarankan**: **Node.js `v20.x` / `v22.x Active LTS`** (Iron / Jod) — Menghadirkan performa puncak melalui mesin V8 JIT mutakhir, jejak memori terendah, serta eksekusi pengujian otomatis Playwright berkecepatan tinggi.
- **Pengelola Paket**: **npm `10.x+`** (atau pnpm `9.x+`, yarn `4.x+`)

```bash
# 1. Gandakan repositori
git clone https://github.com/alsyundawy/visualsubnetcalc.git
cd visualsubnetcalc/src

# 2. Pasang dependensi
npm install

# 3. Kompilasi stylesheet SCSS & bundel aset distribusi
npm run build

# 4. Jalankan server HTTP lokal pada http://127.0.0.1:8080
npm start
```

#### Metode 2: HTTP Server Bawaan Python 3 (Tanpa Dependensi Tambahan)

Pada server atau workstation apa pun yang telah terpasang Python 3, Anda dapat langsung menyajikan direktori `dist/` tanpa perlu memasang Node.js maupun npm:

```bash
# Gandakan repositori
git clone https://github.com/alsyundawy/visualsubnetcalc.git
cd visualsubnetcalc

# Jalankan server HTTP bawaan yang terikat pada localhost port 8080
python3 -m http.server 8080 --directory dist --bind 127.0.0.1
```

Akses `http://127.0.0.1:8080` pada peramban Anda.

#### Metode 3: Server Statis Native Nginx (Performa Sangat Tinggi)

Untuk server Linux produksi (Ubuntu/Debian) di mana Nginx menyajikan berkas statis secara langsung:

```bash
# 1. Pasang Nginx
sudo apt update
sudo apt install -y nginx

# 2. Gandakan repositori dan salin berkas dist ke web root
git clone https://github.com/alsyundawy/visualsubnetcalc.git
sudo mkdir -p /var/www/visualsubnetcalc
sudo cp -r visualsubnetcalc/dist/* /var/www/visualsubnetcalc/

# 3. Atur hak akses direktori yang benar
sudo chown -R www-data:www-data /var/www/visualsubnetcalc
sudo chmod -R 755 /var/www/visualsubnetcalc
```

Lihat bagian [`Konfigurasi Nginx`](#-deployment-produksi-nginx--certbot-ssl--domain-kustom) di bawah untuk blok konfigurasi virtual host selengkapnya.

#### Metode 4: Server Caddy (Modern dengan HTTPS Otomatis)

Jika Anda menggunakan [`Caddy`](https://caddyserver.com/), penyajian berkas statis berkecepatan tinggi dengan sertifikat SSL otomatis hanya membutuhkan 3 baris pada `/etc/caddy/Caddyfile`:

```caddyfile
subnet.domainanda.com {
    root * /var/www/visualsubnetcalc
    file_server
    encode gzip zstd
}
```

Muat ulang Caddy dengan perintah `sudo systemctl reload caddy`, dan sertifikat SSL Let's Encrypt akan diperoleh secara otomatis!

---

### 🔒 Deployment Produksi: Nginx + Certbot (SSL) + Domain Kustom

Panduan ini mendampingi Anda menerapkan Visual Subnet Calculator di server produksi menggunakan domain kustom (misalnya `subnet.domainanda.com` atau `subnet.alsyundawy.com`) dengan sertifikat SSL/TLS gratis otomatis dari Let's Encrypt serta header keamanan yang diperkeras.

#### Langkah 1: Konfigurasi DNS Domain

Pada panel manajemen DNS domain Anda (Cloudflare, Route53, Niagahoster, Rumahweb, dll.), buat **A Record** (dan secara opsional **AAAA Record** untuk IPv6):

| Jenis Record | Hostname / Subdomain | Target / Nilai               | TTL        |
| :----------- | :------------------- | :--------------------------- | :--------- |
| **A**        | `subnet`             | `IP_PUBLIK_IPV4_SERVER_ANDA` | 300 / Auto |
| **AAAA**     | `subnet`             | `IP_PUBLIK_IPV6_SERVER_ANDA` | 300 / Auto |

Verifikasi propagasi DNS melalui terminal:

```bash
dig +short subnet.domainanda.com
```

#### Langkah 2: Konfigurasi Firewall Sistem (UFW)

Pastikan port lalu lintas HTTP (port 80) dan HTTPS (port 443) diizinkan:

```bash
# Izinkan lalu lintas HTTP dan HTTPS melalui firewall
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'

# Muat ulang firewall untuk menerapkan aturan
sudo ufw reload
```

#### Langkah 3: Konfigurasi Server Block Nginx Produksi

Pilih antara **Pola A (Reverse Proxy ke Kontainer Docker)** atau **Pola B (Penyajian Berkas Statis Langsung)**:

Buat berkas konfigurasi `/etc/nginx/sites-available/visualsubnetcalc.conf`:

```nginx
# /etc/nginx/sites-available/visualsubnetcalc.conf

# 1. Konfigurasi HTTP (Blok awal untuk verifikasi domain & redirect HTTPS)
server {
    listen 80;
    listen [::]:80;
    server_name subnet.domainanda.com;

    # Mengizinkan berkas tantangan ACME Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        try_files $uri =404;
    }

    # Alihkan semua permintaan HTTP ke HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

# 2. Blok Server Produksi HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name subnet.domainanda.com;

    # Lokasi Sertifikat SSL (Dikelola otomatis oleh Certbot pada Langkah 4)
    ssl_certificate /etc/letsencrypt/live/subnet.domainanda.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/subnet.domainanda.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Header Keamanan yang Diperkeras (Standar OWASP)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data:; connect-src 'self';" always;

    # Optimasi Kompresi Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    # ------------------------------------------------------------------------
    # OPSI A: Reverse Proxy ke Kontainer Docker yang berjalan di 127.0.0.1:8080
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
    # OPSI B: Penyajian Berkas Statis Langsung (Gunakan bila TIDAK memakai Docker)
    # ------------------------------------------------------------------------
    # root /var/www/visualsubnetcalc;
    # index index.html;
    # error_page 404 /404.html;
    #
    # location / {
    #     try_files $uri $uri/ /index.html =404;
    # }
    #
    # # Caching agresif untuk aset statis immutable (CSS, JS, Font, Gambar)
    # location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    #     expires 30d;
    #     add_header Cache-Control "public, no-transform";
    # }
}
```

Aktifkan konfigurasi dan uji sintaks:

```bash
# Buat symlink ke sites-enabled
sudo ln -sf /etc/nginx/sites-available/visualsubnetcalc.conf /etc/nginx/sites-enabled/

# Uji keabsahan sintaks Nginx
sudo nginx -t
```

#### Langkah 4: Pasang Certbot & Terbitkan Sertifikat SSL Let's Encrypt

Pasang Certbot beserta plugin Nginx:

```bash
# Pada Ubuntu / Debian:
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

Terbitkan dan pasang sertifikat SSL secara otomatis:

```bash
# Konfigurasi otomatis SSL pada Nginx
sudo certbot --nginx -d subnet.domainanda.com --agree-tos --email admin@domainanda.com --redirect
```

Certbot akan mengambil sertifikat secara otomatis, memperbarui arahan SSL di berkas virtual host, dan memuat ulang Nginx.

#### Langkah 5: Verifikasi Perpanjangan Otomatis Sertifikat SSL

Sertifikat Let's Encrypt berlaku selama 90 hari. Certbot menyertakan timer systemd yang memeriksa dan memperpanjang sertifikat secara otomatis dua kali sehari:

```bash
# Uji proses perpanjangan dengan simulasi dry-run
sudo certbot renew --dry-run

# Periksa status aktif dari timer systemd Certbot
sudo systemctl status certbot.timer
```

#### Langkah 6: Verifikasi Hasil Deployment

Periksa hasil deployment produksi Anda menggunakan utilitas `curl`:

```bash
# Pastikan permintaan HTTP dialihkan ke HTTPS dengan status 301
curl -I http://subnet.domainanda.com

# Pastikan HTTPS menghasilkan HTTP/2 200 OK beserta seluruh header keamanan
curl -I https://subnet.domainanda.com
```

---

## 🛠️ Pengembangan Lokal & Pengujian

### 1. Menjalankan Server Pengembangan

```bash
# Masuk ke direktori src
cd visualsubnetcalc/src

# Pasang dependensi
npm install

# Kompilasi stylesheet SCSS dan bundel aset
npm run build

# Jalankan server pengembangan HTTP pada http://localhost:8080
npm start
```

### 2. Rangkaian Pengujian Otomatis Playwright E2E

Visual Subnet Calculator dilengkapi pengujian menyeluruh berbasis Playwright yang memverifikasi kalkulasi IPv4, presisi 128-bit IPv6, mode cloud, interaksi antarmuka pengguna, serta ekspor/impor CSV/Plain Text/JSON pada peramban Chromium dan Firefox:

```bash
# Jalankan seluruh 114 uji end-to-end pada Chromium dan Firefox
npm test

# Jalankan pengujian dengan antarmuka UI runner
npx playwright test --ui

# Jalankan berkas pengujian spesifik
npx playwright test tests/import-export.spec.ts
```

### 3. HTTPS Lokal dengan Sertifikat Mandiri (Opsional)

_Diperlukan bila ingin memvalidasi Clipboard API peramban (`navigator.clipboard.writeText`) yang menuntut konteks aman (secure context)._

```bash
# Pasang mkcert (contoh pada macOS)
brew install mkcert
mkcert -install

# Buat sertifikat pengembangan lokal
cd src
npm run setup:certs

# Jalankan server dengan protokol HTTPS pada https://localhost:8443
npm run local-secure-start
```

---

## 📊 Jaminan Kualitas & Matriks Verifikasi

Setiap rilis edisi ini melewati pengujian bertingkat yang ketat pada pipeline otomatis:

| Gerbang Kualitas           | Alat / Mesin                           | Cakupan Target                                           | Status                                       |
| :------------------------- | :------------------------------------- | :------------------------------------------------------- | :------------------------------------------- |
| **Linting Komprehensif**   | [`Trunk Check`](https://trunk.io)      | 14 Linter (`prettier`, `yamllint`, `markdownlint`, dll.) | **BERHASIL (68/68 berkas bersih)**           |
| **Validasi Standar HTML5** | `html-validate`                        | Standar native HTML, aksesibilitas & tag semantik        | **BERHASIL (0 galat, 0 peringatan)**         |
| **Pengujian Peramban E2E** | [`Playwright`](https://playwright.dev) | Alur pengguna menyeluruh pada Chromium & Firefox         | **BERHASIL (162/162 pengujian lulus)**       |
| **Pemindaian Keamanan**    | GitHub CodeQL                          | Analisis kerentanan DOM XSS dan alur source-to-sink      | **BERHASIL (0 peringatan keamanan)**         |
| **Kebijakan Kontainer**    | `checkov` & `hadolint`                 | Best practice Dockerfile & konfigurasi CloudFormation    | **BERHASIL (Kepatuhan CIS & Best Practice)** |

---

## 📋 Standar Rekayasa, Praktik Terbaik & Kaidah RFC 2119

### 📑 Ringkasan Eksekutif

Visual Subnet Calculator merupakan mesin perencanaan subnet IP visual tingkat industri di sisi klien yang dirancang untuk keandalan jaringan korporat, topologi cloud (AWS VPC, Azure VNet, OCI), serta arsitektur transisi dual-stack IPv4/IPv6. Untuk memastikan kepatuhan deterministik, pencegahan kebocoran data, dan performa tinggi tanpa latensi, seluruh alur kerja rekayasa mematuhi standar formal berikut.

### 📐 Kriteria Rekayasa RFC 2119 / RFC 8174

Kata kunci **MUST (Wajib)**, **MUST NOT (Dilarang)**, **SHOULD (Sangat Dianjurkan)**, **SHOULD NOT (Sangat Tidak Dianjurkan)**, **MAY (Boleh / Opsional)**, dan **AVOID (Hindari)** dalam dokumen ini ditafsirkan sebagaimana dijelaskan dalam [`BCP 14`](https://datatracker.ietf.org/doc/html/bcp14), [`RFC 2119`](https://datatracker.ietf.org/doc/html/rfc2119), dan [`RFC 8174`](https://datatracker.ietf.org/doc/html/rfc8174).

#### 🔴 MUST (Keharusan Mutlak / Invarian Wajib)

- **MUST Berjalan Penuh di Sisi Klien**: Seluruh kalkulasi pemisahan subnet, penggabungan, konversi format, dan serialisasi status WAJIB dieksekusi secara lokal di dalam runtime peramban klien. Tidak ada data topologi, blok CIDR, maupun catatan pengguna yang boleh dikirimkan ke server eksternal mana pun.
- **MUST Menggunakan Matematika Presisi 128-Bit (`BigInt`) untuk IPv6**: Kalkulasi ruang alamat IPv6 WAJIB memanfaatkan operasi bitwise native JavaScript `BigInt`. Implementasi DILARANG mengonversi integer 128-bit ke tipe floating-point standar JavaScript `Number`.
- **MUST Menerapkan Sanitasi HTML Kontekstual**: Semua masukan catatan pengguna, label, dan konfigurasi impor WAJIB disanitasi menggunakan penyandian entitas karakter (`escapeHtml()`) sebelum disisipkan ke DOM guna menangkal serangan Cross-Site Scripting (XSS).
- **MUST Mengisolasi Dialog Modal Peringatan dengan Teks Node Aman**: Peringatan koreksi batas jaringan dinamis WAJIB mengikat data menggunakan simpul teks aman (`.text()`), meniadakan potensi celah DOM XSS (menyelesaikan GitHub CodeQL Alert #5).
- **MUST Mematuhi Pemformatan CSV Standar RFC 4180**: Serialisasi CSV WAJIB mengapit setiap kolom dengan tanda kutip ganda serta melakukan _escape_ tanda kutip internal menjadi `""` guna menjamin kompatibilitas pembacaan aplikasi pengolah angka.
- **MUST Menyediakan Label Formulir yang Aksesibel**: Setiap kontrol interaktif, termasuk input berkas tersembunyi (`#importFileInput`), WAJIB diasosiasikan dengan elemen `<label>` semantik dan atribut `title` deskriptif yang memenuhi standar WCAG 2.2 Level AA.
- **MUST Menjalankan Kontainer sebagai Pengguna Tanpa Hak Root**: Lingkungan produksi Docker WAJIB berjalan di bawah konteks pengguna unprivileged numerik (`USER 101` pada `nginxinc/nginx-unprivileged`).

#### 🟡 SHOULD (Sangat Dianjurkan / Praktik Standar)

- **SHOULD Menggunakan Kompresi LZ-String untuk Berbagi URL**: Perancang jaringan SANGAT DIANJURKAN menyerialisasi dan mendistribusikan topologi melalui hash fragmen URL LZ-String (`#?c=...`) guna memfasilitasi kolaborasi instan tanpa dependensi database.
- **SHOULD Menegakkan HTTPS Produksi dengan HSTS**: Deployment server produksi SANGAT DIANJURKAN mengonfigurasi protokol TLSv1.2/v1.3, pembaruan otomatis sertifikat Let's Encrypt (Certbot), serta header HSTS berdurasi minimal 1 tahun (`max-age=31536000; includeSubDomains; preload`).
- **SHOULD Memasang Probe Healthcheck pada Kontainer**: Implementasi Docker SANGAT DIANJURKAN mendeklarasikan probe HTTP healthcheck aktif (`wget --spider http://127.0.0.1:8080/`) guna mendukung pemulihan otomatis layanan.
- **SHOULD Menerapkan Pewarnaan Berbasis Tingkatan**: Arsitek SANGAT DIANJURKAN membagi infrastruktur multi-tier (seperti DMZ, Web, Aplikasi, Basis Data, Manajemen) menggunakan palet warna pastel yang berbeda guna mempercepat audit visual.
- **SHOULD Menjaga Kompatibilitas Mundur Skema JSON**: Ekspor konfigurasi baru SANGAT DIANJURKAN mempertahankan urutan kunci lama agar kompatibel dengan sistem parser terdahulu.

#### 🟢 MAY (Boleh / Opsi Tambahan)

- **MAY Mengekspor ke Format Plain Text Terformat**: Pengguna BOLEH mengunduh atau menyalin tabel ASCII monospace untuk disertakan langsung dalam pull request Git, dokumen RFC, atau catatan teknis markdown.
- **MAY Memanfaatkan Python 3 atau Caddy untuk Deployment Cepat**: Tim operasional BOLEH menggunakan server HTTP bawaan Python untuk pengujian lokal cepat tanpa instalasi ekstra, atau Caddy untuk penyediaan HTTPS otomatis.
- **MAY Mengalokasikan Subnet hingga /127 untuk Tautan Point-to-Point**: Insinyur jaringan BOLEH memecah alokasi IPv6 hingga tingkat `/127` khusus untuk kebutuhan tautan router point-to-point sesuai RFC 6164.

#### ⛔ AVOID (Pantangan Keras / Anti-Pattern)

- **AVOID Gaya Inline HTML**: Pengembang DILARANG menambahkan atribut inline `style="..."`; seluruh presentasi visual WAJIB mengacu pada kelas CSS terlingkup di `dist/css/main.css`.
- **AVOID Aritmetika Floating-Point pada IPv6**: Pengembang DILARANG melakukan manipulasi bit atau penggeseran bit IPv6 menggunakan tipe `Number` standar JavaScript.
- **AVOID Sink `innerHTML` atau `.html()` Tanpa Sanitasi**: Jangan pernah mengalirkan nilai dari parameter URL, berkas JSON, atau elemen DOM secara langsung ke dalam parser HTML.
- **AVOID Pemecahan Subnet di Bawah /64 untuk SLAAC**: Pengguna dan skrip otomasi DILARANG memecah jaringan lokal SLAAC standar melebihi `/64` tanpa justifikasi arsitektur khusus (RFC 7421).
- **AVOID Polusi Selektor CSS Global**: Aturan styling DILARANG menargetkan tag elemen HTML dasar tanpa batasan ruang lingkup (seperti `input` atau `label` polos) yang berpotensi merusak tata letak navbar atau modal.

---

### 🏆 Praktik Terbaik Rekayasa Jaringan & Arsitektur

1. **Perencanaan IP Berbasis Hierarki**:
   - Mulailah dari alokasi blok induk yang realistis (misalnya IPv4 `/16` atau IPv6 `/32`–`/48`).
   - Bagilah alokasi secara hierarkis mengikuti batas operasional (Availability Zone, subnet VPC, atau perimeter keamanan), bukan semata-mata angka acak.
2. **Kewaspadaan Reservasi Vendor Cloud**:
   - Selalu aktifkan mode cloud spesifik (**AWS VPC**, **Azure VNet**, atau **Oracle Cloud OCI**) saat mendesain topologi cloud untuk mencegah kesalahan konfigurasi akibat alamat yang dicadangkan vendor (seperti AWS yang mencadangkan `.0`, `.1`, `.2`, `.3`, dan `.255`).
3. **Penyajian Web Berlapis (Defense-in-Depth)**:
   - Pasangkan kontainer reverse proxy dengan server Nginx host yang diperkeras, mengaktifkan pengalihan HTTP-ke-HTTPS otomatis, kompresi Gzip/Brotli, serta caching aset statis immutable (`Cache-Control: public, no-transform; max-age=2592000`).
4. **Kesiapan Jaringan Terisolasi (Air-Gapped & Offline)**:
   - Karena seluruh aset (Bootstrap, jQuery, Font Awesome, LZ-String) telah dibundel secara lokal dengan hash Subresource Integrity, pastikan lingkungan terisolasi dapat menjalankan kalkulator secara mandiri tanpa membutuhkan akses internet publik.

---

## 📚 Dokumentasi & Catatan Rekayasa

Dokumentasi teknis komprehensif, spesifikasi arsitektur, pertimbangan keamanan, dan panduan integrasi sistem dipelihara di **[`DOCNOTE-ID.md`](DOCNOTE-ID.md)**. Topik utama mencakup:

- **Arsitektur Inti**: Rincian Struktur (`dist/index.html`), Presentasi (`dist/css/main.css`), Logika (`dist/js/main.js`), dan Profil Subnet Cloud.
- **Matriks Dependensi & Hash Kriptografis SRI**: Tabel verifikasi lengkap Subresource Integrity SHA384 untuk Bootstrap 5.3.8, jQuery 3.7.1, jQuery Validate 1.21.0, dan LZ-String 1.5.0.
- **Mesin Impor & Ekspor Multi-Format**: Model data, serialisasi CSV RFC 4180, tabel Plain Text ASCII, serta algoritma perhitungan supernet minimal ($32 - \lfloor \log_2(\text{xor}) + 1 \rfloor$).
- **Rekayasa Performa**: Masker bitwise $O(1)$ waktu-konstan dan modernisasi kode ES6+.
- **Silsilah Evolusi Proyek**: Kronologi arsitektur lintas generasi dari konsep awal Perl CGI (`davidc/subnets`), modernisasi Bootstrap (`ckabalan/visualsubnetcalc`), hingga edisi produksi ALSYUNDAWY (`alsyundawy/visualsubnetcalc`).
- **Integrasi Infrastruktur ALSYUNDAWY**: Panduan integrasi alokasi subnet ke dalam sistem Netplan Linux, alat diagnostik Ping/MTR, administrasi DNS PTR, audit keamanan Nmap, serta isolasi akses zero-trust Nginx.
- **Model Keamanan & Privasi**: Jaminan eksekusi 100% sisi klien tanpa kebocoran data jaringan dan panduan Content Security Policy (CSP).

👉 **Baca spesifikasi teknis selengkapnya**: **[`DOCNOTE-ID.md`](DOCNOTE-ID.md)**

---

## 📜 Riwayat Versi & Catatan Perubahan

Setiap rilis, perbaikan keamanan, peningkatan aksesibilitas, dan pembaruan kerangka kerja didokumentasikan dalam **[`CHANGELOG-ID.md`](CHANGELOG-ID.md)** mengikuti format [`Keep a Changelog`](https://keepachangelog.com/en/1.1.0/) dan prinsip [`Semantic Versioning`](https://semver.org/spec/v2.0.0.html).

### Ringkasan Rilis Terkini

- **[`v1.4.3 (Rilis Terkini)`](CHANGELOG-ID.md#143---2026-09-17)**:
  - 🔄 **Tombol Reset Perhitungan Subnet Instan (`#btn_reset`)**: Pemulihan satu klik kembali ke kondisi default (`10.0.0.0/16` untuk IPv4, `2001:db8::/32` untuk IPv6, mode Standard), menetralisir status validasi formulir jQuery, mereset preset aktif dan indikator RFC 1918, merender ulang tabel, serta menyinkronkan parameter URL secara instan.
  - 🎨 **Standar Palet Warna Pastel 2026**: Memperbarui tampilan tombol kontrol dengan standar palet pastel modern 2026: Tombol Tools Hijau Pastel (`.btn-pastel-green`) dan Tombol Reset Merah Pastel (`.btn-pastel-red`), direkayasa dengan kontras tinggi standar WCAG AAA pada mode terang maupun gelap.
  - ⬆️ **Tombol Melayang Kembali ke Atas (`#btn_scroll_top`)**: Tombol navigasi melayang berbentuk sirkular dengan pemantauan scroll ganda (> 120px) dan smooth scrolling, diperkuat siklus hidup DOM-nya untuk menjamin kemunculan tombol baik pada IPv4 maupun pemecahan mendalam IPv6.
  - 🛡️ **Pengerasan Kondisi Balapan Penutupan Modal Bootstrap 5**: Menghilangkan kegagalan penutupan modal saat animasi fade-in pembukaan berlangsung melalui flag `_pendingDismiss` berlingkup node DOM modal, mencegah penutupan prematur pada pembukaan modal selanjutnya.
  - 🌙 **Default Mode Gelap (Dark Mode) saat Pertama Dibuka**: Mengatur tema awal menjadi Mode Gelap secara default pada kunjungan pertama dengan skrip anti-FOUC langsung di `<head>`.
  - 🌐 **100% Lokalisasi Kode & UI Bahasa Inggris**: Memastikan seluruh kode produksi, HTML, CSS, JavaScript, atribut ARIA, label, tooltip, modal, badge, dan pengujian sepenuhnya berbahasa Inggris.
  - ☁️ **Mode Reservasi Subnet VPC Google Cloud (GCP)**: Integrasi profil reservasi cloud GCP pada menu Tools (`#dropdown_gcp`) yang mencadangkan 4 alamat IP per subnet (`network + 0` ID Jaringan, `network + 1` Gateway Default, `broadcast - 1` dicadangkan masa depan, dan `broadcast - 0` Broadcast Jaringan). Menegakkan batas ukuran subnet minimum `/29` serta rentang IP yang dapat digunakan secara deterministik (`network + 2` hingga `last_address - 2`).
  - 🌐 **Progresi Tingkatan IPv6 Hierarkis & Batas Keamanan**: Penyempurnaan dan optimasi fungsi `getNextIpv6Tier()` dan `splitIpv6Network()` dengan jaminan memori terbatas $O(1)$ dan pembagian subnet yang sepenuhnya aman. Menerapkan transisi nibble bersih (+4 bit) di seluruh tingkatan korporasi, cabang, dan mikro-segmentasi, menjaga `/64` sebagai batas daun SLAAC permanen (RFC 4291 / RFC 7421), serta mendukung sub-delegasi point-to-point granular (`/112 -> /120 -> /124 -> /127 -> /128`).
  - 🔢 **Perbaikan Aritmatika Kapasitas IPv6**: Memperbaiki pembagi kuadriliun pada `getIpv6Capacity()` dari `10^18` menjadi `10^15`.
  - 🛡️ **Pengerasan Injeksi CSS & Keamanan Tipe**: Validasi regex ketat warna latar tabel via `sanitizeColor()`, serta penguatan penanganan tipe pada `escapeHtml()`.
  - 🧪 **Ekspansi Rangkaian Uji E2E**: 162 uji otomatis Playwright yang sepenuhnya lulus pada Chromium dan Firefox.
- **[`v1.4.2`](CHANGELOG-ID.md#142---2026-09-16)**:
  - 📦 **Mesin Impor & Ekspor Multi-Format**: Dukungan pertukaran data untuk spreadsheet CSV standar RFC 4180, tabel Plain Text ASCII rata kolom, serta konfigurasi hierarkis JSON dengan tombol pengalih format satu-klik (`#btn_format_json`, `#btn_format_csv`, `#btn_format_txt`).
  - 💾 **Unduh & Unggah Berkas Sisi Klien**: Pembuatan objek `Blob` di memori untuk pengunduhan berkas langsung (`#btn_download_export`) dan pembacaan berkas lokal via HTML5 `FileReader` (`#btn_upload_file`, `#importFileInput`) untuk berkas `.json`, `.csv`, dan `.txt`.
  - 📋 **Salin Cepat ke Clipboard**: Tombol salin (`#btn_copy_export`) dengan umpan balik visual transien "Copied!".
  - ⚡ **Optimasi Masker Bitwise Waktu-Konstan $O(1)$**: Fungsi kalkulasi alamat dasar IPv4 `get_network()` dioptimalkan dari perulangan iteratif menjadi masker bitwise instan (`(0xffffffff << (32 - netSize)) >>> 0`).
  - 🌐 **Mesin Subnetting Dual-Stack IPv4 & IPv6**: Beralih mulus antara IPv4 dan IPv6 melalui tombol segmen toolbar `#ip_version_toolbar` yang aksesibel.
  - ⚡ **Toolbar Preset Prefiks IPv4**: Pemilihan cepat ukuran CIDR dari `/16` hingga `/32` (17 preset) dengan sinkronisasi dua arah dan penataan chip responsif (`#ipv4_tier_info`). Default: `/16` (`10.0.0.0/16`).
  - 🎯 **Toolbar Preset Prefiks IPv6**: 12 preset tingkatan dari `/32` (default), `/48`, `/56`, `/60`, `/64`, `/80`, `/96`, `/112`, `/120`, `/124`, `/127`, hingga `/128` dengan sinkronisasi dua arah ke kolom input panjang prefiks (`#ipv6_tier_info`).
  - 🔢 **Matematika Presisi 128-Bit (`BigInt`)**: Perhitungan presisi untuk IPv6 tanpa batasan _floating-point_, disertai pemformatan kanonikal RFC 5952.
  - ⚡ **Tautan Point-to-Point Antar-Router RFC 6164**: Dukungan langsung untuk subnet `/127` yang terbagi menjadi dua subnet host `/128`, serta proteksi pemecahan daun `/128`.
  - 🛡️ **Perlindungan Batas SLAAC**: Menetapkan subnet `/64` sebagai daun permanen yang tidak dapat dipecah disertai dialog modal edukatif.
  - 🎨 **Modernisasi Tata Letak Header**: Merestrukturisasi bilah navigasi menggunakan flexbox semantik `<header id="app_header">` dengan ikon merek Font Awesome `fa-network-wired`.
  - 📖 **Akordion FAQ Interaktif**: 10 topik arsitektur terlipat rapi dengan tombol kendali "Expand All" dan "Collapse All".
  - 📱 **Paritas Viewport Responsif**: Penataan gaya khusus `#calc.ipv6-mode` dan sinkronisasi visibilitas header kolom tabel pada layar ponsel `< 576px`.
  - 🧪 **Pengujian Otomatis Komprehensif**: 114 uji otomatis Playwright E2E yang seluruhnya lulus pada Chromium dan Firefox.
- **[`v1.4.1`](CHANGELOG-ID.md#141---2026-09-16)**:
  - 🛡️ **Keamanan**: Perbaikan CodeQL Alert #5 (`js/xss-through-dom`) melalui penyisipan teks node `.text()` pada modal peringatan batas; sanitasi entitas HTML kontekstual (`escapeHtml()`) pada seluruh dekoder URL dan impor JSON.
  - ♿ **Aksesibilitas**: Kepatuhan WCAG 2.2 Level AA; penambahan atribut unik `id` dan `name` untuk autofill peramban; pemicu form WCAG H32 `<button type="submit">`; keterangan tabel semantik `<caption class="visually-hidden">`; navigasi keyboard palet warna.
  - 📱 **Desain Responsif**: Media queries CSS modular dari VGA (640×480), smartphone, tablet, hingga layar 2K (2560px).
  - 🔍 **Standar SEO & Web**: Data terstruktur Schema.org JSON-LD `WebApplication`, kartu Open Graph, dan validasi 100% `html-validate`.
  - ⚡ **Dependensi**: Pembaruan ke Bootstrap 5.3.8 (verifikasi SRI) dan Playwright 1.63.0.
- **[`v1.4.0`](CHANGELOG-ID.md#140---2026-09-15)**:
  - ☁️ Kalkulasi IP yang dapat digunakan untuk profil cloud AWS VPC, Azure VNet, dan Oracle Cloud (OCI).
  - 🔗 Berbagi URL terkompresi dengan LZ-String; impor/ekspor konfigurasi JSON.
- **v1.3.x & Sebelumnya**:
  - Model dasar pohon visual tabel subnet, mesin interaktif split/join, dan kontainerisasi Docker.

👉 **Telusuri catatan perubahan selengkapnya**: **[`CHANGELOG-ID.md`](CHANGELOG-ID.md)**

---

## 🤝 Kredit & Penulis Asli

Visual Subnet Calculator dibangun atas semangat kolaborasi komunitas sumber terbuka. Apresiasi tulus disampaikan kepada:

- 👤 **Caesar Kabalan ([`@ckabalan`](https://github.com/ckabalan))** — _Pencipta Asli & Arsitek Utama Visual Subnet Calculator._ Merancang implementasi web modern pertama, model pohon UI interaktif, profil mode cloud, serta pengemasan kontainer Docker awal.
- 👤 **Florian M. ([`@bl4ckfir3`](https://github.com/bl4ckfir3))** — _Kontributor Fitur Inti._ Merancang dan mengontribusikan aturan kalkulasi subnet Oracle Cloud Infrastructure (OCI) ([`PR #30`](https://github.com/ckabalan/visualsubnetcalc/pull/30)).
- 👤 **David C ([`@davidc`](https://github.com/davidc))** — _Pelopor Konsep Visual Subnetting._ Menciptakan konsep pemisahan visual subnet sumber terbuka awal ([`davidc/subnets`](https://github.com/davidc/subnets)) yang menjadi inspirasi lahirnya aplikasi modern ini.
- 👤 **HARRY DERTIN SUTISNA ([`@alsyundawy`](https://github.com/alsyundawy))** — _Pengelola Edisi Modern & Diperkeras._ Memimpin pengerasan keamanan (remediasi CodeQL DOM XSS), kepatuhan aksesibilitas WCAG 2.2 AA, penskalaan responsif universal (VGA ke 2K), arsitektur dual-stack IPv4/IPv6, mesin impor/ekspor multi-format, optimasi masker bitwise $O(1)$, data terstruktur SEO, pembaruan dependensi modern, dan rekayasa rilis untuk versi `v1.4.3+`.
- 🎨 **Ikonografi**: Ikon split dirancang oleh [`Freepik`](https://www.flaticon.com/authors/freepik) dari [`Flaticon`](https://www.flaticon.com/), serta [`Font Awesome Free`](https://fontawesome.com/) oleh Fonticons, Inc.

---

## 📬 Pengelola & Kontak

Untuk pertanyaan, usulan fitur, pelaporan keamanan, atau kerja sama teknis:

- **Pengelola Utama & Rekayasa**: **HARRY DERTIN SUTISNA** — [`ALSYUNDAWY IT SOLUTION`](https://alsyundawy.com)
- **Situs Web Resmi**: [`https://alsyundawy.com`](https://alsyundawy.com) (ALSYUNDAWY IT SOLUTION)
- **Profil GitHub**: [`https://github.com/alsyundawy`](https://github.com/alsyundawy)
- **X (Twitter)**: [`@alsyundawy`](https://x.com/alsyundawy)
- **Telegram**: [`@alsyundawy`](https://t.me/alsyundawy)
- **Surel (Email)**: [`alsyundawy@gmail.com`](mailto:alsyundawy@gmail.com)
- **Repositori Proyek**: [`https://github.com/alsyundawy/visualsubnetcalc`](https://github.com/alsyundawy/visualsubnetcalc)
- **Dukungan / Donasi**: [`Donasi PayPal`](https://paypal.me/alsyundawy)

---

## 💖 Dukungan & Donasi

Jika **Visual Subnet Calculator** telah membantu Anda merancang, mengoptimalkan, atau menyelesaikan masalah arsitektur jaringan Anda, pertimbangkan untuk mendukung pemeliharaan berkelanjutan, audit keamanan, dan infrastruktur hosting:

### 💳 Dukungan Internasional: PayPal

[![Donasi dengan PayPal](https://img.shields.io/badge/Donate-PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.me/alsyundawy)

- **Tautan PayPal**: [`https://www.paypal.me/alsyundawy`](https://www.paypal.me/alsyundawy)

### 🇮🇩 Dukungan Indonesia & Regional: QRIS (Quick Response Code Indonesian Standard)

Pindai barcode QRIS di bawah ini menggunakan aplikasi perbankan seluler Indonesia mana pun (BCA, Mandiri, BRI, BNI, BSI, CIMB Niaga, Permata) atau dompet digital / e-wallet (GoPay, OVO, DANA, LinkAja, ShopeePay):

![Barcode Donasi QRIS - ALSYUNDAWY](https://github.com/user-attachments/assets/a0126f28-6dde-43da-ba14-d7c9a27de0df)

- **Nama Merchant / Akun**: **ALSYUNDAWY**
- **NMID**: **`ID1020021153676`**
- **Tautan Langsung Gambar Barcode**: [`https://github.com/user-attachments/assets/a0126f28-6dde-43da-ba14-d7c9a27de0df`](https://github.com/user-attachments/assets/a0126f28-6dde-43da-ba14-d7c9a27de0df)
- **Konfirmasi Langsung via WhatsApp**: [`https://wa.me/6285658515212`](https://wa.me/6285658515212) (`+62 856-5851-5212`)

Kemurahan hati Anda secara langsung mendukung pengembangan sumber terbuka, pengerasan keamanan, dan penyediaan alat bantu terbaik bagi komunitas insinyur jaringan.

---

## 📄 Lisensi

Visual Subnet Calculator dilisensikan di bawah [`Lisensi MIT`](https://opensource.org/licenses/MIT).
Anda bebas untuk menggunakan, memodifikasi, dan mendistribusikannya untuk keperluan pribadi maupun alur kerja rekayasa jaringan perusahaan.
