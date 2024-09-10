const connectionOut = require('./connectionOut');
const {getConnectionCount, checkConnection} = require('./connectionStorage');

const serverBaseName = 'ws://raftnode_';
const startPort = 3000;

//build up connections with other nodes
const buildUpConnections = async (fastify) => {
    const totalCount = fastify.totalCount;
    const serverId = fastify.serverId;
    while (!checkConnectionCount(totalCount)) {
        console.log('Trying to establish connections');
        for(const id of Array.from({length: totalCount}, (_, i) => i + 1)) {
            if(id.toString() === serverId.toString()) {
                continue;
            }
            if(checkConnection(id)) {
                continue;
            }
            const url = `${serverBaseName}${id}:${startPort}`;
            connectionOut(fastify, url, id);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log('All connections are established: ', getConnectionCount());
}

const checkConnectionCount = (totalCount) => {
    const connectionCount = getConnectionCount();
    return connectionCount === totalCount - 1;
}

module.exports = buildUpConnections;