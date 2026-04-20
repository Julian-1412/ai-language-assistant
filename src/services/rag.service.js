import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storePath = path.join(__dirname, "../data/vectordb/store.json");

function normalize(text) {
  return text.toLowerCase().replace(/[^\w\sáéíóúüñ-]/gi, " ");
}

function scoreChunk(question, chunkText) {
  const qWords = normalize(question).split(/\s+/).filter(Boolean);
  const chunk = normalize(chunkText);
  let score = 0;

  for (const word of qWords) {
    if (word.length >= 3 && chunk.includes(word)) {
      score += 1;
    }
  }

  return score;
}

export async function retrieveRelevantChunks(question, topK = 3) {
  const raw = await fs.readFile(storePath, "utf-8");
  const chunks = JSON.parse(raw);

  const ranked = chunks
    .map((chunk) => ({
      ...chunk,
      score: scoreChunk(question, chunk.pageContent)
    }))
    .sort((a, b) => b.score - a.score);

  const filtered = ranked.filter((chunk) => chunk.score > 0).slice(0, topK);

  return filtered;
}