const fastify = require('fastify')({ logger: true });
const buildUpConnections = require('./Socket/buildUpConnections');
const connectionIn = require('./Socket/connectionIn');
const consensus = require('./Consensus/Consensus');
const { addConsensus } = require('./Consensus/session');
const dbConnection = require('./DB/connection');
require('dotenv').config();

const registerRoutes = require('./routes');

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
        await new Promise(resolve => setTimeout(resolve, 5000));
        await dbConnection.register(fastify);
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
        connectionIn(fastify);
        await buildUpConnections(fastify);
        addConsensus(new consensus(fastify));
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
module.exports = fastify;