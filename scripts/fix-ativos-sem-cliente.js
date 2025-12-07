require('module-alias/register');
const db = require('@models');

(async () => {
  const { sequelize, Cliente, Ativo } = db;
  try {
    await sequelize.authenticate();

    const cliente = await Cliente.findOne({ order: [['id', 'ASC']] });
    if (!cliente) {
      throw new Error('Nenhum cliente encontrado para atribuir aos ativos.');
    }

    const ativos = await Ativo.findAll({
      where: { clienteId: null },
      order: [['id', 'ASC']]
    });

    if (!ativos.length) {
      console.log('Todos os ativos já possuem cliente associado.');
      return;
    }

    for (const ativo of ativos) {
      // eslint-disable-next-line no-await-in-loop
      await ativo.update({ clienteId: cliente.id });
      console.log(`Ativo ${ativo.id} (${ativo.numeroSerie || ativo.nome}) atribuído ao cliente ${cliente.nome}.`);
    }
  } catch (error) {
    console.error('Falha ao atribuir clientes aos ativos:', error.message);
    process.exitCode = 1;
  } finally {
    await db.sequelize.close();
  }
})();
