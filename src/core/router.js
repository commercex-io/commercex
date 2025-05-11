'use strict';

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const yaml = require('js-yaml');
const Ajv = require('ajv');

const CONFIG_PATH = path.join(__dirname, '../../config/commercex.json');
const CONFIG_SCHEMA_URL = 'https://raw.githubusercontent.com/devopsfaith/krakend-json-schema/master/schema.json'; // Compatible schema, but do not mention KrakenD

let registeredRoutes = [];

async function loadConfig() {
  const ext = path.extname(CONFIG_PATH).toLowerCase();
  const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
  if (ext === '.yaml' || ext === '.yml') {
    return yaml.load(raw);
  }
  return JSON.parse(raw);
}

async function validateConfig(config) {
  // Download and cache the config schema
  let schema;
  try {
    const schemaPath = path.join(__dirname, '../../config/gateway.schema.json');
    if (!fs.existsSync(schemaPath)) {
      const https = require('https');
      const file = fs.createWriteStream(schemaPath);
      await new Promise((resolve, reject) => {
        https.get(CONFIG_SCHEMA_URL, (response) => {
          response.pipe(file);
          file.on('finish', () => file.close(resolve));
          file.on('error', reject);
        });
      });
    }
    schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
  } catch (err) {
    throw new Error('Failed to load config schema: ' + err.message);
  }
  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(schema);
  if (!validate(config)) {
    throw new Error('Config validation error: ' + JSON.stringify(validate.errors));
  }
}

function unregisterRoutes(fastify) {
  for (const route of registeredRoutes) {
    try {
      fastify.route({
        method: route.method,
        url: route.url,
        handler: (req, reply) => reply.code(410).send({ error: 'Route removed' })
      });
    } catch (err) {
      fastify.log.warn(`Failed to unregister route: ${route.method} ${route.url}`);
    }
  }
  registeredRoutes = [];
}

function buildRouteHandler(fastify, endpointConfig) {
  return async function(request, reply) {
    const { backend, aggregator } = endpointConfig;
    const results = [];
    for (const backendConfig of backend) {
      const { host, url_pattern, extra_config = {} } = backendConfig;
      // Use adapter/plugin if available
      const adapterName = (host[0] || '').replace(/^https?:\/\//, '').split('.')[0];
      const adapter = fastify[adapterName];
      let result;
      try {
        if (adapter && typeof adapter.request === 'function') {
          result = await adapter.request({
            path: url_pattern,
            method: endpointConfig.method,
            query: request.query,
            params: request.params,
            body: request.body,
            headers: request.headers
          });
        } else {
          // fallback: direct fetch
          const fetch = require('node-fetch');
          const url = host[0] + url_pattern;
          const res = await fetch(url, {
            method: endpointConfig.method,
            headers: request.headers,
            body: ['POST', 'PUT', 'PATCH'].includes(endpointConfig.method) ? JSON.stringify(request.body) : undefined
          });
          result = await res.json();
        }
        results.push(result);
      } catch (err) {
        fastify.log.error(`Backend call failed: ${host[0]}${url_pattern} - ${err.message}`);
        if (!extra_config.optional) throw err;
      }
    }
    // Aggregation
    if (aggregator && fastify.aggregators && fastify.aggregators[aggregator]) {
      return fastify.aggregators[aggregator](results, request);
    }
    return results.length === 1 ? results[0] : results;
  };
}

function registerRoutes(fastify, config) {
  unregisterRoutes(fastify);
  if (!config.endpoints) return;
  for (const endpoint of config.endpoints) {
    const { endpoint: url, method, backend, extra_config = {}, validation = {} } = endpoint;
    const routeOptions = {
      method,
      url,
      handler: buildRouteHandler(fastify, endpoint),
      schema: validation
    };
    // TODO: Apply extra_config features (rate limiting, circuit breaker, etc.)
    fastify.route(routeOptions);
    registeredRoutes.push({ method, url });
    fastify.log.info(`Registered route: ${method} ${url}`);
  }
}

async function setupRouter(fastify) {
  let config = await loadConfig();
  await validateConfig(config);
  registerRoutes(fastify, config);
  chokidar.watch(CONFIG_PATH).on('change', async () => {
    fastify.log.info('Configuration file changed, reloading routes...');
    try {
      const newConfig = await loadConfig();
      await validateConfig(newConfig);
      registerRoutes(fastify, newConfig);
    } catch (err) {
      fastify.log.error('Failed to reload config: ' + err.message);
    }
  });
}

module.exports = { setupRouter };
