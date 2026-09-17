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
- **Status Bawaan**: Terinisialisasi pada `172.16.0.0/16` dengan tombol preset `/16` dalam kondisi aktif (IPv6 terinisialisasi pada `2508:6789::/32`).
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

Pemisahan biner tradisional ala IPv4 (/N -> /N+1) tidak praktis untuk IPv6 karena luasnya ruang alamat $2^{128}$. Visual Subnet Calculator mematuhi tingkatan alokasi rekayasa jaringan standar yang didefinisikan dalam RFC 6177, RFC 4291, RFC 6052, dan RFC 6164:

$$\text{/32 (ISP/LIR)} \longrightarrow \text{/40 (NAT64)} \longrightarrow \text{/48 (Situs Korporat)} \longrightarrow \text{/52 (Multi-Situs)} \longrightarrow \text{/56 (Cabang)} \longrightarrow \text{/60 (Dept)} \longrightarrow \text{/64 (SLAAC)} \quad\Big|\quad \text{/127 (P2P)} \longrightarrow \text{/128 (Host)}$$

| Prefiks Tingkatan  | Langkah Bit | Faktor Pengali Subnet                        | Cakupan Tipikal & Peran Arsitektur                                  | Standar RFC         |
| :----------------- | :---------- | :------------------------------------------- | :------------------------------------------------------------------ | :------------------ |
| **/32** _(Bawaan)_ | $+4$ bit    | $16 \times /36$ ($65.536 \times /48$)        | Alokasi Regional Internet Registry (RIR) ke ISP / Korporasi Besar   | RFC 6177            |
| **/40**            | $+8$ bit    | $256 \times /48$ ($16.8\text{M} \times /64$) | Prefiks Translasi NAT64 (RFC 6052) & Alokasi Provider Besar         | RFC 6052            |
| **/48**            | $+4$ bit    | $16 \times /52$ ($65.536 \times /64$)        | Penugasan ISP ke Situs Korporat / Pusat Data Perusahaan             | RFC 6177            |
| **/52**            | $+4$ bit    | $16 \times /56$ ($4.1\text{K} \times /64$)   | Tingkatan Kampus Multi-Situs Batas Nibble                           | RFC 6177            |
| **/56**            | $+4$ bit    | $16 \times /60$ ($256 \times /64$)           | Penugasan Korporat ke Kantor Cabang / Kampus / Multi-VPC            | RFC 6177            |
| **/60**            | $+4$ bit    | $16 \times /64$ subnet                       | Penugasan Cabang ke Kantor Kecil / VLAN Departemen                  | RFC 6177            |
| **/64**            | $+4$ bit    | $16 \times /68$ ($65.536 \times /80$)        | Tautan Lokal / VLAN (SLAAC & Pemisahan Interaktif Aktif)            | RFC 4291 / RFC 7421 |
| **/80**            | $+4$ bit    | $16 \times /84$ ($65.536 \times /96$)        | Batas Mikro-segmentasi / Layanan Cloud (Pemisahan Interaktif Aktif) | RFC 4291            |
| **/96**            | $+16$ bit   | $65.536 \times /112$ subnet                  | Translasi IPv4-ke-IPv6 / Alamat Tersemat IPv4 (RFC 6052)            | RFC 6052            |
| **/112**           | $+8$ bit    | $256 \times /120$ subnet                     | Klaster Perangkat Terisolasi / Sub-delegasi Khusus                  | RFC 4291            |
| **/120**           | $+4$ bit    | $16 \times /124$ subnet                      | Sub-delegasi Jaringan Industri & Sensor IoT                         | RFC 4291            |
| **/124**           | $+3$ bit    | $8 \times /127$ subnet                       | Sub-delegasi Kelompok Kecil Antar-Router                            | RFC 4291            |
| **/127**           | $+1$ bit    | $2 \times /128$ subnet                       | Tautan Antar-Router Point-to-Point (Standar RFC 6164)               | RFC 6164            |
| **/128**           | Daun        | Daun Host Tunggal / Loopback                 | Antarmuka Loopback / Alamat Host Tunggal (Standar RFC 4291)         | RFC 4291            |

### 5. Batas SLAAC, Pemisahan Subnet & Perlindungan Host (RFC 4291 / RFC 7421 / RFC 6164)

Sesuai RFC 4291 Bagian 2.5.4 dan RFC 7421, semua subnet unicast IPv6 standar dengan Stateless Address Autoconfiguration (SLAAC) memerlukan Interface Identifier (IID) 64-bit. Meskipun autokonfigurasi klien standar mengandalkan `/64`, praktisi jaringan sering kali perlu membagi blok `/64` untuk kebutuhan alokasi sub-delegasi:

- **Pemisahan Penuh Subnet `/64`**: Visual Subnet Calculator mengizinkan pemisahan blok `/64` menjadi 16 subnet `/68` ($2^4 = 16$), berlanjut ke `/72`, `/76`, `/80`, hingga tautan antar-router `/127`.
- **Tautan Point-to-Point Antar-Router (RFC 6164)**: Pengguna dapat memilih langsung `/127` dari toolbar preset atau input teks. Subnet `/127` menyediakan 2 alamat IP usable dan terbagi rapi menjadi dua host `/128`.
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

#### v1.4.3 (Arsitektur Rilis Terkini) — 2026-09-18

