import React from "react";
import axios from "axios";

export default function Dashboard() {
  const [memory, setMemory]   = React.useState("");
  const [recipe, setRecipe]   = React.useState<any>(null);
  const [examples, setExamples] = React.useState<any[]>([]);
  const [rating, setRating]   = React.useState<number | null>(null);

  const handleGenerate = async () => {
    if (!memory.trim()) return;
    const { data } = await axios.post("/api/generate", { memory });
    setRecipe(data.recipe);
    setExamples(data.examples);
    setRating(null);
  };

  const handleFeedback = async (score: number) => {
    await axios.post("/api/feedback", { memory, rating: score });
    setRating(score);
  };

  return (
    <div className="main-container">
      <h1 style={{ textAlign: "center", padding: "1rem 0" }}>MemScent Dashboard</h1>
      <div className="panel">
        <label>
          <strong>Recall a memory:</strong><br/>
          <input
            type="text"
            value={memory}
            onChange={e => setMemory(e.target.value)}
            placeholder="e.g. Grandma's cookies"
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "0.5rem",
              border: "1px solid #444",
              background: "#222",
              color: "#eee",
              marginBottom: "1rem"
            }}
          />
        </label>
        <button
          className="generate-btn"
          style={{ width: "100%", marginBottom: "1rem" }}
          onClick={handleGenerate}
        >
          Generate Scent
        </button>

        {recipe && (
          <>
            <h2>{recipe.name}</h2>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              {recipe.components.map((c: any) => (
                <div key={c.oil} style={{ textAlign: "center" }}>
                  <div>{c.oil}</div>
                  <div>{c.percent}%</div>
                </div>
              ))}
            </div>

            {examples.length > 0 && (
              <>
                <h4>Inspiration:</h4>
                <ul>
                  {examples.map((ex, i) => <li key={i}>{ex.name}</li>)}
                </ul>
              </>
            )}

            <div style={{ marginTop: "1rem", textAlign: "center" }}>
              <button className="feedback-btn" onClick={() => handleFeedback(5)}>👍</button>
              <button className="feedback-btn" onClick={() => handleFeedback(1)}>👎</button>
            </div>

            {rating != null && (
              <p style={{ textAlign: "center", marginTop: "0.5rem" }}>
                You rated this: {rating >= 3 ? "👍 Liked" : "👎 Disliked"}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
