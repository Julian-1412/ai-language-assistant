## Test+Bash
curl -X POST "https://julian-1412.app.n8n.cloud/webhook-test/academy-assistant" \
  -H "Content-Type: application/json" \
  -d '{"message":"What are your English class prices?"}'

  curl -X POST "https://julian-1412.app.n8n.cloud/webhook-test/academy-assistant" \
  -H "Content-Type: application/json" \
  -d '{"message":"Do you provide visa sponsorship?"}'

  ## Deploy+Publish
  curl -X POST "https://julian-1412.app.n8n.cloud/webhook/academy-assistant" \
  -H "Content-Type: application/json" \
  -d '{"message":"What are your English class prices?"}'

  curl -X POST "https://julian-1412.app.n8n.cloud/webhook/academy-assistant" \
  -H "Content-Type: application/json" \
  -d '{"message":"Do you provide visa sponsorship?"}'