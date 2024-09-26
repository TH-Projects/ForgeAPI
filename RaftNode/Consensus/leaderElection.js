const {getAllConnections, getConnection, getConnectionCount} = require('../Socket/connectionStorage');
const {consensusTypes} = require('../enums');
const {getLatestId} = require('../DB/consensus_Node_Log');
const webSocket = require('ws');
const {getConsensus} = require('./session');

// Map to store the votes
const votes = new Map();

// Start the leader election
const startLeaderElection = async (fastify) => {
    votes.clear();
    const connections = getAllConnections();
    const serverId = fastify.serverId;
    const logId = await getLatestId(fastify);
    if(!logId.success)
        return;
    const message = {
        type: consensusTypes.LEADERELECTION,
        payload: {
            serverId: serverId,
            logId: logId.data
        }
    }
    for (const [key, value] of connections) {
        if(value.readyState === webSocket.OPEN){
            try {
                value.send(JSON.stringify(message));
            } catch (error) {
                console.log(error);
            }
        }
    }
}

// Vote for the leader
const voteForLeader = async (fastify, serverId, acceptLeader) => {
    const message = {
        type: consensusTypes.VOTERESPONSE,
        payload: {
            serverId: fastify.serverId,
            acceptLeader: acceptLeader
        }
    }
    const connection = getConnection(serverId);
    if(connection.readyState === webSocket.OPEN){
        try {
            connection.send(JSON.stringify(message));
        } catch (error) {
            console.log(error);
        }
    }
}

// Handle the leader election
const handleLeaderElection = async (fastify, payload) => {
    const payloadLogId = payload.logId;
    const logId = await getLatestId(fastify);
    if(!logId.success)
        return;
    let acceptLeader = false;
    if(payloadLogId >= logId.data){
        // Vote for Leader
        acceptLeader = true;
    }
    await voteForLeader(fastify, payload.serverId, acceptLeader);
}

// Handle the vote response
const handleVoteResponse = (fastify, payload) => {
    votes.set(payload.serverId, payload.acceptLeader);
    const connectionCount = getConnectionCount();
    if(votes.size === connectionCount){
        let acceptLeader = false;
        const voteCount = Array.from(votes.values()).filter((value) => value === true).length;
        console.log('Vote Count: ', voteCount, ' Connection Count: ', connectionCount);
        if(voteCount > connectionCount / 2)
            acceptLeader = true;
        const consensus = getConsensus();
        if(consensus && consensus.getLeader()){
            return false;
        }
        if(acceptLeader){
            console.log('I am the leader');
        }
        return acceptLeader;
    }
    return false;
}

// Publish the leader election to all the nodes
const publishLeaderElection = async (fastify) => {
    const connections = getAllConnections();
    const serverId = fastify.serverId;
    const message = {
        type: consensusTypes.ELECTIONRESULT,
        payload: {
            serverId: serverId
        }
    }
    for (const [key, value] of connections) {
        if(value.readyState === webSocket.OPEN){
            try {
                value.send(JSON.stringify(message));
            } catch (error) {
                console.log(error);
            }
        }
    }
}

module.exports = {
    startLeaderElection,
    handleLeaderElection,
    handleVoteResponse,
    publishLeaderElection
};