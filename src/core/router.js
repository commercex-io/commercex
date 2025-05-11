'use strict';

function registerRoutes(server, routes = []) {
  for (const route of routes) {
    server.route(route);
  }
}

module.exports = { registerRoutes };
