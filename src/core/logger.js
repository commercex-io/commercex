'use strict';

const pino = require('pino');

/**
 * Create a logger instance with advanced transport support.
 * @param {Object} options - Logger options, including level, format, and transport config.
 * @returns {import('pino').Logger}
 */
function createLogger(options = {}) {
  // Support advanced transports via config
  let transport;
  if (options.transport) {
    transport = options.transport;
  } else if (options.prettyPrint) {
    transport = { target: 'pino-pretty' };
  } else if (options.file) {
    transport = {
      target: 'pino/file',
      options: { destination: options.file }
    };
  }

  return pino({
    level: options.level || 'info',
    formatters: options.formatters,
    ...options,
    transport
  });
}

module.exports = { createLogger };
