
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
const removeConnection = (nodeId) => {
    connectionStorage.delete(nodeId.toString());
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

module.exports = {
    addConnection,
    getConnection,
    removeConnection,
    getAllConnections,
    getConnectionCount,
    checkConnection
};