- **Mesin Reset Kalkulasi Subnet Instan (`#btn_reset`)**: Menambahkan tombol Reset khusus di samping tombol Tools pada bilah kontrol `#calc`. Mengembalikan status bawaan dual-stack (IPv4 ke `10.0.0.0/16`, preset `/16`, mode `Standard`; IPv6 ke `2001:db8::/32`, preset `/32`), menyelaraskan preset aktif, membersihkan `subnetMap`, menetralkan pesan validasi dan kelas `.was-validated` pada form, serta membersihkan parameter pembagian pada address bar peramban melalui `window.history.replaceState`.
- **Standar Palet Pastel Modern 2026 & Kontras WCAG AAA**: Tombol kontrol aksi dimodernisasi menggunakan token pastel 2026 yang terkurasi: Go (Sapphire / Royal Blue `linear-gradient(135deg, #0284c7, #1d4ed8)`), Tools (Pastel Emerald Green `#d1fae5` / `#065f46`), dan Reset (Pastel Rose / Crimson `#fee2e2` / `#991b1b`). Varian mode terang maupun mode gelap melampaui rasio kontras 7.2:1 (**WCAG AAA**) untuk teks normal dan besar.
- **Mesin Kontras Dinamis Kecerahan Perseptual Mode Gelap (`isColorLight`)**: Perhitungan luminansi relatif pada `dist/js/main.js` mengacu rumus ITU-R BT.601 ($0.299R + 0.587G + 0.114B > 140$) yang secara dinamis menyematkan kelas `.has-light-bg` atau `.has-dark-bg` pada baris tabel. Pada baris dengan warna kustom di Mode Gelap, secara otomatis memaksa teks menjadi gelap kontras tinggi `#0f172a` pada latar belakang terang dan `#f8fafc` pada latar gelap, melenyapkan masalah teks tidak terlihat.
- **Mitigasi Kondisi Balapan (Race Condition) Transisi Penutupan Modal Bootstrap 5**: Arsitektur flag `_pendingDismiss` berlingkup elemen DOM modal. Penutupan modal dijadwalkan secara aman hingga event `shown.bs.modal` selesai dan dibersihkan pada event `hide.bs.modal` atau `hidden.bs.modal`, menjamin penutupan 100% andal tanpa kebocoran event saat pengujian otomatis atau klik berulang yang cepat.
- **Tombol Melayang Kembali ke Atas (Back to Top Button `#btn_scroll_top`)**: Tombol navigasi melayang berbentuk sirkular di pojok kanan bawah dengan deteksi posisi scroll dinamis (> 120px), transisi opacity/transform halus, efek elevasi hover, serta fungsi scroll mulus (smooth scroll) ke posisi paling atas. Pengikatan siklus hidup DOM diperkuat untuk menjamin ketersediaan tombol baik pada IPv4 maupun IPv6 setelah pembagian subnet yang mendalam.
- **Default Mode Gelap (Dark Mode) saat Pertama Dibuka & Anti-FOUC**: Pengunjung baru secara otomatis disajikan tema Mode Gelap berestetika modern terinspirasi oleh `ns1.orion.net.id`, diaplikasikan melalui skrip inline `<script>` di dalam `<head>` sebelum perenderan CSS tree.
- **Kebijakan Lokalisasi Kode Penuh Bahasa Inggris**: Mengaudit dan memastikan 100% kode produksi, HTML, CSS, JavaScript, atribut ARIA, label, tooltip, modal, badge, dan pengujian sepenuhnya berbahasa Inggris, dengan dokumentasi bahasa Indonesia diisolasi khusus pada berkas `*-ID.md`.
- **Pemisahan Subnet IPv6 `/64` Hingga `/127` Secara Interaktif**: Mengaktifkan pemisahan interaktif untuk prefiks `/64` hingga `/127` menjadi tingkatan berikutnya (misalnya `/68`, `/72`, `/80`, `/84`, `/88`, `/92`, `/96`, `/112`, dan `/127`), memungkinkan perencanaan mikro-segmentasi mendalam hingga point-to-point links (RFC 6164) dengan proteksi batas leaf `/128` (loopback/host).
- **Tampilan Tautan Hyperlink Subnet Langsung (Di Bawah Tabel Subnet)**: Selain tombol aksi "Copy Shareable URL", sebuah tautan hyperlink langsung (`#live_shareable_url`) kini ditampilkan secara permanen tepat di bawah tabel rincian subnet. Menggunakan tipografi kontras tinggi yang jelas pada mode terang (`#0284c7`) maupun mode gelap (`#38bdf8`), font tebal (`font-weight: 700`), ukuran optimal (`0.84rem`), serta penanganan wrapping teks `word-break: break-all; overflow-wrap: anywhere;` sehingga parameter query yang panjang tidak akan pernah menyebabkan tata letak terpotong di layar ponsel sempit. Tautan ini tersinkronisasi secara otomatis setiap kali tabel diperbarui.
- **Fitur Sesi Kuki Sementara Maksimal 15 Menit (`vsc_draft_15m` & `vsc_visitor_15m_session`)**: Mengintegrasikan engine kuki sementara standar RFC 6265 (`TemporaryCookieStore`) dengan masa aktif tepat 15 menit (`max-age=900`, `SameSite=Lax`). Draft konfigurasi subnet tersimpan aman dalam kuki dan akan dipulihkan secara otomatis jika tab ditutup atau dibuka kembali dalam waktu 15 menit. Menghadirkan deduplikasi counter kunjungan berbasis sesi 15 menit serta badge status visual interaktif (`#cookie_session_badge`).
- **Mode Reservasi Subnet Google Cloud (GCP) VPC**: Mengintegrasikan profil cloud GCP VPC yang mereservasi 4 alamat IP per subnet (`network + 0` ID Jaringan, `network + 1` Default Gateway, `broadcast - 1` cadangan masa depan Google, dan `broadcast - 0` Broadcast Jaringan) dengan batas minimum subnet `/29`, melengkapi paritas hyperscaler cloud antara AWS, Azure, GCP, dan OCI.
- **Pengerasan Responsif Khusus Xiaomi, Redmi & POCO**: Menjalankan riset mendalam terhadap perilaku render browser MIUI/HyperOS (inflasi ukuran teks sistem, rasio aspek 20:9, notch DotDisplay). Memperkuat tata letak dengan `-webkit-text-size-adjust: 100%; text-size-adjust: 100%;`, menghapus batasan kaku `min-width: 576px;` pada kontainer, serta mengganti aturan sembunyikan kolom (`display: none` pada Range/Usable IP) dengan kontainer `.table-responsive` yang fluid dan memiliki scrolling sentuh inersial (`-webkit-overflow-scrolling: touch; overscroll-behavior-x: contain;`). Teruji mulus dari resolusi VGA (640x480), Redmi A2 (360x800), Redmi Note 13 (392x872), POCO X6 Pro (412x915), iPhone 15 Pro, iPad Air, hingga 2K tanpa pemotongan dokumen horizontal.
- **Kurasi 8 Saluran Kontak / Sosial Media Utama**: Memangkas ikon kontak di footer menjadi tepat 8 saluran esensial (Telegram, WhatsApp, X, Website, Email, GitHub, QRIS, dan PayPal) dengan efek kilau hover elegan dan box model sirkular seragam.
- **Dukungan Resmi QRIS Nasional & Modal Donasi (`#qrisModal`)**: Mengintegrasikan modal donasi QRIS Standar Nasional (`ID1020021153676`) beresolusi tinggi yang mendukung transfer lintas bank dan dompet digital instan (BCA, Mandiri, BRI, BNI, GoPay, OVO, DANA, LinkAja).
- **Pemeliharaan Tombol Penghitung Pengunjung Dinamis (`#visitor_counter_btn`) & Integrasi `counter.txt`**: Mempertahankan tombol Penghitung Pengunjung sebagai bentuk pill interaktif dengan teks di kolom footer, membaca baseline angka pengunjung dari `dist/counter.txt` secara realtime dengan pencegahan cache browser, menghitung dan menambah kunjungan dinamis per sesi pengguna, mencoba menyimpan pembaruan ke server jika didukung, serta memberikan animasi putar (`fa-spin`) saat tombol diklik untuk menyegarkan data. Angka diformat rapi dengan pemisah ribuan standar Indonesia/internasional.
- **Konsistensi Geometri Tombol WhatsApp & QRIS**: Menstandarkan tinggi, font family, font size, dan border radius antara tombol WhatsApp dan QRIS sirkular sehingga 100% konsisten dan lolos pengujian geometri otomatis tanpa blur visual.
- **Standardisasi IP Privat RFC 1918 & Indikator Status Real-Time**: Menstandarisasi alokasi subnet IPv4 seputar tiga blok IP privat resmi IETF RFC 1918: `10.0.0.0/8` (blok 24-bit), `172.16.0.0/12` (blok 20-bit), dan `192.168.0.0/16` (blok 16-bit), dengan preset default tetap pada `/16` (`10.0.0.0/16`). Mengintegrasikan lencana status dinamis (`#rfc1918_indicator`) yang memverifikasi alamat dasar jaringan aktif secara real-time disertai label kelas blok kontekstual.
- **Estetika & Desain Glassmorphism Toolbar Preset 2026**: Mempercantik bilah tombol preset IPv4 (`#ipv4_tier_info`) dan IPv6 (`#ipv6_tier_info`) ke standar desain 2026: kontainer glassmorphism modern (`backdrop-filter: blur(8px)`), tombol pill aktif bergradien cerah (`linear-gradient(135deg, #0284c7, #2563eb)`), elevasi hover halus, dan metrik tipografi tabular tanpa mengubah ID atau listener bawaan.
- **Kalibrasi Kontras Palet Warna Standar 2026**: Mengkalibrasi ulang 10 warna palet subnet Mode Gelap ke nuansa _luminous jewel_ modern yang bebas silau serta menjamin kontras optimal, sembari mempertahankan nilai heksadesimal Mode Terang 100% kompatibel dengan pengujian eksisting.
- **Penyempurnaan Progresi Tingkatan IPv6 Hirarkis & Batas Keamanan**: Mengoptimalkan fungsi `getNextIpv6Tier()` dan `splitIpv6Network()` dengan alokasi memori berbatas $O(1)$, transisi berbasis nibble (+4 bit), perlindungan leaf SLAAC `/64` (RFC 4291 / RFC 7421), serta alur sub-delegasi point-to-point granular (`/112 -> /120 -> /124 -> /127 -> /128`).
- **Perbaikan Aritmetika Kapasitas IPv6**: Memperbaiki bug pembagi satuan _quadrillion_ (Q) pada `getIpv6Capacity()` dari $10^{18}$ (_quintillion_) menjadi $10^{15}$ (_quadrillion_), memulihkan keakuratan tampilan kapasitas blok besar (`/0` hingga `/16`).
- **Remediasi Kerentanan DOM XSS CodeQL Alert #6 [High]**: Mengganti penggunaan `.html()` dengan pembuatan elemen DOM yang aman pada `updateRfc1918Indicator`, sanitasi pesan error pada `errorPlacement`, sanitasi baris induk dengan `escapeHtml()`, dan menghapus duplikasi atribut `aria-label`.
- **Pengerasan Terhadap Injeksi CSS**: Memvalidasi atribut `style="background-color: ..."` baris tabel menggunakan fungsi `sanitizeColor()` dengan regex ketat `^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$`. Panjang tidak standar (5 atau 7 karakter heksadesimal) dan upaya injeksi CSS diblokir total tanpa disisipkan ke atribut DOM.
- **Sanitasi Bertipe Data Aman**: Memperketat `escapeHtml()` agar selalu mengembalikan string kosong (`''`) saat menerima input non-string, mencegah kebocoran objek atau `undefined` ke dalam DOM.
- **Kompatibilitas Peramban & Peningkatan DX**: Mengatasi peringatan kompatibilitas browser untuk `text-size-adjust` via sintaks standar dan prefix vendor bersama konfigurasi `.hintrc`, menyempurnakan definisi TypeScript pada `src/playwright.config.ts`, serta memperbarui berkas rekaman demonstrasi visual (`src/demo.gif`).
- **Otomasi Kualitas Menyeluruh & Integrasi MegaLinter**: Mengaktifkan seluruh suite MegaLinter (`.mega-linter.yml`), berkas root `eslint.config.js`, `.stylelintrc.json`, mencapai 100% kelulusan bersih (0 error, 0 warning) di seluruh HTML, CSS, JavaScript, dan Markdown.

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

