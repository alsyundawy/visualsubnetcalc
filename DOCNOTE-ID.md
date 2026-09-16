# Catatan Dokumentasi Teknis — Visual Subnet Calculator

Spesifikasi arsitektur teknis, standar keamanan, dan panduan integrasi operasional untuk Visual Subnet Calculator v1.4.3.

---

## 🧭 Ikhtisar Arsitektur

Visual Subnet Calculator adalah aplikasi visual kalkulator dan perancang subnet IP di sisi klien (_client-side_) yang dirancang untuk memberikan performa tinggi, latensi eksekusi nol, serta kompatibilitas lintas peramban yang maksimal. Dimulai sejak versi 1.4.2, aplikasi menghadirkan arsitektur _dual-stack_ terpadu yang mendukung perencanaan visual IPv4 legasi (CIDR 32-bit) dan IPv6 modern (hierarki tingkatan 128-bit). Versi 1.4.3 memperkuat lapisan keamanan CSS dan memperbaiki presisi tampilan kapasitas IPv6 skala besar.

### Lapisan Arsitektur Utama

- **Struktur (`dist/index.html`)**: Markup semantik HTML5 yang dibangun dengan sistem kisi (_grid_) Bootstrap 5.3.8, toolbar pemilihan versi IP tersegmen dan aksesibel (`#ip_version_toolbar`), kontainer tabel responsif, dialog modal aksesibel, serta anotasi ARIA yang mematuhi pedoman WCAG 2.2 Level AA. Bersih seutuhnya dari atribut gaya inline (`style="..."`).
- **Presentasi (`dist/css/main.css`)**: CSS modern yang memanfaatkan aturan ruang lingkup (_scoped rules_), media queries responsif dari resolusi VGA (640×480) hingga 2K (2560×1440), cincin fokus aksesibel `:focus-visible`, awalan vendor `-webkit-user-select` untuk Safari, mode tata letak khusus IPv6 (`#calc.ipv6-mode`), serta bebas dari polusi selektor global.
- **Logika (`dist/js/main.js`)**: JavaScript vanilla murni berstandar modern yang dipadukan dengan utilitas DOM jQuery 3.7.1 dan komponen Bootstrap 5.3.8, mengimplementasikan matematika bitwise 32-bit (IPv4) dan bitwise native 128-bit `BigInt` (IPv6), rekursi pohon subnet hierarkis, serialisasi status LZ-String, serta sanitasi XSS kontekstual.
- **Profil Cloud**: Preset bawaan vendor cloud terkemuka yang menyesuaikan perhitungan alamat IP yang dapat digunakan (_usable IPs_) mengikuti aturan standar RFC 1918/RFC 4632 atau reservasi khusus penyedia layanan cloud (AWS mencadangkan 5 alamat IP, Azure mencadangkan 5 alamat IP, GCP mencadangkan 4 alamat IP, OCI mencadangkan 3 alamat IP).

---

## Mesin Subnetting Dual-Stack IPv4 & IPv6

### 1. Arsitektur Toolbar Preset IPv4 (`#ipv4_tier_info`)

Visual Subnet Calculator menyediakan bilah alat preset responsif dan aksesibel untuk pemilihan cepat ukuran jaringan IPv4 dari `/16` hingga `/32` (17 preset berbeda):

- **Sinkronisasi Dua Arah**: Mengklik tombol preset mana pun akan secara instan memperbarui kolom input `#netsize`, menghitung ulang batas jaringan dasar bila diperlukan, me-render ulang pohon subnet visual, dan menandai tombol terpilih dengan kelas CSS `.active`. Sebaliknya, pengetikan manual atau penempelan teks (_paste_) pada `#netsize` secara otomatis mendeteksi ukuran prefiks dan menyinkronkan status tombol aktif.
- **Status Bawaan**: Terinisialisasi pada `10.0.0.0/16` dengan tombol preset `/16` dalam kondisi aktif.
- **Tata Letak Chip Responsif**: Tombol-tombol preset menggunakan `flex-wrap: wrap`, padding yang kompak (`py-0 px-2`), dan batas chip independen (`border-radius: 0.2rem !important;`), memastikan seluruh 17 tombol terbungkus rapi tanpa merusak batas tata letak pada layar sempit (VGA 640px, smartphone).

### 2. Presisi Matematika 128-Bit (`BigInt`)

