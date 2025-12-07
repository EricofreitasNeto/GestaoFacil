require('module-alias/register');
const db = require('@models');

(async () => {
  const { sequelize, Usuario } = db;
  try {
    await sequelize.authenticate();

    const [affected] = await Usuario.update(
      { status: 'approved' },
      {
        where: {
          status: ['pending', null, '', 'aguardando', 'rejected']
        }
      }
    );

    console.log(`Usuários atualizados: ${affected}`);
  } catch (error) {
    console.error('Falha ao aprovar usuários existentes:', error.message);
    process.exitCode = 1;
  } finally {
    await db.sequelize.close();
  }
})();
