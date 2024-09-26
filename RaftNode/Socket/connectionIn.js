const WebSocket = require('ws');
const {handleMessage} = require('./messageHandler');
const {removeConnection} = require('./connectionStorage');

// Connections from other instances
function connectionIn (fastify){
    const wss = new WebSocket.Server({ server: fastify.server });
    // Handle incoming connections
    wss.on('connection', (ws, req) => {

        // Handle incoming messages
        ws.on('message', (message) => {
            if(Buffer.isBuffer(message)){
                message = message.toString();
            }
            handleMessage(fastify, message, ws);
        });

        // Handle connection close
        ws.on('close', () => {
            removeConnection(ws)
        });

        // Handle errors
        ws.on('error', (error) => {

        });
    });
}
module.exports = connectionIn;