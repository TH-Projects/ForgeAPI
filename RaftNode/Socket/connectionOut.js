const WebSocket = require('ws');
const {handleMessage} = require('./messageHandler');
const {addConnection, removeConnection} = require('./connectionStorage');
const {communicationTypes} = require('../enums');

// Connections to other instances
const connectionOut = (fastify, url, id) => {
    const ws = new WebSocket(url);

    // Open the connection
    ws.on('open', () => {
        addConnection(id, ws);
        if(ws.readyState === WebSocket.OPEN){
            ws.send(createAddConnectionMessage(fastify));
        }
    });

    // Receive messages
    ws.on('message', (message) => {
        if(Buffer.isBuffer(message)){
            message = message.toString();
        }
        handleMessage(fastify, message, ws);
    });

    // Close the connection
    ws.on('close', () => {
        removeConnection(ws)
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