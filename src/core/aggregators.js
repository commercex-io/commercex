'use strict';

const fp = require('fastify-plugin');

/**
 * Plugin that registers common aggregation patterns
 */
async function aggregators(fastify, options = {}) {
  // Store aggregator functions
  fastify.decorate('aggregators', {});

  // Merge objects from multiple sources
  fastify.aggregators.merge = (results) => {
    return results.reduce((merged, result) => {
      return { ...merged, ...result };
    }, {});
  };

  // Concatenate arrays from multiple sources
  fastify.aggregators.concat = (results) => {
    return results.reduce((concatenated, result) => {
      if (Array.isArray(result)) {
        return concatenated.concat(result);
      }
      return concatenated;
    }, []);
  };

  // Group results by a specified key
  fastify.aggregators.groupBy = (results, request) => {
    const key = request.query.groupBy || 'id';
    return results.reduce((grouped, result) => {
      if (Array.isArray(result)) {
        result.forEach(item => {
          const groupKey = item[key];
          if (!grouped[groupKey]) {
            grouped[groupKey] = [];
          }
          grouped[groupKey].push(item);
        });
      }
      return grouped;
    }, {});
  };

  // Custom aggregator for product data
  fastify.aggregators.products = (results) => {
    // First result assumed to be base product data
    const products = Array.isArray(results[0]) ? results[0] : [results[0]];

    // Process additional results (could be inventory, pricing, etc.)
    for (let i = 1; i < results.length; i++) {
      const additionalData = results[i];

      if (Array.isArray(additionalData)) {
        // Match by ID and merge
        products.forEach(product => {
          const matching = additionalData.find(item => item.id === product.id);
          if (matching) {
            Object.assign(product, matching);
          }
        });
      }
    }

    return products;
  };

  // Register custom aggregators from options
  if (options.custom) {
    Object.entries(options.custom).forEach(([name, fn]) => {
      fastify.aggregators[name] = fn;
    });
  }
}

module.exports = fp(aggregators, {
  name: 'aggregators',
  fastify: '>=4.0.0'
});
