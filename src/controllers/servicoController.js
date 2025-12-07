const { Op } = require('sequelize');
const models = require('../models');
const { Servico, Cliente, Usuario, Ativo, TipoServico } = models;
const { logTriggerEvent } = require('../utils/auditLogger');
const { validateServicoPayload, ServicoValidationError } = require('../services/servicoValidator');
const { isAdmin, getUserClienteIds } = require('../utils/accessControl');

const parsePagination = (query) => {
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 50, 1), 100);
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const offset = (page - 1) * limit;
  return { limit, page, offset };
};

const normalizeServicoPayload = (payload = {}) => {
  const clone = { ...payload };
  if (!clone.dataAgendada && clone.dataInicio) clone.dataAgendada = clone.dataInicio;
  if (!clone.dataConclusao && clone.dataFim) clone.dataConclusao = clone.dataFim;
  return clone;
};

const buildServicoFilters = (query = {}) => {
  const where = {};
  const status = query.status || query.situacao;
  if (status) where.status = status;

  const clienteId = Number(query.clienteId ?? query.clientId);
  if (!Number.isNaN(clienteId) && clienteId) where.clienteId = clienteId;

  const ativoId = Number(query.ativoId ?? query.assetId);
  if (!Number.isNaN(ativoId) && ativoId) where.ativoId = ativoId;

  return where;
};

const denyScope = (res) => res.status(403).json({ message: 'Acesso negado para esta operação.' });
const buildScopedClienteFilter = (clienteIds) => {
  if (!clienteIds?.length) return null;
  return clienteIds.length === 1 ? clienteIds[0] : { [Op.in]: clienteIds };
};

