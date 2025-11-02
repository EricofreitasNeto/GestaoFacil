/* Lista serviços sem ativo (ativoId NULL) para correção antes da migration. */
require('module-alias/register');
const db = require('@models');

(async () => {
  try {
    await db.sequelize.authenticate();
    const [rows] = await db.sequelize.query(
      'SELECT id, descricao, "clienteId", "usuarioId" FROM "Servicos" WHERE "ativoId" IS NULL ORDER BY id'
    );
    if (!rows.length) {
      console.log('Nenhum serviço órfão (ativoId NULL) encontrado.');
    } else {
      console.log(`Encontrados ${rows.length} serviço(s) com ativoId NULL:`);
      console.table(rows);
      console.log('\nSugestões para corrigir:');
      console.log('- Atribuir um ativo válido: UPDATE "Servicos" SET "ativoId" = <id_ativo> WHERE id IN (<ids>);');
      console.log('- Ou remover registros inválidos: DELETE FROM "Servicos" WHERE id IN (<ids>);');
    }
  } catch (e) {
    console.error('Falha ao inspecionar órfãos:', e.message);
    process.exitCode = 1;
  } finally {
    await db.sequelize.close();
  }
})();

