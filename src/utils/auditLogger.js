const { verbose, isVerboseEnabled } = require('./logger');

function safeJson(value) {
  if (!value || typeof value !== 'object') return value;
  if (typeof value.toJSON === 'function') {
    try {
      return value.toJSON();
    } catch (_) { /* ignore */ }
  }
  return { ...value };
}

function extractDiff(instance) {
  if (!instance || typeof instance !== 'object') return null;
  const current = safeJson(instance) || {};
  const previous = instance._previousDataValues || null;
  if (!previous) return null;
  const diff = {};
  Object.keys(current).forEach((key) => {
    if (previous[key] !== current[key]) {
      diff[key] = { before: previous[key], after: current[key] };
    }
  });
  return Object.keys(diff).length ? diff : null;
}

function logCrudEvent(modelName, action, instance, options = {}) {
  const payload = safeJson(instance) || {};
  verbose(`[CRUD] ${modelName}.${action}`, {
    id: payload.id ?? payload.uuid ?? null,
    transaction: Boolean(options.transaction),
    userId: options.user?.id ?? options?.userId ?? null,
    diff: action === 'update' ? extractDiff(instance) : undefined,
    snapshot: action === 'delete' ? payload : undefined,
  });
}

function attachCrudHooks(modelName, model) {
  if (!model || typeof model.addHook !== 'function') return;
  if (model._verboseHooksAttached) return;

  model.addHook('afterCreate', (instance, options) => logCrudEvent(modelName, 'create', instance, options));
  model.addHook('afterUpdate', (instance, options) => logCrudEvent(modelName, 'update', instance, options));
  model.addHook('afterDestroy', (instance, options) => logCrudEvent(modelName, 'delete', instance, options));
  model.addHook('afterRestore', (instance, options) => verbose(`[CRUD] ${modelName}.restore`, {
    id: instance?.id ?? null,
    transaction: Boolean(options?.transaction),
  }));

  model._verboseHooksAttached = true;
}

function logTriggerEvent(label, details) {
  verbose(`[TRIGGER] ${label}`, details);
}

module.exports = {
  attachCrudHooks,
  logTriggerEvent,
  isVerboseEnabled,
};
