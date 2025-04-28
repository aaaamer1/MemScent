//Reads recipes from scentLibrary and calls openai 
//embeddings api to make name+components for each recipe
//bundles {id, embedding, recipe} into cloud/embeddings.json
//for fast lookup later

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { OpenAI } from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function ingest() {
  const recipesPath = path.join(__dirname, "../recipes/scentLibrary.json");
  const recipes = JSON.parse(fs.readFileSync(recipesPath, "utf-8"));

  // Filter out recipes with no components
  const out = [];
  for (const r of recipes) { 
    const text = `${r.name}: ${r.components 
      .map((c) => `${c.oil} ${c.percent}%`)
      .join(", ")}`;
    const resp = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    out.push({
      id: r.id,
      embedding: resp.data[0].embedding,
      recipe: r,
    });
    console.log(`✓ Embedded recipe ${r.id} – ${r.name}`);
  }

  const outPath = path.join(__dirname, "embeddings.json");
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`✅ Done writing ${outPath}`);
}

ingest().catch((err) => {
  console.error(err);
  process.exit(1);
});