## Desain Visual, Aksesibilitas & Arsitektur Antarmuka Lintas Perangkat (v1.4.3)

Visual Subnet Calculator v1.4.3 menghadirkan penyempurnaan desain visual menyeluruh, ergonomi mode gelap berkontras tinggi, peningkatan kontras mode terang, irama spasi vertikal yang proporsional, resolusi path URL dinamis, serta pengujian otomatis lintas-browser:

### 1. Tipografi Judul & Arsitektur Branding

- **Tipografi Cair Responsif**: Judul utama menggunakan formula CSS `clamp(1.15rem, 1.2vw + 0.5rem, 1.55rem)` dengan ketebalan `font-weight: 800` dan spasi huruf `-0.025em`. Memastikan judul tampil tegas, jelas, dan berwibawa tanpa mendominasi viewport di layar kecil maupun besar dan bebas dari pemotongan horizontal pada resolusi VGA (640px) hingga 2K (2560px).
- **Lencana Glassmorphic "Fork" (`.fork-badge`)**: Mempertegas identitas rilis _fork_ dengan lencana kapsul modern berlatar gradien cyan halus, efek _glow_ teks yang lembut, dan keterbacaan yang tajam.
- **Navigasi Aksi Melingkar (`.nav-action-btn`)**: Tombol aksi pada bilah navigasi atas (Pengalih Tema, Modal FAQ, Modal Info, dan Repositori GitHub) diseragamkan ke dalam tombol melingkar $38\text{px} \times 38\text{px}$ berestetika _glassmorphism_, efek pembesaran saat kursor mendekat (`transform: scale(1.06)`), cincin fokus yang tegas (`:focus-visible`), serta ikon tebal Font Awesome (`fa-solid`).

### 2. Irama Spasi Vertikal yang Seimbang

Guna memberikan kenyamanan visual maksimal, mencegah elemen berhimpitan, dan mempertegas hierarki optik antarmuka, telah diterapkan pemisahan jarak vertikal atas dan bawah yang proporsional:

- **Area Judul Header (`#app_header`)**: Dilengkapi `margin-bottom: 1.15rem !important` (Bootstrap class `mb-3`), memberikan jarak pemisah yang bersih dari teks pengantar di bawahnya.
- **Banner Peringatan & Deskripsi Aplikasi (`.alert`)**: Diberi `margin-top: 1rem !important; margin-bottom: 1.25rem !important;` (Bootstrap class `my-3`), memberi ruang lega pada ringkasan fungsi aplikasi.
- **Bilah Pemilih Versi IP (`#ip_version_toolbar`)**: Diberi `margin-top: 1rem !important; margin-bottom: 1.25rem !important;` (Bootstrap class `my-3`), memisahkan modul pemilih IPv4/IPv6 secara tegas dari teks pengantar di atas dan preset toolbar di bawahnya.
- **Container Utama Aplikasi**: Dikelilingi pembungkus `container-xxl py-3`, menjamin tersedianya padding atas dan bawah yang elegan di layar monitor maupun ponsel.

