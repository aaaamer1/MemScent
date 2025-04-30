import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { cosine } from "../../lib/cosine";
import { redis } from "../../lib/redis";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const PYTHON_SERVER_URL = process.env.PYTHON_SERVER_URL;

//oils that are allowed in the recipe - change later
const ALLOWED_OILS = [
  "Coffee","Oud Wood","Bergamot","Lavender","Rose","Cherry",
  "Vanilla","Strawberry","Sweet Orange","Mango",
  "Frankincense","Cinnamon","Rosemary","Jasmine",
  "Tea Tree","Vetiver","Sandalwood","Lemon"
];

// Load pre-built embeddings from disk 
const EMB_PATH = path.join(process.cwd(), "data/embeddings.json");
const embeddings: Array<{ embedding: number[]; recipe: any }> = JSON.parse(
  fs.readFileSync(EMB_PATH, "utf-8")
);

async function callPythonPredictor(memory: string) {
  if (!PYTHON_SERVER_URL) {
    throw new Error("PYTHON_SERVER_URL is not set");
  }
  const resp = await fetch(`${PYTHON_SERVER_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ memory }),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Python error: ${err}`);
  }
  return resp.json(); // { recipe, examples }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST only" });
  }

  const { memory = "", temperature = 0.7 } = req.body;
  if (!memory.trim()) {
    return res.status(400).json({ error: "Please send a non-empty memory" });
  }
  const key = memory.trim().toLowerCase();

  try {
    const cached = await redis.hget("memory_map", key);
    if (cached) {
      return res.status(200).json(JSON.parse(cached as string));
    }
  } catch (e) {
    console.warn("Redis read failed:", e);
  }

  if (PYTHON_SERVER_URL) {
    try {
      const payload = await callPythonPredictor(key);
      await redis.set(`memory_map:${key}`, JSON.stringify(payload));
      return res.status(200).json(payload);
    } catch (e) {
      console.warn("Python fallback failed:", e);
    }
  }

  const emb = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: key,
  });
  const queryVec = emb.data[0].embedding;

  // score against saved examples
  const top3 = embeddings
    .map(e => ({ score: cosine(queryVec, e.embedding), recipe: e.recipe }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(e => e.recipe);


  const fewShot = top3
    .map(r =>
      `Memory "${r.name}": ` +
      r.components.map((c: any) => `${c.oil} ${c.percent}%`).join(", ")
    )
    .join("\n\n");

  const oilList = ALLOWED_OILS.map(o => `"${o}"`).join(", ");
  const prompt = `
You are an expert perfumer. You MUST use *only* these oils: ${oilList}.
Based on a user's memory, you create a three-oil blend. Only output JSON.
Here are examples:
${fewShot}

Now for Memory: "${key}"
Return ONLY JSON: {"name":string,"components":[{"oil":string,"percent":number},…]}
`.trim();

  // call ChatGPT
  const chat = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature,
    messages: [
      { role: "system", content: "You are a helpful perfumer." },
      { role: "user", content: prompt },
    ],
  });

  let c = chat.choices[0].message.content?.trim() || "";
  if (c.startsWith("```")) {
    c = c.replace(/^```json?/, "").replace(/```$/, "").trim();
  }
  const first = c.indexOf("{"), last = c.lastIndexOf("}");
  if (first !== -1 && last !== -1) {
    c = c.slice(first, last + 1);
  }

  // parse, filter & re-normalize percents
  const recipe = JSON.parse(c);
  const filtered = recipe.components.filter((x: any) =>
    ALLOWED_OILS.includes(x.oil)
  );
  const total = filtered.reduce((s: number, x: any) => s + x.percent, 0) || 1;
  filtered.forEach((x: any) => {
    x.percent = Math.round((x.percent / total) * 100);
  });
  recipe.components = filtered;

  const payload = { recipe, examples: top3 };

  // cache to Redis
  try {
    await redis.hset("memory_map", { [key]: JSON.stringify(payload) });
  } catch (e) {
    console.warn("Redis write failed:", e);
  }

  return res.status(200).json(payload);
}