Alamat IPv6 membentang sepanjang 128 bit, melampaui ambang batas representasi integer aman pada IEEE 754 JavaScript (`Number.MAX_SAFE_INTEGER` = $2^{53} - 1$). Visual Subnet Calculator mengimplementasikan aritmetika bitwise tak bertanda 128-bit tanpa kehilangan presisi (_lossless_) melalui fitur native JavaScript `BigInt`:

- **Penguraian Alamat (`parseIpv6`)**: Memperluas pemampatan titik dua ganda (`::`), memvalidasi hextet 16-bit, dan menghitung nilai integer 128-bit secara presisi:
  $$\text{netInt} = \sum_{i=0}^{7} \text{hextet}_i \times 2^{(7-i) \times 16}$$
- **Isolasi Masker Bitwise & Jaringan (`getIpv6Network`)**: Menghasilkan alamat dasar jaringan kanonikal melalui operasi masker bitwise:
  $$\text{mask} = ((1 \ll 128) - 1) \oplus ((1 \ll (128 - \text{prefiks})) - 1)$$
  $$\text{baseInt} = \text{ipInt} \ \& \ \text{mask}$$
- **Perhitungan Rentang (`getIpv6End`)**: Menghitung akhir blok prefiks tanpa adanya potensi _overflow_ numerik:
  $$\text{endInt} = \text{baseInt} + (1 \ll (128 - \text{prefiks})) - 1$$

### 3. Representasi Kanonikal RFC 5952 (`formatIpv6`)

Format keluaran IPv6 mematuhi rekomendasi standar IETF RFC 5952 secara ketat:

- Angka nol di awal (_leading zeros_) pada bidang 16-bit ditekan/dihilangkan (misalnya `2001:0db8` menjadi `2001:db8`).
- Urutan hextet nol berurutan terpanjang (dua atau lebih) digantikan dengan `::`. Jika terdapat beberapa urutan nol dengan panjang yang sama, urutan pertamalah yang dikompresi.
- Digit heksadesimal ditampilkan sepenuhnya dalam huruf kecil (_lowercase_).
- Hextet nol tunggal tidak pernah dikompresi menggunakan `::` (misalnya `2001:db8:0:1::/64`).

### 4. Arsitektur Tingkatan Hierarkis IPv6

Pemisahan biner tradisional ala IPv4 (/N -> /N+1) tidak praktis untuk IPv6 karena luasnya ruang alamat $2^{128}$. Visual Subnet Calculator mematuhi tingkatan alokasi rekayasa jaringan standar:

$$\text{/32 (ISP/LIR)} \longrightarrow \text{/48 (Situs Korporat)} \longrightarrow \text{/56 (Kantor Cabang/VPC)} \longrightarrow \text{/60 (Departemen)} \longrightarrow \text{/64 (SLAAC)} \quad\Big|\quad \text{/127 (P2P)} \longrightarrow \text{/128 (Host)}$$

| Prefiks Tingkatan  | Langkah Bit | Faktor Pengali Subnet                  | Cakupan Tipikal & Peran Arsitektur                                  |
| :----------------- | :---------- | :------------------------------------- | :------------------------------------------------------------------ |
| **/32** _(Bawaan)_ | $+4$ bit    | $16 \times /36$ ($65.536 \times /48$)  | Alokasi Regional Internet Registry (RIR) ke ISP / Korporasi Besar   |
| **/48**            | $+8$ bit    | $256 \times /56$ ($65.536 \times /64$) | Penugasan ISP ke Situs Korporat / Pusat Data Perusahaan             |
| **/56**            | $+4$ bit    | $16 \times /60$ ($256 \times /64$)     | Penugasan Korporat ke Kantor Cabang / Kampus / Multi-VPC            |
| **/60**            | $+4$ bit    | $16 \times /64$ subnet                 | Penugasan Cabang ke Kantor Kecil / VLAN Departemen                  |
| **/64**            | Daun / Sub  | Subnet Daun Standar                    | Tautan Lokal / VLAN (SLAAC & Interface ID) — Modal Panduan Edukatif |
| **/80**            | $+16$ bit   | $65.536 \times /96$ subnet             | Batas Mikro-segmentasi / Layanan Cloud                              |
| **/96**            | $+16$ bit   | $65.536 \times /112$ subnet            | Translasi IPv4-ke-IPv6 / Alamat Tersemat IPv4 (RFC 6052)            |
| **/112**           | $+8$ bit    | $256 \times /120$ subnet               | Klaster Perangkat Terisolasi / Sub-delegasi Khusus                  |
| **/120**           | $+4$ bit    | $16 \times /124$ subnet                | Sub-delegasi Jaringan Industri & Sensor IoT                         |
| **/124**           | $+3$ bit    | $8 \times /127$ subnet                 | Sub-delegasi Kelompok Kecil Antar-Router                            |
| **/127**           | $+1$ bit    | $2 \times /128$ subnet                 | Tautan Antar-Router Point-to-Point (Standar RFC 6164)               |
| **/128**           | Daun        | Daun Host Tunggal / Loopback           | Antarmuka Loopback / Alamat Host Tunggal (Standar RFC 4291)         |