### 3. Peningkatan Kontras & Keterbacaan Mode Terang

Saat mode terang aktif (`[data-theme="light"]`), seluruh elemen teks dan komponen interaktif diaudit dan ditingkatkan kontrasnya untuk memastikan ketajaman prima dan bebas efek buram:

- **Judul dan Label**: Diformulasikan dalam warna slate gelap pekat `#0f172a` (slate-900).
- **Data Tabel Subnet**: Menggunakan warna kontras tinggi `#1e293b` (slate-800).
- **Tautan Aksi Navigasi Bawah**: Tombol aksi (`Change Colors »`, `Copy Shareable URL`) dirancang dalam warna biru cerah tegas `#0284c7` (sky-600) bergaris bawah putus-putus dan efek hover responsif.
- **Kartu Kapsul Footer (`.footer-social-btn`)**: Secara eksplisit diatur dengan latar putih bersih murni (`background: #ffffff !important;`), garis bingkai slate (`border: 1px solid #cbd5e1 !important;`), serta teks kontras tinggi `#1e293b`, mencegah terbawanya gaya kapsul gelap saat terjadi pergantian tema secara runtime.
- **Teks Area Footer (`#app_footer`)**: Informasi hak cipta, profil pemelihara, dan catatan teknis menggunakan corak slate tegas (`#475569` dan `#1e293b`) tanpa warna abu-abu pudar.

### 4. Jaminan Keterbacaan & Kontras Tinggi Mode Gelap

- **Tipografi Bersih Tanpa Efek Buram**: Mode gelap (`[data-theme="dark"]`) mengalokasikan warna teks utama berkontras tinggi (`#f1f5f9`) dan teks sekunder tajam (`#cbd5e1`), sepenuhnya meniadakan teks buram atau pudar pada tema gelap.
- **Audit Area Footer (`#app_footer`)**: Seluruh teks deskripsi dan hak cipta di footer diformulasikan ulang dengan kontras tinggi (`#cbd5e1` / `#94a3b8`) serta garis pembatas lembut (`rgba(255, 255, 255, 0.1)`), menjamin kenyamanan mata di semua kondisi pencahayaan.
- **Ikon Font Awesome Tebal Universal**: Seluruh ikon antarmuka diperbarui ke varian solid (`fa-solid`) yang tegas, terlihat jelas, dan berbobot visual solid di latar terang maupun gelap.

### 5. Kartu Kapsul Sosial Media & Dukungan (`.footer-social-btn`)

- Tombol kontak, profil sosial, dan dukungan diubah menjadi kartu kapsul kaca modern bertepi bundar sempurna (`border-radius: 9999px`) dengan filter _backdrop blur_ (`backdrop-filter: blur(8px)`).
- Efek pendaran (_glow_) dan aksen warna khas tiap platform:
  - **GitHub**: Bingkai _slate_ gelap dengan pendaran monokrom halus.
  - **Website (`alsyundawy.com`)**: Pendaran biru laut cerah (`rgba(14, 165, 233, 0.45)`).
  - **X (Twitter)**: Bingkai abu-abu gelap dengan aksen ikon putih kontras.
  - **Telegram**: Pendaran biru langit dinamis (`rgba(34, 158, 217, 0.45)`).
  - **WhatsApp**: Pendaran hijau zamrud khas (`rgba(37, 211, 102, 0.45)`).
  - **Email**: Pendaran merah koral hangat (`rgba(239, 68, 68, 0.45)`).
  - **PayPal**: Pendaran biru korporat PayPal (`rgba(0, 112, 186, 0.45)`).
  - **QRIS**: Pendaran aksen merah QRIS terverifikasi (`rgba(225, 29, 72, 0.45)`).

### 6. Kalibrasi Palet Warna Subnet Mode Gelap

- Pada mode gelap, 10 pilihan warna palet subnet (`--subpal-1-1` hingga `--subpal-1-10`) secara cerdas dipetakan ulang dari warna pastel terang ke warna batu permata dalam (_deep jewel tones_):
  - Warna 1 (Ruby / Merah Anggur Dalam): `rgba(159, 18, 57, 0.5)`
  - Warna 2 (Rust / Amber Dalam): `rgba(154, 52, 18, 0.5)`
  - Warna 3 (Ochre / Perunggu Dalam): `rgba(133, 77, 14, 0.5)`
  - Warna 4 (Emerald / Hutan Tropis): `rgba(6, 95, 70, 0.5)`
  - Warna 5 (Ocean / Teal Samudra): `rgba(17, 94, 89, 0.5)`
  - Warna 6 (Sapphire / Biru Safir): `rgba(30, 58, 138, 0.55)`
  - Warna 7 (Iris / Indigo Pekat): `rgba(67, 56, 202, 0.5)`
  - Warna 8 (Plum / Magenta Anggun): `rgba(134, 25, 143, 0.5)`
  - Warna 9 (Slate / Arang Elegan): `rgba(51, 65, 85, 0.6)`
  - Warna 10 (Midnight / Basis Gelap): `rgba(30, 41, 59, 0.7)`
- Mengeliminasi silau warna putih-di-atas-pastel saat mode gelap aktif, membedakan tiap partisi subnet dengan jelas, dan memastikan teks catatan tetap mudah dibaca.

### 7. Deteksi Otomatis Lokasi Script URL Shareable

Fungsi `getConfigUrl()` menghitung URL tautan berbagi secara dinamis dengan memeriksa konteks `window.location.pathname`:

- **Deployment Root**: Bila aplikasi di-host pada direktori root domain (misal `https://example.com/` atau `https://example.com/index.html`), tautan yang dihasilkan otomatis mengarah ke `https://example.com/index.html?c=...`.
- **Deployment Subfolder**: Bila aplikasi diletakkan dalam subdirektori (misal `https://example.com/folder/` atau `https://example.com/tools/subnet/index.html`), path subdirektori terdeteksi dan dipertahankan secara utuh menghasilkan `https://example.com/folder/index.html?c=...` atau `https://example.com/tools/subnet/index.html?c=...`.
- **Implementasi Algoritma**:
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

### 8. Verifikasi Lintas Perangkat & Multi-Peramban

