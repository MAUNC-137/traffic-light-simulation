# 🚦 SmartCross — IoT Traffic & Red-Light Violation Surveillance System

SmartCross adalah sistem pemantauan lalu lintas pintar persimpangan jalan (T-Junction) terintegrasi yang menggabungkan mikrokontroler **Arduino Mega 2560** fisik dengan **Dasbor Pemantauan Web 3D Real-time** berbasis Three.js (React Three Fiber) dan WebSerial API.

Sistem ini dirancang untuk mendeteksi pelanggaran kendaraan yang menerobos lampu merah secara otomatis, membunyikan alarm peringatan seketika (buzzer piezo fisik + audio synthesizer browser), mengambil tangkapan layar bukti CCTV lengkap dengan telemetri identitas kendaraan, serta mencatat log insiden secara real-time.

---

## 📸 Fitur Utama

- **🎮 Simulasi & Visualisasi 3D Interaktif**:
  - Persimpangan 3 arah (*T-Junction*: Barat, Timur, dan Utara) dengan geometri aspal, zebra cross, marka jalan, tiang lampu gantung (*mast arm*), sensor ultrasonik, dan lampu penerangan jalan.
  - Kamera bebas digerakkan (rotasi 360°, geser, dan *zoom*) menggunakan mouse (*OrbitControls*).
  - Ragam kendaraan 3D: Mobil Sedan, SUV, Sepeda Motor, Mini Bus, dan Truk Box dengan plat nomor acak khas Indonesia.
- **⚡ Komunikasi Hardware Dua Arah (WebSerial API)**:
  - Browser terhubung langsung ke port serial Arduino Mega 2560 (9600 Baud) tanpa perlu aplikasi perantara (*bridge* / server lokal tambahan).
  - Sinkronisasi fase lampu lalu lintas fisik dengan tampilan virtual di layar 3D.
  - Pengiriman sinyal otomatis dari web ke Arduino untuk menyalakan buzzer fisik di Pin 32 saat simulasi mendeteksi pelanggaran.
- **🚨 Deteksi & Bukti Pelanggaran Otomatis (CCTV Surveillance)**:
  - Deteksi stop line: kendaraan yang melintasi sensor saat lampu sedang MERAH langsung ditandai sebagai pelanggar.
  - *CCTV Camera Flash & Snapshot*: memotret tangkapan layar 3D resolusi tinggi dengan *digital watermark* ala CCTV forensik (waktu presisi, nama jalur, jenis kendaraan, plat nomor, dan status lampu).
  - Modal pratinjau bukti foto full-size dengan opsi unduh file PNG dan unggah ke cloud via Cloudinary.
- **🔊 Dual Audio Alarm Feedback**:
  - Mengirim sinyal `'B'` ke Arduino fisik untuk menyalakan buzzer piezo 2000Hz di Pin 32.
  - Membunyikan suara alarm piezo synthesized secara native di browser via Web Audio API (frekuensi 2000Hz sawtooth pulse).
- **⚙️ Konfigurasi Hardware Interaktif & Live Serial Monitor**:
  - Panel konfigurasi pin GPIO Arduino (TL1, TL2, TL3, ultrasonik HC-SR04, buzzer) yang dapat disesuaikan langsung dari UI.
  - *Live incoming serial monitor* untuk melihat output log Arduino secara *real-time*.

---

## 🏗️ Arsitektur Sistem

```
+-------------------------------------------------------+
|                 HARDWARE (Arduino Mega 2560)          |
|  - 3x Traffic Light LEDs (Timur, Barat, Utara)        |
|  - 2x HC-SR04 Ultrasonic Sensors (Timur & Barat)      |
|  - 1x Buzzer Alarm (Pin 32)                           |
+---------------------------+---------------------------+
                            |
                     USB Serial (9600 Baud)
                            |
+---------------------------v---------------------------+
|                   BROWSER CLIENT                      |
|                                                       |
|  [ WebSerial Driver ] <---> [ Zustand State Store ]   |
|                                     |                 |
|             +-----------------------+---------------+ |
|             |                       |               | |
|     [ 3D Scene / R3F ]      [ CCTV Capture ] [ Audio Synth ]
|   Three.js T-Junction       Telemetri Bukti    Piezo 2000Hz   |
|   Marka & Kendaraan           Canvas Overlay   Web Audio API  |
+-------------------------------------------------------+
```

---

## 🔌 Skema Wiring & Konfigurasi Pinout Arduino

Sistem default menggunakan board **Arduino Mega 2560** dengan pinout berikut (sesuai sketch `arduino/smartcross/smartcross.ino`):

