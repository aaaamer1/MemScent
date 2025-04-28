const fs = require("fs");
const path = require("path");

const fbPath  = path.join(__dirname, "feedback_data.json");
const mapPath = path.join(__dirname, "memory_map.json");

const fbData  = JSON.parse(fs.readFileSync(fbPath, "utf-8"));
const memMap  = JSON.parse(fs.readFileSync(mapPath, "utf-8"));

//total feedback entries
console.log(" Total feedback entries:", fbData.length);

//group by memory key, show last rating & current recipe
const byMemory = fbData.reduce((acc, entry) => {
  acc[entry.memory] ||= [];
  acc[entry.memory].push(entry);
  return acc;
}, {});

for (const [mem, entries] of Object.entries(byMemory)) {
  const last = entries[entries.length - 1];
  console.log(`\nMemory: "${mem}"`);
  console.log("  Last EEG rating:", last.rating);
  console.log("  Current recipe in memory_map:", memMap[mem].recipe.components);
}
