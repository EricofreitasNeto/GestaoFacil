const { incrementMetric } = require('../utils/auditMetrics');
const { verbose } = require('../utils/logger');

class ServicoValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ServicoValidationError';
    this.statusCode = 400;
    this.details = details;
  }
}

function fail(reason, code, details) {
  incrementMetric(`servico.validation_failure.${code}`);
  verbose(`[SERVICO_VALIDATION] ${reason}`, details || {});
  throw new ServicoValidationError(reason, details);
}

async function validateServicoPayload(models, payload = {}, options = {}) {
  const { Cliente, Usuario, Ativo } = models || {};
  if (!Cliente || !Usuario || !Ativo) {
    throw new Error('Modelos inválidos fornecidos ao validador de serviços');
  }

  const { existingServico } = options;
  const targetAtivoId = payload.ativoId ?? existingServico?.ativoId;
  if (!targetAtivoId) {
    fail('ativoId é obrigatório', 'missing_ativo');
  }

  const ativo = await Ativo.findByPk(targetAtivoId, {
    paranoid: false,
    attributes: ['id', 'status', 'clienteId', 'deletedAt'],
  });
  if (!ativo) {
    fail('Ativo informado não existe', 'ativo_not_found', { ativoId: targetAtivoId });
  }

  const ativoStatus = String(ativo.status || '').toLowerCase();
  if (ativo.deletedAt || ativoStatus === 'inativo') {
    fail('Não é permitido utilizar ativo desativado', 'ativo_inativo', {
      ativoId: ativo.id,
      status: ativoStatus,
    });
  }

  let resolvedClienteId = payload.clienteId ?? existingServico?.clienteId ?? ativo.clienteId;
  if (!resolvedClienteId) {
    fail('clienteId é obrigatório', 'missing_cliente');
  }

  if (ativo.clienteId && resolvedClienteId !== ativo.clienteId) {
    fail('Cliente informado não está associado ao ativo', 'cliente_mismatch', {
      ativoId: ativo.id,
      clienteInformado: resolvedClienteId,
      clienteAtivo: ativo.clienteId,
    });
  }

  const cliente = await Cliente.findByPk(resolvedClienteId, { paranoid: false });
  if (!cliente) {
    fail('Cliente informado não existe', 'cliente_not_found', { clienteId: resolvedClienteId });
  }

  let usuario = null;
  if (payload.usuarioId !== undefined && payload.usuarioId !== null) {
    usuario = await Usuario.findByPk(payload.usuarioId, { paranoid: false });
    if (!usuario) {
      fail('Usuário informado não existe', 'usuario_not_found', { usuarioId: payload.usuarioId });
    }
  }

  return {
    ativo,
    cliente,
    usuario,
    resolvedClienteId,
    resolvedAtivoId: ativo.id,
  };
}

module.exports = {
  validateServicoPayload,
  ServicoValidationError,
};