| Komponen | Jalur | Pin Arduino | Keterangan |
| :--- | :--- | :--- | :--- |
| **Traffic Light Timur (TL1)** | Timur | **Pin 27** (Merah), **Pin 28** (Kuning), **Pin 29** (Hijau) | Anoda LED via Resistor 220Ω |
| **Sensor Jarak HC-SR04 (1)** | Timur | **Pin 30** (TRIG), **Pin 31** (ECHO) | VCC 5V, GND |
| **Traffic Light Barat (TL2)** | Barat | **Pin 2** (Merah), **Pin 3** (Kuning), **Pin 4** (Hijau) | Anoda LED via Resistor 220Ω |
| **Sensor Jarak HC-SR04 (2)** | Barat | **Pin 11** (TRIG), **Pin 12** (ECHO) | VCC 5V, GND |
| **Traffic Light Utara (TL3)** | Utara | **Pin 40** (Merah), **Pin 41** (Kuning), **Pin 42** (Hijau) | Anoda LED via Resistor 220Ω |
| **Sensor Jarak Utara** | Utara | *Bypass / Dinonaktifkan* | Sensor fisik utara offline |
| **Buzzer Alarm** | - | **Pin 32** | Active Buzzer 5V DC / Passive Piezo |

- **Batas Jarak Pelanggaran Sensor Ultrasonik**: $\le 4\text{ cm}$ di depan garis stop saat lampu merah.
- **Baud Rate Serial**: `9600` bps.

---

## 📡 Protokol Komunikasi Serial

### 1. Transmisi dari Arduino ke Web Client
Arduino mengirimkan telemetry status secara berkala melalui serial monitor:
- **Status Fase Lampu**:
  ```text
  === BARAT HIJAU | UTARA MERAH | TIMUR MERAH ===
  ```
- **Deteksi Pelanggaran Fisik**:
  ```text
  BARAT: 3 cm | TIMUR: 25 cm | !!! PELANGGARAN BARAT !!!
  ```

### 2. Transmisi dari Web Client ke Arduino
Web dashboard dapat mengirimkan perintah kontrol balik melalui port serial:
- `'B'` / `'b'` / `'1'` / `'T'`: Memerintahkan Arduino untuk membunyikan alarm buzzer fisik selama 1,5 detik.
- Format `CONFIG:...`: Mengirimkan pembaruan alokasi pinout mikrokontroler.

---

## 📁 Struktur Folder Proyek

```
Maunc/
├── arduino/
│   └── smartcross/
│       └── smartcross.ino          # Sketch Arduino Mega 2560
├── public/
│   ├── favicon.svg                 # Favicon aplikasi
│   └── icons.svg                   # Aset ikon SVG
├── src/
│   ├── components/
│   │   ├── canvas/                 # Komponen 3D Three.js / React Three Fiber
│   │   │   ├── CCTV.tsx            # Model tiang CCTV, kamera & animasi lampu flash
│   │   │   ├── Scene.tsx           # Setup 3D scene, pencahayaan, bayangan & OrbitControls
│   │   │   ├── TJunction.tsx       # Geometri aspal, trotoar, marka jalan & lampu jalan
│   │   │   ├── TrafficLight.tsx    # Tiang lampu lalu lintas mast-arm & emisi warna
│   │   │   ├── UltrasonicSensor.tsx# Representasi 3D sensor ultrasonik & gelombang deteksi
│   │   │   └── Vehicle.tsx         # Spawner & model 3D kendaraan (Sedan, SUV, Motor, Bus, Truk)
│   │   └── ui/                     # Komponen antarmuka 2D HUD
│   │       ├── AlertBanner.tsx     # Notifikasi banner pelanggaran real-time
│   │       ├── HeaderNav.tsx       # Navigasi atas (status serial, tombol koneksi & mode)
│   │       ├── SettingsModal.tsx   # Modal drawer konfigurasi pin hardware & serial monitor
│   │       ├── SimToggle.tsx       # Tombol alih Mode Simulasi / Mode Hardware
│   │       ├── SimulationInfoBar.tsx # Bar telemetri bawah & tombol aksi cepat
│   │       ├── ViolationLogPanel.tsx # Panel sidebar riwayat & filter pelanggaran
│   │       └── ViolationPreviewModal.tsx # Lightbox foto bukti CCTV resolusi penuh
│   ├── config/
│   │   ├── arena.ts                # Koordinat 3D fisik jalur & stop line persimpangan
│   │   └── vehiclePaths.ts         # Definisi lintasan kurva CatmullRom kendaraan
│   ├── hooks/
│   │   ├── useCCTVCapture.ts       # Generator snapshot CCTV canvas dengan telemetri digital
│   │   ├── useSerial.ts            # Hook WebSerial API (pembacaan stream & transmisi serial)
│   │   └── useSimCycle.ts          # State machine siklus traffic light otomatis (mode simulasi)
│   ├── services/
│   │   ├── buzzerAudio.ts          # Web Audio API 2000Hz piezo synthesizer
│   │   └── cloudinary.ts           # Service upload bukti tangkapan layar ke Cloudinary
│   ├── store/
│   │   └── arenaStore.ts           # State management global (Zustand)
│   ├── styles/
│   │   └── ui.css                  # Stylesheet industrial dark UI HUD
│   ├── types/
│   │   ├── pins.ts                 # Definisi tipe konfigurasi pin, fase & parser string
│   │   └── serial.ts               # Type declarations untuk WebSerial API
│   ├── App.tsx                     # Entrypoint & root orchestrator aplikasi
│   ├── index.css                   # Global styles & token variabel warna
│   └── main.tsx                    # React DOM root render
├── .env.example                    # Template variabel lingkungan Cloudinary
├── eslint.config.js                # Konfigurasi ESLint
├── package.json                    # Dependensi proyek & npm scripts
├── tsconfig.json                   # Konfigurasi TypeScript
└── vite.config.ts                  # Konfigurasi bundler Vite
```

