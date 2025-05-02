# MemScent

**Turn your favorite memories into custom fragrance recipes.**

We all carry vivid, smell-linked memories: Grandma’s warm kitchen, the fresh tang of summer rain, the smoky warmth of a beach bonfire.  
MemScent turns those mental snapshots into real-world fragrance recipes by:

- **Listening to Your Memory**  
  You type in any memory, such as “Grandma’s cookies” or “first day of college” and hit **Generate Scent**.
  Under the hood, your memory is sent to an AI “embedding” model that transforms words into numbers, capturing their meaning.

- **Blending an Oil Trio**  
  A Random Forest regressor, trained on past user feedback, maps that embedding to three essential oils (for prototyping purposes—e.g. Coffee, Vanilla, Bergamot) and their exact percentages to recreate the emotion of your memory.

- **Learning and Improving**  
  You give a 👍/👎. Every day, the system retrains itself on the latest feedback so that it gets better at matching blends to memories.

- **Serving It Fast**  
  We cache memory→recipe lookups in Upstash Redis-KV so repeat requests are instantaneous and API calls are minimized.

- **Turning Data Into Aroma (ongoing)**  
  An ESP32-powered diffuser can pull your custom recipe over Wi-Fi and drive peristaltic pumps or MOSFET-controlled valves to dispense the exact blend in your home, office, or retail space.

---

## Project Overview

<img width="1282" alt="Screenshot 2025-04-30 at 1 50 17 PM" src="https://github.com/user-attachments/assets/1de5d73e-1f71-49b2-b3ed-5f840bae4248" />


MemScent has two main components:

1. **Cloud AI Server** (`/cloud`)  
   - **FastAPI** + **scikit-learn**  
   - Trains a multi-output RandomForest on OpenAI embeddings  
   - Exposes `/predict` to map a user memory → a 3-oil blend  

2. **Web Dashboard** (`/dashboard`)  
   - **Next.js** + **React** + **TypeScript**  
   - User enters a memory, clicks **Generate Scent**, sees a blend  
   - Feedback (👍/👎) stored to retrain the model daily  

3. **Caching**  
   - **Upstash Redis-KV** caches memory→recipe lookups for instant repeats  

4. **Hosting & CI/CD**  
   - Deployed on **Vercel** with automatic Git-triggered builds  
   - Environment variables and secrets managed in the Vercel dashboard  

5. **Embedded Diffuser & Edge Control (ongoing)**  
   - **ESP32** microcontroller running **PlatformIO** code  
   - Controls peristaltic pumps or MOSFET-driven valves for each oil line  
   - Wi-Fi endpoint to fetch recipe and dispense the blend automatically  

   ### 5.1 Hardware Components & Setup  
   | Component                              | Qty  | Purpose                                                        |
   |----------------------------------------|:----:|----------------------------------------------------------------|
   | `Raspberry Pi 5` (8 GB)                |  1   | Edge AI server, camera capture & weight-sensor control         |
   | `Raspberry Pi Camera V2`               |  1   | Visual feedback (bottle fill-level, UI integration, security)  |
   | `HX711 + Load Cell`                    | 1–4  | Measure exactly how much oil was dispensed (closed-loop)       |
   | `ESP32 DevKit` (NodeMCU-32S)           |  1   | Wi-Fi MCU for real-time pump control                           |
   | `Peristaltic Pump` (Kamoer NKP-DC-S10B)| 3–4  | One pump per essential-oil channel (12 V, 3 mm×5 mm)            |
   | `N-Channel MOSFET` (RFP30N06LE)        | 3–4  | Logic-level gate driver for each pump                          |
   | `Flyback Diode` (1N4007)               | 3–4  | Protects MOSFET from pump back-EMF                             |
   | `Power Module` (5–12 V regulator)      |  1   | Feeds +12 V to pumps & +5 V/3.3 V to electronics               |
   | `Breadboard` (full-size, right rails)  |  1   | Wiring hub with dedicated +/– rails                             |
   | `100 Ω resistor`                       | 3–4  | Series resistor between PWM pin & MOSFET Gate                  |
   | `10 kΩ resistor`                       | 3–4  | Gate pull-down to ensure MOSFET turns fully off                |
   | Jumper Wires (F-M & M-M)               | 20+  | Connectors between ESP32, Pi GPIO, breadboard, pumps           |
   | `12 V DC Power Supply` (5 A)           |  1   | Powers the pump network via the regulator                      |
   | Essential Oil Vials & Tubing           |  N/A | Holds and routes each oil channel                              |

   ### 5.2 Pi + Sensor Integration  
   - **Run** the AI Server (`/cloud`) and Dashboard (`/dashboard`) on the Pi  
   - **Mount** the Pi Camera V2 over the diffuser fill station to capture fill levels or user interactions  
   - **Connect** each Load Cell + HX711 board to the Pi’s I²C pins (SDA/SCL) or spare GPIOs for clock/data  
   - **Place** each oil bottle on its load-cell platform for weight-based, closed-loop dispensing  
   - **Continuously read** weight via HX711 and adjust pump durations in firmware

   ### 5.3 Wiring & Data Flow  
   ```ascii
        +------------------+        +-----------+
        | Raspberry Pi 5   |        |  Camera   |
        | (AI + HX711)     |        +-----------+
        +--------+---------+
                 |
              I²C|
                 v
             +-------+
             | HX711 |
             +-------+
                 |
          MQTT / WebSocket
                 |
                 v
        +------------------+    +--------+
        |      ESP32       |--->| Pumps  |
        |   (Wi-Fi API)    |    |(MOSFET)|
        +------------------+    +--------+



- **Pi** runs the AI & web dashboard, reads camera & weight sensors  
- **ESP32** fetches recipe & drives oil pumps in real time  
- **Bi-directional**: Pi can monitor dispense progress via HX711 and camera, then adjust pump durations  


---

## Getting Started

1. **Clone & install**  
   ```bash
   git clone https://github.com/aaaamer1/MemScent.git
   cd MemScent
   # Python
   cd cloud && pip install -r requirements.txt
   # JS
   cd ../dashboard && npm ci

   
2. **Env vars**
    Copy .env.example → .env.local
    Fill in your OPENAI_API_KEY, UPSTASH_REDIS_REST_URL, and UPSTASH_REDIS_REST_TOKEN


3. **Train the model**
    cd cloud
    python train_regressor.py

4. **Run locally**
    ## In one terminal
    cd cloud && uvicorn server:app --reload --port 8001
    ## In another
    cd dashboard && npm run dev

5. **Deploy**
    Link repo in Vercel, set the same env vars in Project Settings → Environment Variables, then push to main.


# Tech & Skills
      Languages: Python, TypeScript, JavaScript, C++ (embedded stubs)
      Front-end: Next.js, React, Tailwind CSS
      Back-end: FastAPI, Uvicorn
      Machine Learning: OpenAI text embeddings, scikit-learn MultiOutputRegressor (RandomForest)
      Cloud & DevOps: Vercel (Serverless functions), Upstash Redis-KV, CI/CD pipelines, environment-safe secrets
      Data & Caching: JSON feedback storage, Redis KV for fast lookups
      Embedded: ESP32 (PlatformIO), MOSFET pump drivers, peristaltic pumps
      Hardware: Raspberry Pi 5, Pi Camera V2, HX711 load-cells, custom diffuser electronics
