const { Cliente } = require('../models');
const { Op } = require('sequelize');
const { isAdmin, getUserClienteIds } = require('../utils/accessControl');

const buildSearchFilter = (term = '') => {
  const normalized = term.trim();
  if (!normalized) return null;
  return {
    [Op.or]: [
      { nome: { [Op.iLike]: `%${normalized}%` } },
      { cnpj: { [Op.iLike]: `%${normalized}%` } }
    ]
  };
};

const parsePagination = (query) => {
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 50, 1), 100);
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const offset = (page - 1) * limit;
  return { limit, page, offset };
};

const clienteController = {
  // Listar clientes respeitando filtros e escopo do usuário
  async listar(req, res) {
    try {
      const userIsAdmin = isAdmin(req.user);
      const userClienteIds = getUserClienteIds(req.user);
      const { q, clienteId: clienteIdQuery, clientId } = req.query;
      const requestedClientIdRaw = clienteIdQuery ?? clientId;
      const requestedClientId = requestedClientIdRaw ? Number(requestedClientIdRaw) : null;

      const where = {};
      const searchFilter = buildSearchFilter(q || req.query.search || '');
      if (searchFilter) Object.assign(where, searchFilter);

      if (requestedClientId) {
        if (Number.isNaN(requestedClientId)) {
          return res.status(400).json({ message: 'clienteId informado é inválido' });
        }
        where.id = requestedClientId;
      }

      if (!userIsAdmin) {
        if (!userClienteIds.length) {
          return res.status(403).json({ message: 'Usuário não possui clientes associados.' });
        }
        if (requestedClientId) {
          if (!userClienteIds.includes(requestedClientId)) {
            return res.status(403).json({ message: 'Acesso negado para listar este cliente.' });
          }
        } else {
          where.id = userClienteIds.length === 1 ? userClienteIds[0] : { [Op.in]: userClienteIds };
        }
      }

      const { limit, offset } = parsePagination(req.query);
      const { rows, count } = await Cliente.findAndCountAll({
        where,
        limit,
        offset,
        order: [['nome', 'ASC']]
      });

      res.set('X-Total-Count', String(count));
      return res.status(200).json(rows);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao listar clientes', detalhes: error.message });
    }
  },

  // Buscar cliente por ID com escopo
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const numericId = Number(id);
      const userIsAdmin = isAdmin(req.user);
      const userClienteIds = getUserClienteIds(req.user);

      if (!userIsAdmin) {
        if (!userClienteIds.length || !userClienteIds.includes(numericId)) {
          return res.status(403).json({ message: 'Acesso negado para visualizar este cliente.' });
        }
      }

      const cliente = await Cliente.findByPk(numericId);
      if (!cliente) return res.status(404).json({ message: 'Cliente não encontrado' });
      return res.status(200).json(cliente);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao buscar cliente', detalhes: error.message });
    }
  },

  // Criar novo cliente
  async criar(req, res) {
    try {
      const { nome, cnpj, contatos } = req.body;
      const whereOr = [{ nome }];
      if (cnpj) whereOr.push({ cnpj });
      const softDeleted = await Cliente.findOne({
        where: { [Op.or]: whereOr, deletedAt: { [Op.ne]: null } },
        paranoid: false
      });
      if (softDeleted) {
        await softDeleted.restore();
        await softDeleted.update({ nome, cnpj, contatos });
        return res.status(201).json(softDeleted);
      }

      const novoCliente = await Cliente.create({ nome, cnpj, contatos });
      return res.status(201).json(novoCliente);
    } catch (error) {
      if (error?.name === 'SequelizeUniqueConstraintError') {
        const target = (error.errors && error.errors[0]?.path) || '';
        if (String(target).toLowerCase().includes('nome')) {
          return res.status(409).json({ message: 'Nome de cliente já cadastrado' });
        }
        if (String(target).toLowerCase().includes('cnpj')) {
          return res.status(409).json({ message: 'CNPJ já cadastrado' });
        }
        return res.status(409).json({ message: 'Registro já existe' });
      }
      return res.status(400).json({ message: 'Erro ao criar cliente', detalhes: error.message });
    }
  },

  // Atualizar cliente existente
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, cnpj, contatos } = req.body;
      const cliente = await Cliente.findByPk(id);
      if (!cliente) return res.status(404).json({ message: 'Cliente não encontrado' });

      await cliente.update({ nome, cnpj, contatos });
      return res.status(200).json(cliente);
    } catch (error) {
      if (error?.name === 'SequelizeUniqueConstraintError') {
        const target = (error.errors && error.errors[0]?.path) || '';
        if (String(target).toLowerCase().includes('nome')) {
          return res.status(409).json({ message: 'Nome de cliente já cadastrado' });
        }
        if (String(target).toLowerCase().includes('cnpj')) {
          return res.status(409).json({ message: 'CNPJ já cadastrado' });
        }
        return res.status(409).json({ message: 'Registro já existe' });
      }
      return res.status(400).json({ message: 'Erro ao atualizar cliente', detalhes: error.message });
    }
  },

  // Desativar cliente (soft delete)
  async desativar(req, res) {
    try {
      const { id } = req.params;
      const cliente = await Cliente.findByPk(id);
      if (!cliente) return res.status(404).json({ message: 'Cliente não encontrado' });

      await cliente.destroy();
      return res.status(200).json({ message: 'Cliente desativado com sucesso' });
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao desativar cliente', detalhes: error.message });
    }
  }
};

module.exports = clienteController;
