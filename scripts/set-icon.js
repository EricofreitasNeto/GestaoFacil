const path = require('path');
const fs = require('fs');

async function main() {
  // Este script aplica o ícone no executável gerado pelo pkg (Windows)
  if (process.platform !== 'win32') {
    console.log('Script set-icon ignorado: plataforma não Windows.');
    return;
  }

  let rcedit;
  try {
    rcedit = require('rcedit');
  } catch (e) {
    console.error('Dependência rcedit não encontrada. Instale com: npm i -D rcedit');
    process.exitCode = 1;
    return;
  }

  const exePath = path.resolve('api', 'build', 'gestao-facil.exe');
  const iconPath = path.resolve('api', 'assets', 'app-icon.ico');

  if (!fs.existsSync(exePath)) {
    console.error(`Executável não encontrado: ${exePath}`);
    console.error('Gere o binário primeiro (pkg) conforme sua configuração.');
    process.exitCode = 1;
    return;
  }

  if (!fs.existsSync(iconPath)) {
    console.error(`Arquivo de ícone não encontrado: ${iconPath}`);
    process.exitCode = 1;
    return;
  }

  try {
    await rcedit(exePath, { icon: iconPath });
    console.log('Ícone aplicado com sucesso ao executável.');
  } catch (err) {
    console.error('Erro ao aplicar ícone:', err);
    process.exitCode = 1;
  }
}

main();

