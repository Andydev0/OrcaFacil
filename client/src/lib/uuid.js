// Este arquivo serve como um wrapper para o módulo uuid
// para garantir que ele seja importado corretamente em todos os ambientes

// Importando o uuid usando require para compatibilidade com CommonJS
const uuid = require('uuid');

// Exportando a função v4 para ser usada em componentes React
module.exports = {
  v4: uuid.v4
};
