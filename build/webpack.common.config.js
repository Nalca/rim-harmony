const path = require('path');

function pathResolve (...targetPath) {
  return path.join(__dirname, '..', ...targetPath);
}

module.exports = {
  resolve: {
    alias: {
      '@': pathResolve('source'),
      '@Core': pathResolve('source/core'),
      '@Web': pathResolve('source/view'),
      '@Common': pathResolve('source/common'),
    }
  }
}