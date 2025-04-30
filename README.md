# MemScent

**Turn your favorite memories into custom fragrance recipes.**

---

## Project Overview

MemScent has two parts:

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
   - Environment variables and secrets managed in Vercel dashboard

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

Languages: Python, TypeScript, JavaScript
Frameworks: FastAPI, Next.js, React
AI/ML: OpenAI Embeddings, RandomForestRegressor
Cloud/DevOps: Vercel (Serverless), Upstash Redis-KV, CI/CD, env-var secrets
Future-proof: PlatformIO stubs ready for embedded diffuser hardware
