const {communicationTypes, consensusTypes} = require('../enums');
const {addConnection} = require('./connectionStorage');
const {getConsensus} = require('../Consensus/session');
const {handleLeaderElection, handleVoteResponse, publishLeaderElection} = require('../Consensus/leaderElection');
//handles the messages from connectionIn and connectionOut
const handleMessage = (fastify, message, ws) => {
    console.log(`Received message: ${message}`);
    const jsonMessage = JSON.parse(message);
    const type = jsonMessage.type;
    const payload = jsonMessage.payload;
    // Check if the message is valid
    if(!type || !payload){
        console.log('Invalid message');
    }
    // Handle the message based on the type
    switch (type){
        case communicationTypes.ADDCONNECTION:
            // Add the connection to the connectionStorage
            addConnection(payload.nodeId, ws);
            break;
        case consensusTypes.LEADERELECTION:
            handleIncomingLeaderElection(fastify, jsonMessage.payload)
            break;
        case consensusTypes.VOTERESPONSE:
            // Handle the vote response
            if(handleVoteResponse(fastify, payload)){
                updateLeader(fastify.serverId);
                publishLeaderElection(fastify);
            }
            break;
        case consensusTypes.ELECTIONRESULT:
            // Handle the election result
            updateLeader(payload.serverId);
            break;
        case consensusTypes.HEARBEAT:
            // Handle the heartbeat
            const consensus = getConsensus();
            if(consensus){
                consensus.receiveHeartbeat(payload);
            }
            break;
        default:
            console.log('Invalid message type');
    }
}

// Handle the leader election
const handleIncomingLeaderElection = async (fastify, payload) => {
    const consensus = getConsensus();
    if(consensus){
        await handleLeaderElection(fastify, payload);
    }
}

//Update the leader
const updateLeader = (serverId) => {
    const consensus = getConsensus();
    if(consensus){
        consensus.stopsSelectLeaderTimeout();
        consensus.setLeader(serverId);
    }

}

module.exports = {
    handleMessage
}