const fastify = require('fastify')({ logger: true });
const buildUpConnections = require('./Socket/buildUpConnections');
const connectionIn = require('./Socket/connectionIn');
const consensus = require('./Consensus/Consensus');
const { addConsensus } = require('./Consensus/session');
require('dotenv').config();

const registerRoutes = require('./routes');

// Register Fastify Plugins
fastify.register(require('@fastify/postgres'), {
    connectionString: `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.DB_HOST}:5432/${process.env.POSTGRES_DB}`,
});

// Read Environment Variables
const serverId = process.env.SERVER_ID;
const totalCount = process.env.TOTAL_SERVERS;

// Decorate Fastify Instance for Global Access
fastify.decorate('serverId', serverId);
fastify.decorate('totalCount', totalCount);

// Start Server
const start = async () => {
    try {
        // Register Routes
        await registerRoutes(fastify);

        // Start Server
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
        connectionIn(fastify);
        await buildUpConnections(fastify);
        await new Promise(resolve => setTimeout(resolve, 5000));
        addConsensus(new consensus(fastify));
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
module.exports = fastify;