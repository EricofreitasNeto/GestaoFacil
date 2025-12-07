const ADMIN_ROLES = (process.env.ADMIN_ROLES || 'admin,administrador')
  .split(',')
  .map((role) => role.trim().toLowerCase())
  .filter(Boolean);

const toInt = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
};

const normalizeClienteIds = (input) => {
  if (input === undefined || input === null) return [];
  const values = Array.isArray(input) ? input : [input];
  const ids = values
    .map((value) => {
      if (typeof value === 'string' && value.includes(',')) {
        return value.split(',').map((chunk) => chunk.trim());
      }
      return value;
    })
    .flat()
    .map((value) => (typeof value === 'string' ? value.trim() : value))
    .map(toInt)
    .filter((value) => value !== null);

  return [...new Set(ids)];
};

const isAdmin = (user) => {
  if (!user?.cargo) return false;
  return ADMIN_ROLES.includes(String(user.cargo).trim().toLowerCase());
};

const getUserClienteIds = (user) => {
  if (!user) return [];
  const explicitList = normalizeClienteIds(user.clienteIds);
  if (explicitList.length) return explicitList;

  const fallback = normalizeClienteIds(user.clienteId ?? user.clientId ?? null);
  return fallback;
};

module.exports = {
  ADMIN_ROLES,
  isAdmin,
  getUserClienteIds,
  normalizeClienteIds
};
