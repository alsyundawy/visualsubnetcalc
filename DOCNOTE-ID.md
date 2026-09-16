# Catatan Dokumentasi Teknis — Visual Subnet Calculator

Spesifikasi arsitektur teknis, standar keamanan, dan panduan integrasi operasional untuk Visual Subnet Calculator v1.4.2.

---

## 🧭 Ikhtisar Arsitektur

Visual Subnet Calculator adalah aplikasi visual kalkulator dan perancang subnet IP di sisi klien (_client-side_) yang dirancang untuk memberikan performa tinggi, latensi eksekusi nol, serta kompatibilitas lintas peramban yang maksimal. Dimulai sejak versi 1.4.2, aplikasi menghadirkan arsitektur _dual-stack_ terpadu yang mendukung perencanaan visual IPv4 legasi (CIDR 32-bit) dan IPv6 modern (hierarki tingkatan 128-bit).

### Lapisan Arsitektur Utama

- **Struktur (`dist/index.html`)**: Markup semantik HTML5 yang dibangun dengan sistem kisi (_grid_) Bootstrap 5.3.8, toolbar pemilihan versi IP tersegmen dan aksesibel (`#ip_version_toolbar`), kontainer tabel responsif, dialog modal aksesibel, serta anotasi ARIA yang mematuhi pedoman WCAG 2.2 Level AA. Bersih seutuhnya dari atribut gaya inline (`style="..."`).
- **Presentasi (`dist/css/main.css`)**: CSS modern yang memanfaatkan aturan ruang lingkup (_scoped rules_), media queries responsif dari resolusi VGA (640×480) hingga 2K (2560×1440), cincin fokus aksesibel `:focus-visible`, awalan vendor `-webkit-user-select` untuk Safari, mode tata letak khusus IPv6 (`#calc.ipv6-mode`), serta bebas dari polusi selektor global.
- **Logika (`dist/js/main.js`)**: JavaScript vanilla murni berstandar modern yang dipadukan dengan utilitas DOM jQuery 3.7.1 dan komponen Bootstrap 5.3.8, mengimplementasikan matematika bitwise 32-bit (IPv4) dan bitwise native 128-bit `BigInt` (IPv6), rekursi pohon subnet hierarkis, serialisasi status LZ-String, serta sanitasi XSS kontekstual.
- **Profil Cloud**: Preset bawaan vendor cloud terkemuka yang menyesuaikan perhitungan alamat IP yang dapat digunakan (_usable IPs_) mengikuti aturan standar RFC 1918/RFC 4632 atau reservasi khusus penyedia layanan cloud (AWS mencadangkan 5 alamat IP, Azure mencadangkan 5 alamat IP, OCI mencadangkan 3 alamat IP).

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

