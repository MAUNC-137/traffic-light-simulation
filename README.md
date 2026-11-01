# Mini Traffic Light V1 --- Vehicle Detection Alert

Prototype lampu lalu lintas satu jalur dengan peringatan suara ketika
sensor mendeteksi objek di area pengawasan saat lampu merah menyala.

> **Status dokumentasi: rancangan awal.** Pinout Traffic Module MAUNC
> dan tipe buzzer belum diverifikasi. Wiring Traffic Module pada dokumen
> ini sengaja belum menetapkan nomor pin agar tidak salah sambung.
> Lengkapi setelah memeriksa label atau dokumentasi modul yang
> sebenarnya.

## 1. Gambaran Sistem

Sistem memiliki tiga fase lampu:

1.  **Merah:** sensor ultrasonik aktif mengawasi area deteksi. Jika
    objek terdeteksi dalam jarak yang ditentukan, buzzer berbunyi.
2.  **Kuning:** sensor tidak memicu alarm.
3.  **Hijau:** sensor tidak memicu alarm.

Siklus lampu berjalan berulang. Pada versi awal ini, sensor mendeteksi
keberadaan objek di area pengawasan; sistem belum dapat memastikan bahwa
objek benar-benar bergerak melewati garis berhenti atau mengidentifikasi
kendaraan.

## 2. Daftar Komponen

  ------------------------------------------------------------------------
  No.              Komponen                        Jumlah Status / catatan
  ---------------- ---------------- --------------------- ----------------
  1                Arduino Uno atau                     1 Gunakan board
                   Mega                                   yang sudah lolos
                                                          Blink Test

  2                Traffic Module                       1 Tercatat 12 unit
                                                          di inventaris;
                                                          model dan pinout
                                                          harus diperiksa

  3                Sensor                               1 Tercatat 10
                   ultrasonik                             unit; fungsi
                   HC-SR04                                unit yang
                                                          dipakai harus
                                                          diuji

  4                Buzzer aktif /                       1 Tipe dan
                   buzzer module                          kebutuhan arus
                                                          harus diperiksa

  5                Breadboard                           1 Jika diperlukan
                                                          untuk distribusi
                                                          koneksi

  6                Kabel jumper                Secukupnya Periksa
                                                          ketersediaan dan
                                                          kondisi

  7                Kabel USB                            1 Untuk upload
                                                          program dan daya
                                                          Arduino
  ------------------------------------------------------------------------

## 3. Wiring Sensor Ultrasonik

### HC-SR04 ke Arduino Uno

  Pin HC-SR04   Arduino Uno
  ------------- -------------
  VCC           5V
  GND           GND
  TRIG          D9
  ECHO          D10

Jika menggunakan Arduino Mega, pin D9 dan D10 juga dapat digunakan.
Pastikan nomor pin pada program sama dengan wiring.

## 4. Wiring Buzzer

Wiring berikut berlaku **hanya jika** buzzer yang digunakan merupakan
modul aktif yang memiliki pin Signal/VCC/GND dan kompatibel dengan
output Arduino.

  Pin buzzer module   Arduino Uno
  ------------------- -----------------------------------
  Signal / IN         D8
  VCC                 5V, jika sesuai spesifikasi modul
  GND                 GND

Jika yang tersedia adalah buzzer bare 2-pin, jangan langsung
menganggapnya sama dengan modul 3-pin. Periksa spesifikasi arusnya.
Gunakan transistor driver dan resistor basis yang sesuai bila buzzer
membutuhkan arus melebihi kemampuan pin Arduino.

## 5. Wiring Traffic Module

**Nomor pin belum ditentukan.** Inventaris MAUNC hanya menyebut "Traffic
Module" dan jumlah 12 unit; inventaris tidak mencantumkan tipe, label
pin, tegangan kerja, maupun skema modul.

Sebelum menyambungkan, periksa: - Tulisan/label pada pin modul. - Apakah
modul memiliki pin input terpisah untuk merah, kuning, dan hijau, atau
menggunakan antarmuka lain. - Tegangan kerja modul. - Apakah input modul
aktif-HIGH atau aktif-LOW. - Apakah modul sudah memiliki resistor
pembatas arus.

