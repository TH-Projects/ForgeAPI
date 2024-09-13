const {getAllConnections} = require('../Socket/connectionStorage');
const {consensusTypes} = require('../enums');
const webSocket = require('ws');

const sendHeartbeat = async (fastify) => {
    const connections = getAllConnections();
    const message = {
        type: consensusTypes.HEARBEAT,
        payload: {
            serverId: fastify.serverId
        }
    }
    for(const connection of connections.values()){
        if(connection.readyState === webSocket.OPEN){
            try {
                connection.send(JSON.stringify(message));
            } catch (error) {
                console.log(error);
            }
        }
    }
}

module.exports = {
    sendHeartbeat
};