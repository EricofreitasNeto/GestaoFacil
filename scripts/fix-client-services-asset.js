// Cria um ativo para um cliente e atualiza os serviços do cliente
// para apontarem para esse ativo quando estiverem inconsistentes.
// Uso: node scripts/fix-client-services-asset.js <clienteId> <numeroSerie> <nome com espaços>

require('module-alias/register');
const db = require('@models');

async function main() {
  const [clienteIdArg, serieArg, ...nameParts] = process.argv.slice(2);
  const clienteId = Number(clienteIdArg);
  const numeroSerie = serieArg;
  const nome = nameParts.join(' ') || `Ativo Cliente ${clienteId}`;

  if (!clienteId || !numeroSerie) {
    console.error('Uso: node scripts/fix-client-services-asset.js <clienteId> <numeroSerie> <nome...>');
    process.exit(1);
  }

  const { sequelize, Ativo, Servico, Cliente } = db;
  await sequelize.authenticate();

  const cliente = await Cliente.findByPk(clienteId, { paranoid: false });
  if (!cliente) {
    console.error(`Cliente ${clienteId} não encontrado.`);
    process.exit(1);
  }

  let ativo = await Ativo.findOne({ where: { numeroSerie } });
  if (!ativo) {
    ativo = await Ativo.create({
      nome,
      numeroSerie,
      clienteId,
      status: 'ativo',
      detalhes: {}
    });
    console.log(`Ativo criado: id=${ativo.id}, numeroSerie=${numeroSerie}`);
  } else {
    if (ativo.clienteId !== clienteId) {
      await ativo.update({ clienteId, status: 'ativo' });
      console.log(`Ativo existente reassociado ao cliente ${clienteId}: id=${ativo.id}`);
    } else {
      console.log(`Ativo já existente para o cliente: id=${ativo.id}`);
    }
  }

  // Atualiza serviços do cliente cujo ativo atual é de outro cliente ou inexistente
  const [result] = await sequelize.query(
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
     RETURNING s.id`
    , { replacements: { clienteId, assetId: ativo.id } }
  );

  const updatedIds = Array.isArray(result) ? result.map(r => r.id) : [];
  console.log(`Serviços atualizados: ${updatedIds.length}`);
  if (updatedIds.length) console.log('IDs:', updatedIds.join(', '));
}

main()
  .catch(e => { console.error('Falha ao executar fix:', e.message); process.exit(1); })
  .finally(async () => { await db.sequelize.close(); });

