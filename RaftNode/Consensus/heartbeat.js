const {getAllConnections, getLeaderConnection, getConnection} = require('../Socket/connectionStorage');
const {consensusTypes} = require('../enums');
const webSocket = require('ws');
const {getLatestId, getAllByStartId, insertWithDate} = require('../DB/consensus_Node_Log');
const {dbInteraction} = require('../DB/dbInteraction');

const sendHeartbeat = async (fastify) => {
    const connections = getAllConnections();
    let logId = await getLatestId(fastify);
    if(!logId.success)
        logId = -1;
    else
        logId = logId.data;
    const message = {
        type: consensusTypes.HEARBEAT,
        payload: {
            serverId: fastify.serverId,
            logId: logId
        }
    }
    for(const connection of connections.values()){
        if(connection.readyState === webSocket.OPEN){
            try {
                connection.send(JSON.stringify(message));
            } catch (error) {
                console.log(error);
            }
        }
    }
}

//handle incoming heartbeat and check current logId
const handleHeartbeat = async (fastify, payload) => {
    const payloadLogId = payload.logId;
    const logId = await getLatestId(fastify);
    if(!logId.success)
        return;
    if(logId.data >= payloadLogId){
        return;
    }
    console.log('Missing log detected LogId: ', logId.data);
    const message = {
        type: consensusTypes.MISSINGLOG,
        payload: {
            serverId: fastify.serverId,
            logId: logId.data
        }
    }
    const leaderConnection = getLeaderConnection();
    if(leaderConnection.readyState === webSocket.OPEN){
        try {
            leaderConnection.send(JSON.stringify(message));
        } catch (error) {
            console.log(error);
        }
    }
}

//handle when a client detects missing log
const handleMissingLog = async (fastify, payload) => {
    const entries = await getAllByStartId(fastify, payload.logId);
    if(!entries.success)
        return;
    const message = {
        type: consensusTypes.APPENDLOG,
        payload: {
            serverId: fastify.serverId,
            entries: entries.data
        }
    }
    const connection = getConnection(payload.serverId);
    if(connection.readyState === webSocket.OPEN){
        try {
            connection.send(JSON.stringify(message));
        } catch (error) {
            console.log(error);
        }
    }
}

//insert missing logs from leader
const insertMissingLog = async (fastify, payload) => {
    const entries = payload.entries.sort((a, b) => a.id - b.id);
    for(const entry of entries){
        const {success} = await insertWithDate(fastify, entry.command, entry.commandtime);
        if(!success)
            return false;
        const commandJson = JSON.parse(entry.command);
        await dbInteraction(fastify, commandJson.query, commandJson.values ?? null);
    }
    return true;
}

module.exports = {
    sendHeartbeat,
    handleHeartbeat,
    handleMissingLog,
    insertMissingLog
};