'use strict';

const Fastify = require('fastify');

function createServer(options = {}) {
  const server = Fastify({
    logger: options.logger || false,
    ignoreTrailingSlash: true,
  });

  // Core routes (e.g., health check)
  server.get('/health', async () => {
    return { status: 'ok' };
  });

  return server;
}

module.exports = { createServer };
