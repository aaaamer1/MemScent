export function cosine(a: number[], b: number[]): number {
    let dot = 0,
      magA = 0,
      magB = 0;
    // Calculate the dot product and magnitudes so we can get the cosine similarity.
    // Cosine similarity is how similar two scent vectors are
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
  }
  