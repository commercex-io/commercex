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

  // Allow dynamic plugin registration
  server.registerPlugin = (plugin, opts = {}) => server.register(plugin, opts);

  // Allow dynamic route registration
  server.registerRoute = (routeOptions) => server.route(routeOptions);

  // Allow middleware registration (onRequest, preHandler, etc.)
  server.registerMiddleware = (hook, fn) => server.addHook(hook, fn);

  // Allow error handler registration
  server.registerErrorHandler = (fn) => server.setErrorHandler(fn);

  return server;
}

module.exports = { createServer };
