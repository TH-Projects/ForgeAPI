const {consensusTypes, dbMethods} = require('../enums');
const {getAllConnections, getConnectionCount} = require('../Socket/connectionStorage');
const crypto = require('crypto');

const votes = new Map();
let ownHash = null;
let data = null;

const get = (query, values) => {
    votes.clear();
    const connections = getAllConnections();
    const message = {
        type: consensusTypes.REQUESTCONSENSUSVOTING,
        payload: {
            method: dbMethods.GET,
            query: query,
            values: values
        }
    }
    //TODO: set own hash and data
    sendMessageToAllNodes(message);
}

const post = (query, values) => {
    votes.clear();
    const connections = getAllConnections();
    const message = {
        type: consensusTypes.REQUESTCONSENSUSVOTING,
        payload: {
            method: dbMethods.POST,
            query: query,
            values: values
        }
    }
    //TODO: set own hash and data
    sendMessageToAllNodes(message);
}

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

const handleVotingResponse = (payload) => {
    const hash = generateHash(payload.result);
    const voteCountsByHash = votes.get(hash) ?? 0;
    let maxVotes = 0;
    let maxKey = null;
    let totalVotes = 0;
    votes.set(hash , voteCountsByHash + 1);
    votes.forEach((key, value) => {
        totalVotes += value;
        if (value > maxVotes) {
            maxVotes = value;
            maxKey = key;
        }
    });
    const connectionCount = getConnectionCount();
    if(totalVotes === connectionCount){
        const voteCount = Array.from(votes.values()).filter((value) => value === true).length;
        if(voteCount > connectionCount / 2){
            if(maxKey === ownHash){
                // Success
                return {
                    success: true,
                    data: data
                }
            }
        }
        return{
            success: false
        }
    }
}

// Generate a hash from the data
const generateHash = (data) => {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

module.exports = {
    get,
    post
}