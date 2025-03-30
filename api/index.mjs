// Este arquivo serve como ponto de entrada para a Vercel
import { createServer } from 'http';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Servir arquivos estáticos da pasta dist/public
const staticPath = path.join(__dirname, '..', 'dist', 'public');
if (fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));
} else {
  console.error(`Diretório estático não encontrado: ${staticPath}`);
}

// Rota de fallback para o SPA
app.get('*', (req, res) => {
  const indexPath = path.join(staticPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Aplicação não encontrada. Verifique se o build foi realizado corretamente.');
  }
});

const port = process.env.PORT || 3000;
const server = createServer(app);

server.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

export default app;
