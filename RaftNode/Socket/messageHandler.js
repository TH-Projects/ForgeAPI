const {communicationTypes, consensusTypes} = require('../enums');
const {addConnection} = require('./connectionStorage');
const {getConsensus} = require('../Consensus/session');
const {handleLeaderElection, handleVoteResponse, publishLeaderElection} = require('../Consensus/leaderElection');
const {handleHeartbeat, handleMissingLog, insertMissingLog} = require('../Consensus/heartbeat');
const {applyLog} = require('../DB/dbInteraction');
const {handleVotingRequest, handleVotingResponse} = require('../Consensus/consensusVoting');

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
            handleIncomingHeartbeat(fastify, payload);
            break;
        case consensusTypes.MISSINGLOG:
            // Handle the missing log
            handleMissingLog(fastify, payload);
            break;
        case consensusTypes.APPENDLOG:
            // Handle the append log
            insertMissingLog(fastify, payload);
            break;
        case consensusTypes.REQUESTCONSENSUSVOTING:
            // Handle the request consensus voting
            handleVotingRequest(fastify, payload);
            break;
        case consensusTypes.RESPONSECONSENSUSVOTING:
            // Handle the response consensus voting
            handleVotingResponse(payload);
            break;
        case consensusTypes.APPLYLOG:
            // Handle the apply log
            applyLog(fastify, payload.logId);
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

//handle heartbeat and check current logId
const handleIncomingHeartbeat = async (fastify, payload) => {
    const consensus = getConsensus();
    if(consensus){
        consensus.receiveHeartbeat(payload);
        await handleHeartbeat(fastify, payload);
    }
}
module.exports = {
    handleMessage
}