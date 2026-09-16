# Catatan Rekayasa & Arsitektur — Visual Subnet Calculator

Catatan desain teknis, spesifikasi algoritma, struktur data, dan mekanisme serialisasi untuk Visual Subnet Calculator v1.4.3.

---

## 🧭 Ikhtisar & Daftar Isi

1. [`Eksplorasi Historis Serialisasi Status`](#1-eksplorasi-historis-serialisasi-status)
2. [`Serialisasi Status Produksi: LZ-String & URL Hash`](#2-serialisasi-status-produksi-lz-string--url-hash)
3. [`Arsitektur Pertukaran Data Multi-Format (v1.4.2)`](#3-arsitektur-pertukaran-data-multi-format-v142)
4. [`Algoritma Perhitungan Supernet Minimal & Rekonstruksi Pohon`](#4-algoritma-perhitungan-supernet-minimal--rekonstruksi-pohon)
5. [`Fondasi Matematika Dual-Stack (IPv4 vs IPv6 BigInt)`](#5-fondasi-matematika-dual-stack-ipv4-vs-ipv6-bigint)
6. [`Optimasi Masker Bitwise Waktu-Konstan O(1)`](#6-optimasi-masker-bitwise-waktu-konstan-o1)
7. [`Performa DOM, Pengerasan Keamanan & Standar Aksesibilitas`](#7-performa-dom-pengerasan-keamanan--standar-aksesibilitas)
8. [`Ringkasan Teknis, Kaidah RFC 2119 & Praktik Terbaik Rekayasa`](#8-ringkasan-teknis-kaidah-rfc-2119--praktik-terbaik-rekayasa)
9. [`Atribusi Pengelola & Konteks Ekosistem`](#9-atribusi-pengelola--konteks-ekosistem)

---

## 1. Eksplorasi Historis Serialisasi Status

Pada tahap awal perancangan konseptual Visual Subnet Calculator, penyimpanan partisi pohon biner yang kompleks ke dalam string URL yang ringkas dieksplorasi melalui beberapa model matematika:

### 1.1 Penyimpanan Biner Berbasis Offset

Usulan awal melacak alamat jaringan dasar (misalnya `10.0.0.0/8`) dan merepresentasikan semua subnet yang terbagi sebagai offset bilangan bulat (integer) dari alamat dasar tersebut:

- **Offset jaringan dasar**: Rentang bilangan bulat $0$ hingga $4.294.967.296$ ($2^{32}$).
  - Kasus terbaik: $0$ (subnet yang dimulai pada alamat jaringan yang sama persis, seperti `10.0.0.0/24`).
  - Kasus terburuk: $255.255.255.255$ ($2^{32}-1$).
- **Masker prefiks**: Rentang $0$ hingga $32$ (dikodekan dalam 5 bit).
- **Pengemasan bitwise**: Menggabungkan kedua nilai menjadi string biner berukuran $(32 + 5 = 37)$ bit, dibulatkan ke atas menjadi 40 bit (5 byte), lalu dikodekan ke dalam format Base64 yang aman untuk URL.

_Keterbatasan_: Walaupun efektif untuk subnet-subnet kecil yang berdekatan dengan alamat dasar, nilai offset membengkak secara signifikan ketika mempartisi blok induk berukuran besar (misalnya `/24` di ujung atas blok `/8`), sehingga menghilangkan efisiensi panjang URL.

### 1.2 Sistem Koordinat (Pengindeksan Subnet Relatif)

Untuk mengeliminasi offset bilangan bulat yang besar, dilakukan evaluasi terhadap koordinat indeks relatif di dalam prefiks induk penampung:

$$\text{Indeks Subnet} = \frac{\text{Alamat Subnet Target} - \text{Alamat Jaringan Dasar}}{\text{Kapasitas Alamat dari Prefiks Target}}$$

Sebagai contoh, untuk merepresentasikan `10.166.64.0/20` di dalam `10.0.0.0/8`:

- Nilai desimal dari `10.0.0.0` = $167.772.160$
- Nilai desimal dari `10.166.64.0` = $178.667.520$
- Selisih (Delta): $178.667.520 - 167.772.160 = 10.895.360$
- Satu blok `/20` mencakup $4.096$ alamat:
  $$\frac{10.895.360}{4.096} = 2660$$
- Hasil: `10.166.64.0` merupakan `/20` ke-2.660 di dalam blok `/8`.

_Sintaks ringkas yang diusulkan_: `[Subnet ke-N sebagai Integer][Ukuran Prefiks sebagai Base32]`. Sebagai contoh, `/24` ke-0 dalam `/20` dikodekan sebagai `00`, dan `/28` ke-5 sebagai `54`.

Meskipun elegan, kebutuhan untuk menyimpan metadata dinamis (label, catatan teks, palet warna pastel kustom, profil cloud provider, dan tingkatan IPv6) menuntut model data yang jauh lebih tangguh dan mudah dikembangkan.

---

## 2. Serialisasi Status Produksi: LZ-String & URL Hash

Visual Subnet Calculator menggantikan sistem koordinat kustom dengan kompresi data JSON berdensitas tinggi tanpa kehilangan data (_lossless_) menggunakan **LZ-String**:

```text
┌──────────────────────────┐       JSON.stringify       ┌─────────────────────────┐
│  Pohon Subnet Interaktif │ ─────────────────────────> │    Objek JSON Mentah    │
│   (Peta, Catatan, Warna) │                            │  (Hierarki Bersarang)   │
└──────────────────────────┘                            └────────────┬────────────┘
                                                                     │
                                                      LZ-String      │
                                                      compressTo-    │
                                                      EncodedURI-    ▼
                                                      Component ┌─────────────────────────┐
                                                                │   Hash URL Terkompresi  │
                                                                │  https://.../#?c=Mo...  │
                                                                └─────────────────────────┘
```

### 2.1 Spesifikasi Skema Status

Pohon status merepresentasikan blok CIDR yang terpartisi sebagai objek rekursif bersarang:

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

- Subnet yang memiliki objek turunan merepresentasikan cabang yang terbagi (_split_).
- Subnet yang memiliki properti `_note` atau `_color` merepresentasikan subnet daun (_leaf_) yang telah dikonfigurasi.
- Metadata operasional tingkat atas (mode cloud, flag IPv6) diserialisasi ke dalam selubung akar (_root envelope_):
  - `mode`: `"Standard"`, `"AWS"`, `"Azure"`, `"GCP"`, atau `"OCI"`
  - `ip_version`: `"IPv4"` atau `"IPv6"`

### 2.2 Kompatibilitas Mundur & Migrasi Aman

Visual Subnet Calculator menerapkan alur migrasi otomatis di seluruh generasi format status:

- **URL v1 / Config v1**: Format JSON polos legasi tanpa tag mode eksplisit.
- **URL v2 / Config v2**: Format LZ-String terkompresi dengan enkapsulasi mode cloud.
- **URL v3 (v1.4.2)**: Dukungan dual-stack IPv4/IPv6 dengan validasi alamat 128-bit dan sanitasi entitas kontekstual (`escapeHtml()`) guna mencegah celah DOM XSS tersimpan.

---

## 3. Arsitektur Pertukaran Data Multi-Format (v1.4.2)

Versi 1.4.2 memperkenalkan mesin pertukaran data universal yang mendukung format spreadsheet CSV, tabel dokumentasi Plain Text, dan konfigurasi status JSON:

```text
                               ┌──────────────────────────────────────────────┐
                               │   Model Pohon Visual Subnet Calculator       │
                               └──────────────────────┬───────────────────────┘
                                                      │
                            ┌─────────────────────────┼─────────────────────────┐
                            ▼                         ▼                         ▼
                 ┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
                 │     Format JSON     │   │   CSV (RFC 4180)    │   │  Tabel Plain Text   │
                 │  Status & Pohon Penuh│   │  Siap Spreadsheet   │   │  Dokumen & Review   │
                 └─────────────────────┘   └─────────────────────┘   └─────────────────────┘
```

### 3.1 Ekspor & Impor CSV (Standar RFC 4180)

Menghasilkan format nilai yang dipisahkan koma (_comma-separated values_) yang terstruktur untuk aplikasi pengolah angka (Microsoft Excel, LibreOffice Calc, Google Sheets):

- **Struktur Header**: `"Subnet Address","Range of Addresses","Usable IPs","Hosts","Note","Color"`
- **Tanda Kutip & Karakter Escape**: Semua nilai bidang dibungkus dengan tanda kutip ganda; tanda kutip di dalam teks di-escape sebagai `""`.
- **Contoh Rekaman**:
  ```csv
  "Subnet Address","Range of Addresses","Usable IPs","Hosts","Note","Color"
  "10.0.0.0/18","10.0.0.0 - 10.0.63.255","10.0.0.1 - 10.0.63.254","16382","DMZ Tier","#cbf078"
  ```

### 3.2 Tabel ASCII Rata Kolom (Plain Text)

Menghasilkan tabel monospace ASCII terformat rapi dengan komentar metadata:

- **Header Metadata**: Diawali komentar `#` yang merinci jaringan dasar, mode, format, dan stempel waktu ISO.
- **Padding Kolom Dinamis**: Menghitung lebar karakter maksimum dari setiap kolom guna memastikan kesejajaran yang presisi pada konsol terminal maupun deskripsi Pull Request Git.
- **Contoh Keluaran**:
  ```text
  # Visual Subnet Calculator Export
  # Base Network: 10.0.0.0/16 | Mode: Standard | Format: Plain Text
  # Exported on: 2026-09-16T13:27:18.000Z

  Subnet Address   Range of Addresses          Usable IPs                  Hosts   Note       Color
  10.0.0.0/18      10.0.0.0 - 10.0.63.255      10.0.0.1 - 10.0.63.254      16382   DMZ Tier   #cbf078
  ```

### 3.3 Transfer File In-Memory Sisi Klien

- **Unduh File (`#btn_download_export`)**: Membuat objek `Blob` di dalam memori dengan tipe MIME ketat (`text/csv;charset=utf-8;`, `text/plain;charset=utf-8;`, atau `application/json`), secara dinamis membuat elemen tautan, dan memicu pengunduhan peramban tanpa pemrosesan perantara di sisi server.
- **Unggah File (`#btn_upload_file`, `#importFileInput`)**: Memanfaatkan HTML5 `FileReader` API untuk membaca file lokal langsung ke dalam memori, mendeteksi format secara otomatis berdasarkan ekstensi file (`.csv`, `.txt`, `.json`).

---

## 4. Algoritma Perhitungan Supernet Minimal & Rekonstruksi Pohon

Saat mengimpor daftar flat subnet arbitrer (dari CSV, teks berpemisah tab, atau daftar CIDR mentah), Visual Subnet Calculator secara otomatis menghitung **supernet penampung minimal** dan merekonstruksi hierarki biner interaktif.

### 4.1 Formulasi Matematika Supernet Minimal

Diberikan himpunan impor berisi $k$ subnet, masing-masing dengan nilai integer awal $S_i$ dan akhir $E_i$:

$$\text{Global Min} = \min_{1 \le i \le k} S_i, \quad \text{Global Max} = \max_{1 \le i \le k} E_i$$

Operasi bitwise XOR antara alamat minimum dan maksimum mengungkap bit berbeda yang paling signifikan (_most significant divergent bit_):

$$\Delta = \text{Global Min} \oplus \text{Global Max}$$

Panjang prefiks bersama dihitung secara logaritmik:

$$\text{Panjang Prefiks} = \begin{cases} 32 - \lfloor \log_2(\Delta) + 1 \rfloor, & \Delta > 0 \\ 32, & \Delta = 0 \end{cases}$$

Alamat jaringan dasar kemudian diperoleh menggunakan masker bitwise:

$$\text{Alamat Dasar} = \text{Global Min} \ \& \ \left( (0\text{xffffffff} \ll (32 - \text{Panjang Prefiks})) \ggg 0 \right)$$

### 4.2 Rekonstruksi Pohon Rekursif (`insertSubnetIntoTree`)

Setelah jaringan dasar ditetapkan:

1. Subnet diurutkan berdasarkan panjang prefiks secara menaik (blok terbesar terlebih dahulu).
2. Untuk setiap subnet target, algoritma menelusuri pohon mulai dari simpul akar (_root_).
3. Jika simpul perantara belum sesuai dengan ukuran subnet target, simpul tersebut dipecah menjadi dua simpul anak menggunakan `split_network` (IPv4) atau `splitIpv6Network` (IPv6).
4. Penelusuran memilih simpul anak yang rentang alamatnya melingkupi alamat target.
5. Saat mencapai panjang prefiks yang tepat, catatan teks kustom (`_note`) dan label warna (`_color`) dipasangkan kembali.

---

## 5. Fondasi Matematika Dual-Stack (IPv4 vs IPv6 BigInt)

### 5.1 Aritmetika 32-Bit IPv4

IPv4 menggunakan integer 32-bit _unsigned_:

- Konversi notasi titik-desimal ke integer:
  $$\text{ipInt} = (O_1 \ll 24) + (O_2 \ll 16) + (O_3 \ll 8) + O_4$$
- Pergeseran kanan tanpa tanda (`>>> 0`) memaksa representasi bitwise 32-bit bertanda JavaScript menjadi bilangan positif tak bertanda.

### 5.2 Matematika Presisi 128-Bit IPv6 (`BigInt`)

Tipe data angka standar JavaScript melampaui batas aman integer IEEE 754 ($2^{53} - 1$) saat merepresentasikan alamat 128-bit IPv6. Visual Subnet Calculator menggunakan fitur native `BigInt`:

- **Konversi Integer (`parseIpv6`)**:
  $$\text{netInt} = \sum_{i=0}^{7} \text{hextet}_i \times 2^{(7-i) \times 16}$$
- **Penurunan Masker Subnet**:
  $$\text{mask} = ((1\text{n} \ll 128\text{n}) - 1\text{n}) \oplus ((1\text{n} \ll (128\text{n} - \text{prefiks})) - 1\text{n})$$
- **Kompresi Alamat Kanonikal (RFC 5952)**:
  1. Nol di awal hextet 16-bit dihilangkan (`2001:0db8` $\to$ `2001:db8`).
  2. Rangkaian hextet nol berurutan terpanjang (dua atau lebih) digantikan dengan `::`.
  3. Hextet nol tunggal tidak pernah dikompresi.
  4. Seluruh digit heksadesimal ditampilkan dalam huruf kecil (_lowercase_).

### 5.3 Standar Batasan RFC 6164 & RFC 7421

- **RFC 6164 (Link Point-to-Point /127)**: Didukung langsung untuk tautan antar-router, membelah secara presisi menjadi dua alamat host `/128`.
- **RFC 7421 & RFC 4291 (Batas SLAAC /64)**: Subnet pada ukuran `/64` ditetapkan sebagai simpul daun permanen (`.split-disabled`). Klik pengguna akan menampilkan modal edukatif mengenai aturan pembentukan Identifier Antarmuka (IID) SLAAC.

---

## 6. Optimasi Masker Bitwise Waktu-Konstan O(1)

Pada versi-versi sebelumnya, fungsi `get_network()` menghitung alamat jaringan dasar menggunakan perulangan iteratif:

```javascript
// Perulangan iteratif O(N) legasi:
for (let i = 31 - netSize; i >= 0; i--) {
  ipInt &= ~1 << i;
}
```

Pada v1.4.2, fungsi ini dioptimalkan menjadi satu operasi masker bitwise berwaktu-konstan $O(1)$:

```javascript
// Masker waktu-konstan O(1) teroptimasi:
const mask = (0xffffffff << (32 - netSize)) >>> 0;
return int2ip((ipInt & mask) >>> 0);
```

### Perbandingan Kompleksitas

| Metrik                    | Implementasi Legasi   | Masker Teroptimasi v1.4.2 | Faktor Peningkatan |
| :------------------------ | :-------------------- | :------------------------ | :----------------- |
| **Kompleksitas Waktu**    | $O(32 - \text{net})$  | $O(1)$ konstan            | Hingga $32\times$  |
| **Iterasi Loop (/0)**     | 32 iterasi            | 0 iterasi                 | Reduksi $100\%$    |
| **Iterasi Loop (/16)**    | 16 iterasi            | 0 iterasi                 | Reduksi $100\%$    |
| **Percabangan & Latensi** | Bergantung ukuran net | Deterministik konstan     | Nol jitter         |

---

## 7. Performa DOM, Pengerasan Keamanan & Standar Aksesibilitas

### 7.1 Remediasi Keamanan (CodeQL Alert #5)

- **Pemberantasan Celah DOM XSS**: String koreksi batas jaringan dirender melalui fungsi pembantu khusus `show_boundary_warning_modal()` menggunakan penyematan node `.text()` yang aman, mencegah injeksi skrip berbahaya dari fragmen URL yang dimanipulasi.
- **Sanitasi Kontekstual**: Semua catatan input pengguna melewati penyandian entitas HTML yang ketat (`escapeHtml()`) sebelum disisipkan ke dalam tabel.
- **Kebijakan Keamanan Konten (CSP)**: Seluruh basis kode dapat beroperasi di bawah aturan `script-src 'self'` tanpa memerlukan `eval()` inline atau skrip eksternal yang tidak diverifikasi.

### 7.2 Aksesibilitas WCAG 2.2 Tingkat AA

- **Kontrol Formulir & Label**: Seluruh elemen kontrol interaktif, termasuk `#importFileInput`, memiliki asosiasi `<label>` semantik serta atribut `title` yang deskriptif.
- **Semantik Tabel**: Tabel data dilengkapi elemen `<caption class="visually-hidden">` untuk pembaca layar yang menjelaskan hierarki pohon CIDR, dipadukan dengan header kolom semantik `<th scope="col">`.
- **Navigasi Keyboard**: Swatch warna palet menerapkan atribut `role="button"`, `tabindex="0"`, serta trigger penekanan tombol `Enter`/`Space`.

### 7.3 Arsitektur Token Responsif (VGA ke 2K)

```text
Lebar Viewport (px)
0       480      640            768            992           1200           1920          2560+
├────────┼────────┼──────────────┼──────────────┼─────────────┼──────────────┼─────────────┤
  Ponsel   Ponsel   Monitor VGA    Tablet (iPad)  Laptop        Desktop HD     Desktop FHD   2K / Layar Lebar
  (Kecil)  (Lebar)  (640x480)      (Potret)       (MacBook)     (1080p)                       (Resolusi Tinggi)
```

- Penataan chip preset fleksibel (`flex-wrap: wrap`) mencegah elemen meluap (_overflow_) pada layar VGA klasik.
- Aturan cakupan `#calc.ipv6-mode` secara otomatis menerapkan pemenggalan kata (`word-break: break-all`) dan penyesuaian ukuran font (`0.74rem`) pada viewport seluler di bawah 576px.

---

## 8. Ringkasan Teknis, Kaidah RFC 2119 & Praktik Terbaik Rekayasa

### 8.1 Ringkasan Teknis

Visual Subnet Calculator (v1.4.3) adalah mesin perencanaan IP visual berskala industri yang beroperasi sepenuhnya pada sisi klien (_client-side_), dirancang untuk operasional jaringan enterprise berkeandalan tinggi, topologi cloud VPC/VNet (AWS, Azure, GCP, OCI), serta arsitektur _dual-stack_ IPv4/IPv6. Prinsip utama arsitektur mencakup:

- **Determinisme Sisi Klien 100%**: Seluruh pemisahan (_split_), penggabungan (_join_), konversi format (JSON, CSV, Plain Text), dan pengodean status berlangsung sepenuhnya di dalam runtime browser lokal menggunakan operasi bitwise waktu-konstan $O(1)$ dan kepresisian lossless 128-bit `BigInt`. Nol bita data topologi yang dikirimkan ke server eksternal.
- **Serialisasi Status Nir-Server (URL Hash)**: Topologi interaktif dengan struktur pohon biner bersarang, catatan teks kustom, dan tag warna pastel diserialisasi menjadi string hash URL yang aman dan ringkas menggunakan kompresi LZ-String (`#?c=...`).
- **Mesin Pertukaran Data Universal**: Alur data multi-format yang mendukung spreadsheet CSV standar RFC 4180, tabel Plain Text ASCII terformat dinamis, serta _snapshot_ status JSON hierarkis dengan fitur unduh `Blob` di memori dan unggah berkas via `FileReader`.
- **Keamanan Zero-Trust & Aksesibilitas**: Sanitasi ketat entitas HTML dinamis (`escapeHtml()`), pengikatan _node_ teks aman `.text()` untuk modal peringatan batas (meremediasi CodeQL Alert #5), kepatuhan penuh standar aksesibilitas WCAG 2.2 Level AA, serta penskalaan responsif dari monitor VGA lawas (640x480) hingga layar 2K/Ultrawide.

### 8.2 Kaidah Rekayasa RFC 2119 & RFC 8174

Kata kunci **MUST (Wajib)**, **MUST NOT (Dilarang)**, **SHOULD (Sangat Dianjurkan)**, **SHOULD NOT (Sangat Tidak Dianjurkan)**, **MAY (Boleh / Opsional)**, dan **AVOID (Hindari)** dalam spesifikasi teknis ini ditafsirkan sebagaimana dijelaskan dalam [`BCP 14`](https://datatracker.ietf.org/doc/html/bcp14), [`RFC 2119`](https://datatracker.ietf.org/doc/html/rfc2119), dan [`RFC 8174`](https://datatracker.ietf.org/doc/html/rfc8174).

#### 🔴 MUST (Kaidah Wajib)

1. **MUST Berjalan Murni pada Sisi Klien**: Seluruh kalkulasi partisi subnet, penggabungan, konversi format, dan serialisasi data WAJIB dieksekusi seutuhnya pada runtime peramban lokal. Data topologi jaringan atau catatan internal TIDAK BOLEH dikirimkan ke server eksternal mana pun.
2. **MUST Menggunakan Matematika Lossless 128-Bit (`BigInt`) untuk IPv6**: Seluruh perhitungan aritmatika dan bitwise alamat IPv6 WAJIB memanfaatkan tipe data `BigInt` bawaan JavaScript. Implementasi DILARANG mengonversi representasi bilangan bulat 128-bit ke tipe `Number` standar IEEE 754 (batas presisi $2^{53} - 1$).
3. **MUST Melakukan Sanitasi Input HTML Dinamis**: Semua catatan subnet, label, dan data konfigurasi impor yang dimasukkan oleh pengguna WAJIB disanitasi entitas karakternya (`escapeHtml()`) sebelum diinterpolasikan ke dalam DOM guna mencegah kerentanan Cross-Site Scripting (XSS).
4. **MUST Mengisolasi Notifikasi Modal via Text Sink Aman**: Dialog peringatan batas subnet dan pesan kesalahan WAJIB menyuntikkan data menggunakan _node_ teks aman (`.text()`), mengeliminasi potensi DOM XSS sink (meremediasi CodeQL Alert #5).
5. **MUST Menerapkan Format RFC 4180 pada Ekspor CSV**: Format CSV WAJIB mengapit seluruh kolom dengan tanda kutip ganda dan meloloskan kutip internal sebagai `""` guna mencegah injeksi formula dan inkonsistensi struktur kolom.
6. **MUST Menyediakan Label Formulir yang Aksesibel**: Setiap kontrol interaktif, termasuk elemen unggah berkas tersembunyi (`#importFileInput`), WAJIB memiliki elemen `<label>` semantik dan atribut `title` deskriptif sesuai standar WCAG 2.2 Level AA.
7. **MUST Menjalankan Kontainer dengan Pengguna Non-Root**: Lingkungan kontainer Docker produksi WAJIB berjalan di bawah konteks pengguna non-root numerik yang tidak memiliki hak istimewa (`USER 101` pada citra `nginxinc/nginx-unprivileged`).

#### 🟡 SHOULD (Sangat Dianjurkan)

1. **SHOULD Memanfaatkan Kompresi LZ-String untuk Berbagi URL**: Insinyur jaringan SANGAT DIANJURKAN menyerialisasi dan mendistribusikan status topologi melalui hash URL LZ-String (`#?c=...`) untuk kolaborasi instan nir-server.
2. **SHOULD Menerapkan Protokol HTTPS Produksi dengan HSTS**: Penerapan produksi SANGAT DIANJURKAN mengonfigurasi TLSv1.2/v1.3, sertifikat Let's Encrypt otomatis (Certbot), dan _header_ HSTS (`max-age=31536000; includeSubDomains; preload`).
3. **SHOULD Mengonfigurasi Uji Kesehatan Kontainer (_Healthcheck_)**: Instans Docker SANGAT DIANJURKAN mendeklarasikan uji kesehatan HTTP aktif (`wget --spider http://127.0.0.1:8080/`) guna mendukung mekanisme pemulihan mandiri (_self-healing_).
4. **SHOULD Menerapkan Penandaan Warna Bertingkat (_Tiering_)**: Arsitek jaringan SANGAT DIANJURKAN membagi tingkatan infrastruktur (misalnya DMZ, Web, App, Database, Manajemen) menggunakan palet warna pastel yang kontras untuk kemudahan audit visual.
5. **SHOULD Mempertahankan Skema JSON yang Kompatibel ke Belakang**: Ekspor konfigurasi baru SANGAT DIANJURKAN mempertahankan urutan kunci lama guna memastikan interoperabilitas dengan alat pengurai versi terdahulu.

#### 🟢 MAY (Boleh / Opsional)

1. **MAY Mengekspor ke Format Plain Text Terformat**: Pengguna DIPERBOLEHKAN mengunduh atau menyalin tabel teks ASCII rapi untuk dokumentasi langsung pada Git pull request, panduan teknis (_runbook_ RFC), atau catatan rekayasa.
2. **MAY Menggunakan Python 3 atau Caddy untuk Pengujian Cepat**: Tim teknis DIPERBOLEHKAN memanfaatkan modul server bawaan Python 3 untuk pengujian luring tanpa instalasi, atau server Caddy untuk konfigurasi otomatis HTTPS lokal.
3. **MAY Mengalokasikan Subnet hingga Prefiks /127 untuk Tautan Point-to-Point**: Insinyur jaringan DIPERBOLEHKAN mempartisi alokasi IPv6 hingga prefiks `/127` khusus untuk interkoneksi antar-router sesuai standar RFC 6164.

#### ⛔ AVOID (Hindari / Pola Anti-Praktik)

1. **AVOID Penggunaan Atribut Gaya Sebaris (_Inline Styles_)**: Pengembang DILARANG menyisipkan atribut `style="..."` sebaris pada markup HTML; seluruh tata letak visual WAJIB mengacu pada kelas CSS modular dalam `dist/css/main.css`.
2. **AVOID Aritmatika Floating-Point untuk Alamat IPv6**: Pengembang DILARANG mengonversi hekstet IPv6 ke tipe `Number` JavaScript biasa untuk operasi pergeseran bit (_bit-shift_).
3. **AVOID Sink Manipulasi DOM Tidak Aman (`innerHTML` atau `.html()` Tak Tersanitasi)**: Jangan pernah menyuntikkan parameter URL mentah, payload JSON, atau nilai DOM langsung ke parser HTML.
4. **AVOID Membagi Subnet di Bawah /64 untuk Jaringan SLAAC**: Pengguna dan skrip otomatisasi DILARANG membagi jaringan lokal standar SLAAC melebihi `/64` tanpa justifikasi arsitektur yang valid (RFC 7421).
5. **AVOID Polusi Selektor CSS Global**: Aturan penataan gaya DILARANG menargetkan elemen dasar tanpa _scope_ (seperti `input` atau `label` polos) yang dapat merusak tata letak modal atau _navbar_.

### 8.3 Praktik Terbaik Rekayasa & Implementasi

1. **Alur Perhitungan Deterministik**:
   - Selalu lakukan _masking_ jaringan sebelum melakukan format alamat.
   - Gunakan operasi bitwise waktu-konstan ($O(1)$) guna mengeliminasi variasi siklus CPU pada berbagai ukuran prefiks.
2. **Alokasi Subnet Berbasis Hierarki**:
   - Awali perencanaan dari blok induk terbesar (misalnya IPv4 `/16` atau IPv6 `/32`–`/48`).
   - Lakukan partisi secara berurutan berdasarkan tingkatan operasional (Zona Ketersediaan, subnet VPC, atau batas keamanan) daripada rentang alamat acak.
3. **Kesadaran Alokasi IP Khusus Penyedia Cloud**:
   - Selalu aktifkan profil cloud yang relevan (**AWS VPC**, **Azure VNet**, **Google Cloud GCP**, atau **Oracle Cloud OCI**) saat merancang topologi cloud guna memperhitungkan alamat yang dicadangkan oleh penyedia (seperti AWS yang mencadangkan `.0`, `.1`, `.2`, `.3`, dan `.255`).
4. **Manipulasi DOM Defensif**:
   - Gunakan jQuery `.text()` atau `textContent` murni untuk nilai dinamis. Jika struktur HTML diperlukan, selalu sanitasi nilai terlebih dahulu menggunakan `escapeHtml()`.
5. **Kesiapan Beroperasi di Lingkungan Air-Gapped (Luring)**:
   - Seluruh pustaka eksternal (Bootstrap, jQuery, Font Awesome, LZ-String) dibundel secara lokal di dalam folder `dist/` dengan verifikasi Subresource Integrity (SRI). Pastikan secara berkala bahwa tidak ada koneksi jaringan keluar yang terjadi selama aplikasi berjalan.

---

## 9. Atribusi Pengelola & Konteks Ekosistem

Visual Subnet Calculator dikembangkan dan dikelola secara aktif oleh **HARRY DERTIN SUTISNA (@alsyundawy)** di bawah naungan **ALSYUNDAWY IT SOLUTION**.

### Integrasi Ekosistem Infrastruktur

Visual Subnet Calculator berfungsi sebagai mesin perancangan dan alokasi IP dasar untuk ekosistem sistem jaringan produksi:

- **Otomasi Netplan**: Membangun konfigurasi profil antarmuka produksi untuk server Ubuntu dan Debian.
- **Routing & Diagnostik**: Menghubungkan batas subnet dengan utilitas diagnostik Ping, Traceroute, dan MTR.
- **Administrasi DNS**: Menentukan batas zona forward (A/AAAA) dan reverse (`in-addr.arpa`, `ip6.arpa`) PTR secara tepat.
- **Audit Keamanan & Discovery**: Menentukan cakupan rentang CIDR target untuk pemindaian Nmap dan uji performa IPERF3.
- **Kontrol Akses Zero-Trust**: Menetapkan daftar kendali akses (ACL) berbasis subnet pada reverse proxy Nginx dan gateway korporat.

### Saluran & Sumber Daya Resmi

- **Situs Resmi Pengelola**: [`https://alsyundawy.com`](https://alsyundawy.com)
- **Repositori GitHub**: [`https://github.com/alsyundawy/visualsubnetcalc`](https://github.com/alsyundawy/visualsubnetcalc)
- **Kontak Langsung**: X ([`@alsyundawy`](https://x.com/alsyundawy)) | Telegram ([`@alsyundawy`](https://t.me/alsyundawy)) | Email ([`alsyundawy@gmail.com`](mailto:alsyundawy@gmail.com))
- **Dukungan Finansial**: [`Donasi PayPal`](https://paypal.me/alsyundawy)
