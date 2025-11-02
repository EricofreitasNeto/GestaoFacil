const { Cliente, Ativo } = require('../models');

module.exports = {
  // Admin: cria (ou usa) um ativo para o cliente e realoca serviços inconsistentes
  // Suporta dryRun (não altera nada; apenas retorna o que seria feito)
  async fixServicosCliente(req, res) {
    try {
      const { clienteId, numeroSerie, nome, dryRun: dryRunBody } = req.body || {};
      const dryRun = String(req.query?.dryRun || '').toLowerCase() === 'true' || dryRunBody === true;
      if (!Number.isInteger(clienteId) || !numeroSerie) {
        return res.status(400).json({ message: 'Parametros obrigatorios: clienteId (int), numeroSerie (string)' });
      }

      const cliente = await Cliente.findByPk(clienteId, { paranoid: false });
      if (!cliente) return res.status(404).json({ message: 'Cliente nao encontrado' });

      let ativo = await Ativo.findOne({ where: { numeroSerie } });
      const willCreateAsset = !ativo;
      const willReassignAsset = !!ativo && ativo.clienteId !== clienteId;

      const { sequelize } = require('../models');

      // Serviços candidatos a atualização (sem ativo ou com ativo de outro cliente)
      const [candidates] = await sequelize.query(
        `SELECT s.id
         FROM "Servicos" s
         LEFT JOIN "Ativos" a ON a.id = s."ativoId"
         WHERE s."clienteId" = :clienteId
           AND (a.id IS NULL OR a."clienteId" IS DISTINCT FROM :clienteId)
         ORDER BY s.id`,
        { replacements: { clienteId } }
      );

      if (dryRun) {
        return res.status(200).json({
          success: true,
          dryRun: true,
          assetAction: willCreateAsset ? 'create' : willReassignAsset ? 'reassign' : 'reuse',
          assetId: ativo ? ativo.id : null,
          wouldUpdate: (candidates || []).length,
          serviceIds: (candidates || []).map(r => r.id)
        });
      }

      // Execução real: garantir ativo e aplicar updates
      if (!ativo) {
        ativo = await Ativo.create({
          nome: nome || `Ativo Cliente ${clienteId}`,
          numeroSerie,
          clienteId,
          status: 'ativo',
          detalhes: {}
        });
      } else if (ativo.clienteId !== clienteId) {
        await ativo.update({ clienteId, status: 'ativo' });
      }

      const [rows] = await sequelize.query(
        `WITH alvo AS (
           SELECT s.id
           FROM "Servicos" s
           LEFT JOIN "Ativos" a ON a.id = s."ativoId"
           WHERE s."clienteId" = :clienteId
             AND (a.id IS NULL OR a."clienteId" IS DISTINCT FROM :clienteId)
         )
         UPDATE "Servicos" s
         SET "ativoId" = :assetId
         FROM alvo
         WHERE s.id = alvo.id
         RETURNING s.id`,
        { replacements: { clienteId, assetId: ativo.id } }
      );

      const updated = Array.isArray(rows) ? rows.map(r => r.id) : [];
      return res.status(200).json({ success: true, ativoId: ativo.id, atualizado: updated.length, servicosIds: updated });
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao realocar servicos do cliente', detalhes: error.message });
    }
  }
};