- Rangkaian pengujian otomatis Playwright (`src/tests/responsive-visual-v143.spec.ts`) dijalankan pada mesin peramban **Chromium** dan **Firefox** memverifikasi:
  - **VGA (640x480)**: Validasi pembungkusan elemen responsif tanpa scroll horizontal tak diinginkan (`scrollWidth <= clientWidth`).
  - **Android / Samsung (360x800)**: Validasi keramahan sentuhan, aksesibilitas tombol, dan navbar ringkas.
  - **iPhone 15 (390x844)**: Validasi orientasi potret seluler dan target sentuh jari.
  - **iPad (820x1180)**: Validasi hierarki visual tablet potret/lanskap dan stabilitas grid.
  - **MacBook (1440x900)**: Validasi penskalaan laptop desktop, ketajaman font, dan kelurusan navbar.
  - **Desktop FHD (1920x1080)**: Validasi tata letak standar, penskalaan clamp tipografi, dan perilaku akordion.
  - **Desktop 2K QHD (2560x1440)**: Validasi batas tata letak resolusi tinggi (`container-xxl`) dan proporsi elemen.
  - **Uji Irama Jarak Vertikal**: Penegasan _bounding box_ otomatis yang memvalidasi adanya celah vertikal nyata antara `#app_header`, `.alert`, dan `#ip_version_toolbar`.
  - **Uji Simulasi Lokasi URL**: Validasi otomatis yang memastikan path root dan subfolder tersusun akurat.

### 9. Arsitektur Sesi Kuki Sementara 15 Menit (Standar RFC 6265)

- **Tujuan**: Memberikan ketahanan sesi sementara dan deduplikasi counter kunjungan hingga maksimal 15 menit (`max-age=900`) tanpa membebani penyimpanan perangkat secara permanen.
- **Engine**: Modul `TemporaryCookieStore` yang mengelola `set()`, `get()`, dan `remove()` dengan pengamanan ketat `SameSite=Lax`, `path=/`, serta flag `Secure` otomatis saat berjalan di protokol HTTPS:
  - `vsc_draft_15m`: Secara otomatis menyimpan draft kueri URL subnet aktif (`?network=...&mask=...&division=...`) setiap kali terjadi pembagian (split), penggabungan (join), atau perubahan mode. Jika pengguna tidak sengaja menutup tab atau me-refresh ke path root `/` dalam kurun waktu 15 menit, aplikasi secara otomatis memulihkan sesi subnet yang sedang dikerjakan.
  - `vsc_visitor_15m_session`: Melakukan deduplikasi kunjungan dalam jendela waktu 15 menit sehingga refresh berulang kali tidak menggelembungkan counter kunjungan (`#visitor_count_val`).
- **Indikator Status Visual**: `#cookie_session_badge` menampilkan lencana status kuki sesi secara dinamis tepat di sebelah Shareable URL (`Kuki Sesi: 15 Menit`).

### 10. Tombol Melayang Kembali ke Atas (Back to Top `#btn_scroll_top`)

- **Penempatan**: Tombol sirkular melayang tetap (_fixed floating_) pada sudut kanan bawah layar dengan perlindungan safe area `env(safe-area-inset-*)`.
- **Perilaku**: Tersembunyi secara default (`opacity: 0; visibility: hidden; pointer-events: none`). Muncul secara anggun dengan transisi meluncur ke atas dan memudar (_fade-in_) saat scroll vertikal melebihi 220px. Saat diklik, melakukan pergerakan scroll halus terakselerasi perangkat keras (`window.scrollTo({ top: 0, behavior: 'smooth' })`).

### 11. Penyeragaman Gaya Tombol Footer & Eliminasi Anomali Ikon Hitam

- **Akar Masalah Ikon Hitam Sebelumnya**: Selektor CSS lawas `#app_footer a[href*="alsyundawy"]` hanya mewarnai biru elemen tautan yang memuat substring kata "alsyundawy". Akibatnya, tombol WhatsApp (`wa.me/6281313628796`), tombol QRIS (elemen `<button>` tanpa `href`), dan tombol Pengunjung (elemen `<button>` tanpa `href`) terlewatkan dan tertinggal dengan warna teks bawaan hitam/abu-abu.
- **Solusi**: Mengganti selektor tersebut dengan aturan universal `.footer-social-btn i { color: #0284c7 !important; }` (mode terang) dan `color: #38bdf8 !important;` (mode gelap). Seluruh 9 tombol (alsyundawy.com, GitHub, X, Telegram, WhatsApp, Email, PayPal, QRIS, Pengunjung) kini berpenampilan 100% seragam, harmonis, dan seimbang.
- **Optimalisasi Berat Ikon (Font Weight)**: Mengganti ikon tebal solid (`fa-solid`) dengan varian reguler (`fa-regular`) yang proporsional (matahari/bulan, tanda tanya FAQ, amplop email, jam sesi) demi tampilan modern yang bersih dan bersahaja.

### 12. Optimalisasi Tampilan Smartphone Xiaomi, Redmi & POCO serta Analisis Akar Masalah

- **Hasil Riset Mendalam Mengenai Tampilan Terpotong di Smartphone Xiaomi/Redmi/POCO**:
  1. _Inflasi Font Sistem MIUI/HyperOS_: Sistem antarmuka Xiaomi (MIUI dan HyperOS) memiliki fitur "Ukuran Teks" bawaan yang agresif (mulai dari S hingga XXL). Pada peramban berbasis WebKit/Blink tanpa pengaman inflasi font, teks dipaksa membesar melampaui batas sel tabel dan kontainer, sehingga mendorong elemen ke kanan dan memotong tampilan.
  2. _Rasio Aspek Layar Sangat Panjang (20:9 & 20.5:9)_: Perangkat seperti Redmi Note 13 (392x872), POCO X6 Pro (412x915), dan Redmi A2 (360x800) memiliki rasio layar tinggi dengan lubang kamera DotDisplay. Satuan tinggi kaku (`100vh`) mengabaikan bilah alamat peramban dinamis dan navigasi gestur.
  3. _Lebar Minimum Kontainer yang Kaku_: Versi sebelumnya memiliki aturan CSS desktop yang menetapkan batas lebar kaku sehingga pada layar di bawah 576px terjadi luapan (_overflow_) horizontal.
- **Solusi Arsitektural yang Diterapkan**:
  - Mengaktifkan `-webkit-text-size-adjust: 100%;` pada `html` dan `body` untuk menonaktifkan pembesaran teks otomatis peramban sembari tetap menghormati hierarki unit `rem`.
  - Menerapkan `overflow-x: hidden; max-width: 100%;` pada `body` serta mengunci scroll horizontal tabel hanya di dalam kontainer `.table-responsive` dengan `overflow-x: auto; overscroll-behavior-x: contain;`.
  - Mengintegrasikan `viewport-fit=cover` dan satuan viewport dinamis modern (`min-height: 100dvh;`) serta perlindungan safe area:
    `padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);`.
  - Merancang ulang `#input_form` dan `.footer-social-btn` dengan flexbox dinamis sehingga tidak ada elemen yang memiliki lebar minimum melebihi 320px.
  - Diverifikasi lulus pengujian otomatis pada 12 profil resolusi termasuk orientasi potret dan lanskap pada Xiaomi, Redmi, dan POCO dengan nol luapan dokumen horizontal (`scrollWidth === clientWidth`).

