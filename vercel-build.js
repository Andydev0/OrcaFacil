// Este script é executado pela Vercel durante o processo de build
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Executar o build do cliente e do servidor
console.log('🔨 Iniciando o build do cliente e do servidor...');
execSync('npm run build', { stdio: 'inherit' });

// Verificar se os diretórios necessários existem
const distDir = path.join(__dirname, 'dist');
const publicDir = path.join(distDir, 'public');

if (!fs.existsSync(publicDir)) {
  console.log('⚠️ Diretório public não encontrado, criando...');
  fs.mkdirSync(publicDir, { recursive: true });
}

// Criar um arquivo .vercel/output/config.json para configuração da Vercel
const vercelOutputDir = path.join(__dirname, '.vercel', 'output');
if (!fs.existsSync(vercelOutputDir)) {
  fs.mkdirSync(vercelOutputDir, { recursive: true });
}

const vercelConfig = {
  version: 3,
  routes: [
    { handle: 'filesystem' },
    { src: '/api/(.*)', dest: '/api/$1' },
    { src: '/(.*)', dest: '/index.html' }
  ],
  env: {
    NODE_ENV: 'production'
  }
};

fs.writeFileSync(
  path.join(vercelOutputDir, 'config.json'),
  JSON.stringify(vercelConfig, null, 2)
);

console.log('✅ Build concluído com sucesso!');