const servicoController = {
  // Listar serviÇõs aplicando filtros e escopo
  async listar(req, res) {
    try {
      const where = buildServicoFilters(req.query);
      const userIsAdmin = isAdmin(req.user);
      const userClienteIds = getUserClienteIds(req.user);

      if (!userIsAdmin) {
        if (!userClienteIds.length) return denyScope(res);
        if (where.clienteId) {
          if (!userClienteIds.includes(where.clienteId)) return denyScope(res);
        } else {
          where.clienteId = buildScopedClienteFilter(userClienteIds);
        }
      }

      const { limit, offset } = parsePagination(req.query);
      const { rows, count } = await Servico.findAndCountAll({
        where,
        include: [
          { model: Cliente, as: 'cliente' },
          { model: Usuario, as: 'responsavel' },
          { model: Ativo, as: 'ativo' },
          { model: TipoServico, as: 'tipoServico' }
        ],
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      res.set('X-Total-Count', String(count));
      return res.status(200).json(rows);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao listar serviços', detalhes: error.message });
    }
  },

  // Buscar serviÇõo por ID com escopo
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const servico = await Servico.findByPk(id, {
        include: [
          { model: Cliente, as: 'cliente' },
          { model: Usuario, as: 'responsavel' },
          { model: Ativo, as: 'ativo' },
          { model: TipoServico, as: 'tipoServico' }
        ]
      });
      if (!servico) return res.status(404).json({ message: 'Serviço não encontrado' });

      const userIsAdmin = isAdmin(req.user);
      const userClienteIds = getUserClienteIds(req.user);
      if (!userIsAdmin) {
        if (!userClienteIds.length || !userClienteIds.includes(servico.clienteId)) {
          return denyScope(res);
        }
      }

      return res.status(200).json(servico);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao buscar serviço', detalhes: error.message });
    }
  },

  // Criar novo serviÇõo
  async criar(req, res) {
    try {
      const payload = normalizeServicoPayload(req.body);
      const {
        descricao,
        status,
        dataAgendada,
        dataConclusao,
        detalhes,
        clienteId,
        usuarioId,
        ativoId,
        tipoServicoId
      } = payload;

      if (!descricao) {
        return res.status(400).json({ message: 'Campo descricao é obrigatório' });
      }

      const userIsAdmin = isAdmin(req.user);
      const allowedClienteIds = userIsAdmin ? [] : getUserClienteIds(req.user);
      if (!userIsAdmin && !allowedClienteIds.length) return denyScope(res);

      const validation = await validateServicoPayload(models, payload, {
        requireAtivo: true,
        allowedClienteIds: userIsAdmin ? null : allowedClienteIds
      });

      const novoServico = await Servico.create({
        descricao,
        status,
        dataAgendada,
        dataConclusao,
        detalhes,
        clienteId: validation.resolvedClienteId,
        usuarioId,
        ativoId: validation.resolvedAtivoId,
        tipoServicoId
      });

      return res.status(201).json(novoServico);
    } catch (error) {
      if (error instanceof ServicoValidationError) {
        return res.status(error.statusCode).json({ message: error.message, detalhes: error.details });
      }
      return res.status(400).json({ message: 'Erro ao criar serviço', detalhes: error.message });
    }
  },

  // Atualizar serviÇõo existente
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const payload = normalizeServicoPayload(req.body);
      const {
        descricao,
        status,
        dataAgendada,
        dataConclusao,
        detalhes,
        clienteId,
        usuarioId,
        ativoId,
        tipoServicoId
      } = payload;

      const servico = await Servico.findByPk(id);
      if (!servico) return res.status(404).json({ message: 'Serviço não encontrado' });

      const userIsAdmin = isAdmin(req.user);
      const allowedClienteIds = userIsAdmin ? [] : getUserClienteIds(req.user);
      if (!userIsAdmin) {
        if (!allowedClienteIds.length || !allowedClienteIds.includes(servico.clienteId)) {
          return denyScope(res);
        }
      }

      const validation = await validateServicoPayload(models, payload, {
        existingServico: servico,
        allowedClienteIds: userIsAdmin ? null : allowedClienteIds
      });

      await servico.update({
        descricao,
        status,
        dataAgendada,
        dataConclusao,
        detalhes,
        clienteId: validation.resolvedClienteId,
        usuarioId,
        ativoId: validation.resolvedAtivoId,
        tipoServicoId
      });

      return res.status(200).json(servico);
    } catch (error) {
      if (error instanceof ServicoValidationError) {
        return res.status(error.statusCode).json({ message: error.message, detalhes: error.details });
      }
      return res.status(400).json({ message: 'Erro ao atualizar serviço', detalhes: error.message });
    }
  },

  // Desativar serviÇõo (soft delete)
  async desativar(req, res) {
    try {
      const { id } = req.params;
      const servico = await Servico.findByPk(id);
      if (!servico) return res.status(404).json({ message: 'Serviço não encontrado' });

      const userIsAdmin = isAdmin(req.user);
      const userClienteIds = getUserClienteIds(req.user);
      if (!userIsAdmin && (!userClienteIds.length || !userClienteIds.includes(servico.clienteId))) {
        return denyScope(res);
      }

      await servico.destroy();
      return res.status(200).json({ message: 'Serviço desativado com sucesso' });
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao desativar serviço', detalhes: error.message });
    }
  },

  // Criar novo serviÇõo usando função do banco
  async criarDb(req, res) {
    try {
      const payload = normalizeServicoPayload(req.body);
      const {
        descricao,
        status,
        dataAgendada,
        detalhes,
        clienteId,
        usuarioId,
        ativoId,
        tipoServicoId
      } = payload;

      if (!descricao || !ativoId) {
        return res.status(400).json({ message: 'Campos obrigatórios: descricao, ativoId' });
      }

      const userIsAdmin = isAdmin(req.user);
      const allowedClienteIds = userIsAdmin ? [] : getUserClienteIds(req.user);
      if (!userIsAdmin && !allowedClienteIds.length) return denyScope(res);

      const validation = await validateServicoPayload(models, payload, {
        requireAtivo: true,
        allowedClienteIds: userIsAdmin ? null : allowedClienteIds
      });

      logTriggerEvent('create_servico:request', {
        ativoId: validation.resolvedAtivoId,
        descricao,
        status: status || 'pendente',
        clienteId: validation.resolvedClienteId,
        usuarioId,
        tipoServicoId,
        dataAgendada
      });

      let detalhesValue = detalhes;
      if (detalhes && typeof detalhes === 'object') {
        try {
          detalhesValue = JSON.stringify(detalhes);
        } catch (_) {
          detalhesValue = '{}';
        }
      }

      const { sequelize } = require('../models');
      const rows = await sequelize.query(
        `SELECT create_servico(:descricao, :ativoId, :status, :clienteId, :usuarioId, :tipoServicoId, :dataAgendada, :detalhes) AS id`,
        {
          replacements: {
            descricao,
            ativoId: validation.resolvedAtivoId,
            status: status || 'pendente',
            clienteId: validation.resolvedClienteId,
            usuarioId: Number.isInteger(usuarioId) ? usuarioId : null,
            tipoServicoId: Number.isInteger(tipoServicoId) ? tipoServicoId : null,
            dataAgendada: dataAgendada || null,
            detalhes: detalhesValue || '{}'
          },
          type: sequelize.QueryTypes.SELECT
        }
      );

      const servicoId = rows[0]?.id ?? rows.id;
      logTriggerEvent('create_servico:response', { servicoId, rowsReturned: Array.isArray(rows) ? rows.length : 1 });
      const criado = await Servico.findByPk(servicoId, {
        include: [
          { model: Cliente, as: 'cliente' },
          { model: Usuario, as: 'responsavel' },
          { model: Ativo, as: 'ativo' },
          { model: TipoServico, as: 'tipoServico' }
        ]
      });
      return res.status(201).json(criado);
    } catch (error) {
      if (error instanceof ServicoValidationError) {
        return res.status(error.statusCode).json({ message: error.message, detalhes: error.details });
      }
      logTriggerEvent('create_servico:error', { message: error.message });
      return res.status(400).json({ message: 'Erro ao criar serviço (DB)', detalhes: error.message });
    }
  }
};

module.exports = servicoController;
