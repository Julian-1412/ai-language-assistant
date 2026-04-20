import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const docsPath = path.join(__dirname, "../data/docs");
const outputPath = path.join(__dirname, "../data/vectordb/store.json");

async function loadDocuments() {
  const files = await fs.readdir(docsPath);
  const docs = [];

  for (const file of files) {
    const fullPath = path.join(docsPath, file);
    const stat = await fs.stat(fullPath);

    if (stat.isFile()) {
      const content = await fs.readFile(fullPath, "utf-8");
      docs.push({
        pageContent: content,
        metadata: { source: file }
      });
    }
  }

  return docs;
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing in .env");
  }

  const rawDocs = await loadDocuments();

  if (rawDocs.length < 3) {
    throw new Error("You need at least 3 business documents.");
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 700,
    chunkOverlap: 120
  });

  const splitDocs = await splitter.splitDocuments(rawDocs);

  const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY,
    model: "text-embedding-3-small"
  });

  const vectorStore = new MemoryVectorStore(embeddings);
  await vectorStore.addDocuments(splitDocs);

  const serializableChunks = splitDocs.map((doc, index) => ({
    id: index + 1,
    pageContent: doc.pageContent,
    metadata: doc.metadata
  }));

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(serializableChunks, null, 2), "utf-8");

  console.log(`Loaded ${rawDocs.length} source docs`);
  console.log(`Created ${splitDocs.length} chunks`);
  console.log(`Saved chunks to ${outputPath}`);
}

main().catch((error) => {
  console.error("Ingest error:", error.message);
  process.exit(1);
});