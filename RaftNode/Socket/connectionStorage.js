const session = require('../Consensus/session');


// contains all the connections of the nodes
let connectionStorage = new Map();

// Add a connection to the storage
const addConnection = (nodeId, socket) => {
    connectionStorage.set(nodeId.toString(), socket);
}

// Get a connection from the storage by node id
const getConnection = (nodeId) => {
    return connectionStorage.get(nodeId.toString());
}

// Remove a connection from the storage by node id
const removeConnection = (ws) => {
    for(const [key, value] of connectionStorage){
        if(value === ws){
            connectionStorage.delete(key.toString());
            const consensus = session.getConsensus();
            if(consensus && consensus.checkLeader(key)){
                consensus.removeLeader();
            }
            console.log('Connection removed: ', key);
            return;
        }
    }
}

// Get all connections from the storage
const getAllConnections = () => {
    return connectionStorage;
}

// Get the number of connections in the storage
const getConnectionCount = () => {
    return connectionStorage.size;
}

// Checks if the connection exists in the storage
const checkConnection = (nodeId) => {
    return connectionStorage.has(nodeId.toString());
}

//get Consensus leader from the storage
const getLeaderConnection = () => {
    const consensus = session.getConsensus();
    if(!consensus){
        return null;
    }

    const leader = consensus.getLeader();

    if(!leader){
        return null;
    }

    return connectionStorage.get(leader);
}

module.exports = {
    addConnection,
    getConnection,
    removeConnection,
    getAllConnections,
    getConnectionCount,
    checkConnection,
    getLeaderConnection
};