### 13. Arsitektur Search Engine Optimization (SEO) Ramah Mesin Pencari

- **Struktur HTML5 Semantik**: Menggunakan satu `<h1>` utama, landmark semantik `<main>`, `<section>`, `<header>`, `<footer>`, dan `<nav>` yang mematuhi standar perayapan mesin pencari.
- **Tag Meta Komprehensif**:
  - Judul `<title>` deskriptif dan unik: `Visual Subnet Calculator - IPv4 & IPv6 Subnet Planner`.
  - Meta deskripsi ringkas (160 karakter) yang memuat kata kunci utama kalkulator subnet, CIDR, dan profil cloud.
  - Direktif robots terperinci: `index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1`.
- **Integrasi Media Sosial (Rich Snippets)**:
  - Kartu Open Graph (`og:title`, `og:description`, `og:image`, `og:url`, `og:site_name`, `og:locale`).
  - Kartu Twitter / X (`summary_large_image`, `twitter:site`, `twitter:creator`).
- **Data Terstruktur Schema.org (JSON-LD)**: Skema `WebApplication` lengkap yang mencakup `operatingSystem: All`, `applicationCategory: NetworkingApplication`, `featureList`, dan `softwareVersion: 1.4.3`.
- **Sitemap & Robots.txt**: `dist/sitemap.xml` dan `dist/robots.txt` siap pakai untuk indeksasi cepat oleh Googlebot dan Bingbot.

---

## Diagnostik & Pemecahan Masalah: Peringatan Pemeriksa HTML IDE (`@[current_problems]`)

Selama proses pengembangan, IDE dapat memunculkan peringatan berikut:

```json
{
  "path": "/dist/index.html",
  "message": "Could not get results from HTML checker for 'file:///.../dist/index.html'. Error: 'Unexpected token '<', \"<!DOCTYPE \"... is not valid JSON'.",
  "severity": "warning",
  "startLine": 1,
  "endLine": 1
}
```

### Analisis Akar Masalah (Root Cause)

1. **Asal Peringatan**: Peringatan ini **bukan** berasal dari kesalahan sintaksis markup atau kode HTML yang salah pada `index.html` maupun `404.html`. Peringatan ini dihasilkan oleh ekstensi validator HTML pada IDE (seperti ekstensi VS Code W3C HTML Validator) yang mencoba mengunggah dokumen HTML via koneksi HTTP POST ke server layanan web validator online (`https://validator.w3.org/nu/`).
2. **Mekanisme Kegagalan**: Ketika koneksi jaringan internet ke server validator tidak tersedia, diblokir, atau saat server eksternal validator merespons dengan halaman galat berformat HTML (seperti halaman 502/503 atau captive portal yang diawali string `<!DOCTYPE html>`), ekstensi IDE mencoba mem-parsing respons tersebut sebagai JSON via `JSON.parse()`. Karena tubuh respons adalah dokumen HTML bukan JSON, `JSON.parse()` melempar kesalahan parser `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`.
3. **Pembuktian & Verifikasi**: Pengujian linter statis offline menggunakan linter standar industri `html-validate` membuktikan bahwa `dist/index.html` dan `dist/404.html` adalah **100% valid sesuai spesifikasi HTML5** dengan hasil **0 galat dan 0 peringatan**:
   ```bash
   npx html-validate dist/index.html dist/404.html
   # Hasil: PASSED (0 errors, 0 warnings)
   ```
4. **Solusi Permanen pada `.hintrc`**: Peringatan ini dihasilkan secara spesifik oleh integrasi ekstensi Webhint / Edge DevTools (`@hint/hint-html-checker`) yang membaca konfigurasi `.hintrc` pada direktori kerja. Dengan menambahkan konfigurasi `"html-checker": "off"` pada `.hintrc`, ekstensi diinstruksikan untuk tidak menjalankan permintaan HTTP eksternal ke `validator.w3.org`, melenyapkan peringatan palsu tersebut secara permanen dari tab Problems IDE sekaligus menjaga efisiensi validasi HTML offline via `html-validate`.

---

## Arsitektur Kontrol UI Modern & Pengerasan Sistem (v1.4.3)

### 1. Mesin Reset Perhitungan Subnet Instan (`#btn_reset`)

Untuk mempermudah alur kerja pengguna, tombol aksi reset (`#btn_reset`) ditempatkan tepat di sebelah `#btn_tools`:

- **Pemulihan Kondisi Awal Dual-Stack**:
  - IPv4: Mengembalikan `#network` ke `10.0.0.0`, `#netsize` ke `16`, mengaktifkan preset `/16`, mengatur `subnetMap = {"10.0.0.0/16": {}}`, dan mereset `maxNetSize = 16`.
  - IPv6: Mengembalikan `#network` ke `2001:db8::`, `#netsize` ke `32`, mengaktifkan preset `/32`, mengatur `subnetMap = {"2001:db8::/32": {}}`, dan mereset `maxNetSize = 32`.
- **Netralisasi Status Validasi**: Mengeksekusi `$("#input_form").removeClass("was-validated")` dan metode `.resetForm()` dari plugin jQuery Validation, menghapus indikator galat merah dan pesan validasi secara instan.
- **Sinkronisasi Presets & RFC 1918**: Menjalankan fungsi `updateActiveIpv4Preset()` atau `updateActiveIpv6Preset()` serta `updateRfc1918Indicator()`.
- **Reset Mode Operasi**: Mengembalikan `operatingMode` ke `"Standard"` melalui `switchMode("Standard")`.
- **Serialisasi Status & URL**: Memicu `renderTable(operatingMode)` dan `syncUrlState()` untuk segera membersihkan parameter pemecahan kustom dari bilah URL peramban.

### 2. Standar Token Warna Palet Pastel 2026 & Kontras WCAG

Visual Subnet Calculator menerapkan palet warna pastel modern berstandar 2026 yang ergonomis dan aksesibel untuk tombol kontrol operasional utama:

| Tombol    | Peran / Kelas                      | Latar Mode Terang       | Teks Mode Terang        | Latar Mode Gelap        | Teks Mode Gelap         | Kontras WCAG      |
| :-------- | :--------------------------------- | :---------------------- | :---------------------- | :---------------------- | :---------------------- | :---------------- |
| **Tools** | `#btn_tools` (`.btn-pastel-green`) | `#d1fae5` (Emerald 100) | `#065f46` (Emerald 800) | `#064e3b` (Emerald 900) | `#a7f3d0` (Emerald 200) | **AAA** (> 7.2:1) |
| **Reset** | `#btn_reset` (`.btn-pastel-red`)   | `#fee2e2` (Rose 100)    | `#991b1b` (Rose 800)    | `#7f1d1d` (Rose 900)    | `#fecaca` (Rose 200)    | **AAA** (> 7.4:1) |

