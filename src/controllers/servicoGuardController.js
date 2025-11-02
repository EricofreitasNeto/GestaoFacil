const { Servico, Ativo } = require('../models');

module.exports = {
  // Delete com checagem: só permite se ativo estiver 'inativo'
  async desativarChecked(req, res) {
    try {
      const { id } = req.params;
      const servico = await Servico.findByPk(id);
      if (!servico) return res.status(404).json({ message: 'Servico nao encontrado' });

      if (servico.ativoId) {
        const ativo = await Ativo.findByPk(servico.ativoId, { paranoid: false, attributes: ['status'] });
        const st = String(ativo?.status || '').toLowerCase();
        if (st !== 'inativo') {
          return res.status(400).json({ message: 'Nao e permitido excluir servico enquanto o ativo nao estiver desativado' });
        }
      }

      await servico.destroy();
      return res.status(200).json({ message: 'Servico desativado com sucesso' });
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao desativar servico', detalhes: error.message });
    }
  }
};

