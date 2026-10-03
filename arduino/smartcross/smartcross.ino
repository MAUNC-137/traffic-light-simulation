// =====================================================
// TRAFFIC LIGHT + VIOLATION DETECTION
// TEST 3 ARAH
// SENSOR UTARA BELUM DIGUNAKAN
// =====================================================


// =====================================================
// BARAT
// =====================================================

#define R_BARAT 2
#define Y_BARAT 3
#define G_BARAT 4

#define TRIG_BARAT 11
#define ECHO_BARAT 12


// =====================================================
// UTARA
// Traffic light saja
// =====================================================

#define R_UTARA 40
#define Y_UTARA 41
#define G_UTARA 42


// =====================================================
// TIMUR
// =====================================================

#define R_TIMUR 27
#define Y_TIMUR 28
#define G_TIMUR 29

#define TRIG_TIMUR 30
#define ECHO_TIMUR 31


// =====================================================
// BUZZER
// =====================================================

#define BUZZER 32


// =====================================================
// SENSOR
// =====================================================

#define BATAS_JARAK 4


// =====================================================
// DURASI
// =====================================================

#define WAKTU_HIJAU 3000
#define WAKTU_KUNING 1000


// =====================================================
// BACA SENSOR
// =====================================================

long bacaJarak(int trigPin, int echoPin) {

  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);

  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);

  digitalWrite(trigPin, LOW);

  long durasi = pulseIn(echoPin, HIGH, 30000);

  if (durasi == 0) {
    return 999;
  }

  return durasi * 0.0343 / 2;
}


// =====================================================
// BARAT
// =====================================================

void baratMerah() {
  digitalWrite(R_BARAT, HIGH);
  digitalWrite(Y_BARAT, LOW);
  digitalWrite(G_BARAT, LOW);
}

void baratKuning() {
  digitalWrite(R_BARAT, LOW);
  digitalWrite(Y_BARAT, HIGH);
  digitalWrite(G_BARAT, LOW);
}

void baratHijau() {
  digitalWrite(R_BARAT, LOW);
  digitalWrite(Y_BARAT, LOW);
  digitalWrite(G_BARAT, HIGH);
}


// =====================================================
// UTARA
// =====================================================

void utaraMerah() {
  digitalWrite(R_UTARA, HIGH);
  digitalWrite(Y_UTARA, LOW);
  digitalWrite(G_UTARA, LOW);
}

void utaraKuning() {
  digitalWrite(R_UTARA, LOW);
  digitalWrite(Y_UTARA, HIGH);
  digitalWrite(G_UTARA, LOW);
}

void utaraHijau() {
  digitalWrite(R_UTARA, LOW);
  digitalWrite(Y_UTARA, LOW);
  digitalWrite(G_UTARA, HIGH);
}


// =====================================================
// TIMUR
// =====================================================

void timurMerah() {
  digitalWrite(R_TIMUR, HIGH);
  digitalWrite(Y_TIMUR, LOW);
  digitalWrite(G_TIMUR, LOW);
}

void timurKuning() {
  digitalWrite(R_TIMUR, LOW);
  digitalWrite(Y_TIMUR, HIGH);
  digitalWrite(G_TIMUR, LOW);
}

void timurHijau() {
  digitalWrite(R_TIMUR, LOW);
  digitalWrite(Y_TIMUR, LOW);
  digitalWrite(G_TIMUR, HIGH);
}


// =====================================================
// CEK BARAT + TIMUR
// UTARA TIDAK DIBACA
// =====================================================

void cekPelanggaran() {

  long barat = bacaJarak(TRIG_BARAT, ECHO_BARAT);

  delay(20);

  long timur = bacaJarak(TRIG_TIMUR, ECHO_TIMUR);


  // ===================================================
  // SERIAL MONITOR
  // ===================================================

  Serial.print("BARAT: ");

  if (barat == 999) {
    Serial.print("TIMEOUT");
  }
  else {
    Serial.print(barat);
    Serial.print(" cm");
  }


  Serial.print(" | TIMUR: ");

  if (timur == 999) {
    Serial.print("TIMEOUT");
  }
  else {
    Serial.print(timur);
    Serial.print(" cm");
  }


  // ===================================================
  // PELANGGARAN BARAT
  // ===================================================

  if (digitalRead(R_BARAT) == HIGH &&
      barat <= BATAS_JARAK) {

    Serial.println(" | !!! PELANGGARAN BARAT !!!");

    tone(BUZZER, 2000);
  }


  // ===================================================
  // PELANGGARAN TIMUR
  // ===================================================

  else if (digitalRead(R_TIMUR) == HIGH &&
           timur <= BATAS_JARAK) {

    Serial.println(" | !!! PELANGGARAN TIMUR !!!");

    tone(BUZZER, 2000);
  }


  // ===================================================
  // TIDAK ADA PELANGGARAN SENSOR FISIK
  // ===================================================

  else {

    Serial.println();

    // Matikan buzzer jika tidak sedang dipicu oleh simulasi web
    if (millis() >= waktuBuzzerWeb) {
      matikanBuzzerFisik();
    }
  }
}


// =====================================================
// BACA PERINTAH TRIGGER DARI WEB SIMULASI
// =====================================================

unsigned long waktuBuzzerWeb = 0;

