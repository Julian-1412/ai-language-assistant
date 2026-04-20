import { retrieveRelevantChunks } from "../services/rag.service.js";
import { generateAnswer } from "../services/llm.service.js";

function detectOutOfScope(message, chunks) {
  const userQuestion = message.toLowerCase();
  const combinedText = chunks.map((chunk) => chunk.pageContent.toLowerCase()).join(" ");

  const restrictedTopics = [
    "visa",
    "sponsorship",
    "job",
    "jobs",
    "employment",
    "accommodation",
    "housing"
  ];

  const askedRestrictedTopic = restrictedTopics.some((term) =>
    userQuestion.includes(term)
  );

  const scopeDocumentSupportsRestriction =
    combinedText.includes("scope limitation") ||
    combinedText.includes("do not include visa guidance") ||
    combinedText.includes("job placement") ||
    combinedText.includes("accommodation services");

  return askedRestrictedTopic && scopeDocumentSupportsRestriction;
}

export const askAssistant = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    const chunks = await retrieveRelevantChunks(message);

    if (!chunks.length) {
      return res.json({
        answer:
          "I could not find verified information in the academy documents. Your request will be escalated to a human advisor.",
        escalate: true,
        sources: []
      });
    }

    if (detectOutOfScope(message, chunks)) {
      return res.json({
        answer:
          "This topic is outside the documented scope of the academy. Your request will be escalated to a human advisor.",
        escalate: true,
        sources: chunks.map((chunk) => chunk.metadata.source)
      });
    }

    const llmAnswer = await generateAnswer({
      question: message,
      chunks
    });

    if (llmAnswer === "ESCALATE") {
      return res.json({
        answer:
          "I could not verify that information from the academy documents. Your request will be escalated to a human advisor.",
        escalate: true,
        sources: chunks.map((chunk) => chunk.metadata.source)
      });
    }

    return res.json({
      answer: llmAnswer,
      escalate: false,
      sources: chunks.map((chunk) => chunk.metadata.source)
    });
  } catch (error) {
    console.error("Assistant error:", error);

    return res.status(500).json({
      error: "Internal server error"
    });
  }
};