### 5. Perlindungan Batas SLAAC & Host (RFC 4291 / RFC 7421 / RFC 6164)

Sesuai ketentuan RFC 4291 Bagian 2.5.4 dan RFC 7421, semua subnet unicast IPv6 standar dengan Stateless Address Autoconfiguration (SLAAC) memerlukan Interface Identifier (IID) sepanjang 64-bit. Subnet yang lebih kecil dari `/64` (misalnya `/65`, `/112`, `/127`) mematahkan mekanisme SLAAC dan umumnya hanya ditujukan bagi tautan point-to-point khusus:

- **Perlindungan Batas SLAAC**: Visual Subnet Calculator menetapkan `/64` sebagai prefiks daun standar (`.split-disabled`). Mengklik daun `/64` akan memicu modal edukatif (`#notifyModal`) yang menjelaskan batasan arsitektur RFC 7421 dan RFC 4291 tanpa menimbulkan status galat pada aplikasi.
- **Tautan Point-to-Point Antar-Router (RFC 6164)**: Pengguna dapat langsung memilih `/127` dari toolbar preset atau memasukkannya ke input. Subnet `/127` menyediakan 2 alamat IP dan terbagi secara bersih menjadi dua subnet host `/128`.
- **Perlindungan Batas Host / Loopback**: `/128` merepresentasikan alamat host tunggal atau antarmuka loopback (RFC 4291) dan ditetapkan sebagai simpul daun permanen (`.split-disabled`) yang mencegah pembagian lebih lanjut.

---

## Matriks Dependensi & Hash Kriptografis SRI

| Komponen           | Versi  | Integritas (SRI SHA384)                                                   | Tujuan Fungsi               |
| :----------------- | :----- | :------------------------------------------------------------------------ | :-------------------------- |
| Bootstrap Bundle   | 5.3.8  | `sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI` | Kerangka UI & Modal         |
| jQuery             | 3.7.1  | `sha384-1H217gwSVyLSIfaLxHbE7dRb3v4mYCKbpQvzx0cegeju1MVsGrX5xXxAvs/HgeFs` | Manipulasi DOM & Event      |
| jQuery Validate    | 1.21.0 | `sha384-INLNT6YPpjCRFM2xpOexEE3T4i2mIigf+Kr19b7a59RFtrVBZQzZWXkGuiMA/q1r` | Validasi Formulir Input     |
| Additional Methods | 1.21.0 | `sha384-YJxXUyJ0BogsbWMDJj4h3uJVyImZsAI6qh7MG2LGgxMstOXB8G1mNwaRuL4A6VYb` | Metode Validasi Tambahan    |
| LZ-String          | 1.5.0  | Vendored (`dist/js/lz-string.min.js`)                                     | Kompresi Status pada URL    |
| Font Awesome Free  | 7.3.1  | Vendored (`dist/css/fontawesome.min.css`, `dist/webfonts/`)               | Ikonografi Antarmuka Vektor |

---

## Evolusi & Perbandingan Lintas Generasi

### 1. Fondasi Awal (`davidc/subnets`)

- Konsep awal berbasis skrip Perl CGI dan halaman statis yang dirancang oleh David C.
- Memperkenalkan konsep visualisasi pemisahan alamat biner dalam bentuk sel tabel HTML bersarang.
- Terbatas pada kalkulasi statis IPv4 tanpa preservasi status dinamis di sisi klien, tanpa URL sharing, tanpa profil cloud, dan tanpa dukungan perangkat bergerak.

### 2. Modernisasi Awal (`ckabalan/visualsubnetcalc`)

- Penulisan ulang total berbasis JavaScript modern sisi klien, jQuery, dan Bootstrap oleh Caesar Kabalan.
- Memperkenalkan fitur berbagi URL terkompresi dengan LZ-String guna menyerialisasi struktur pohon subnet ke dalam parameter kueri (`?c=...`).
- Menambahkan kalkulasi reservasi IP khusus cloud untuk profil AWS, Azure, dan Oracle Cloud Infrastructure (OCI).
- Mengimplementasikan fitur ekspor/impor dasar dalam format JSON.

