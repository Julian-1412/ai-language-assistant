# AI Language Assistant

An AI-powered customer support assistant for an English academy.  
It answers questions using only the academy documents, escalates out-of-scope requests to a human, and runs with a Node.js + LangChain backend plus an n8n automation workflow.

## Features

- Answers customer questions based only on business documents.
- Uses retrieval-augmented generation (RAG) with a populated vector store.
- Escalates out-of-scope questions to a human by email.
- Exposes a public HTTP endpoint for chatbot/webhook usage.
- Includes an n8n workflow for automation and escalation routing.
- Deployed on Render.

## Tech Stack

- Node.js
- Express
- OpenAI Responses API
- LangChain
- n8n
- Gmail node in n8n for escalation notifications

## Project Structure

```bash
ai-language-assistant/
├── src/
│   ├── app.js
│   ├── controllers/
│   ├── services/
│   ├── data/
│   │   └── vectordb/
│   │       └── store.json
│   └── scripts/
├── n8n/
│   └── workflow.json
├── utils/
├── README.md
├── .env.example
├── package.json
└── package-lock.json
```

## Prerequisites

- Node.js 18+
- npm
- OpenAI API key
- Gmail account for escalation notifications
- n8n account or self-hosted n8n instance

## Environment Variables

Create a `.env` file based on `.env.example` and set these values:

```bash
PORT=10000
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4.1-mini
BASE_URL=https://your-render-service.onrender.com
GMAIL_TO=your_email@gmail.com
```

## Installation

```bash
npm install
```

## Running Locally

```bash
npm start
```

For development:

```bash
npm run dev
```

## API

### Health Check

`GET /health`

Example:

```bash
curl https://your-domain.onrender.com/health
```

Response:

```json
{
  ok: true, message: "Server is running"
}
```

### Ask the Assistant

`POST /api/ask`

Request body:

```json
{
  "message": "What are your English class prices?"
}
```

Example:

```bash
curl -X POST https://your-domain.onrender.com/api/ask \
  -H "Content-Type: application/json" \
  -d '{"message":"What are your English class prices?"}'
```

Success response example:

```json
{
  "answer": "English class prices are COP 280,000 per month for Basic A1-A2, COP 320,000 per month for Intermediate B1-B2, and COP 360,000 per month for Advanced C1.",
  "escalate": false,
  "sources": [
    "prices-and-programs.md",
    "enrollment-policy.md",
    "faq-and-certifications.md"
  ]
}
```

Escalation example:

```json
{
  "answer": "Your request has been escalated to a human advisor.",
  "escalate": true,
  "sources": [
    "faq-and-certifications.md"
  ]
}
```

## n8n Workflow

The `n8n/workflow.json` file contains the full automation workflow.

Workflow logic:

1. Webhook receives the user message.
2. HTTP Request sends the message to the Render backend.
3. The response is normalized.
4. A Switch node routes the flow:
   - `false` → success response
   - `true` → escalation branch
5. Escalated requests are sent by Gmail to the human support inbox.

### Importing the Workflow

In n8n:

1. Open n8n.
2. Go to **Workflows**.
3. Click **Import**.
4. Upload `n8n/workflow.json`.
5. Update credentials if needed.
6. Activate the workflow.

## Documents Used

The assistant answers only from these documents:

- `prices-and-programs.md`
- `enrollment-policy.md`
- `faq-and-certifications.md`

## Validation

### Local backend
```bash
npm install
npm start
```

### Public deployment
- Backend deployed on Render.
- Workflow tested with valid and out-of-scope messages.
- Escalation email delivered successfully via Gmail.
- Render URL:
https://ai-language-assistant-no2e.onrender.com
## Notes

- API keys are never hardcoded.
- The assistant must not answer from general knowledge when the question is outside the document scope.
- Questions outside scope are escalated to a human.

