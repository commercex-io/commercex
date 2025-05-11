'use strict';

const { createServer } = require('./src/core/server');
const { createLogger } = require('./src/core/logger');
const { registerPlugins } = require('./src/core/plugins');
const { setupRouter } = require('./src/core/router');
const config = require('./config/commercex.json');

async function commercex(options = {}) {
  const logger = createLogger(options.logger || config.extra_config?.logging || {});
  const server = createServer({ ...options, logger });

  try {
    // Register plugins/adapters if any (config.plugins is optional)
    if (config.plugins) {
      await registerPlugins(server, config.plugins);
    }
    // Register dynamic routes from config
    await setupRouter(server);
    // Start server
    await server.listen({ port: config.port || 8080 });
    logger.info(`CommerceX is running on port ${config.port || 8080}`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }

  return server;
}

module.exports = commercex;
