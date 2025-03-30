// Plugin personalizado para lidar com o módulo uuid
module.exports = function uuidPlugin() {
  return {
    name: 'vite-plugin-uuid',
    resolveId(id) {
      if (id === 'uuid') {
        return { id: 'uuid', external: false };
      }
      return null;
    }
  };
}
