import type { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { cosine } from "../../lib/cosine";


async function callPythonPredictor(req: NextApiRequest, res: NextApiResponse) {
    const { memory = "" } = req.body;
    const pyRes = await fetch("http://localhost:8001/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memory }),
    });
    if (!pyRes.ok) {
      const err = await pyRes.text();
      return res.status(500).json({ error: err });
    }
    const { recipe } = await pyRes.json();
    return res.status(200).json({ recipe, examples: [] });
  }

//prototypes
const ALLOWED_OILS = [
    "Coffee", //done
    "Oud Wood", //done
    "Bergamot", //done
    "Lavender", //done
    "Rose", //done
    "Cherry", //done
    "Vanilla", //done
    "Strawberry", //done
    "Sweet Orange", //done
    "Mango", //done
    "Frankincense", //done
    "Cinnamon", //done
    "Rosemary", //done
    "Jasmine", //done
    "Tea Tree", //done
    "Vanilla", //done
    "Vetiver", //done
    "Sandalwood", //done
    "Lemon", //done
]

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Path to the embeddings and memory map files
const EMB_PATH = path.join(process.cwd(), "../cloud/embeddings.json");
const MAP_PATH = path.join(process.cwd(), "../cloud/memory_map.json");

// Load on startup:
const embeddings: Array<{ embedding: number[]; recipe: any }> = JSON.parse(
  fs.readFileSync(EMB_PATH, "utf-8")
);
const memoryMap: Record<string, { recipe: any; examples: any[] }> = JSON.parse(
  fs.readFileSync(MAP_PATH, "utf-8")
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { mood, memory = "", temperature = 0.7 } = req.body;
  const key = memory.trim().toLowerCase();

  // If cached memory is found, return it
  if (key && memoryMap[key]) {
    return res.status(200).json(memoryMap[key]);
  }

  // Embed the query 
  const queryText = key || mood;
  const embResp = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: queryText,
  });
  const queryVec = embResp.data[0].embedding;

  // Score & pick top 3
  const scored = embeddings
    .map((e) => ({
      score: cosine(queryVec, e.embedding),
      recipe: e.recipe,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((e) => e.recipe);

  
  const fewShot = scored
    .map(
      (r) =>
        `Memory "${r.name}": ${r.components
          .map((c: any) => `${c.oil} ${c.percent}%`)
          .join(", ")}`
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

  // Call OpenAI
  const chat = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature,
    messages: [
      { role: "system", content: "You are a helpful perfumer." },
      { role: "user", content: prompt },
    ],
  });
    let content = chat.choices[0].message.content?.trim();
    if (!content) {
      throw new Error("Chat response content is null or undefined.");
    }
      if (content.startsWith('```')) {
      content = content
        .replace(/^```json?/, '') // remove leading ``` or ```json
        .replace(/```$/, '') // remove trailing ```
        .trim();
    }
      const firstBrace = content.indexOf('{');
    const lastBrace  = content.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      content = content.substring(firstBrace, lastBrace + 1);
    }
      const recipe = JSON.parse(content);
      recipe.components = recipe.components
        .filter((c: any) => ALLOWED_OILS.includes(c.oil));
      const total = recipe.components.reduce((sum: number, c: any) => sum + c.percent, 0) || 1;
      recipe.components.forEach((c: any) => {
        c.percent = Math.round((c.percent / total) * 100);
      });
  

  // If the user has given a memory, cache the recipe to use later
  const payload = { recipe, examples: scored };
  if (key) {
    memoryMap[key] = payload;
    fs.writeFileSync(MAP_PATH, JSON.stringify(memoryMap, null, 2));
  }

  res.status(200).json(payload);
}
