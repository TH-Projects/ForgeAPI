const consensusVoting = require('../Consensus/consensusVoting');


const get = async (fastify, options) => {
    fastify.get('/get', async (request, reply) => {
        return await consensusVoting.get(fastify, "SELECT * FROM TEST");
    });
}


module.exports = get;