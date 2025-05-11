'use strict';

const path = require('path');

async function registerPlugins(server, plugins = []) {
  for (const plugin of plugins) {
    try {
      const pluginModule = require(plugin.path);
      await server.register(pluginModule, plugin.options || {});
      server.log.info(`Loaded plugin: ${plugin.name}`);
    } catch (err) {
      server.log.error(`Failed to load plugin: ${plugin.name}`, err);
    }
  }
}

module.exports = { registerPlugins };
