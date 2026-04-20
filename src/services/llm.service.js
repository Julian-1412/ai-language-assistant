import OpenAI from "openai";
import { systemPrompt } from "../utils/prompts.js";

let client;

function getClient() {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return client;
}

export async function generateAnswer({ question, chunks }) {
  const context = chunks
    .map((chunk, index) => {
      return `Source ${index + 1} (${chunk.metadata.source}):\n${chunk.pageContent}`;
    })
    .join("\n\n");

  const input = `
Customer question:
${question}

Retrieved business context:
${context}

Instructions:
- Answer only with information supported by the retrieved business context.
- If the answer is outside scope or unsupported, return exactly: ESCALATE
`;

  const response = await getClient().responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    temperature: 0.2,
    input: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: input
      }
    ]
  });

  return response.output_text.trim();
}