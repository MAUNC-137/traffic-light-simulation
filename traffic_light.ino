
/*
 * MAUNC - Mini Traffic Light V1
 * Vehicle Detection Alert
 *
 * Arduino Uno / Mega
 */

#define TRIG_PIN 9
#define ECHO_PIN 10
#define BUZZER_PIN 8

// Traffic Module pins (sementara)
#define RED_PIN 2
#define YELLOW_PIN 3
#define GREEN_PIN 4

// Configuration
const int DETECT_DISTANCE = 15;

const unsigned long RED_DURATION = 5000;
const unsigned long YELLOW_DURATION = 2000;
const unsigned long GREEN_DURATION = 5000;

// Read distance from HC-SR04
float readDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);

  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);

  digitalWrite(TRIG_PIN, LOW);

  unsigned long duration =
    pulseIn(ECHO_PIN, HIGH, 25000UL);

  if (duration == 0) {
    return -1;
  }

  return duration * 0.0343 / 2.0;
}

// Control traffic light
void setTrafficLight(bool red, bool yellow, bool green) {
  digitalWrite(RED_PIN, red);
  digitalWrite(YELLOW_PIN, yellow);
  digitalWrite(GREEN_PIN, green);
}

// RED PHASE
void redPhase() {
  Serial.println("\nRED LIGHT - SENSOR ACTIVE");

  setTrafficLight(HIGH, LOW, LOW);

  unsigned long startTime = millis();

  while (millis() - startTime < RED_DURATION) {

    float distance = readDistance();

    if (distance > 0 && distance <= DETECT_DISTANCE) {

      digitalWrite(BUZZER_PIN, HIGH);

      Serial.print("WARNING! Object detected: ");
      Serial.print(distance);
      Serial.println(" cm");

    } else {

      digitalWrite(BUZZER_PIN, LOW);

      if (distance < 0) {
        Serial.println("Sensor reading invalid");
      }
    }

    delay(100);
  }

  digitalWrite(BUZZER_PIN, LOW);
}

// YELLOW PHASE
void yellowPhase() {
  Serial.println("\nYELLOW LIGHT");

  setTrafficLight(LOW, HIGH, LOW);

  digitalWrite(BUZZER_PIN, LOW);

  delay(YELLOW_DURATION);
}

// GREEN PHASE
void greenPhase() {
  Serial.println("\nGREEN LIGHT");

  setTrafficLight(LOW, LOW, HIGH);

  digitalWrite(BUZZER_PIN, LOW);

  delay(GREEN_DURATION);
}

// SETUP
void setup() {
  Serial.begin(9600);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  pinMode(BUZZER_PIN, OUTPUT);

  pinMode(RED_PIN, OUTPUT);
  pinMode(YELLOW_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);

  digitalWrite(BUZZER_PIN, LOW);

  Serial.println("==============================");
  Serial.println(" MAUNC MINI TRAFFIC LIGHT V1");
  Serial.println(" VEHICLE DETECTION ALERT");
  Serial.println("==============================");
}

// MAIN LOOP
void loop() {
  redPhase();
  yellowPhase();
  greenPhase();
}