---

## 🚀 Panduan Memulai

### 1. Prasyarat
- **Node.js**: v18.0.0 atau lebih baru.
- **Browser**: Google Chrome atau Microsoft Edge versi terbaru (mendukung WebSerial API).
- **Arduino IDE**: v1.8.x atau v2.x (jika ingin menjalankan dengan hardware Arduino fisik).

### 2. Instalasi Dependensi
```bash
# Clone atau masuk ke direktori proyek
cd c:/CODING/Maunc

# Install dependensi
npm install
```

### 3. Konfigurasi Environment (Opsional)
Jika Anda ingin menyimpan foto bukti pelanggaran ke Cloudinary secara otomatis:
1. Salin `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
2. Isi kredensial Cloudinary:
   ```env
   VITE_CLOUDINARY_CLOUD_NAME=nama_cloud_anda
   VITE_CLOUDINARY_PRESET=upload_preset_unsigned_anda
   ```

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka browser pada alamat `http://localhost:5173`.

### 5. Menjalankan Kode Arduino
1. Hubungkan Arduino Mega 2560 ke port USB komputer.
2. Buka file `arduino/smartcross/smartcross.ino` di Arduino IDE.
3. Pilih board **Arduino Mega or Mega 2560** dan port COM yang sesuai.
4. Klik **Upload**.
5. *Penting*: Tutup Serial Monitor di Arduino IDE sebelum menghubungkan browser via tombol **Connect Arduino** agar port serial tidak terkunci (*busy*).

### 6. Build Produksi & Linting
```bash
# Uji kualitas kode (0 error, 0 warning)
npm run lint

# Kompilasi TypeScript dan bundler Vite
npm run build

# Menjalankan preview build produksi
npm run preview
```

---

## 🎮 Cara Penggunaan Dashboard

1. **Mode Simulasi 3D**:
   - Klik tombol **Simulasi Aktif** pada bilah navigasi atas.
   - Lampu lalu lintas akan berganti secara otomatis. Kendaraan virtual akan berlalu-lalang di persimpangan.
   - Klik tombol **🚗+ Pancing Pelanggar** pada bar bawah untuk langsung memunculkan kendaraan yang melanggar di jalur lampu merah.
   - Saat terjadi pelanggaran: flash CCTV menyala, alarm piezo browser berbunyi, banner alert muncul, foto bukti CCTV dijepret, dan data tercatat di sidebar kanan.
2. **Mode Hardware Arduino**:
   - Pastikan Arduino sudah di-*flash* sketch dan terhubung via USB.
   - Klik tombol **🔌 Connect Arduino** di navigasi atas dan pilih port COM Arduino Mega Anda.
   - Matikan mode simulasi (**Simulasi Nonaktif**).
   - Layar 3D sekarang akan mengikuti warna lampu fisik Arduino.
   - Dekatkan objek ke sensor ultrasonik Barat/Timur ($\le 4\text{ cm}$) saat lampu merah menyala: Arduino akan menyalakan buzzer di Pin 32 dan mengirimkan sinyal pelanggaran ke web dashboard.
3. **Melihat & Mengunduh Bukti**:
   - Klik kartu pelanggaran di panel log sebelah kanan.
   - Klik foto thumbnail untuk membuka modal pratinjau resolusi penuh (*lightbox*).
   - Klik **⬇ Unduh Bukti** untuk menyimpan file PNG barang bukti ke komputer Anda.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **3D Graphics**: [Three.js](https://threejs.org/), [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber), [@react-three/drei](https://github.com/pmndrs/drei)
- **State Management**: [Zustand](https://zustand.docs.pmnd.rs/)
- **Hardware Interface**: Web Serial API (W3C standard)
- **Audio Synthesizer**: Web Audio API (Native browser oscillator & gain envelopes)
- **Cloud Storage**: Cloudinary Upload API
- **Embedded**: C++ / Arduino Mega 2560

---

## 📄 Lisensi

Proyek ini bersifat open-source untuk keperluan edukasi, riset teknologi transportasi cerdas, dan tugas akhir/portofolio IoT.
