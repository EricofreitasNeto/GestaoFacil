const toBool = (value) => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'boolean') return value;
  return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
};

const VERBOSE_ENABLED = toBool(process.env.VERBOSE_LOGS) || process.argv.includes('--verbose-logs');

function formatMessage(message = '') {
  const ts = new Date().toISOString();
  return `[VERBOSE ${ts}] ${message}`;
}

function verbose(message, meta) {
  if (!VERBOSE_ENABLED) return;
  if (meta !== undefined) {
    console.log(formatMessage(message), meta);
    return;
  }
  console.log(formatMessage(message));
}

module.exports = {
  verbose,
  isVerboseEnabled: () => VERBOSE_ENABLED,
};