### 3. Edisi Produksi ALSYUNDAWY (`alsyundawy/visualsubnetcalc`)

#### v1.4.3 (Arsitektur Rilis Terkini) — 2026-09-17

- **Mode Reservasi Google Cloud (GCP) VPC**: Mengintegrasikan profil cloud GCP VPC yang mereservasi 4 alamat IP per subnet (`network + 0` ID Jaringan, `network + 1` Default Gateway, `broadcast - 1` cadangan masa depan Google, dan `broadcast - 0` Broadcast Jaringan) dengan batas minimum subnet `/29`, melengkapi paritas hyperscaler cloud antara AWS, Azure, GCP, dan OCI.
- **Penyempurnaan Progresi Tingkatan IPv6 Hirarkis & Batas Keamanan**: Mengoptimalkan fungsi `getNextIpv6Tier()` dan `splitIpv6Network()` dengan alokasi memori berbatas $O(1)$, transisi berbasis nibble (+4 bit), perlindungan leaf SLAAC `/64` (RFC 4291 / RFC 7421), serta alur sub-delegasi point-to-point granular (`/112 -> /120 -> /124 -> /127 -> /128`).
- **Perbaikan Aritmetika Kapasitas IPv6**: Memperbaiki bug pembagi satuan _quadrillion_ (Q) pada `getIpv6Capacity()` dari $10^{18}$ (_quintillion_) menjadi $10^{15}$ (_quadrillion_), memulihkan keakuratan tampilan kapasitas blok besar (`/0` hingga `/16`).
- **Pengerasan Terhadap Injeksi CSS**: Memvalidasi atribut `style="background-color: ..."` baris tabel menggunakan fungsi `sanitizeColor()` dengan regex ketat `^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$`. Panjang tidak standar (5 atau 7 karakter heksadesimal) dan upaya injeksi CSS diblokir total tanpa disisipkan ke atribut DOM.
- **Sanitasi Bertipe Data Aman**: Memperketat `escapeHtml()` agar selalu mengembalikan string kosong (`''`) saat menerima input non-string, mencegah kebocoran objek atau `undefined` ke dalam DOM.
- **Ekspansi Rangkaian Uji Otomatis Playwright**: Memperluas rangkaian uji end-to-end menjadi 118 pengujian sukses pada mesin peramban Chromium dan Firefox dengan sinkronisasi siklus hidup modal dan penanganan touch event yang presisi.

#### v1.4.2 — 2026-09-16

- **Dukungan Dual-Stack IPv4/IPv6 Penuh**: Mengintegrasikan toolbar pemilih versi IP interaktif dengan matematika bitwise 128-bit `BigInt`, format kanonikal RFC 5952, bilah alat preset (/32 hingga /128), link point-to-point RFC 6164 (`/127`), dan proteksi SLAAC RFC 7421 (`/64`).
- **Arsitektur Akordion FAQ Interaktif**: Merombak total sistem panduan menjadi Akordion Bootstrap (`#faqAccordion`) dengan 10 modul arsitektur, dilengkapi tombol kontrol satu-klik "Expand All" (`#faq_expand_all`) dan "Collapse All" (`#faq_collapse_all`).
- **Mesin Impor & Ekspor Multi-Format**: Mendukung format CSV standar RFC 4180, tabel rata-kolom Plain Text, dan konfigurasi hierarkis JSON dengan tombol pemilih format seketika, fitur unduh file `Blob` langsung (`#btn_download_export`), dan unggah file lokal (`#btn_upload_file`).
- **Optimasi Masker Bitwise Waktu-Konstan $O(1)$**: Mengoptimalkan kalkulasi alamat dasar IPv4 `get_network()` dari perulangan iteratif menjadi operasi masker bitwise instan (`(0xffffffff << (32 - netSize)) >>> 0`).
- **Bilah Alat Preset IPv4**: 17 preset CIDR satu-klik dari `/16` hingga `/32` dengan sinkronisasi dua arah secara _real-time_ terhadap kolom input ukuran jaringan `#netsize`.
- **Ikonografi Font Awesome Free v7 Terkini**: Meningkatkan seluruh ikonografi antarmuka ke Font Awesome Free v7.3.1 (`@fortawesome/fontawesome-free`) pada navigasi header, toolbar, palet warna, modal, dan footer.
- **Footer Melekat Flexbox**: Mengembangkan footer melekat permanen (`#app_footer`) menggunakan Flexbox modern (`min-height: 100dvh`, `margin-top: auto`), yang selalu melekat di dasar viewport pada seluruh halaman termasuk halaman 404.
- **Ikon Merek Header**: Menambahkan ikon Font Awesome `fa-network-wired` pada judul utama `<h1>` "Visual Subnet Calculator".

