const { execSync } = require('child_process');
const rcedit = require('rcedit');
const path = require('path');
const fs = require('fs');

// Caminhos
const exePath = path.join(__dirname, 'build', 'gestao-facil.exe');
const iconPath = path.join(__dirname, 'assets', 'app-icon.ico');

// Etapa 1: Empacotar com pkg
console.log('📦 Empacotando com pkg...');
execSync('pkg ../ --targets node18-win-x64 --output build/gestao-facil.exe', { stdio: 'inherit' });

// Etapa 2: Verificar se o .exe foi gerado
if (!fs.existsSync(exePath)) {
  console.error('❌ .exe não encontrado. Verifique se o pkg gerou corretamente.');
  process.exit(1);
}

// Etapa 3: Aplicar ícone com rcedit
console.log('🎨 Aplicando ícone...');
rcedit(exePath, { icon: iconPath })
  .then(() => console.log('✅ Ícone aplicado com sucesso!'))
  .catch(err => {
    console.error('❌ Erro ao aplicar ícone:', err.message);
    process.exit(1);
  });