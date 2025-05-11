'use strict';

const pino = require('pino');

function createLogger(options = {}) {
  return pino({
    level: options.level || 'info',
    transport: options.prettyPrint ? { target: 'pino-pretty' } : undefined,
    ...options,
  });
}

module.exports = { createLogger };
