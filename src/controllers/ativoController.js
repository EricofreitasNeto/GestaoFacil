const { Ativo, Local, Cliente, Servico } = require("../models");
const { Op } = require("sequelize");
const { isAdmin, getUserClienteIds } = require("../utils/accessControl");

const ALLOWED_STATUS = ["ativo", "manutencao", "inativo"];
const parseOptionalInt = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : NaN;
};

async function ensureClienteExiste(clienteId) {
  if (!clienteId) return null;
  const cliente = await Cliente.findByPk(clienteId);
  return cliente || null;
}

const buildScopedClienteFilter = (clienteIds) => {
  if (!clienteIds?.length) return null;
  return clienteIds.length === 1 ? clienteIds[0] : { [Op.in]: clienteIds };
};

const resolveClienteForUser = (userIsAdmin, userClienteIds, providedClienteId, fallbackClienteId) => {
  if (userIsAdmin) return parseOptionalInt(providedClienteId ?? fallbackClienteId);

  if (!userClienteIds.length) {
    const error = new Error("Usuário não possui clientes associados");
    error.statusCode = 403;
    throw error;
  }

  const parsedProvided = parseOptionalInt(providedClienteId);
  if (parsedProvided) {
    if (!userClienteIds.includes(parsedProvided)) {
      const error = new Error("Cliente informado não pertence ao escopo do usuário");
      error.statusCode = 403;
      throw error;
    }
    return parsedProvided;
  }

  if (fallbackClienteId && userClienteIds.includes(fallbackClienteId)) {
    return fallbackClienteId;
  }

  if (userClienteIds.length === 1) {
    return userClienteIds[0];
  }

  const error = new Error("Selecione um cliente válido para esta operação");
  error.statusCode = 400;
  throw error;
};

