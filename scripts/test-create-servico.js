require('module-alias/register');
const db = require('@models');

(async () => {
  const { sequelize, Ativo, Usuario, TipoServico, Servico, Cliente } = db;
  try {
    await sequelize.authenticate();

    const ativo = await Ativo.findOne({ where: { numeroSerie: 'SRV-APP-0001' } })
                  || await Ativo.findOne({ where: { status: 'ativo' } });
    if (!ativo) throw new Error('Nenhum ativo disponível encontrado.');

    const tipo = await TipoServico.findOne({ where: { nome: 'Suporte' } });
    const usuario = await Usuario.findOne({ where: { email: 'admin@gestaofacil.local' } });

    const descricao = 'Abertura via função create_servico';
    const status = 'pendente';
    const clienteId = null; // será inferido do ativo
    const usuarioId = usuario ? usuario.id : null;
    const tipoServicoId = tipo ? tipo.id : null;
    const dataAgendada = new Date(Date.now() + 24*3600*1000);
    const detalhes = JSON.stringify({ origem: 'teste-funcao', prioridade: 'media' });

    const rows = await sequelize.query(
      `SELECT create_servico(:descricao, :ativoId, :status, :clienteId, :usuarioId, :tipoServicoId, :dataAgendada, :detalhes) AS id`,
      {
        replacements: {
          descricao,
          ativoId: ativo.id,
          status,
          clienteId,
          usuarioId,
          tipoServicoId,
          dataAgendada,
          detalhes
        },
        type: sequelize.QueryTypes.SELECT
      }
    );

    const servicoId = rows[0]?.id ?? rows.id;
    console.log('Serviço criado com id:', servicoId);

    const created = await Servico.findByPk(servicoId, {
      include: [
        { model: Ativo, as: 'ativo' },
        { model: Cliente, as: 'cliente' },
        { model: Usuario, as: 'responsavel' },
        { model: TipoServico, as: 'tipoServico' },
      ]
    });
    console.log('Resumo:', {
      id: created.id,
      descricao: created.descricao,
      status: created.status,
      ativo: created.ativo?.numeroSerie,
      cliente: created.cliente?.nome,
      responsavel: created.responsavel?.email,
      tipo: created.tipoServico?.nome,
    });
  } catch (e) {
    console.error('Falha no teste da função:', e.message);
    process.exitCode = 1;
  } finally {
    await db.sequelize.close();
  }
})();
