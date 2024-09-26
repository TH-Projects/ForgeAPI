const { getConnection } = require('./connection');
const {getById} = require('./consensus_Node_Log');
let {currentLogId} = require("../Consensus/session");

// Interact with the database with the given query and values of the consensus leader
const dbInteraction = async (fastify, query, values) => {
    // Check if the payload is empty
    if(!query){
        console.log('Missing data');
        return {
            success: false,
            data: 'Missing data'
        }
    }
    console.log('Query: ', query, 'Values: ', values);
    try {
        const db = await getConnection(fastify);
        // Check if the payload has parameters
        if(values){
            const rows = await db.query(query, values);
            console.log('Rows with value: ', rows);
            db.release();
            return {
                success: true,
                data: rows,
            };
        }
        const rows = await db.query(query);
        db.release();
        console.log('Rows: ', rows);
        return {
            success: true,
            data: rows,
        };
    } catch (err) {
        console.log(err);
        return {
            success: false,
            data: 'Missing data'
        };
    }
}

const applyLog = async (fastify, logId) => {
    const log = await getById(fastify, logId);
    if(!log.success || !log.data || log.data.length === 0)
        return;
    console.log('Log: ', log);
    const command = log.data[0].command;
    console.log('Command: ', command);
    const commandJson = JSON.parse(command);
    await dbInteraction(fastify, commandJson.query, commandJson.values ?? null);
    currentLogId = null;
}

module.exports = {
    dbInteraction,
    applyLog
}