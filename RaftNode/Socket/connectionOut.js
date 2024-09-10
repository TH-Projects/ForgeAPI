const WebSocket = require('ws');
const {handleMessage} = require('./messageHandler');
const {addConnection} = require('./connectionStorage');
const {communicationTypes} = require('./enums');

// Connections to other instances
const connectionOut = (fastify, url, id) => {
    const ws = new WebSocket(url);

    // Open the connection
    ws.on('open', () => {
        addConnection(id, ws);
        ws.send(createAddConnectionMessage(fastify));
    });

    // Receive messages
    ws.on('message', (message) => {
        handleMessage(message, ws);
    });

    // Close the connection
    ws.on('close', () => {

    });

    // Error handling
    ws.on('error', (error) => {
    });
}

const createAddConnectionMessage = (fastify) => {
    return JSON.stringify({
        type: communicationTypes.ADDCONNECTION,
        payload: {
            nodeId: fastify.serverId
        }
    });
}

module.exports = connectionOut;