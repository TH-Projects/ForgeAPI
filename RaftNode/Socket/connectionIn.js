const WebSocket = require('ws');
const {handleMessage} = require('./messageHandler');

// Connections from other instances
function connectionIn (fastify){
    const wss = new WebSocket.Server({ server: fastify.server });
    // Handle incoming connections
    wss.on('connection', (ws, req) => {

        // Handle incoming messages
        ws.on('message', (message) => {
            handleMessage(message, ws);
        });

        // Handle connection close
        ws.on('close', () => {

        });

        // Handle errors
        ws.on('error', (error) => {

        });
    });
}
module.exports = connectionIn;