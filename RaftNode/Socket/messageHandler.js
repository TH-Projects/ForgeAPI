const {communicationTypes} = require('./enums');
const {addConnection} = require('./connectionStorage');
//handles the messages from connectionIn and connectionOut
const handleMessage = (message, ws) => {
    console.log(`Received message: ${message}`);
    const jsonMessage = JSON.parse(message);
    const type = jsonMessage.type;
    const payload = jsonMessage.payload;
    // Check if the message is valid
    if(!type || !payload){
        console.log('Invalid message');
    }
    // Handle the message based on the type
    console.log(type);
    switch (type){
        case communicationTypes.ADDCONNECTION:
            // Add the connection to the connectionStorage
            addConnection(payload.nodeId, ws);
            break;
        default:
            console.log('Invalid message type');
    }
}

module.exports = {
    handleMessage
}