Setelah informasi tersebut diketahui, catat pemetaan pin pada tabel
berikut:

  Fungsi Traffic Module   Pin modul                       Pin Arduino
  ----------------------- ------------------------------- ---------------------------------
  Merah                   Periksa label modul             Belum ditentukan
  Kuning                  Periksa label modul             Belum ditentukan
  Hijau                   Periksa label modul             Belum ditentukan
  GND                     Periksa label modul             GND, jika diperlukan oleh modul
  VCC                     Periksa label dan spesifikasi   Tegangan sesuai spesifikasi

**Jangan menghubungkan modul berdasarkan tebakan atau hanya berdasarkan
warna LED.** Wiring final harus mengikuti label atau dokumentasi modul
aktual.

## 6. Rencana Pemetaan Pin Arduino

Pin berikut adalah rancangan untuk sensor dan buzzer. Pin Traffic Module
masih menunggu verifikasi.

  Fungsi           Pin Arduino Uno
  ---------------- ------------------
  Sensor TRIG      D9
  Sensor ECHO      D10
  Buzzer Signal    D8
  Traffic merah    Belum ditentukan
  Traffic kuning   Belum ditentukan
  Traffic hijau    Belum ditentukan

Pastikan tidak ada pin yang dipakai oleh dua komponen sekaligus.

## 7. Diagram Blok Sistem

``` mermaid
flowchart TD
    A[Arduino Uno / Mega]
    B[Traffic Module]
    C[HC-SR04]
    D[Buzzer]

    A -->|Kontrol lampu| B
    C -->|TRIG dan ECHO| A
    A -->|Kontrol alarm| D
    C -.->|Area deteksi aktif saat lampu merah| A
```

Diagram ini menunjukkan hubungan fungsional, bukan pinout fisik Traffic
Module.

## 8. Logika Operasi

  Fase lampu   Sensor               Kondisi objek                   Buzzer
  ------------ -------------------- ------------------------------- ----------
  Merah        Aktif                Tidak terdeteksi                Mati
  Merah        Aktif                Terdeteksi dalam ambang jarak   Berbunyi
  Kuning       Tidak memicu alarm   Apa pun                         Mati
  Hijau        Tidak memicu alarm   Apa pun                         Mati

Nilai ambang jarak dan durasi tiap lampu adalah parameter awal yang
dapat disesuaikan saat pengujian.

## 9. Pemeriksaan Sebelum Perakitan

-   [ ] Arduino berhasil menjalankan Blink Test.
-   [ ] HC-SR04 berhasil membaca jarak melalui Serial Monitor.
-   [ ] Tipe dan pinout Traffic Module sudah diidentifikasi.
-   [ ] Tegangan kerja Traffic Module sudah diketahui.
-   [ ] Logika input Traffic Module (aktif-HIGH/aktif-LOW) sudah
    diketahui.
-   [ ] Tipe buzzer dan kebutuhan dayanya sudah diperiksa.
-   [ ] Buzzer berhasil diuji secara terpisah.
-   [ ] Pemetaan pin final dicatat dan tidak saling bertabrakan.
-   [ ] Seluruh GND disatukan jika rangkaian menggunakan sumber daya
    yang sama/terpisah sesuai rancangan.

## 10. Batasan dan Keselamatan

1.  Proyek ini adalah prototype edukasi, bukan sistem penegakan lalu
    lintas atau perangkat keselamatan jalan.
2.  Sensor ultrasonik hanya mendeteksi objek dalam area dan jangkauan
    tertentu; pembacaan tidak membuktikan pelanggaran lalu lintas
    sebenarnya.
3.  Uji prototype di meja atau miniatur, bukan di jalan umum.
4.  Matikan daya sebelum mengubah wiring.
5.  Periksa tegangan, polaritas, dan kebutuhan arus setiap modul sebelum
    menyalakannya.
6.  Jangan menghubungkan buzzer yang membutuhkan arus besar langsung ke
    pin I/O Arduino.

## 11. Informasi yang Masih Harus Dikonfirmasi

Dokumentasi wiring final perlu diperbarui setelah pemeriksaan komponen
MAUNC:

-   Foto bagian depan dan belakang Traffic Module.
-   Tulisan pin pada Traffic Module.
-   Tegangan dan logika input Traffic Module.
-   Tipe buzzer yang akan digunakan.
-   Kondisi HC-SR04 yang dipilih.

**Langkah berikutnya:** ambil foto Traffic Module MAUNC dengan tulisan
pin terlihat jelas. Setelah itu, pemetaan pin dan diagram wiring dapat
dilengkapi sesuai modul sebenarnya.