Kedua token warna dilengkapi interaksi mikro saat hover (`transform: translateY(-1px)`, bayangan ambient halus) serta cincin fokus aksesibel `:focus-visible` yang mematuhi standar WCAG 2.2 AA.

### 3. Penguatan Siklus Hidup DOM Tombol Kembali ke Atas (`#btn_scroll_top`)

Pada tabel subnet yang panjang dengan puluhan pemecahan (terutama pada alokasi IPv6 seperti `/32 -> /48 -> /56 -> /64`), tombol navigasi kembali ke atas sangat krusial:

- **Posisi DOM**: Diletakkan tepat sebelum tag `<script>` untuk memastikan elemen telah tersedia di pohon DOM sebelum skrip JavaScript dieksekusi.
- **Hook Siklus Hidup**: Dibungkus dalam pendengar `DOMContentLoaded` (dengan fallback eksekusi instan jika `document.readyState !== "loading"`).
- **Pemasangan Pendengar Ganda**: Memantau event scroll baik pada objek `window` maupun `document` guna menjamin kompatibilitas di berbagai viewport seluler, kontainer scroll bersarang, dan browser desktop.
- **Ambang Batas Scroll**: Diaktifkan secara responsif ketika jarak scroll vertikal melampaui `120px` (`window.scrollY > 120 || document.documentElement.scrollTop > 120`).
- **Konteks Tumpukan Tinggi (z-index)**: Menggunakan `z-index: 1060`, berada di atas baris tabel dan badge footer namun tetap di bawah backdrop modal Bootstrap.

### 4. Mitigasi Kondisi Balapan Transisi Penutupan Modal Bootstrap 5

Ketika pengujian otomatis atau interaksi pengguna yang cepat menutup modal saat animasi fade-in pembukaan masih berlangsung:

- **Akar Masalah**: Metode internal Bootstrap 5 `Modal.prototype.hide()` memeriksa `if (this._isTransitioning) return;`. Jika klik penutupan terjadi saat modal masih dalam proses fade-in, Bootstrap mengabaikan aksi tersebut sehingga modal tetap terbuka.
- **Kelemahan Solusi Naif**: Pemasangan event listener `{ once: true }` pada `shown.bs.modal` memicu kondisi balapan baru. Jika penutupan terjadi saat modal sedang menutup, event `shown` tidak tertembak sehingga listener tertinggal dan langsung menutup modal tersebut secara prematur pada saat dibuka kembali di masa depan.
- **Solusi Standar Produksi**: Menerapkan flag `_pendingDismiss` berlingkup elemen node DOM modal:
  ```javascript
  $(document).on("click", ".modal [data-bs-dismiss='modal']", function () {
    const modalEl = $(this).closest(".modal")[0];
    if (modalEl && typeof bootstrap !== "undefined" && bootstrap.Modal) {
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (
        modalInstance &&
        modalInstance._isTransitioning &&
        modalEl.classList.contains("show")
      ) {
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
  Pola ini menjamin tidak ada kebocoran status antar-modal dan penutupan selalu dieksekusi secara 100% andal di segala kecepatan pengujian.

### 5. Remediasi DOM XSS Peringatan CodeQL #6 [Tingkat Tinggi]

Peringatan keamanan GitHub CodeQL Alert #6 mengidentifikasi potensi celah DOM XSS tingkat tinggi pada `dist/js/main.js` di mana data dari masukan DOM diinterpretasikan ulang sebagai HTML:

- **Badge Status RFC 1918 (`updateRfc1918Indicator`)**: Menggantikan interpolasi template string `.html(...)` dengan pembuatan node DOM terprogram yang aman (`$("<span>")`, `$("<i>")`) serta penugasan teks strictly `.text()`, sepenuhnya mencegah injeksi kode HTML ke dalam kontainer status.
- **Penempatan Galat Formulir (`errorPlacement`)**: Menggantikan pembacaan langsung `error[0].innerHTML` dengan pembacaan teks bersih `error.text()` sebelum pesan tooltip ditampilkan.
- **Baris Header Induk (`addParentHeaderRow`)**: Menegakkan penyandian entitas karakter (`escapeHtml()`) pada seluruh nilai dinamis seperti catatan subnet, rentang alamat, dan jumlah host sebelum diinterpolasi ke dalam tabel.
- **Sanitasi Atribut Aksesibel**: Menghapus penugasan `aria-label` dinamis yang redundan pada `#live_shareable_url` guna menghindari peringatan linter HTML terhadap refleksi atribut DOM tanpa validasi.

### 6. Arsitektur Pemecahan Subnet IPv6 /64

Visual Subnet Calculator mendukung pemecahan interaktif tanpa hambatan pada seluruh spektrum prefiks IPv6:

- **Evolusi Batas SLAAC**: Di samping subnet standar (`/32` hingga `/60`), prefiks `/64` kini dapat dipecah secara interaktif menjadi 16 subnet `/68`, yang kemudian dapat dipecah lebih lanjut ke `/72`, `/76`, `/80`, `/84`, `/88`, `/92`, `/96`, `/112`, `/120`, `/124`, dan `/127` (tautan point-to-point).
- **Desain Node Daun**: Dalam fungsi `addRow()`, baris tabel ditetapkan sebagai non-daun (`isLeaf = false`) untuk seluruh prefiks `< 128`, mengaktifkan tombol kolom aksi pemecahan pada semua prefiks valid. Hanya prefiks `/128` (host/loopback) yang ditetapkan sebagai daun permanen.
- **Integritas Serialisasi Pohon**: Ketika subnet akar belum pernah dipecah (`!hasDivided(rootAddress, rootNetSize)`), fungsi `encodeDivisionTree()` mengembalikan string kosong (`""`), menjaga format URL kanonikal tetap bersih dan rapi (`?network=2001-db8--&mask=64`).

### 7. Optimasi Tata Letak Tampilan Seluler Xiaomi, Redmi, dan POCO

Fitur inflasi ukuran font sistem yang agresif serta rasio aspek layar yang sangat tinggi (20:9 dan 20.5:9) pada lingkungan MIUI dan HyperOS dapat menyebabkan tampilan antarmuka terpotong dan menghasilkan luapan (_overflow_) horizontal:

- **Netralisasi Inflasi Font**: Mengonfigurasi `text-size-adjust: 100%` dan `-webkit-text-size-adjust: 100%` pada `html, body, table, input, select, button` untuk mencegah algoritma pembesaran teks peramban merusak ukuran sel tabel dan kontrol formulir.
- **Perbaikan Min-Width Flexbox**: Menambahkan aturan `min-width: 0` pada elemen-elemen turunan flex (`#ipv4_tier_info`, `#ipv6_tier_info`, `#input_form`, `.app-header-left`), menggantikan nilai bawaan `min-width: auto` yang memicu pemaksaan lebar minimum pada layar 360px–412px.
- **Reklamasi Ruang Header**: Menghapus `padding-right: 6rem` dan `7rem` buatan pada judul `h1`, memungkinkan judul aplikasi dan tombol navigasi mengalir alami tanpa mendorong ikon aksi ke luar batas layar.
- **Pembungkusan Formulir yang Mengalir (Fluid Wrapping)**: Merancang ulang `#input_form` pada layar `< 576px` menjadi dua baris rapi: alamat jaringan dan prefiks berada bersisian di baris 1, sementara tombol Go, Tools, dan Reset membentang di baris 2 dalam toolbar terpadu.
- **Penanganan Safe Area Insets**: Menerapkan fungsi `env(safe-area-inset-*)` dengan fallback `max()` pada pembungkus halaman guna melindungi konten dari gangguan potongan kamera depan (_punch hole / DotDisplay_) dan bilah navigasi gestur.

