#include <Wire.h>
#include <Adafruit_NeoPixel.h>
#include <MAX30105.h>
#include <Adafruit_TCS34725.h>
#include <heartRate.h>

#define LED_PIN   16
#define LED_COUNT 16
#define VALVE_PIN 17
#define FAN_PIN    4

Adafruit_NeoPixel halo(LED_COUNT, LED_PIN, NEO_GRB + NEO_KHZ800); // LED strip
MAX30105 pulse; // Heart-rate sensor
Adafruit_TCS34725 tcs(TCS34725_INTEGRATIONTIME_50MS, // integration time
                      TCS34725_GAIN_4X); // gain which is suitable for most lighting conditions

void setup() {
  Serial.begin(115200); 
  pinMode(VALVE_PIN, OUTPUT);
  digitalWrite(VALVE_PIN, LOW);
  pinMode(FAN_PIN, OUTPUT);
  ledcSetup(0, 5000, 8); 
  ledcAttachPin(FAN_PIN, 0);
  ledcWrite(0, 200);

// — LED strip setup —
  halo.begin();  
  halo.show();  

// — Heart-rate sensor setup —
  Wire.begin();
  pulse.begin();
  pulse.setup();
  
  // — Colour sensor setup —
  if (!tcs.begin()) {
    Serial.println("TCS34725 not found");
    while (1);
  }
}

void loop() {
  // — Heart-rate trigger —
  long ir = pulse.getIR();
  static uint32_t lastBeat = 0;
  if (checkForBeat(ir)) {
    uint32_t now = millis();
    int bpm = 60000 / (now - lastBeat);
    lastBeat = now;
    Serial.print("BPM: "); Serial.println(bpm);
    if (bpm > 120) triggerScent("stress");
  }

  // — Colour trigger —
  uint16_t r, g, b, c;
  tcs.getRawData(&r, &g, &b, &c);
  if (c > 200) { // only trigger if light is detected
    if (r > g && r > b) triggerScent("joy"); //red
    else if (g > r && g > b) triggerScent("energy"); //green
    else if (b > r && b > g) triggerScent("calm"); //blue
  }
  delay(100);
}

void triggerScent(const char* mode) {
  uint32_t col = 
    strcmp(mode,"joy")==0     ? halo.Color(255,165,0) : 
    strcmp(mode,"energy")==0  ? halo.Color(0,255,0) :
    strcmp(mode,"calm")==0    ? halo.Color(0,0,255) :
                                halo.Color(0,0,255);
  halo.fill(col, 0, LED_COUNT);
  halo.show();

  digitalWrite(VALVE_PIN, HIGH);
  delay(3000);
  digitalWrite(VALVE_PIN, LOW);

  halo.clear(); 
  halo.show();
}