const ativoController = {
  async listar(req, res) {
    try {
      const userIsAdmin = isAdmin(req.user);
      const userClienteIds = getUserClienteIds(req.user);
      const where = {};

      if (!userIsAdmin) {
        if (!userClienteIds.length) {
          return res.status(403).json({ message: "Usuário não possui clientes associados" });
        }
        where.clienteId = buildScopedClienteFilter(userClienteIds);
      }

      const ativos = await Ativo.findAll({
        where,
        include: [
          { model: Local, as: "local" },
          { model: Cliente, as: "cliente", attributes: ["id", "nome"] }
        ]
      });
      return res.status(200).json(ativos);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao listar ativos", detalhes: error.message });
    }
  },

  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const ativo = await Ativo.findByPk(id, {
        include: [
          { model: Local, as: "local" },
          { model: Cliente, as: "cliente", attributes: ["id", "nome"] }
        ]
      });
      if (!ativo) return res.status(404).json({ message: "Ativo não encontrado" });

      const userIsAdmin = isAdmin(req.user);
      const userClienteIds = getUserClienteIds(req.user);
      if (!userIsAdmin && (!userClienteIds.length || !userClienteIds.includes(ativo.clienteId))) {
        return res.status(403).json({ message: "Acesso negado para este ativo" });
      }

      return res.status(200).json(ativo);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar ativo", detalhes: error.message });
    }
  },

  async criar(req, res) {
    try {
      const { nome, numeroSerie, status, detalhes, localId } = req.body;
      const userIsAdmin = isAdmin(req.user);
      const userClienteIds = getUserClienteIds(req.user);
      let resolvedClienteId = null;

      if (status && !ALLOWED_STATUS.includes(String(status).toLowerCase())) {
        return res.status(400).json({ message: "Status inválido", detalhes: `Permitidos: ${ALLOWED_STATUS.join(', ')}` });
      }

      try {
        resolvedClienteId = resolveClienteForUser(
          userIsAdmin,
          userClienteIds,
          req.body?.clienteId,
          null
        );
      } catch (error) {
        return res.status(error.statusCode || 400).json({ message: error.message });
      }
      if (Number.isNaN(resolvedClienteId)) {
        return res.status(400).json({ message: "clienteId informado é inválido" });
      }

      if (resolvedClienteId !== null) {
        const clienteExiste = await ensureClienteExiste(resolvedClienteId);
        if (!clienteExiste) return res.status(400).json({ message: "Cliente informado não existe" });
      }

      if (numeroSerie) {
        const softDeleted = await Ativo.findOne({
          where: { numeroSerie, deletedAt: { [Op.ne]: null } },
          paranoid: false
        });
        if (softDeleted) {
          await softDeleted.restore();
          await softDeleted.update({ nome, numeroSerie, status, detalhes, localId, clienteId: resolvedClienteId });
          return res.status(201).json(softDeleted);
        }
      }

      const novoAtivo = await Ativo.create({ nome, numeroSerie, status, detalhes, localId, clienteId: resolvedClienteId });
      return res.status(201).json(novoAtivo);
    } catch (error) {
      if (error?.name === 'SequelizeUniqueConstraintError') {
        const target = (error.errors && error.errors[0]?.path) || '';
        if (String(target).toLowerCase().includes('numeroserie')) {
          return res.status(409).json({ message: "Número de série já cadastrado" });
        }
      }
      return res.status(400).json({ message: "Erro ao criar ativo", detalhes: error.message });
    }
  },

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, numeroSerie, status, detalhes, localId } = req.body;
      const ativo = await Ativo.findByPk(id);
      if (!ativo) return res.status(404).json({ message: "Ativo não encontrado" });

      const userIsAdmin = isAdmin(req.user);
      const userClienteIds = getUserClienteIds(req.user);
      if (!userIsAdmin && (!userClienteIds.length || !userClienteIds.includes(ativo.clienteId))) {
        return res.status(403).json({ message: "Acesso negado para este ativo" });
      }

      let resolvedClienteId = ativo.clienteId ?? null;
      try {
        resolvedClienteId = resolveClienteForUser(
          userIsAdmin,
          userClienteIds,
          req.body?.clienteId,
          ativo.clienteId ?? null
        );
      } catch (error) {
        return res.status(error.statusCode || 400).json({ message: error.message });
      }
      if (Number.isNaN(resolvedClienteId)) {
        return res.status(400).json({ message: "clienteId informado é inválido" });
      }

      if (resolvedClienteId !== null) {
        const clienteExiste = await ensureClienteExiste(resolvedClienteId);
        if (!clienteExiste) return res.status(400).json({ message: "Cliente informado não existe" });
      }

      if (status && !ALLOWED_STATUS.includes(String(status).toLowerCase())) {
        return res.status(400).json({ message: "Status inválido", detalhes: `Permitidos: ${ALLOWED_STATUS.join(', ')}` });
      }

      await ativo.update({ nome, numeroSerie, status, detalhes, localId, clienteId: resolvedClienteId });
      return res.status(200).json(ativo);
    } catch (error) {
      if (error?.name === 'SequelizeUniqueConstraintError') {
        const target = (error.errors && error.errors[0]?.path) || '';
        if (String(target).toLowerCase().includes('numeroserie')) {
          return res.status(409).json({ message: "Número de série já cadastrado" });
        }
      }
      return res.status(400).json({ message: "Erro ao atualizar ativo", detalhes: error.message });
    }
  },

  async desativar(req, res) {
    try {
      const { id } = req.params;
      const ativo = await Ativo.findByPk(id);
      if (!ativo) return res.status(404).json({ message: "Ativo não encontrado" });

      const userIsAdmin = isAdmin(req.user);
      const userClienteIds = getUserClienteIds(req.user);
      if (!userIsAdmin && (!userClienteIds.length || !userClienteIds.includes(ativo.clienteId))) {
        return res.status(403).json({ message: "Acesso negado para este ativo" });
      }

      const hasServicos = await Servico.findOne({ where: { ativoId: id } });
      if (hasServicos) {
        return res.status(400).json({ message: 'Não é permitido desativar o ativo enquanto houver serviços vinculados.' });
      }

      await ativo.destroy();
      return res.status(200).json({ message: "Ativo desativado com sucesso" });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao desativar ativo", detalhes: error.message });
    }
  }
};

module.exports = ativoController;
