const { Local, Ativo, Cliente } = require("../models");
const { Op } = require("sequelize");
const { isAdmin, getUserClienteIds } = require("../utils/accessControl");

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

const localController = {
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

      const locais = await Local.findAll({
        where,
        include: [
          { model: Cliente, as: 'cliente', attributes: ['id', 'nome'] },
          { model: Ativo, as: 'ativos' }
        ],
        order: [["nome", "ASC"]],
      });
      return res.status(200).json(locais);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao listar locais", detalhes: error.message });
    }
  },

  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const local = await Local.findByPk(id, {
        include: [
          { model: Cliente, as: 'cliente', attributes: ['id', 'nome'] },
          { model: Ativo, as: "ativos" }
        ],
      });
      if (!local) return res.status(404).json({ message: "Local não encontrado" });

      const userIsAdmin = isAdmin(req.user);
      const userClienteIds = getUserClienteIds(req.user);
      if (!userIsAdmin && (!userClienteIds.length || !userClienteIds.includes(local.clienteId))) {
        return res.status(403).json({ message: "Acesso negado para este local" });
      }

      return res.status(200).json(local);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar local", detalhes: error.message });
    }
  },

  async criar(req, res) {
    try {
      const { nome } = req.body;
      if (!nome?.trim()) {
        return res.status(400).json({ message: "O nome do local é obrigatório" });
      }

      const userIsAdmin = isAdmin(req.user);
      const userClienteIds = getUserClienteIds(req.user);
      let resolvedClienteId = null;
      try {
        resolvedClienteId = resolveClienteForUser(userIsAdmin, userClienteIds, req.body?.clienteId, null);
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

      const softDeleted = await Local.findOne({
        where: { nome, deletedAt: { [Op.ne]: null } },
        paranoid: false,
      });

      if (softDeleted) {
        await softDeleted.restore();
        await softDeleted.update({ nome, clienteId: resolvedClienteId });
        return res.status(201).json(softDeleted);
      }

      const novoLocal = await Local.create({ nome, clienteId: resolvedClienteId });
      return res.status(201).json(novoLocal);
    } catch (error) {
      if (error?.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({ message: "Nome de local já cadastrado" });
      }
      return res.status(400).json({ message: "Erro ao criar local", detalhes: error.message });
    }
  },

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome } = req.body;

      const local = await Local.findByPk(id);
      if (!local) return res.status(404).json({ message: "Local não encontrado" });

      const userIsAdmin = isAdmin(req.user);
      const userClienteIds = getUserClienteIds(req.user);
      if (!userIsAdmin && (!userClienteIds.length || !userClienteIds.includes(local.clienteId))) {
        return res.status(403).json({ message: "Acesso negado para este local" });
      }

      let resolvedClienteId = local.clienteId ?? null;
      try {
        resolvedClienteId = resolveClienteForUser(
          userIsAdmin,
          userClienteIds,
          req.body?.clienteId,
          local.clienteId ?? null
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

      await local.update({ nome, clienteId: resolvedClienteId });
      return res.status(200).json(local);
    } catch (error) {
      if (error?.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({ message: "Nome de local já cadastrado" });
      }
      return res.status(400).json({ message: "Erro ao atualizar local", detalhes: error.message });
    }
  },

  async desativar(req, res) {
    try {
      const { id } = req.params;
      const local = await Local.findByPk(id);
      if (!local) return res.status(404).json({ message: "Local não encontrado" });

      const userIsAdmin = isAdmin(req.user);
      const userClienteIds = getUserClienteIds(req.user);
      if (!userIsAdmin && (!userClienteIds.length || !userClienteIds.includes(local.clienteId))) {
        return res.status(403).json({ message: "Acesso negado para este local" });
      }

      await local.destroy();
      return res.status(200).json({ message: "Local desativado com sucesso" });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao desativar local", detalhes: error.message });
    }
  },
};

module.exports = localController;
