# Catatan Perubahan (Changelog) — Visual Subnet Calculator

<!-- markdownlint-disable MD024 -->

Seluruh perubahan penting pada proyek Visual Subnet Calculator akan didokumentasikan dalam berkas ini.

Format pencatatan mengacu pada [`Keep a Changelog`](https://keepachangelog.com/en/1.1.0/),
dan proyek ini mematuhi standar [`Semantic Versioning`](https://semver.org/spec/v2.0.0.html).

## [1.4.3] - 2026-09-18

### Ditambahkan

- Mesin Reset Kalkulasi Subnet Instan (`#btn_reset`): Menambahkan tombol Reset khusus di samping tombol Tools pada bilah kontrol `#calc`. Mengembalikan status bawaan dual-stack (IPv4 ke `10.0.0.0/16`, preset `/16`, mode `Standard`; IPv6 ke `2001:db8::/32`, preset `/32`), menyelaraskan preset aktif, membersihkan `subnetMap`, menetralkan pesan validasi dan kelas `.was-validated` pada form, serta membersihkan parameter pembagian pada address bar peramban melalui `window.history.replaceState`.
- Standar Palet Pastel Modern 2026 & Kontras WCAG AAA: Tombol kontrol aksi dimodernisasi menggunakan token pastel 2026 yang terkurasi: Go (Sapphire / Royal Blue `linear-gradient(135deg, #0284c7, #1d4ed8)`), Tools (Pastel Emerald Green `#d1fae5` / `#065f46`), dan Reset (Pastel Rose / Crimson `#fee2e2` / `#991b1b`). Varian mode terang maupun mode gelap melampaui rasio kontras 7.2:1 (**WCAG AAA**) untuk teks normal dan besar.
- Mesin Kontras Dinamis Kecerahan Perseptual Mode Gelap (`isColorLight`): Mengembangkan kalkulator kecerahan perseptual otomatis pada `dist/js/main.js` serta kelas dinamis (`.has-light-bg`, `.has-dark-bg`) yang menyesuaikan warna teks baris, input catatan, dan alamat IP menjadi warna gelap kontras tinggi `#0f172a` saat warna latar terang diaplikasikan, dan `#f8fafc` saat warna latar gelap, mencegah teks putih-di-atas-putih yang tidak terbaca pada mode gelap.
- Mitigasi Kondisi Balapan (Race Condition) Transisi Penutupan Modal Bootstrap 5: Arsitektur flag `_pendingDismiss` berlingkup elemen DOM modal. Penutupan modal dijadwalkan secara aman hingga event `shown.bs.modal` selesai dan dibersihkan pada event `hide.bs.modal` atau `hidden.bs.modal`, menjamin penutupan 100% andal tanpa kebocoran event saat pengujian otomatis atau klik berulang yang cepat.
- Pemisahan Subnet IPv6 `/64` Hingga `/127` Secara Interaktif: Mengaktifkan pemisahan interaktif untuk prefiks `/64` hingga `/127` menjadi tingkatan berikutnya (misalnya `/68`, `/72`, `/80`, `/84`, `/88`, `/92`, `/96`, `/112`, dan `/127`), memungkinkan perencanaan mikro-segmentasi mendalam hingga point-to-point links (RFC 6164) sembari mengembalikan division tree kosong pada subnet yang belum dibagi demi menjaga URL kanonikal tetap bersih.
- Preset IPv6 Standar RFC Tambahan (`/40` & `/52`): Menambahkan tombol preset `/40` (translasi NAT64 RFC 6052) dan `/52` (alokasi kampus multi-situs RFC 6177) pada bilah alat preset IPv6 (`#ipv6_tier_info`), memperluas tingkatan standar menjadi 14 preset.
- Sanitasi URL IPv6 Tanpa Encoding `%3A` (Format Tanda Hubung): Mengganti karakter titik dua (`:`) pada parameter kueri URL IPv6 dengan tanda hubung (`-`), menghasilkan URL yang bersih dan mudah dibaca (misal `?network=2508-6789--&mask=32`) dengan penguraian dua arah yang mulus saat dimuat kembali.
- Subtitle Header Resmi (`.app-subtitle-author`): Menambahkan atribusi pengembang `MODIFIED BY HARRY DERTIN SUTISNA ALSYUNDAWY` tepat di bawah judul utama `<h1>`, diformat elegan menggunakan Google Font `Space Grotesk` dengan perataan huruf, ketebalan proporsional, antialiasing, dan kontras tinggi di mode terang maupun gelap.
- Alokasi IP Bawaan Standar: Mengonfigurasi default IPv4 ke `172.16.0.0/16` (blok 20-bit RFC 1918) dan default IPv6 ke `2508:6789::/32`.
- Tautan Demo Langsung GitHub Pages Resmi: Mempublikasikan dan menautkan URL demo langsung di `https://alsyundawy.github.io/visualsubnetcalc/` di seluruh dokumentasi, metadata, dan header berkas.
- Header Komentar Metadata DOCNOTE Komprehensif: Mengintegrasikan header komentar metadata profesional dan standar di seluruh berkas kode produksi (`dist/index.html`, `dist/404.html`, `dist/css/main.css`, `dist/js/main.js`) yang mendokumentasikan arsitektur, profil pengembang, kontak lengkap, versi 1.4.3, dan tanggal rilis.
- Kurasi 8 Saluran Kontak / Sosial Media Utama: Memangkas ikon kontak di footer menjadi tepat 8 saluran esensial (Telegram, WhatsApp, X, Website, Email, GitHub, QRIS, dan PayPal) dengan efek kilau hover elegan dan box model sirkular seragam.
- Deskripsi Proyek Profesional Tanpa Hiperbola: Menggantikan istilah hiperbolis bernuansa buatan AI dengan deskripsi teknis yang jernih dan profesional: "Interactive IPv4 & IPv6 Subnet Calculator and CIDR Network Design Tool".
- Default Mode Gelap (Dark Mode) saat Pertama Dibuka: Mengatur tema tampilan awal menjadi Mode Gelap (`dark`) secara default pada kunjungan pertama sebelum ada pemilihan pengguna, didukung skrip anti-FOUC langsung di `<head>`.
- Kebijakan Lokalisasi Kode Penuh Bahasa Inggris: Mengaudit dan memastikan 100% kode produksi, HTML, CSS, JavaScript, atribut ARIA, label, tooltip, modal, badge, dan pengujian sepenuhnya berbahasa Inggris (dokumentasi bahasa Indonesia diisolasi khusus pada berkas `*-ID.md`).
- Font Tautan Shareable URL Tebal & Sangat Jelas (`.live-url-link`): Mempertebal font shareable URL di bawah tabel subnet (`font-weight: 700`), merapikan spasi huruf (`0.01em`), dan mengoptimalkan ukuran font (`0.84rem`), menjamin teks URL sangat mudah dibaca, tegas, dan kontras tinggi di mode terang maupun gelap tanpa merusak responsivitas.
- Fitur Sesi Kuki Sementara Maksimal 15 Menit (`vsc_draft_15m` & `vsc_visitor_15m_session`): Mengintegrasikan engine kuki sementara standar RFC 6265 (`TemporaryCookieStore`) dengan masa aktif tepat 15 menit (`max-age=900`, `SameSite=Lax`). Draft konfigurasi subnet tersimpan aman dalam kuki dan akan dipulihkan secara otomatis jika tab ditutup atau dibuka kembali dalam waktu 15 menit. Menghadirkan deduplikasi counter kunjungan berbasis sesi 15 menit serta badge status visual interaktif (`#cookie_session_badge`).
- Tombol Melayang Kembali ke Atas (Back to Top Button `#btn_scroll_top`): Menambahkan tombol navigasi melayang berbentuk sirkular di `dist/index.html` dan `dist/404.html` dengan deteksi scroll dinamis (> 120px), transisi opacity/transform halus, efek elevasi hover, serta fungsi scroll mulus (smooth scroll) ke posisi paling atas. Pengikatan siklus hidup DOM diperkuat untuk menjamin ketersediaan tombol baik pada IPv4 maupun IPv6 setelah pembagian subnet yang mendalam.
- Penyeragaman Gaya Ikon Footer: Menyeragamkan warna ikon seluruh tombol `.footer-social-btn i` bernilai `#0284c7` (mode terang) dan `#38bdf8` (mode gelap) sehingga seluruh 8 tombol dan pill counter tampil harmonis.
- Standardisasi Ikon Font Awesome Bersahaja (Bukan Bold/Tebal): Mengganti ikon tebal (`fa-solid`) dengan varian reguler (`fa-regular`) pada tombol tema matahari/bulan, ikon tanya FAQ, ikon surat email, dan ikon jam kuki sesi, serta menerapkan `-webkit-font-smoothing: antialiased` agar ikon tampil rapi, proporsional, dan tidak menggelembung tebal.
- Tombol Penghitung Pengunjung Dinamis (`#visitor_counter_btn`) & Integrasi `counter.txt`: Menambahkan tombol counter pengunjung interaktif yang terletak tepat di bawah bagian donasi PayPal / QRIS pada footer di `dist/index.html` dan `dist/404.html`. Menggunakan berkas `dist/counter.txt` sebagai baseline persisten yang selalu bertambah dinamis di setiap kunjungan baru via `localStorage`/`sessionStorage` serta sinkronisasi server otomatis.
- Tautan Hyperlink Subnet Real-Time di Bawah Tabel (`#live_shareable_url`): Selain tombol salin URL (copy URL), menyertakan tautan hyperlink langsung yang terletak tepat di bawah tabel pembagian subnet. Menampilkan URL aktif yang selalu tersinkronisasi secara real-time sebagai tautan yang dapat diklik langsung, berukuran proporsional dan nyaman dibaca, berlatar kontras tinggi di semua mode tema, serta dilengkapi aturan `word-break: break-all` dan `overflow-wrap: anywhere` untuk menjamin tata letak tidak terpotong pada layar smartphone manapun.
- Format URL David C & Sinkronisasi Real-Time Dinamis (`?network=...&mask=...&division=...`): Mengintegrasikan format kueri URL David C dengan serialisasi bitstring pohon biner secara lossless (`binToAscii` / `asciiToBin`). Setiap aksi split, join, perubahan mode, atau reset langsung memperbarui bilah URL browser secara dinamis via `window.history.replaceState`.
- Fitur Header Induk Subnet (Integrasi GitHub Issue #5): Menambahkan perender baris ringkasan hirarkis subnet induk. Ketika diaktifkan melalui menu Tools (`#toggle_parent_headers`) atau URL (`&parent_headers=1`), tabel subnet menampilkan baris ringkasan induk (`.parent-header-row`) dengan badge CIDR induk, kedalaman indentasi, rentang IP lengkap, batas alamat usable, dan jumlah total host sebelum dibagi.
- Preset Blok IP Privat RFC 1918 & Indikator Real-Time: Menambahkan chip pemilih cepat untuk tiga alokasi blok IP privat IETF RFC 1918 (`10.0.0.0/8`, `172.16.0.0/12`, dan `192.168.0.0/16`) dengan tetap mempertahankan preset default pada `/16` (`172.16.0.0/16`). Mengintegrasikan lencana status dinamis (`#rfc1918_indicator`) yang memverifikasi alamat jaringan aktif secara real-time terhadap batas alokasi RFC 1918.
- Optimalisasi Responsif Khusus Xiaomi, Redmi & POCO: Riset mendalam terhadap karakteristik render browser MIUI/HyperOS (inflasi ukuran font sistem, rasio layar panjang 20:9, notch punch-hole DotDisplay). Mengintegrasikan `viewport-fit=cover`, penanganan safe area `env(safe-area-inset-*)`, stabilisasi font `-webkit-text-size-adjust: 100%`, tata letak 2 baris fleksibel pada layar `< 576px`, `min-width: 0` pada elemen flex, dan scrolling sentuh halus (`-webkit-overflow-scrolling: touch`) pada kontainer tabel tanpa pemotongan kolom.
- Mode Reservasi Subnet Google Cloud (GCP) VPC: Mengintegrasikan profil cloud GCP pada menu dropdown Tools (`#dropdown_gcp`) dan mesin kalkulasi. Sesuai spesifikasi Google Cloud VPC, GCP mereservasi 4 alamat IP per subnet (`network + 0` ID Jaringan, `network + 1` Default Gateway, `broadcast - 1` dicadangkan GCP untuk penggunaan mendatang, dan `broadcast - 0` Broadcast Jaringan). Menerapkan batas minimum subnet `/29`, menghitung rentang host usable deterministik (`network + 2` hingga `last_address - 2`), serta terintegrasi pada matriks perbandingan FAQ.
- Sistem Tema Dual-Mode (Terang / Gelap): Arsitektur tema glassmorphism modern bergaya dark mode elegan terinspirasi dari ns1.orion.net.id. Dilengkapi tombol beralih Font Awesome di header (`#themeToggle`), penyimpanan persistensi `localStorage`, skrip anti-FOUC langsung di `<head>`, sinkronisasi dinamis `<meta name="theme-color">`, dan transisi visual yang mulus.
- Suite Favicon Lengkap: Integrasi favicon dan ikon aplikasi terpadu langsung dari `alsyundawy.com` ke dalam folder `dist/icon/` (SVG, ICO, PNG 16x16 hingga 512x512, Apple touch icons, Android manifest, Windows mstile).
- Lencana Fork Khusus: Menyematkan lencana pill modern bertuliskan `Fork` pada judul header (`dist/index.html` dan `dist/404.html`) beraksen gradien cyan yang elegan dan rapi.
- Pembaruan Rekaman Demonstrasi GIF Beresolusi Tinggi: Mengambil rekaman baru dan memperbarui berkas `src/demo.gif` yang menampilkan antarmuka visual versi 1.4.3 secara lengkap, mode gelap default, tombol reset, dan tautan live shareable URL.
- Suite Verifikasi Lintas Perangkat & Peramban: Pengujian otomatis headless Chrome dan Playwright memvalidasi profil resolusi perangkat (VGA 640x480, Xiaomi Redmi A2 360x800, Redmi Note 13 392x872, POCO X6 Pro 412x915, iPhone 15 Pro, iPad Air, MacBook, Desktop FHD, dan Desktop 2K QHD), spasi vertikal otomatis, dan auto-deteksi URL path tanpa pemotongan dokumen horizontal.
- Integrasi Penuh Suite MegaLinter: Mengonfigurasi `.mega-linter.yml` untuk mengaktifkan seluruh linter untuk Markdown, HTML, CSS, JavaScript (Node.js), dan TypeScript (`MARKDOWN_MARKDOWNLINT`, `HTML_HTMLHINT`, `CSS_STYLELINT`, `JAVASCRIPT_ESLINT`, `JAVASCRIPT_STANDARD`, `TYPESCRIPT_ESLINT`, `TYPESCRIPT_STANDARD`).
- Konfigurasi Linter Standar: Menyertakan berkas `eslint.config.js` dan `.stylelintrc.json` dengan aturan ketat di direktori utama, mencapai kelulusan 100% bersih tanpa galat maupun peringatan di seluruh HTMLHint, HTML-Validate, Stylelint, ESLint, dan Markdownlint.

### Diperbaiki

- Peringatan Kompatibilitas Peramban & Standar `text-size-adjust`: Mengatasi peringatan kompatibilitas peramban terkait CSS `text-size-adjust` dengan menyandingkan `-webkit-text-size-adjust: 100%` bersama deklarasi standar `text-size-adjust: 100%` serta konfigurasi `.hintrc` untuk mengabaikan peringatan vendor, memberikan diagnostik bersih sembari menjaga proteksi tampilan mobile Xiaomi/HyperOS.
- Pengetikan TypeScript Konfigurasi Playwright: Memperbaiki definisi tipe pada `src/playwright.config.ts` untuk pemeriksaan tipe data yang ketat pada lingkungan pengembang dan CI.
- Memperbaiki Keterbacaan Teks Tabel Subnet pada Mode Gelap: Mengesampingkan warna teks (`.row_range`, `.row_usable`, `.row_hosts`, `.note input`, `.row_address`) untuk baris dengan warna latar kustom, mencegah kegagalan kontras teks tak terlihat saat mewarnai baris subnet di mode gelap.
- Memperbaiki Selektor dan Properti CSS Terduplikasi: Menyatukan margin `#app_header` serta menghapus blok selektor terduplikasi `:root` dan `[data-theme="dark"]` pada `dist/css/main.css`, mencapai kepatuhan stylelint 100% dengan nol galat.
- Remediasi Kerentanan DOM XSS CodeQL Alert #6 [High]: Mengganti penggunaan `.html()` dengan pembuatan elemen DOM yang aman pada `updateRfc1918Indicator`, mengganti `error[0].innerHTML` dengan `error.text()` pada `errorPlacement` validasi jQuery, melakukan sanitasi nilai interpolasi dinamis dengan `escapeHtml()` pada perender `addParentHeaderRow`, dan menghapus duplikasi override atribut `aria-label` pada `#live_shareable_url`.
- Perbaikan Tampilan Terpotong & Inflasi Font Xiaomi, Redmi & POCO: Memperbaiki pemotongan layout horizontal pada browser MIUI dan HyperOS yang disebabkan oleh padding berlebih pada header (`padding-right: 6rem;`), nilai default `min-width: auto` pada flex items, serta inflasi font bawaan sistem WebKit dengan menerapkan `-webkit-text-size-adjust: 100%`, `min-width: 0`, dan penjaga safe-area insets.
- Sinkronisasi URL Subnet Tanpa Pembagian: Memperbaiki fungsi `encodeDivisionTree` agar mengembalikan string kosong `""` ketika subnet utama belum dibagi, mencegah polusi parameter `&division=` pada URL kanonikal.
- Memperbaiki Waktu Inisialisasi Tombol Melayang Kembali ke Atas: Memperbaiki kendala di mana `#btn_scroll_top` tidak muncul di mode IPv6 saat pengguna melakukan scroll setelah membagi banyak subnet. Elemen tombol sebelumnya berada setelah pemanggilan bundel skrip sehingga `document.getElementById("btn_scroll_top")` mengembalikan nilai `null` saat skrip dieksekusi. Tombol kini diposisikan sebelum tag `<script>`, inisialisasi diikat dalam event `DOMContentLoaded` (dengan pengecekan status ready/complete), ambang scroll diturunkan menjadi 120px, serta pendengar event scroll dipasang ganda pada `window` dan `document` untuk menjamin ketersediaan tombol di seluruh perangkat.
- Memperbaiki Kondisi Balapan (Race Condition) Transisi Penutupan Modal Bootstrap 5: Memperbaiki galat penutupan modal yang gagal merespons saat animasi fade-in Bootstrap masih aktif berjalan (`_isTransitioning`). Menggunakan arsitektur flag `_pendingDismiss` berlingkup elemen modal yang menjadwalkan penutupan otomatis tepat saat event `shown.bs.modal` selesai ditembakkan serta membersihkan flag secara aman pada event `hide` atau `hidden`, mencegah event klik terbuang maupun penutupan prematur pada pembukaan modal berikutnya.
- Memperbaiki ketidakkonsistenan rendering visual dan keburaman tombol WhatsApp dan QRIS ("buram sendirian"): melenyapkan deklarasi `!important` khusus mode terang dan artefak backdrop blur yang sebelumnya hanya berdampak pada WhatsApp dan QRIS. Menstandarisasi latar belakang solid dan `transform: translateZ(0)` untuk rendering tajam di semua layar.
- Memperbaiki pemotongan tampilan horizontal pada smartphone Xiaomi, Redmi, dan POCO: mengatasi terpotongnya konten akibat inflasi font sistem MIUI via `-webkit-text-size-adjust: 100%`, menghapus batasan kaku min-width 576px pada kontainer, serta mempertahankan visibilitas kolom rentang dan usable IP lewat `.table-responsive` berakselerasi sentuh.
- Memperbaiki bug kalkulasi aritmetika kritis pada `getIpv6Capacity()`: pembagi satuan _quadrillion_ (Q) sebelumnya keliru disetel ke `1000000000000000000` (10^18, _quintillion_), padahal satuan _quadrillion_ yang benar adalah `1000000000000000` (10^15). Perbaikan ini memulihkan keakuratan tampilan kapasitas untuk blok IPv6 besar (`/16` hingga `/0`) sehingga tidak lagi menampilkan angka 1.000 kali lebih kecil dari kenyataan.
- Mengatasi kerentanan injeksi CSS (_CSS injection_) pada atribut baris tabel `style="background-color: ..."` yang digenerasi secara dinamis: parameter warna yang bersumber dari URL maupun berkas impor kini divalidasi secara ketat oleh fungsi `sanitizeColor()` dengan regex `^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$`, hanya mengizinkan format heksadesimal standar CSS Color Level 4 (#RGB, #RGBA, #RRGGBB, #RRGGBBAA) dan memblokir panjang tidak standar (5 atau 7 karakter) serta karakter injeksi berbahaya.
- Memperketat keamanan tipe data input pada `escapeHtml()`: mengembalikan string kosong (`''`) saat menerima argumen non-string, mencegah kebocoran nilai `undefined` atau objek ke dalam elemen DOM.
- Mengatasi Peringatan Pemeriksa HTML IDE (`@[current_problems]`): mengidentifikasi bahwa peringatan tersebut dipicu oleh ekstensi Webhint/Edge DevTools (`@hint/hint-html-checker`) yang mencoba mengirim dokumen HTML terbuka ke API validator W3C eksternal (`https://validator.w3.org/nu/?out=json`), yang merespons dengan halaman galat HTML sehingga memicu galat sintaks `JSON.parse()`. Mengonfigurasi `"html-checker": "off"` pada berkas `.hintrc`, melenyapkan peringatan palsu tersebut secara permanen sembari tetap menjaga validasi HTML5 statis luring 100% via `html-validate`.

### Dioptimalkan

- Harmonisasi Tombol WhatsApp & QRIS serta Arsitektur Anti-Buram: Menghilangkan anomali visual dan rendering kabur/buram ("buram sendirian") pada tombol WhatsApp dan QRIS di peramban Android dan desktop. Menyeragamkan geometri box model `.footer-social-btn` pada elemen `<a>` dan `<button>` dengan tinggi persis (`32px`, `30px` pada layar ponsel kecil), border-radius (`9999px`), latar belakang solid, dan akselerasi GPU (`transform: translateZ(0)`). Menyertakan label `<span>X</span>` agar pembungkusan baris simetris dan QRIS tidak terasing sendirian.
- Desain & Estetika Toolbar Preset Standar 2026: Mempercantik tampilan toolbar preset IPv4 (`#ipv4_tier_info`) dan IPv6 (`#ipv6_tier_info`) dengan gaya modern 2026 berupa kontainer glassmorphism halus (`backdrop-filter: blur(8px)`), efek pill aktif gradien cerah (`linear-gradient(135deg, #0284c7, #2563eb)`), elevasi hover lembut, dan hierarki tipografi rapi tanpa mengubah ID, kelas CSS, atau listener bawaan.
- Standar Palet Warna 2026 untuk Semua Mode: Mengkalibrasi ulang 10 warna palet subnet Mode Gelap dengan rona _luminous jewel_ anti-silau berstandar 2026, memastikan kontras optimal sekaligus mempertahankan nilai heksadesimal Mode Terang 100% kompatibel dengan pengujian eksisting.
- Irama Spasi Vertikal yang Seimbang: memberikan jarak vertikal atas dan bawah yang proporsional antara Judul Header (`#app_header`), Banner Deskripsi (`.alert`), dan Bilah Pemilih Versi IP (`#ip_version_toolbar`), menghindari tata letak yang berhimpitan dan memberikan ruang pandang yang lapang dan rapi di semua perangkat.
- Skala Tipografi Judul yang Proporsional & Responsif: memperkecil ukuran font `.app-title` menggunakan skala fluid clamp: `clamp(1.15rem, 1.2vw + 0.5rem, 1.55rem)` dengan ketebalan font `font-weight: 800`, menjaga judul tetap tegas, jelas, dan berwibawa tanpa mendominasi viewport di layar kecil maupun besar.
- Peningkatan Kontras & Keterbacaan Mode Terang: mengaudit menyeluruh elemen teks saat mode terang (`[data-theme="light"]`) agar sangat jelas terbaca, terang, tajam, dan tidak buram (`#0f172a` untuk judul dan label, `#1e293b` untuk data tabel, `#0284c7` untuk tautan navigasi bawah dengan garis bawah putus-putus, serta kartu media sosial footer berlatar putih `#ffffff` dengan teks kontras tinggi `#1e293b`).
- Penyempurnaan Progresi Tingkatan IPv6 Hirarkis Standar & Batas Keamanan: menyempurnakan dan mengoptimalkan fungsi `getNextIpv6Tier()` dan `splitIpv6Network()` dengan alokasi memori terkendali $O(1)$ dan pemecahan subnet yang aman. Menerapkan transisi berbasis nibble (+4 bit) di seluruh tingkatan korporat, kantor cabang, dan mikro-segmentasi, mempertahankan `/64` sebagai batas leaf SLAAC yang tidak terbagi (RFC 4291 / RFC 7421) disertai modal edukasi, serta mendukung sub-delegasi granular point-to-point (`/112 -> /120 -> /124 -> /127 -> /128`) tanpa risiko rekursi tak terbatas maupun pembekuan browser.
- Keterbacaan & Kontras Teks Mode Gelap: menyempurnakan seluruh elemen teks saat mode gelap agar tajam, terang, dan bebas buram (`#f8fafc` untuk judul, `#e2e8f0` untuk isi teks, `#38bdf8` untuk tautan aktif dan aksen), dengan perhatian khusus pada teks footer, lencana, dan catatan tabel.
- Palet Warna Subnet Mode Gelap yang Harmonis: mengkalibrasi 10 pilihan warna subnet mode gelap bertema _deep jewel_ (`--subpal-1-1` hingga `--subpal-1-10`) yang tidak bentrok dan tidak menyilaukan mata saat mode gelap, sekaligus menjaga kontras teks putih yang sangat tinggi.
- Standardisasi Ikon Reguler Bersahaja (Bukan Tebal): Mengganti ikon tebal solid dengan varian reguler (`fa-regular fa-sun`, `fa-regular fa-moon`, `fa-regular fa-circle-question`, `fa-regular fa-envelope`, `fa-regular fa-clock`) dan mengaktifkan antialiasing font, menghadirkan estetika visual yang rapi, bersih, dan proporsional.

### Diubah

- Memperbarui metadata versi proyek pada `package.json` dan `package-lock.json` menjadi `1.4.3`.
- Memperbarui `softwareVersion` pada data terstruktur Schema.org `WebApplication` menjadi `1.4.3`.
- Memperbarui lencana rilis, tautan changelog, dan referensi versi pada footer aplikasi, bagian FAQ, header modal About, dan dokumentasi menjadi Visual Subnet Calculator `v1.4.3`.

---

## [1.4.2] - 2026-09-16

### Ditambahkan

- Bilah alat pemilih versi IP tersegmen dan interaktif (`#ip_version_toolbar`) dengan pengelompokan semantik `<fieldset>`, `<legend>` tersembunyi, serta tombol `#btn_ipv4` dan `#btn_ipv6` yang dapat diakses penuh via keyboard sesuai standar WCAG 2.2 AA (`aria-pressed`).
- Bilah alat preset prefiks IPv4 interaktif (`#ipv4_tier_info`) yang memuat 17 preset CIDR satu-klik dari `/16` hingga `/32` dengan sinkronisasi dua arah secara _real-time_ antara tombol toolbar dan kolom input ukuran jaringan. Default: `/16` (`10.0.0.0/16`).
- Bilah alat preset prefiks IPv6 interaktif (`#ipv6_tier_info`) dengan 12 tingkatan rekayasa jaringan standar: `/32` (default), `/48`, `/56`, `/60`, `/64`, `/80`, `/96`, `/112`, `/120`, `/124`, `/127`, dan `/128`, dilengkapi sinkronisasi dua arah secara _real-time_ dengan kolom input panjang prefiks. Default: `/32` (`2001:db8::/32`).
- Perombakan total sistem FAQ menjadi Akordion Bootstrap interaktif dan aksesibel (`#faqAccordion`) yang memuat 10 topik panduan arsitektur: Ikhtisar, Mekanisme Split/Join, Dual-Stack IPv4/IPv6, Profil reservasi cloud (Standar, AWS, Azure, OCI) beserta matriks perbandingan, Pewarnaan 10-swatch & catatan teks, Berbagi URL LZ-String & impor/ekspor data, Privasi sisi klien & keandalan offline, Dukungan perangkat universal (VGA hingga 2K/4K), Pintasan masukan & validasi, serta Kontak resmi pengelola.
- Tombol kendali akordion terpadu "Expand All" (`#faq_expand_all`) dan "Collapse All" (`#faq_collapse_all`) dengan animasi buka-tutup Bootstrap yang halus.
- Peningkatan menyeluruh seluruh ikonografi antarmuka ke Font Awesome Free v7 (`@fortawesome/fontawesome-free` v7.3.1) pada navigasi header, toolbar, palet warna, dialog modal, dan footer melekat.
- Pengembangan footer pengelola permanen (`#app_footer`) yang melekat di dasar viewport, menampilkan profil pengelola resmi HARRY DERTIN SUTISNA (`@alsyundawy`) dan ALSYUNDAWY IT SOLUTION ([`https://alsyundawy.com`](https://alsyundawy.com)), saluran media sosial (X dan Telegram), kontak cepat, serta donasi PayPal.
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