#### v1.4.1 — 2026-09-16

- **Remediasi CodeQL Alert #5 (DOM XSS)**: Mengisolasi koreksi batas jaringan ke fungsi pembantu `show_boundary_warning_modal()` dengan pengikatan node teks aman `.text()`, meniadakan perambatan nilai tercemar ke dalam sink jQuery `.html()`.
- **Kepatuhan Aksesibilitas WCAG 2.2 AA**: Keterangan tabel semantik (`.visually-hidden`), palet warna yang dapat dinavigasi keyboard (`role="button"`, `tabindex="0"`), header kolom semantik `<th scope="col">`, dan tombol submit formulir `#btn_go` bertipe `type="submit"` dengan pencegahan default.
- **Desain Responsif Multi-Resolusi Universal**: Aturan CSS modular yang menskalakan tampilan dari layar VGA (640×480), ponsel cerdas, dan tablet hingga monitor resolusi tinggi 2K (2560px).
- **SEO & Standar Web**: Data terstruktur JSON-LD Schema.org `WebApplication`, tag URL kanonikal, kartu Open Graph, Twitter Cards, serta kepatuhan 100% `html-validate`.
- **Pembaruan Dependensi**: Memperbarui Bootstrap ke versi `5.3.8` (terverifikasi SRI) dan Playwright ke `1.63.0`.

#### v1.4.0 — 2026-09-15

- **Kalkulasi IP Usable Multi-Cloud**: Memperkenalkan profil kalkulasi khusus untuk AWS VPC, Azure VNet, dan Oracle Cloud Infrastructure (OCI) yang menyesuaikan rentang host berdasarkan reservasi IP vendor.
- **Berbagi URL Terkompresi**: Mengintegrasikan kompresi LZ-String untuk menyerialisasi struktur pohon subnet ke dalam parameter URL ringkas (`?c=...`).
- **Mesin Pemecahan & Penggabungan Subnet**: Pemisahan biner dan penggabungan pohon hierarkis secara interaktif di sisi klien.
- **Pertukaran Konfigurasi JSON**: Alur kerja dasar untuk ekspor dan impor konfigurasi berbasis JSON.

### 4. Spesifikasi Lingkungan Runtime & Kebutuhan Sistem Node.js

Alat pembangunan, framework pengujian, dan server lokal Visual Subnet Calculator mengacu pada matriks runtime berikut:

- **Versi Minimum yang Didukung**: **Node.js `v18.0.0+ LTS`** (Hydrogen)
  - _Rasional Teknis_: Rilis LTS baseline yang menyediakan dukungan native modul ECMAScript (ESM), matematika bitwise `BigInt` 128-bit lossless, Web Crypto API (`crypto.getRandomValues`), serta Fetch API tanpa membutuhkan polyfill eksternal.
- **Versi Optimal / Disarankan**: **Node.js `v20.x` / `v22.x Active LTS`** (Iron / Jod)
  - _Rasional Teknis_: Menyajikan kompilasi JIT mesin V8 yang sangat dioptimalkan, eksekusi pengujian otomatis Playwright headless tercepat, konsumsi memori terendah selama pengemasan aset, dan keselarasan siklus hidup pemeliharaan korporat jangka panjang.
- **Pengelola Paket**: **npm `10.x+`** (kompatibel penuh dengan pnpm `9.x+` dan yarn `4.x+`).

### 5. Catatan Subnet Cloud & Matriks Reservasi Hyperscaler

