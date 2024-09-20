const {consensusTypes, dbMethods} = require('../enums');
const {getAllConnections, getConnectionCount, getConnection} = require('../Socket/connectionStorage');
const crypto = require('crypto');
const webSocket = require('ws');
const {dbInteraction} = require('../DB/dbInteraction');
const {getConsensus} = require('./session');
const {insert} = require('../DB/consensus_Node_Log');

const votes = new Map();
let ownHash = null;
let data = null;

// Hande a REST Request which is a SELECT DB-request
const get = async (fastify, query, values = null) => {
    // Check if the node is the leader
    const leader = checkLeaderStatus(fastify);
    if(leader !== -1){
        return {
            success: false,
            data: 'Not the leader! Leader is: ' + leader
        }
    }
    votes.clear();
    const message = {
        type: consensusTypes.REQUESTCONSENSUSVOTING,
        payload: {
            method: dbMethods.GET,
            query: query,
            values: values
        }
    }
    sendMessageToAllNodes(message);

    data = await dbInteraction(fastify, query, values);
    ownHash = generateHash(data);

    return await waitForResponse();
}

// Hande a REST Request which is NOT a SELECT DB-request
// First send message to all Nodes to create a Log Entry
// Second create own Data and Hash
// Third wait for all Nodes to respond
// Fourth send message to all Nodes to apply the Log
const post = async (fastify, query, values) => {
    const leader = checkLeaderStatus(fastify);
    if(leader !== -1){
        return {
            success: false,
            data: 'Not the leader! Leader is: ' + leader
        }
    }

    votes.clear();

    // Send the request to all nodes to add a new Entry in the Log Table
    let message = {
        type: consensusTypes.REQUESTCONSENSUSVOTING,
        payload: {
            method: dbMethods.POST,
            query: query,
            values: values
        }
    }

    sendMessageToAllNodes(message);

    // Set own Data
    data = await insert(fastify, {query: query, values: values});
    ownHash = generateHash(data);

    const response = await waitForResponse();
    if(!response.success){
        //TODO: revert log for other nodes
        return {
            success: false,
            data: 'Consensus failed'
        }
    }

    // Send the message to all nodes to apply the log
    message = {
        type: consensusTypes.APPLYLOG,
        payload: {
            logId: data.data
        }
    }

    const dbInteractionResponse = await dbInteraction(fastify, query, values);
    if(!dbInteractionResponse.success){
        //TODO: revert log for other nodes
        return {
            success: false,
            data: 'Error inserting data'
        }
    }

    sendMessageToAllNodes(message);

    return {
        success: true,
        data: dbInteractionResponse.data
    }
}

// Send a given message to all nodes
const sendMessageToAllNodes = (message) => {
    const connections = getAllConnections();
    for(const [key, value] of connections){
        if(value.readyState === webSocket.OPEN){
            try {
                value.send(JSON.stringify(message));
            } catch (error) {
                console.log(error);
            }
        }
    }
}

// Sets the voting response in the voting map
const handleVotingResponse = (payload) => {
    const hash = payload.result;
    const voteCountsByHash = votes.get(hash) ?? 0;
    votes.set(hash , voteCountsByHash + 1);
}

// Handle the voting request
const handleVotingRequest = async (fastify, payload) => {
    if(payload.method === dbMethods.GET){
        const dbData = await dbInteraction(fastify, payload.query, payload.values);
        const hash = generateHash(dbData);
        await responseVoting(fastify, hash);
    }
    else if(payload.method === dbMethods.POST){
        const response = await insert(fastify, {query: payload.query, values: payload.values});
        const hash = generateHash(response);
        await responseVoting(fastify, hash);
    }
}

// Generate and send a response to the voting request
const responseVoting = async (fastify, hash) => {
    const consensus = getConsensus();
    const leader = consensus.getLeader();
    const message = {
        type: consensusTypes.RESPONSECONSENSUSVOTING,
        payload: {
            result: hash
        }
    }

    const connection = getConnection(leader);
    if(connection.readyState === webSocket.OPEN){
        try {
            connection.send(JSON.stringify(message));
        } catch (error) {
            console.log(error);
        }
    }
}

// Wait for all nodes to respond
const waitForResponse = async () => {
    while (true) {
        let maxVotes = 0;
        let maxKey = null;
        let totalVotes = 0;
        //Answers
        // Calculate the total votes and the maximum votes
        votes.forEach((value, key) => {
            totalVotes += value;
            if (value > maxVotes) {
                maxVotes = value;
                maxKey = key;
            }
        });
        // Check if all connections have voted
        const connectionCount = getConnectionCount();
        if(totalVotes === connectionCount){
            // Check if the majority has voted for the same hash
            if(maxVotes >= connectionCount / 2){
                // Check if the hash is the same as the leader hash
                if(maxKey === ownHash){
                    // Success
                    return {
                        success: true,
                        data: data.data
                    }
                }
            }
            return{
                success: false,
                data: 'Consensus failed not enough votes'
            }
        }
        await new Promise(resolve => setTimeout(resolve, 50));
    }
}

// Generate a hash from the data
const generateHash = (data) => {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

// Only the leader is allowed to accept REST requests
const checkLeaderStatus = (fastify) => {
    const consensus = getConsensus();
    const leader = consensus.getLeader();
    if(leader === fastify.serverId){
        return -1;
    }
    return leader;
}

module.exports = {
    get,
    post,
    responseVoting,
    handleVotingResponse,
    handleVotingRequest
}