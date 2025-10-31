const { TipoServico } = require("../models");

const tipoServicoController = {
  // Listar todos os tipos (ativos e inativos)
  async listar(req, res) {
    try {
      const tipos = await TipoServico.unscoped().findAll();
      return res.status(200).json(tipos);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao listar tipos de serviço", detalhes: error.message });
    }
  },

  // Buscar por ID
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const tipo = await TipoServico.findByPk(id);
      if (!tipo) return res.status(404).json({ message: "Tipo de serviço não encontrado" });
      return res.status(200).json(tipo);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar tipo de serviço", detalhes: error.message });
    }
  },

  // Criar novo tipo
  async criar(req, res) {
    try {
      const { nome, descricao, ativo } = req.body;`r`n      const novoTipo = await TipoServico.create({ nome, descricao, ativo: (typeof ativo === 'boolean') ? ativo : true });
      return res.status(201).json(novoTipo);
    } catch (error) {
      return res.status(400).json({ message: "Erro ao criar tipo de serviço", detalhes: error.message });
    }
  },

  // Atualizar tipo existente
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, descricao, ativo } = req.body;
      const tipo = await TipoServico.findByPk(id);
      if (!tipo) return res.status(404).json({ message: "Tipo de serviço não encontrado" });

      await tipo.update({ nome, descricao, ativo });
      return res.status(200).json(tipo);
    } catch (error) {
      return res.status(400).json({ message: "Erro ao atualizar tipo de serviço", detalhes: error.message });
    }
  },

  // Desativar tipo (soft delete)
  async desativar(req, res) {
    try {
      const { id } = req.params;
      const tipo = await TipoServico.findByPk(id);
      if (!tipo) return res.status(404).json({ message: "Tipo de serviço não encontrado" });

      await tipo.update({ ativo: false });
      return res.status(200).json({ message: "Tipo de serviço desativado com sucesso" });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao desativar tipo de serviço", detalhes: error.message });
    }
  },

  // Excluir definitivamente (hard delete)
  async excluir(req, res) {
    try {
      const { id } = req.params;
      const tipo = await TipoServico.findByPk(id);
      if (!tipo) return res.status(404).json({ message: "Tipo de serviço não encontrado" });

      await tipo.destroy();
      return res.status(200).json({ message: "Tipo de serviço excluído com sucesso" });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao excluir tipo de serviço", detalhes: error.message });
    }
  }
};

module.exports = tipoServicoController;





const { TipoServico } = require("../models");

const tipoServicoController = {
  // Listar todos os tipos (ativos e inativos)
  async listar(req, res) {
    try {
      const tipos = await TipoServico.unscoped().findAll();
      return res.status(200).json(tipos);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao listar tipos de serviço", detalhes: error.message });
    }
  },

  // Buscar por ID
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const tipo = await TipoServico.findByPk(id);
      if (!tipo) return res.status(404).json({ message: "Tipo de serviço não encontrado" });
      return res.status(200).json(tipo);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar tipo de serviço", detalhes: error.message });
    }
  },

  // Criar novo tipo
  async criar(req, res) {
    try {
      const { nome, descricao, ativo } = req.body;
      const novoTipo = await TipoServico.create({
        nome,
        descricao,
        ativo: (typeof ativo === 'boolean') ? ativo : true
      });
      return res.status(201).json(novoTipo);
    } catch (error) {
      return res.status(400).json({ message: "Erro ao criar tipo de serviço", detalhes: error.message });
    }
  },

  // Atualizar tipo existente
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, descricao, ativo } = req.body;
      const tipo = await TipoServico.findByPk(id);
      if (!tipo) return res.status(404).json({ message: "Tipo de serviço não encontrado" });

      await tipo.update({ nome, descricao, ativo });
      return res.status(200).json(tipo);
    } catch (error) {
      return res.status(400).json({ message: "Erro ao atualizar tipo de serviço", detalhes: error.message });
    }
  },

  // Desativar tipo (soft delete)
  async desativar(req, res) {
    try {
      const { id } = req.params;
      const tipo = await TipoServico.findByPk(id);
      if (!tipo) return res.status(404).json({ message: "Tipo de serviço não encontrado" });

      await tipo.update({ ativo: false });
      return res.status(200).json({ message: "Tipo de serviço desativado com sucesso" });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao desativar tipo de serviço", detalhes: error.message });
    }
  },

  // Excluir definitivamente (hard delete)
  async excluir(req, res) {
    try {
      const { id } = req.params;
      const tipo = await TipoServico.findByPk(id);
      if (!tipo) return res.status(404).json({ message: "Tipo de serviço não encontrado" });

      await tipo.destroy();
      return res.status(200).json({ message: "Tipo de serviço excluído com sucesso" });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao excluir tipo de serviço", detalhes: error.message });
    }
  }
};

module.exports = tipoServicoController;
