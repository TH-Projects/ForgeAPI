const fastify = require('fastify')({ logger: true });
const buildUpConnections = require('./Socket/buildUpConnections');
const connectionIn = require('./Socket/connectionIn');

// Read Environment Variables
const serverId = process.env.SERVER_ID;
const totalCount = process.env.TOTAL_SERVERS;
const dbHost = process.env.DB_HOST;

// Decorate Fastify Instance for Global Access
fastify.decorate('serverId', serverId);
fastify.decorate('totalCount', totalCount);
fastify.decorate('dbHost', dbHost);

// Start Server
const start = async () => {
    try {
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
        connectionIn(fastify);
        buildUpConnections(fastify);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
module.exports = fastify;