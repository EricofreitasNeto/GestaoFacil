const rcedit = require('rcedit');
const path = require('path');

const exePath = path.join(__dirname, 'build', 'gestao-facil.exe');
const iconPath = path.join(__dirname, 'assets', 'app-icon.ico');

rcedit(exePath, { icon: iconPath }, (err) => {
  if (err) {
    console.error('❌ Erro ao aplicar ícone:', err);
  } else {
    console.log('✅ Ícone aplicado com sucesso!');
  }
});