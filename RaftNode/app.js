const fastify = require('fastify')({ logger: true });
const buildUpConnections = require('./Socket/buildUpConnections');
const connectionIn = require('./Socket/connectionIn');
const consensus = require('./Consensus/Consensus');
const { addConsensus } = require('./Consensus/session');
require('dotenv').config();

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

// Register Routes -> This part is generated automatically
fastify.register(require('./Rest/employees/getAllEmployees'));
fastify.register(require('./Rest/employees/getEmployeesByName'));
fastify.register(require('./Rest/employees/postEmployees'));
fastify.register(require('./Rest/employees/putEmployees'));
fastify.register(require('./Rest/employees/deleteEmployee'));
fastify.register(require('./Rest/departments/getDepartments'));
fastify.register(require('./Rest/departments/postDepartments'));
fastify.register(require('./Rest/departments/deleteDepartments'));


// Start Server
const start = async () => {
    try {
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