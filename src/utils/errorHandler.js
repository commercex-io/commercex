module.exports = (err, req, reply) => {
  reply.status(err.statusCode || 500).send({
    error: err.message || 'Internal Server Error',
  });
};
