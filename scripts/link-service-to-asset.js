// Vincula um serviço a um ativo e herda o cliente do ativo.
require('module-alias/register');
const db = require('@models');

async function main() {
  const [serviceIdArg, assetIdArg] = process.argv.slice(2);
  const serviceId = Number(serviceIdArg);
  const assetId = Number(assetIdArg);
  if (!serviceId || !assetId) {
    console.error('Uso: node scripts/link-service-to-asset.js <serviceId> <assetId>');
    process.exit(1);
  }

  await db.sequelize.authenticate();
  const asset = await db.Ativo.findByPk(assetId);
  if (!asset) {
    console.error(`Ativo ${assetId} não encontrado.`);
    process.exit(1);
  }

  const [affected] = await db.Servico.update(
    { ativoId: asset.id, clienteId: asset.clienteId },
    { where: { id: serviceId } }
  );
  if (!affected) {
    console.error(`Serviço ${serviceId} não encontrado ou não atualizado.`);
    process.exit(1);
  }
  console.log(`Serviço ${serviceId} vinculado ao ativo ${assetId} (clienteId=${asset.clienteId}).`);
}

main()
  .catch((e) => { console.error('Falha ao vincular:', e.message); process.exit(1); })
  .finally(async () => { await db.sequelize.close(); });

