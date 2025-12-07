const counters = {};

function incrementMetric(name, incrementBy = 1) {
  if (!name) return;
  counters[name] = (counters[name] || 0) + (Number.isFinite(incrementBy) ? incrementBy : 1);
}

function getMetricsSnapshot() {
  return { ...counters };
}

module.exports = {
  incrementMetric,
  getMetricsSnapshot,
};