void bunyikanBuzzerFisik(unsigned long durasiMs = 1200) {
  tone(BUZZER, 2000);
  digitalWrite(BUZZER, HIGH);
  waktuBuzzerWeb = millis() + durasiMs;
  Serial.println(">>> [WEB SIMULASI] TRIGGER BUZZER FISIK AKTIF! <<<");
}

void matikanBuzzerFisik() {
  noTone(BUZZER);
  digitalWrite(BUZZER, LOW);
  waktuBuzzerWeb = 0;
}

void periksaPerintahWeb() {
  while (Serial.available() > 0) {
    char c = Serial.read();
    // Mendukung sinyal 'B', 'b', atau angka '1' dari web
    if (c == 'B' || c == 'b' || c == '1') {
      bunyikanBuzzerFisik(1200); // Bunyikan buzzer fisik selama 1.2 detik
    }
  }
}


// =====================================================
// JALANKAN SENSOR SELAMA DURASI
// =====================================================

void tungguDanDeteksi(unsigned long durasi) {

  unsigned long mulai = millis();

  while (millis() - mulai < durasi) {

    periksaPerintahWeb();

    cekPelanggaran();

    if (millis() >= waktuBuzzerWeb && digitalRead(R_BARAT) == LOW && digitalRead(R_TIMUR) == LOW) {
      matikanBuzzerFisik();
    }

    delay(60);
  }

  if (millis() >= waktuBuzzerWeb) {
    matikanBuzzerFisik();
  }
}


// =====================================================
// SETUP
// =====================================================

void setup() {

  Serial.begin(9600);


  // =========================
  // BARAT
  // =========================

  pinMode(R_BARAT, OUTPUT);
  pinMode(Y_BARAT, OUTPUT);
  pinMode(G_BARAT, OUTPUT);

  pinMode(TRIG_BARAT, OUTPUT);
  pinMode(ECHO_BARAT, INPUT);


  // =========================
  // UTARA
  // =========================

  pinMode(R_UTARA, OUTPUT);
  pinMode(Y_UTARA, OUTPUT);
  pinMode(G_UTARA, OUTPUT);


  // =========================
  // TIMUR
  // =========================

  pinMode(R_TIMUR, OUTPUT);
  pinMode(Y_TIMUR, OUTPUT);
  pinMode(G_TIMUR, OUTPUT);

  pinMode(TRIG_TIMUR, OUTPUT);
  pinMode(ECHO_TIMUR, INPUT);


  // =========================
  // BUZZER
  // =========================

  pinMode(BUZZER, OUTPUT);

  noTone(BUZZER);


  // =========================
  // KONDISI AWAL
  // =========================

  baratHijau();
  utaraMerah();
  timurMerah();


  Serial.println();
  Serial.println("==========================================");
  Serial.println(" TRAFFIC VIOLATION DETECTION");
  Serial.println(" TEST 3 ARAH");
  Serial.println(" SENSOR UTARA: BELUM AKTIF");
  Serial.println("==========================================");
}


// =====================================================
// LOOP
// =====================================================

void loop() {


  // ===================================================
  // FASE 1
  // BARAT HIJAU
  // UTARA MERAH
  // TIMUR MERAH
  // ===================================================

  baratHijau();
  utaraMerah();
  timurMerah();

  Serial.println();
  Serial.println("=== BARAT HIJAU | UTARA MERAH | TIMUR MERAH ===");

  tungguDanDeteksi(WAKTU_HIJAU);


  // ===================================================
  // FASE 2
  // BARAT KUNING
  // UTARA MERAH
  // TIMUR MERAH
  // ===================================================

  baratKuning();
  utaraMerah();
  timurMerah();

  Serial.println();
  Serial.println("=== BARAT KUNING | UTARA MERAH | TIMUR MERAH ===");

  tungguDanDeteksi(WAKTU_KUNING);


  // ===================================================
  // FASE 3
  // BARAT MERAH
  // UTARA HIJAU
  // TIMUR MERAH
  // ===================================================

  baratMerah();
  utaraHijau();
  timurMerah();

  Serial.println();
  Serial.println("=== BARAT MERAH | UTARA HIJAU | TIMUR MERAH ===");

  tungguDanDeteksi(WAKTU_HIJAU);


  // ===================================================
  // FASE 4
  // BARAT MERAH
  // UTARA KUNING
  // TIMUR MERAH
  // ===================================================

  baratMerah();
  utaraKuning();
  timurMerah();

  Serial.println();
  Serial.println("=== BARAT MERAH | UTARA KUNING | TIMUR MERAH ===");

  tungguDanDeteksi(WAKTU_KUNING);


  // ===================================================
  // FASE 5
  // BARAT MERAH
  // UTARA MERAH
  // TIMUR HIJAU
  // ===================================================

  baratMerah();
  utaraMerah();
  timurHijau();

  Serial.println();
  Serial.println("=== BARAT MERAH | UTARA MERAH | TIMUR HIJAU ===");

  tungguDanDeteksi(WAKTU_HIJAU);


  // ===================================================
  // FASE 6
  // BARAT MERAH
  // UTARA MERAH
  // TIMUR KUNING
  // ===================================================

  baratMerah();
  utaraMerah();
  timurKuning();

  Serial.println();
  Serial.println("=== BARAT MERAH | UTARA MERAH | TIMUR KUNING ===");

  tungguDanDeteksi(WAKTU_KUNING);
}