const consensusVoting = require('../Consensus/consensusVoting');


const post = async (fastify, options) => {
    fastify.post('/post', async (request, reply) => {
        return await consensusVoting.post(fastify, "INSERT INTO TEST (abc) VALUES (?)", [187]);
    });
}


module.exports = post;