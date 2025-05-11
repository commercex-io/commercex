'use strict';

const fp = require('fastify-plugin');
const { default: fetch } = require('node-fetch');

/**
 * Base adapter class for all commerce integrations
 */
class Adapter {
  constructor(fastify, options = {}) {
    this.fastify = fastify;
    this.options = options;
    this.name = options.name || 'adapter';
    this.baseUrl = options.baseUrl || '';
    this.headers = options.headers || {};
    this.timeout = options.timeout || 10000;
    this.log = fastify.log.child({ adapter: this.name });
  }

  /**
   * Make a request to the adapter's API
   */
  async request({ path, method = 'GET', query = {}, params = {}, body, headers = {} }) {
    const url = this._buildUrl(path, query, params);

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...this.headers,
        ...headers
      },
      timeout: this.timeout
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(body);
    }

    this.log.debug({ url, method }, 'Making request');

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const error = new Error(`API request failed with status ${response.status}`);
        error.status = response.status;
        error.response = response;
        throw error;
      }

      return await response.json();
    } catch (err) {
      this.log.error({ err, url, method }, 'Request failed');
      throw err;
    }
  }

  /**
   * Build URL with path, query and params
   */
  _buildUrl(path, query = {}, params = {}) {
    // Replace path parameters
    let processedPath = path;

    for (const [key, value] of Object.entries(params)) {
      processedPath = processedPath.replace(`{${key}}`, encodeURIComponent(value));
    }

    // Build full URL
    const url = new URL(processedPath, this.baseUrl);

    // Add query parameters
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    }

    return url.toString();
  }

  /**
   * Authenticate with the service
   * (To be implemented by specific adapters)
   */
  async authenticate() {
    throw new Error('Authentication method not implemented');
  }

  /**
   * Health check method
   */
  async healthCheck() {
    try {
      await this.request({ path: this.options.healthCheckPath || '/' });
      return { status: 'ok' };
    } catch (err) {
      return { status: 'error', message: err.message };
    }
  }
}

/**
 * Create and register adapter plugin
 */
function createAdapter(AdapterClass) {
  return fp(async function(fastify, options) {
    const adapter = new AdapterClass(fastify, options);
    fastify.decorate(adapter.name, adapter);

    // Register health check route
    if (options.registerHealthCheck !== false) {
      fastify.get(`/health/${adapter.name}`, async () => {
        return await adapter.healthCheck();
      });
    }
  }, {
    name: AdapterClass.name.toLowerCase(),
    fastify: '>=4.0.0'
  });
}

module.exports = { Adapter, createAdapter };
