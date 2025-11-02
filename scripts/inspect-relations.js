/*
  scripts/inspect-relations.js
  Inspeciona relações via Sequelize com includes e imprime amostras.
*/

require('module-alias/register');
const util = require('util');
const db = require('@models');

function printHeader(title) {
  console.log('\n=== ' + title + ' ===');
}

async function main() {
  const { sequelize, Cliente, Usuario, Servico, Ativo, Local, TipoServico } = db;
  try {
    await sequelize.authenticate();

    // Totais por tabela (ignorando soft-deletados por padrão)
    printHeader('Totais por Tabela');
    const [clientes, locais, usuarios, tipos, ativos, servicos] = await Promise.all([
      Cliente.count(),
      Local.count(),
      Usuario.count(),
      TipoServico.count(),
      Ativo.count(),
      Servico.count(),
    ]);
    console.table([
      { tabela: 'clientes', total: clientes },
      { tabela: 'Locals', total: locais },
      { tabela: 'Usuarios', total: usuarios },
      { tabela: 'TipoServicos', total: tipos },
      { tabela: 'Ativos', total: ativos },
      { tabela: 'Servicos', total: servicos },
    ]);

    // Clientes com seus Ativos e Serviços
    printHeader('Clientes → (Ativos, Serviços) [amostra]');
    const clientesFull = await Cliente.findAll({
      where: { deletedAt: null },
      include: [
        { model: Ativo, as: 'ativos', separate: true, limit: 5, order: [['id', 'ASC']] },
        { model: Servico, as: 'servicos', separate: true, limit: 5, order: [['id', 'ASC']] },
      ],
      limit: 3,
      order: [['id', 'ASC']],
    });
    clientesFull.forEach(c => {
      console.log(`Cliente #${c.id} - ${c.nome} | ativos=${c.ativos?.length || 0} | servicos=${c.servicos?.length || 0}`);
    });

    // Ativos com Local e Cliente e amostra de Serviços
    printHeader('Ativos → (Local, Cliente, Serviços) [amostra]');
    const ativosFull = await Ativo.findAll({
      where: { deletedAt: null },
      include: [
        { model: Local, as: 'local' },
        { model: Cliente, as: 'cliente' },
        { model: Servico, as: 'servicos', separate: true, limit: 2, order: [['id', 'ASC']] },
      ],
      limit: 5,
      order: [['id', 'ASC']],
    });
    ativosFull.forEach(a => {
      console.log(`Ativo #${a.id} - ${a.nome} (${a.numeroSerie}) | local=${a.local?.nome || 'n/a'} | cliente=${a.cliente?.nome || 'n/a'} | servicos=${a.servicos?.length || 0}`);
    });

    // Serviços com Tipo, Ativo, Cliente e Responsável
    printHeader('Serviços → (Tipo, Ativo, Cliente, Responsável) [amostra]');
    const servicosFull = await Servico.findAll({
      where: { deletedAt: null },
      include: [
        { model: TipoServico, as: 'tipoServico' },
        { model: Ativo, as: 'ativo' },
        { model: Cliente, as: 'cliente' },
        { model: Usuario, as: 'responsavel' },
      ],
      limit: 5,
      order: [['id', 'ASC']],
    });
    servicosFull.forEach(s => {
      console.log(
        `Servico #${s.id} - ${s.descricao} | tipo=${s.tipoServico?.nome || 'n/a'} | ativo=${s.ativo?.numeroSerie || 'n/a'} | cliente=${s.cliente?.nome || 'n/a'} | resp=${s.responsavel?.email || 'n/a'}`
      );
    });

    // Verificação do gatilho (não permitir serviço em ativo inativo)
    printHeader('Validação Trigger: serviço em ativo inativo');
    const nbInativo = await Ativo.findOne({ where: { numeroSerie: 'NB-ADM-0001' } });
    if (nbInativo) {
      try {
        await Servico.create({
          descricao: 'Teste trigger em ativo inativo',
          status: 'pendente',
          clienteId: nbInativo.clienteId,
          ativoId: nbInativo.id,
        });
        console.log('ERRO: criação em ativo inativo não falhou (esperado falhar).');
        // limpeza se passou (não esperado)
        await Servico.destroy({ where: { descricao: 'Teste trigger em ativo inativo' }, force: true });
      } catch (e) {
        console.log('OK: gatilho bloqueou corretamente ->', e.message);
      }
    } else {
      console.log('Ativo inativo NB-ADM-0001 não encontrado; pulando teste de gatilho.');
    }

    // Extra: overview agregada por cliente
    printHeader('Resumo por Cliente (ativos e serviços)');
    const [rows] = await sequelize.query(`
      SELECT c.id, c.nome,
             COUNT(DISTINCT a.id) AS ativos,
             COUNT(DISTINCT s.id) AS servicos
      FROM clientes c
      LEFT JOIN "Ativos" a   ON a."clienteId" = c.id AND a."deletedAt" IS NULL
      LEFT JOIN "Servicos" s ON s."clienteId" = c.id AND s."deletedAt" IS NULL
      WHERE c."deletedAt" IS NULL
      GROUP BY c.id, c.nome
      ORDER BY c.nome;
    `);
    console.table(rows);

  } finally {
    await db.sequelize.close();
  }
}

main().catch(err => {
  console.error('Falha ao inspecionar relações:', err);
  process.exit(1);
});

