'use strict';

const { createServer } = require('./src/core/server');
const { createLogger } = require('./src/core/logger');
const { registerPlugins } = require('./src/core/plugins');
const config = require('./config/commercex.json');

async function commercex(options = {}) {
  const logger = createLogger(options.logger);
  const server = createServer({ ...options, logger });

  try {
    await registerPlugins(server, config.plugins);
    await server.listen({ port: config.server.port });
    logger.info(`CommerceX is running on port ${config.server.port}`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }

  return server;
}

module.exports = commercex;