| Profil Cloud           | Subnet Terkecil |        IP Dicadangkan        | Rincian Peran Alamat IP yang Dicadangkan                                                             | Dokumentasi Rujukan                                                                                                                                                               |
| :--------------------- | :-------------: | :--------------------------: | :--------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Standar**            |      `/32`      | **2** _(ukuran $\le$ `/30`)_ | Alamat Jaringan (`.0`), Alamat Broadcast (`.last`)                                                   | [`RFC 1918`](https://datatracker.ietf.org/doc/html/rfc1918) / [`RFC 4632`](https://datatracker.ietf.org/doc/html/rfc4632)                                                         |
| **AWS VPC**            |      `/28`      |            **5**             | Network (`.0`), Router VPC (`.1`), DNS VPC (`.2`), Penggunaan Masa Depan (`.3`), Broadcast (`.last`) | [`Ukuran Subnet AWS VPC`](https://docs.aws.amazon.com/vpc/latest/userguide/subnet-sizing.html)                                                                                    |
| **Azure VNet**         |      `/29`      |            **5**             | Network (`.0`), Default Gateway (`.1`), Pemetaan DNS Azure (`.2`, `.3`), Broadcast (`.last`)         | [`Batasan Subnet Azure VNet`](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-faq#are-there-any-restrictions-on-using-ip-addresses-within-these-subnets) |
| **Google Cloud (GCP)** |      `/29`      |            **4**             | Network (`.0`), Default Gateway (`.1`), Penggunaan Masa Depan (`.last - 1`), Broadcast (`.last`)     | [`Subnet Google Cloud VPC`](https://cloud.google.com/vpc/docs/subnets#reserved_ip_addresses_in_ipv4_subnets)                                                                      |
| **Oracle Cloud (OCI)** |      `/30`      |            **3**             | Network (`.0`), Default Gateway (`.1`), Broadcast (`.last`)                                          | [`Alamat IP Dicadangkan OCI`](https://docs.oracle.com/en-us/iaas/Content/Network/Concepts/overview.htm#Reserved__reserved_subnet)                                                 |

- **Standar RFC 1918**: Mencadangkan `network + 0` dan `broadcast` (`alamat terakhir`) untuk subnet $\le /30$. Rentang usable adalah `network + 1` hingga `last_address - 1`.
- **AWS VPC**: Menegakkan ukuran minimum `/28`. Mencadangkan 5 alamat: `network + 0` (Jaringan), `network + 1` (Router VPC), `network + 2` (DNS VPC), `network + 3` (Masa Depan), dan `last_address` (Broadcast). Rentang usable adalah `network + 4` hingga `last_address - 1`.
- **Azure VNet**: Menegakkan ukuran minimum `/29`. Mencadangkan 5 alamat: `network + 0` (Jaringan), `network + 1` (Default Gateway), `network + 2` dan `network + 3` (Pemetaan DNS Azure), dan `last_address` (Broadcast). Rentang usable adalah `network + 4` hingga `last_address - 1`.
- **Google Cloud (GCP) VPC**: Menegakkan ukuran minimum `/29`. Mencadangkan 4 alamat: `network + 0` (Jaringan), `network + 1` (Default Gateway), `last_address - 1` (Dicadangkan Google untuk penggunaan masa depan), dan `last_address` (Broadcast). Rentang usable adalah `network + 2` hingga `last_address - 2`.
- **Oracle Cloud (OCI)**: Menegakkan ukuran minimum `/30`. Mencadangkan 3 alamat: `network + 0` (Jaringan), `network + 1` (Default Gateway), dan `last_address` (Broadcast). Rentang usable adalah `network + 2` hingga `last_address - 1`.

### 6. Dukungan, Sponsor & Integrasi Donasi QRIS

Visual Subnet Calculator menyediakan sarana dukungan komunitas melalui gateway internasional maupun regional:

- **PayPal Internasional**: [`https://www.paypal.me/alsyundawy`](https://www.paypal.me/alsyundawy)
- **QRIS (Quick Response Code Indonesian Standard)**:
  - Berkas Barcode: `https://github.com/user-attachments/assets/a0126f28-6dde-43da-ba14-d7c9a27de0df`
  - NMID: `ID1020021153676`
  - Nama Merchant: `ALSYUNDAWY`
  - Kompatibilitas: Kompatibel dengan seluruh aplikasi perbankan mobile Indonesia (BCA, Mandiri, BRI, BNI, BSI, CIMB Niaga, Permata) serta dompet digital (GoPay, OVO, DANA, LinkAja, ShopeePay).
  - Konfirmasi WhatsApp: [`https://wa.me/6285658515212`](https://wa.me/6285658515212) (`+62 856-5851-5212`)

---

## Mesin Impor & Ekspor Multi-Format (v1.4.2 – v1.4.3)

Visual Subnet Calculator v1.4.2 memperkenalkan sistem pertukaran data multi-format yang dapat diakses melalui modal Impor / Ekspor (`#importExportModal`), mendukung spreadsheet CSV standar RFC 4180, tabel dokumentasi Plain Text, serta konfigurasi hierarkis JSON. Versi 1.4.3 memperketat keamanan sanitasi warna pada seluruh format ekspor:

### 1. Format Ekspor

- **JSON (`exportConfig`)**: Menyerialisasi seluruh struktur hierarki pohon termasuk jaringan dasar, mode operasional (`Standard`, `AWS`, `Azure`, `GCP`, `OCI`), versi IP aktif (`IPv4`, `IPv6`), catatan kustom (`_note`), dan pemetaan warna (`_color`).
- **CSV (`exportCsv`)**: Menghasilkan data nilai berpemisah koma yang mematuhi standar RFC 4180 dengan header: `"Subnet Address","Range of Addresses","Usable IPs","Hosts","Note","Color"`. Pembungkusan kutip dan karakter escape ganda (`""`) memastikan kompatibilitas penuh dengan Microsoft Excel, LibreOffice Calc, dan Google Sheets.
- **Plain Text (`exportPlainText`)**: Menghasilkan tabel teks ASCII monospace yang sejajar rapi dengan komentar metadata (`# Visual Subnet Calculator Export`), memudahkan penempelan rencana alokasi IP ke dalam dokumentasi teknis, Git pull request, maupun konsol terminal.

### 2. Unggah & Unduh File di Sisi Klien

- **Unduh File Langsung (`#btn_download_export`)**: Menghasilkan objek `Blob` di memori dengan MIME type spesifik (`application/json`, `text/csv;charset=utf-8;`, atau `text/plain;charset=utf-8;`) dan memicu unduhan otomatis peramban dengan format nama `subnet-calc-[network].[ext]`.
- **Unggah File (`#btn_upload_file`, `#importFileInput`)**: Memanfaatkan HTML5 `FileReader` API untuk membaca file lokal `.json`, `.csv`, atau `.txt` secara instan tanpa komunikasi server, dengan pengalihan tombol format aktif otomatis berdasarkan ekstensi file.
- **Salin Cepat ke Clipboard (`#btn_copy_export`)**: Menyalin teks terformat ke clipboard sistem disertai umpan balik visual transien ("Copied!" -> "Copy").

### 3. Rekonstruksi Pohon Subnet Otomatis

Saat mengimpor baris CSV, daftar teks CIDR, atau tabel teks:

1. **Pengurai (`parseCsvOrText`)**: Pemindai ekspresi reguler yang mengekstrak CIDR IPv4/IPv6, komentar catatan (`# Catatan`), dan label warna (`[#hex]`).
2. **Perhitungan Supernet Minimal**: Menentukan jaringan penampung terkecil yang melingkupi seluruh subnet melalui operasi bitwise XOR dan logaritma bit terdepan:
   $$\text{xor} = \text{minAddress} \oplus \text{maxAddress}$$
   $$\text{commonPrefix} = 32 - \lfloor \log_2(\text{xor}) + 1 \rfloor$$
3. **Penyusunan Pohon Rekursif (`insertSubnetIntoTree`)**: Mengiterasi subnet dari blok terbesar ke terkecil, memecah simpul induk secara dinamis menggunakan `split_network` (IPv4) atau `splitIpv6Network` (IPv6) hingga mencapai simpul target daun, serta memulihkan catatan dan label warna yang bersangkutan.

---

## Konteks Teknis dalam Lingkungan Infrastruktur ALSYUNDAWY

Visual Subnet Calculator berfungsi sebagai mesin perancangan dan alokasi IP dasar dalam ekosistem rekayasa jaringan dan keamanan ALSYUNDAWY IT SOLUTION:

- **Netplan Generator**: Blok subnet CIDR serta alamat gateway/broadcast yang dihitung di sini menjadi masukan langsung untuk pembuatan profil konfigurasi antarmuka jaringan YAML pada sistem operasi Linux Ubuntu dan Debian.
- **Ping, Traceroute, dan MTR**: Batas subnet, rentang host, dan ekspektasi hop yang dikalkulasi pada aplikasi ini membantu operator jaringan menganalisis anomali rute dan kehilangan paket (_packet loss_) pada jaringan intranet maupun transit internet.
- **Pemeriksa DNS & Konfigurasi PTR**: Perhitungan rentang subnet menyediakan batas jaringan presisi yang diperlukan untuk menyusun catatan zona DNS maju (A/AAAA) dan balik (_reverse_) pada zona `in-addr.arpa` serta `ip6.arpa`.
- **Uji Throughput IPERF3**: Perencanaan topologi tolok ukur _throughput_ memanfaatkan partisi subnet yang dirancang di Visual Subnet Calculator untuk mengevaluasi _bandwidth_ antar-VLAN yang terisolasi.
- **Pemindaian Keamanan Nmap**: Audit penemuan jaringan dan pemindaian kerentanan menggunakan rentang CIDR dan matriks IP yang dihasilkan oleh kalkulator ini guna menetapkan cakupan pemindaian target yang akurat.
- **Pemeriksa TrustPositif & WHOIS**: Blok IP publik, alokasi prefiks IPv6, dan nomor ASN disinkronisasikan dengan perencanaan subnet internal guna menjaga kepatuhan regulasi dan memverifikasi perutean tepi (_edge routing_).
- **Keamanan Sistem & Zero-Trust**: Kebijakan daftar kendali akses (ACL) berbasis subnet dan konfigurasi hulu _reverse proxy_ (Nginx/HAProxy) mengandalkan verifikasi batas CIDR yang dihasilkan untuk menegakkan isolasi _zero-trust_.

---

## Rekayasa Performa & Modernisasi (v1.4.2 – v1.4.3)

- **Masker Bitwise Waktu-Konstan ($O(1)$)**: Rutinitas kalkulasi alamat dasar jaringan IPv4 `get_network(networkInput, netSize)` dioptimalkan dari perulangan iteratif menjadi satu operasi masker bitwise instan:
  ```javascript
  const mask = (0xffffffff << (32 - netSize)) >>> 0;
  return int2ip((ipInt & mask) >>> 0);
  ```
  Langkah ini mengeliminasi _overhead_ perulangan pada ratusan pemecahan subnet rekursif dan proses render ulang tabel.
- **Modernisasi Kode Idiomatik ES6+**: Menggantikan pola legasi ES5 (`push.apply`, `for..in` pada array kunci objek, fungsi callback anonim pada `reduce`) dengan standar JavaScript modern yang bersih: fungsi panah (_arrow functions_), perulangan `for...of`, serta sintaks spread (`...array`), memaksimalkan optimasi kompilator JIT V8.

---

## Pertimbangan Keamanan

- **Isolasi Penuh di Sisi Klien**: Seluruh kalkulasi berlangsung sepenuhnya di dalam runtime peramban. Tidak ada data pengguna, skema IP, maupun catatan teks yang dikirimkan ke server backend mana pun.
- **Pencegahan XSS**: Setiap nilai dinamis yang disisipkan ke dalam DOM (termasuk isi catatan yang dimuat dari file impor atau URL bersama) melewati penyandian entitas karakter sebelum proses interpolasi string.
- **Pencegahan DOM XSS (CodeQL Alert #5)**: Masukan koreksi batas jaringan dari DOM diisolasi secara ketat dalam fungsi `show_boundary_warning_modal()` yang menggunakan pengikatan node `.text()` yang aman dari eksekusi skrip.
- **Sanitasi Warna CSS (v1.4.3)**: Atribut `style="background-color: ..."` yang dihasilkan secara dinamis untuk baris tabel subnet kini divalidasi menggunakan fungsi `sanitizeColor(color)` dengan whitelist regex `^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$`. Hanya format heksadesimal CSS yang benar-benar valid (#RGB, #RGBA, #RRGGBB, #RRGGBBAA) yang diizinkan melewati validasi; nilai dengan panjang 5 atau 7 karakter yang tidak diakui oleh spesifikasi CSS Color Level 4 diblokir. Nilai tidak valid dikembalikan sebagai string kosong dan tidak pernah diinterpolasi ke dalam atribut DOM. Pendekatan ini lebih aman daripada `escapeHtml()` dalam konteks CSS karena mencegah injeksi ekspresi CSS seperti `url()`, `expression()`, atau sekuens _escape_ `\`.
- **Aksesibilitas & Kepatuhan Formulir**: Input file tersembunyi (`#importFileInput`) dipasangkan dengan label semantik (`<label for="importFileInput" class="visually-hidden">`) dan atribut judul, memenuhi standar pembaca layar WCAG 2.2 AA dan aturan linter HTML tanpa menghasilkan atribut ARIA yang redundan.
- **Kebijakan Keamanan Konten (CSP)**: Aplikasi tidak memerlukan skrip eksternal di luar aset distribusi lokal, memungkinkan penerapan kebijakan `script-src 'self'` yang ketat pada _reverse proxy_ produksi.
