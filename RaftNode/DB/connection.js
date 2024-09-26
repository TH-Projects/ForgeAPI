const fastifyMariaDB = require('fastify-mariadb');

// register the plugin
async function register(fastify) {
    try {
        await fastify.register(fastifyMariaDB, {
            promise: true,
            connectionString: `mariadb://${process.env.MYSQL_USER}:${process.env.MYSQL_PASSWORD}@${process.env.DB_HOST}:3306/${process.env.MYSQL_DATABASE}`
        });
        // wait for the server to be ready
        await fastify.ready();
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

// get a connection
const getConnection = async (fastify) => {
    try {
        return await fastify.mariadb.getConnection();
    } catch (err) {
        fastify.log.error('Error getting connection:', err);
        throw err;
    }
}

module.exports = {
    register,
    getConnection
};