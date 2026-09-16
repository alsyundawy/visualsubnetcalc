# Catatan Perubahan (Changelog) — Visual Subnet Calculator

<!-- markdownlint-disable MD024 -->

Seluruh perubahan penting pada proyek Visual Subnet Calculator akan didokumentasikan dalam berkas ini.

Format pencatatan mengacu pada [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
dan proyek ini mematuhi standar [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.2] - 2026-09-16

### Ditambahkan

- Bilah alat pemilih versi IP tersegmen dan interaktif (`#ip_version_toolbar`) dengan pengelompokan semantik `<fieldset>`, `<legend>` tersembunyi, serta tombol `#btn_ipv4` dan `#btn_ipv6` yang dapat diakses penuh via keyboard sesuai standar WCAG 2.2 AA (`aria-pressed`).
- Bilah alat preset prefiks IPv4 interaktif (`#ipv4_tier_info`) yang memuat 17 preset CIDR satu-klik dari `/16` hingga `/32` dengan sinkronisasi dua arah secara _real-time_ antara tombol toolbar dan kolom input ukuran jaringan. Default: `/16` (`10.0.0.0/16`).
- Bilah alat preset prefiks IPv6 interaktif (`#ipv6_tier_info`) dengan 12 tingkatan rekayasa jaringan standar: `/32` (default), `/48`, `/56`, `/60`, `/64`, `/80`, `/96`, `/112`, `/120`, `/124`, `/127`, dan `/128`, dilengkapi sinkronisasi dua arah secara _real-time_ dengan kolom input panjang prefiks. Default: `/32` (`2001:db8::/32`).
- Perombakan total sistem FAQ menjadi Akordion Bootstrap interaktif dan aksesibel (`#faqAccordion`) yang memuat 10 topik panduan arsitektur: Ikhtisar, Mekanisme Split/Join, Dual-Stack IPv4/IPv6, Profil reservasi cloud (Standar, AWS, Azure, OCI) beserta matriks perbandingan, Pewarnaan 10-swatch & catatan teks, Berbagi URL LZ-String & impor/ekspor data, Privasi sisi klien & keandalan offline, Dukungan perangkat universal (VGA hingga 2K/4K), Pintasan masukan & validasi, serta Kontak resmi pengelola.
- Tombol kendali akordion terpadu "Expand All" (`#faq_expand_all`) dan "Collapse All" (`#faq_collapse_all`) dengan animasi buka-tutup Bootstrap yang halus.
- Peningkatan menyeluruh seluruh ikonografi antarmuka ke Font Awesome Free v7 (`@fortawesome/fontawesome-free` v7.3.1) pada navigasi header, toolbar, palet warna, dialog modal, dan footer melekat.
- Pengembangan footer pengelola permanen (`#app_footer`) yang melekat di dasar viewport, menampilkan profil pengelola resmi HARRY DERTIN SUTISNA (`@alsyundawy`) dan ALSYUNDAWY IT SOLUTION ([https://alsyundawy.com](https://alsyundawy.com)), saluran media sosial (X dan Telegram), kontak cepat, serta donasi PayPal.
- Penambahan ikon kontras tinggi Font Awesome `fa-network-wired` mendampingi judul utama "Visual Subnet Calculator" pada header aplikasi (`dist/index.html`, `dist/404.html`).
- Peningkatan efek interaktif sorot dan hover ("pilihan / SOROT") di seluruh antarmuka: efek penyorotan baris tabel yang halus (`box-shadow: inset` tanpa menimpa warna kustom subnet), umpan balik visual sel interaktif Split dan Join yang aktif, elevasi chip preset CIDR saat disentuh kursor, indikator visual warna palet terpilih (`.selected-color`), styling dropdown item hover, serta warna seleksi teks kustom (`::selection`).
- Desain responsif multi-resolusi universal dengan `flex-wrap: wrap`, padding chip yang kompak, dan jarak 2px antar-tombol preset, mencegah elemen meluap (_overflow_) pada layar VGA (640×480), smartphone (iPhone, Samsung, Xiaomi, Android), tablet (iPad), laptop (MacBook), hingga monitor resolusi tinggi 2K/4K.
- Mesin kalkulasi subnetting 128-bit IPv6 komprehensif berbasis `BigInt` (`parseIpv6`, `formatIpv6`, `getIpv6Network`, `getIpv6End`, `getIpv6Capacity`) guna mencegah _integer overflow_ dan penurunan presisi.
- Kompresi alamat IPv6 kanonikal yang mematuhi standar IETF RFC 5952 secara ketat (kompresi nol dengan `::`, penekanan angka nol awal, representasi heksadesimal huruf kecil).
- Alur tingkatan hierarkis IPv6 standar (`/32 -> /48 -> /56 -> /60 -> /64`) dan langkah sub-delegasi granular (`/80 -> /96 -> /112 -> /120 -> /124 -> /127 -> /128`) yang memungkinkan pemodelan alokasi bersih dari blok transit ISP hingga tautan lokal dan point-to-point.
- Dukungan tautan antar-router point-to-point RFC 6164 (`/127`, 2 IP host yang dapat digunakan), dengan pemecahan interaktif menjadi dua subnet host/loopback `/128`.
- Penegakan batasan host/loopback RFC 4291 (`/128`), yang ditetapkan sebagai simpul daun permanen guna mencegah pemecahan lebih lanjut.
- Adaptasi tabel dinamis bagi pengguna yang memulai dari tingkatan kustom atau preset apa pun (`/32`, `/48`, `/56`, `/60`, `/64`, `/80`, `/96`, `/112`, `/120`, `/124`, `/127`, atau `/128`).
- Perlindungan prefiks daun SLAAC sesuai IETF RFC 4291 dan RFC 7421: menandai subnet `/64` sebagai simpul daun permanen (`.split-disabled`) dan menampilkan dialog modal edukatif saat diklik.
- Deteksi otomatis versi IP saat menempel teks dari clipboard: menempelkan CIDR IPv6 secara otomatis mengaktifkan mode IPv6, sedangkan menempelkan CIDR IPv4 mengaktifkan mode IPv4.
- Header tabel kontekstual yang beradaptasi dinamis antara IPv4 (`Range of Addresses`, `Usable IPs`, `Hosts`) dan IPv6 (`Subnet Range`, `Subnet / Interface ID`, `Subnet Capacity`).
- Aturan tata letak CSS terlingkup (`#calc.ipv6-mode`) yang memberikan penyesuaian ukuran font (`0.74rem`), pemenggalan kata otomatis (`word-break: break-all`), serta perataan horizontal pada viewport seluler, tablet, dan desktop.
- Mesin Impor & Ekspor Multi-Format (`#importExportModal`) yang mendukung format CSV standar RFC 4180 dan tabel teks rata-kolom Plain Text di samping konfigurasi hierarkis JSON.
- Tombol bilah alat pemilih format interaktif (`#btn_format_json`, `#btn_format_csv`, `#btn_format_txt`) yang memungkinkan perpindahan seketika antara tampilan JSON, CSV, dan Plain Text.
- Tombol Salin Cepat (`#btn_copy_export`) dengan umpan balik visual transien "Copied!" untuk ekspor clipboard instan pada seluruh format.
- Fitur Unduh Berkas Langsung (`#btn_download_export`) yang mengekspor berkas `.json`, `.csv`, atau `.txt` langsung ke komputer pengguna menggunakan objek `Blob` dan URL objek standar.
- Integrasi Unggah Berkas (`#btn_upload_file`, `#importFileInput`) yang mendukung pemuatan berkas `.json`, `.csv`, dan `.txt` langsung ke dalam kalkulator disertai deteksi format otomatis.
- Perhitungan supernet minimal matematis (`Math.min`, bitwise `xor`, `Math.log2`) dan rekonstruksi pohon biner rekursif (`insertSubnetIntoTree`) yang mengubah daftar flat CIDR CSV/TXT menjadi pohon `subnetMap` hierarkis lengkap dengan pemulihan catatan dan warna.
- Perluasan rangkaian pengujian otomatis Playwright pada `src/tests/import-export.spec.ts` yang mencakup ekspor CSV, ekspor Plain Text, impor CSV, dan impor Plain Text pada peramban Chromium dan Firefox (total 114 pengujian lulus).
- Rangkaian uji otomatis end-to-end Playwright (`src/tests/ipv6-subnet.spec.ts`, `src/tests/subnet-basic.spec.ts`, dan `src/tests/ui-usage.spec.ts`) yang memvalidasi peralihan toolbar, preset, pemecahan tingkatan, peringatan batas, interaksi akordion FAQ, dan preservasi status reversibel pada Chromium dan Firefox (total 114 pengujian lulus).

### Diperbaiki

- Memodernisasi tata letak header aplikasi dari `float-end` menjadi header flexbox semantik (`<header id="app_header">`), mengatasi masalah tumpang-tindih spanduk notifikasi di atas ikon repositori GitHub.
- Memperbaiki disparitas header tabel responsif pada layar `< 576px`: menyinkronkan visibilitas header `#rangeHeader` dan `#useableHeader` dengan sel data baris guna meniadakan ketidakcocokan kolom pada layar ponsel.
- Memperbaiki urutan kunci ekspor konfigurasi dan serialisasi bersyarat properti `ip_version`, menjaga kompatibilitas mundur byte-per-byte 100% dengan parser skema IPv4 v1/v2 lama.
- Memperbaiki aksesibilitas formulir pada input file `#importFileInput` dengan menyediakan elemen `<label for="importFileInput" class="visually-hidden">` eksplisit dan atribut `title`, menjamin kepatuhan 100% terhadap standar pelabelan formulir HTML dan WCAG 2.2 AA tanpa peringatan ARIA redundan.
- Mengoptimalkan kalkulasi alamat jaringan IPv4 `get_network()` dari perulangan iteratif $O(N)$ menjadi kalkulasi masker bitwise berwaktu-konstan $O(1)$ (`(0xffffffff << (32 - netSize)) >>> 0`), mempercepat mutasi pohon subnet dan proses render ulang tabel besar secara dramatis.
- Memodernisasi pola legasi ES5 pada berbagai fungsi pembantu (`ip2int`, `has_network_sub_keys`, `get_matching_network_list`, `get_property_values`) menggunakan fungsi panah ES6, `for...of`, dan sintaks spread.

### Diubah

- Memperbarui `softwareVersion` pada data terstruktur Schema.org `WebApplication` menjadi `1.4.2`.
- Memperbarui lencana rilis dan tautan changelog pada footer aplikasi menjadi Visual Subnet Calculator `v1.4.2`.

## [1.4.1] - 2026-09-16

### Ditambahkan

- Aksesibilitas tabel semantik dengan elemen `<caption class="visually-hidden">` pada tabel subnet utama.
- Header kolom tabel semantik HTML5 dengan `<th scope="col">` yang mematuhi pedoman WCAG 2.2 AA secara ketat tanpa penimpaan role ARIA non-interaktif.
- Pembungkus pengguliran horizontal responsif (`.table-responsive`) yang memungkinkan penjelajahan mulus mulai dari layar VGA (640×480) hingga layar 2K lebar.
- Navigasi keyboard penuh dan atribut ARIA (`tabindex="0"`, `role="button"`, `aria-label`) untuk pemilih warna palet dan aksi bilah alat dengan event listener tombol `Enter` dan `Space`.
- Fungsi penyalinan clipboard aman dengan mekanisme cadangan textarea untuk konteks HTTP non-aman dan model keamanan peramban yang ketat.
- Fungsi sanitasi HTML masukan (`escapeHtml`) guna mencegah celah Cross-Site Scripting (XSS) tersimpan maupun terefleksi melalui atribut catatan pada parameter URL dan konfigurasi impor.
- Penanganan galat parsing JSON yang tangguh untuk impor konfigurasi disertai umpan balik peringatan yang deskriptif.
- Konfigurasi MegaLinter (`.mega-linter.yml`) dan linter YAML (`.yamllint.yml`) untuk menyatukan tata kelola linting di seluruh repositori.
- Kompatibilitas gaya Safari dan iOS dengan menambahkan `-webkit-user-select: none;` berdampingan dengan `user-select: none;` standar untuk sel interaktif split/join.
- Standardisasi pengidentifikasi kontrol formulir: menambahkan atribut `id` dan `name` unik ke input catatan (baik template statis maupun baris dinamis JavaScript) dan textarea `importExportArea`, serta menghapus atribut `for` yang redundan pada elemen induk `<label>`.
- Peningkatan arsitektur SEO: mengintegrasikan data terstruktur JSON-LD Schema.org `WebApplication`, tag URL kanonikal, definisi kartu Open Graph, Twitter Cards (`summary_large_image`), dan direktif pengindeksan mesin pencari.
- Skalabilitas responsif multi-resolusi: sistem token CSS komprehensif dengan breakpoint responsif yang mencakup ponsel potret/lanskap, tablet, MacBook, desktop, dan layar 2K (VGA 640×480 hingga 2560×1440).

### Diperbaiki

- Meremediasi peringatan keamanan CodeQL alert #5 (`js/xss-through-dom`): mengisolasi koreksi batas jaringan ke dalam penangan khusus `show_boundary_warning_modal()` yang menggunakan penyisipan node teks DOM `.text()` ketat, meniadakan perambatan nilai tercemar ke dalam sink jQuery `.html()`.
- Memperbaiki atribut `id` dan `name` yang hilang pada elemen kontrol formulir serta atribut `for` yang redundan pada tag induk `<label>`.
- Memperbaiki kepatuhan WCAG H32 dengan menyetel tombol aksi formulir `#btn_go` menjadi `type="submit"` disertai pencegahan default.
- Memperbaiki enkoding entitas validasi HTML: mengganti karakter `&` mentah dengan `&amp;` dan memangkas panjang `<title>` agar berada dalam batas standar 70 karakter.
- Memperbaiki peringatan CSS lintas peramban dengan menghapus properti usang `-webkit-overflow-scrolling: touch;` dari `.table-responsive`.
- Memperbaiki peringatan kompatibilitas peramban pada Firefox dan Opera dengan menghapus `<meta name="theme-color">` yang deprecated dan memusatkan konfigurasi tema PWA pada `site.webmanifest`.
- Memperbaiki URL repositori hulu yang kedaluwarsa, menstandardisasi seluruh dokumentasi, ikon GitHub, issue tracker, dan tautan kontributor ke `https://github.com/alsyundawy/visualsubnetcalc`.
- Memperbaiki polusi selektor CSS global di mana aturan `#calc .note label, input` secara tidak sengaja meregangkan seluruh input teks aplikasi menjadi selebar 100%.
- Mengatasi kebuntuan siklus hidup modal dan backdrop yang membeku dengan beralih ke `bootstrap.Modal.getOrCreateInstance()`.
- Memperbaiki bug teks peringatan koreksi batas di mana pengiriman pesan peringatan kustom menampilkan string `undefined`.
- Memperbaiki penggunaan `window.event.clipboardData` yang telah usang pada event handler penempelan teks dengan mekanisme fallback modern.
- Memperbaiki tata letak bilah navigasi bawah yang terpotong pada viewport sempit dengan mengubah `#bottom_nav` menjadi kontainer pembungkus fleksibel.
- Memperbaiki konversi warna heksadesimal pada `rgba2hex` untuk input heksadesimal yang telah terformat sebelumnya.
- Menghapus seluruh atribut inline `style="..."` pada `dist/index.html` dan `dist/404.html`, mengekstraksi aturan statis ke `dist/css/main.css`.
- Memperbaiki variabel tanpa tanda kutip ShellCheck SC2086 pada skrip alur kerja GitHub Actions.

### Diubah

- Memperbarui Bootstrap ke versi `5.3.8` pada bundel kompilasi lokal dan tag skrip CDN dengan hash Subresource Integrity (SRI) SHA384.
- Memverifikasi dan menegakkan jQuery `3.7.1` serta jQuery Validate `1.21.0` dengan verifikasi SRI yang ketat.
- Memperbarui dependensi GitHub Actions:
  - `actions/checkout` ke `v7.0.1` (`3d3c42e5aac5ba805825da76410c181273ba90b1`)
  - `actions/upload-artifact` ke `v7.0.1` (`043fb46d1a93c77aae656e7c1c64a875d1fc6a0a`)
  - `docker/setup-qemu-action` ke `v4.3.0` (`1f40c72289eff860ee54a304f1438e3cff362e0a`)
  - `docker/setup-buildx-action` ke `v4.3.0` (`37fe631027851001ddb9b187196cc803df7f5f0e`)
  - `docker/metadata-action` ke `v6.2.0` (`dc802804100637a589fabce1cb79ff13a1411302`)
- Memperbarui dependensi build pada `src/package.json`:
  - `@types/node` ke `^26.5.1`
  - `@playwright/test` ke `^1.63.0`
- Memperbarui tautan rilis pada footer aplikasi menjadi Visual Subnet Calculator v1.4.1.
- Mengoptimalkan pembaruan DOM saat pergantian warna dengan meniadakan mutasi string yang redundan.
- Menegakkan kepatuhan linter ketat di seluruh repositori pada semua berkas HTML, CSS, JavaScript, dan konfigurasi.

## [1.4.0] - 2026-09-15

### Fitur

- Mode kalkulasi alamat IP yang dapat digunakan untuk multi-cloud: AWS VPC, Azure VNet, dan Oracle Cloud Infrastructure (OCI).
- Tooltip informasi IP yang dicadangkan khusus cloud beserta tautan dokumentasi resmi vendor.
- Fitur berbagi URL terkompresi menggunakan pengodean status LZ-String.
- Manipulasi pohon hierarki subnet dengan pemisahan (_split_) dan penggabungan (_join_).
- Kemampuan impor dan ekspor konfigurasi berbasis JSON.