- **Dukungan Dual-Stack IPv4/IPv6 Penuh (v1.4.2)**: Mengintegrasikan switcher versi IP tersegmen dengan matematika bitwise 128-bit `BigInt`, format kanonikal RFC 5952, toolbar preset (/32 hingga /128), link point-to-point RFC 6164, dan proteksi SLAAC RFC 7421.
- **Arsitektur Akordion FAQ Interaktif**: Mengubah FAQ statis menjadi Akordion Bootstrap interaktif dan aksesibel (`#faqAccordion`) yang memuat 10 modul panduan arsitektur. Dilengkapi tombol kendali satu-klik "Expand All" (`#faq_expand_all`) dan "Collapse All" (`#faq_collapse_all`).
- **Ikonografi Font Awesome Free v7 Terkini**: Memperbarui ekosistem grafis dengan ikon Font Awesome Free v7.3.1 pada seluruh header, toolbar, palet warna, modal, dan footer.
- **Footer Maintainer Flexbox yang Melekat (Sticky Footer)**: Mengembangkan footer permanen (`#app_footer`) menggunakan tata letak CSS Flexbox (`min-height: 100dvh`, `margin-top: auto`), yang selalu melekat di bagian bawah viewport pada seluruh halaman termasuk halaman galat 404. Memuat profil pengelola resmi HARRY DERTIN SUTISNA (`@alsyundawy`) dan ALSYUNDAWY IT SOLUTION ([https://alsyundawy.com](https://alsyundawy.com)), kontak cepat (X dan Telegram), serta donasi PayPal.
- **Ikon Merek pada Header**: Menyematkan ikon resmi Font Awesome `fa-network-wired` mendampingi judul utama `<h1>` "Visual Subnet Calculator".
- **Modernisasi Kerangka Kerja & Library**: Peningkatan ke Bootstrap 5.3.8 dan jQuery 3.7.1 dengan hash SRI tervalidasi tanpa dependensi luar yang tidak aman.
- **Pengerasan Aksesibilitas (WCAG 2.2 AA)**: Keterangan tabel semantik (`.visually-hidden`), palet warna yang dapat dinavigasi menggunakan keyboard (`role="button"`, `tabindex="0"`), serta header kolom semantik `<th scope="col">`.
- **Pengerasan Keamanan Tingkat Tinggi**: Sanitasi entitas HTML (`escapeHtml()`) pada seluruh teks catatan dinamis guna menangkal ancaman Cross-Site Scripting (XSS) tersimpan maupun terefleksi.
- **Resolusi Celah DOM XSS (CodeQL Alert #5)**: Isolasi penuh input batas jaringan melalui fungsi pembantu `show_boundary_warning_modal()` yang menggunakan pengikatan teks node `.text()` yang aman.
- **Kepatuhan CI/CD dan Linter Ketat**: Kepatuhan penuh terhadap Trunk Check, Prettier, Markdownlint, serta cakupan pengujian otomatis Playwright lintas peramban Chromium dan Firefox (114 uji otomatis berhasil).
- **Standar Formulir & Kepatuhan Autofill**: Semua kontrol formulir (`#network`, `#netsize`, `#importExportArea`, `#importFileInput`, dan setiap input dinamis `#note_*`) memiliki atribut `id` dan `name` unik serta pasangan `<label>` eksplisit.
- **Skalabilitas Responsif Multi-Resolusi**: Sistem token CSS terpadu dengan breakpoint yang mencakup ponsel (potret/lanskap), tablet, MacBook, desktop FHD, hingga layar resolusi tinggi 2K (VGA 640×480 hingga 2560×1440).

---

## Mesin Impor & Ekspor Multi-Format (v1.4.2)

Visual Subnet Calculator v1.4.2 memperkenalkan sistem pertukaran data multi-format yang dapat diakses melalui modal Impor / Ekspor (`#importExportModal`), mendukung spreadsheet CSV standar RFC 4180, tabel dokumentasi Plain Text, serta konfigurasi hierarkis JSON:

### 1. Format Ekspor

- **JSON (`exportConfig`)**: Menyerialisasi seluruh struktur hierarki pohon termasuk jaringan dasar, mode operasional (`Standard`, `AWS`, `Azure`, `OCI`), versi IP aktif (`IPv4`, `IPv6`), catatan kustom (`_note`), dan pemetaan warna (`_color`).
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

## Rekayasa Performa & Modernisasi (v1.4.2)

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
- **Aksesibilitas & Kepatuhan Formulir**: Input file tersembunyi (`#importFileInput`) dipasangkan dengan label semantik (`<label for="importFileInput" class="visually-hidden">`) dan atribut judul, memenuhi standar pembaca layar WCAG 2.2 AA dan aturan linter HTML tanpa menghasilkan atribut ARIA yang redundan.
- **Kebijakan Keamanan Konten (CSP)**: Aplikasi tidak memerlukan skrip eksternal di luar aset distribusi lokal, memungkinkan penerapan kebijakan `script-src 'self'` yang ketat pada _reverse proxy_ produksi.