### 8. Kalibrasi Palet Subnet Mode Gelap & Mesin Kontras Luminansi Terpersepsi

Ketika pengguna menyesuaikan warna latar belakang baris tabel subnet pada Mode Gelap (`[data-theme="dark"]` atau `[data-bs-theme="dark"]`), gaya bawaan tabel sebelumnya memaksakan teks terang (`#f8fafc !important`), menyebabkan teks menjadi putih-di-atas-putih/pastel dan tidak terbaca:

- **Palet Subnet Mode Gelap (`--subpal-1-1` hingga `--subpal-1-10`)**: Merancang ulang token palet latar belakang baris tabel subnet khusus tema gelap menggunakan warna permata (_jewel tones_) yang gelap dengan kontras tinggi:
  - `--subpal-1-1`: `#5c1d2e` (Crimson Gelap / Garnet)
  - `--subpal-1-2`: `#5c2c10` (Terracotta Hangat / Karat)
  - `--subpal-1-3`: `#4a3e0f` (Emas Antik / Perunggu)
  - `--subpal-1-4`: `#0d4a34` (Pinus Gelap / Zamrud)
  - `--subpal-1-5`: `#0e4354` (Cyan Gelap / Teal Dalam)
  - `--subpal-1-6`: `#1e355b` (Safir Tengah Malam / Denim)
  - `--subpal-1-7`: `#322566` (Nila Gelap / Amethyst)
  - `--subpal-1-8`: `#4c184c` (Plum Gelap / Murbei)
  - `--subpal-1-9`: `#273549` (Baja Abu-abu / Slate Gelap)
  - `--subpal-1-10`: `#131d2e` (Obsidian Gelap / Laut Dalam)
- **Visibilitas Pemilih Palet & Tombol Aksi**: Tombol swatch pemilih warna pada mode gelap ditingkatkan dengan batas luminous (`1.5px solid rgba(255, 255, 255, 0.45)`) dan cincin fokus cerah (`#38bdf8`), serta badge tombol navigasi `.bottom-nav-btn` ("Ubah Warna »" dan "« Berhenti Mengubah Warna") beraksen cyan kontras tinggi.
- **Mesin Luminansi Terpersepsi Dinamis (`isColorLight`)**: Demi menjamin keterbacaan teks pada warna kustom maupun warna yang diimpor dari file pengguna, algoritma matematis luminansi relatif menghitung tingkat kecerahan warna latar:
  $$\text{Luminansi} = 0.299 \times R + 0.587 \times G + 0.114 \times B$$
  Baris dengan nilai luminansi $> 140$ secara dinamis ditandai dengan kelas `.has-light-bg`, memaksakan teks slate gelap (`#0f172a !important`) dan tautan jenuh (`#0369a1 !important`), sedangkan baris yang lebih gelap ditandai dengan `.has-dark-bg`, menjamin rasio kontras WCAG 2.2 AA di seluruh tema.

### 9. Integrasi Suite Mega-Linter Terpadu & Infrastruktur Mutu Kode Bebas Galat

Untuk memenuhi standar gerbang mutu tingkat perusahaan dan mencegah regresi pada pipeline CI/CD, konfigurasi `.mega-linter.yml` diperbarui dengan cakupan komprehensif di seluruh teknologi proyek:

- **Deskriptor Linter Aktif**: Matriks linter lengkap diaktifkan untuk `MARKDOWN`, `JAVASCRIPT`, `TYPESCRIPT`, `CSS`, `HTML`, `JSON`, dan `YAML`.
- **Linter yang Dijalankan**:
  - Markdown: `MARKDOWN_MARKDOWNLINT` (hierarki heading ketat, bebas trailing whitespace, indentasi list konsisten).
  - HTML: `HTML_HTMLHINT` dan `html-validate` (pemformatan atribut ketat, label tombol semantik, struktur dokumen bersih).
  - CSS/SCSS: `CSS_STYLELINT` dengan aturan terarah `.stylelintrc.json` (format pseudo-class ketat, selektor terdeduplikasi, dukungan properti duplikat berurutan).
  - JavaScript/TypeScript: `JAVASCRIPT_ESLINT` (konfigurasi flat `eslint.config.js` dengan browser globals, pemeriksaan sintaks ketat) dan `JAVASCRIPT_STANDARD`.
- **Verifikasi Bebas Galat (Zero-Error)**: Seluruh alur kerja lokal maupun CI berhasil lolos verifikasi 100% bersih (0 galat, 0 peringatan) di seluruh repositori.

---

## Pertimbangan Keamanan

- **Isolasi Penuh di Sisi Klien**: Seluruh kalkulasi berlangsung sepenuhnya di dalam runtime peramban. Tidak ada data pengguna, skema IP, maupun catatan teks yang dikirimkan ke server backend mana pun.
- **Pencegahan XSS**: Setiap nilai dinamis yang disisipkan ke dalam DOM (termasuk isi catatan yang dimuat dari file impor atau URL bersama) melewati penyandian entitas karakter sebelum proses interpolasi string.
- **Pencegahan DOM XSS (CodeQL Alerts #5 & #6)**: Masukan koreksi batas jaringan dan badge status RFC 1918 diisolasi ke handler terdedikasi menggunakan pembuatan elemen DOM yang aman dan pengikatan `.text()`, meniadakan _sink_ interpretasi HTML mentah.
- **Sanitasi Warna CSS (v1.4.3)**: Atribut `style="background-color: ..."` yang dihasilkan secara dinamis untuk baris tabel subnet divalidasi menggunakan regex whitelist CSS Color Level 4 `^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$`.
- **Aksesibilitas & Kepatuhan Formulir**: Input file tersembunyi (`#importFileInput`) dipasangkan dengan label semantik (`<label for="importFileInput" class="visually-hidden">`) dan atribut judul, memenuhi standar pembaca layar WCAG 2.2 AA dan aturan linter HTML tanpa menghasilkan atribut ARIA yang redundan.
- **Kebijakan Keamanan Konten (CSP)**: Aplikasi tidak memerlukan skrip eksternal di luar aset distribusi lokal, memungkinkan penerapan kebijakan `script-src 'self'` yang ketat pada _reverse proxy_ produksi.
