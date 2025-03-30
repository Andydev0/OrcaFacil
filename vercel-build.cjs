// Este script é executado pela Vercel durante o processo de build
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Executar o build do cliente
console.log('🔨 Iniciando o build do cliente...');
execSync('npx vite build', { stdio: 'inherit' });

console.log('✅ Build concluído com sucesso!');
