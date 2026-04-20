/**
 * Metrics Service — In-memory tracker for dashboard analytics
 */

const metrics = {
  totalQueries: 0,
  escalatedQueries: 0,
  resolvedQueries: 0,
  totalCostUSD: 0,
  recentQueries: [] // last 20 queries
};

// Average cost estimates per call (input + output tokens for gpt-4.1-mini)
const ESTIMATED_COST_PER_QUERY = 0.003;

export function recordQuery({ message, answer, escalated, sources }) {
  metrics.totalQueries += 1;

  if (escalated) {
    metrics.escalatedQueries += 1;
  } else {
    metrics.resolvedQueries += 1;
  }

  metrics.totalCostUSD += ESTIMATED_COST_PER_QUERY;

  metrics.recentQueries.unshift({
    message: message.slice(0, 120),
    answer: answer.slice(0, 200),
    escalated,
    sources,
    timestamp: new Date().toISOString()
  });

  // Keep only the last 20
  if (metrics.recentQueries.length > 20) {
    metrics.recentQueries = metrics.recentQueries.slice(0, 20);
  }
}

export function getMetrics() {
  const escalationRate =
    metrics.totalQueries > 0
      ? ((metrics.escalatedQueries / metrics.totalQueries) * 100).toFixed(1)
      : "0.0";

  return {
    totalQueries: metrics.totalQueries,
    resolvedQueries: metrics.resolvedQueries,
    escalatedQueries: metrics.escalatedQueries,
    escalationRate: `${escalationRate}%`,
    totalCostUSD: `$${metrics.totalCostUSD.toFixed(4)}`,
    recentQueries: metrics.recentQueries
  };
}
