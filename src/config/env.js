require('dotenv').config();

const config = {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    llm: {
        apiKey: process.env.LLM_API_KEY,
        model: process.env.LLM_MODEL || 'gpt-4-turbo'
    },
    paths: {
        vectorDb: process.env.VECTOR_DB_PATH || './src/data/vectordb',
        docs: process.env.DOCS_PATH || './src/data/docs'
    },
    webhook: {
        secret: process.env.WEBHOOK_SECRET
    }
};

module.exports = config;
