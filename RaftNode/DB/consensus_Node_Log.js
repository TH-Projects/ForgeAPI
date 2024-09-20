const {getConnection} = require('./connection');

const tableName = 'Consensus_Node_Log';

// Get all data from the table
const getAll = async (fastify) => {
    try {
        const db = await getConnection(fastify);
        const [ rows ] = await db.query(`SELECT * FROM ${tableName}`);
        db.release();
        return {
            success: true,
            data: rows,
        };
    } catch (err) {
        console.log(err);
        return {
            success: false
        };
    }
}

// Insert data into the table
const insert = async (fastify, command) => {
    try {
        const query = `INSERT INTO ${tableName} (command) VALUES (?) RETURNING id`;
        const values = [command];
        const db = await getConnection(fastify);
        const rows = await db.query(query, values);
        db.release();
        console.log('Rows: ', rows);
        if(rows.length > 0){
            return {
                success: true,
                data: rows[0].id,
            };
        }
        console.log('Error inserting data');
        return {
            success: false
    };
    } catch (err) {
        console.log(err);
        return {
            success: false
        };
    }
}

// Get the latest id from the table
const getLatestId = async (fastify) => {
    try {
        const db = await getConnection(fastify);
        const [ rows ] = await db.query(`SELECT id FROM ${tableName} ORDER BY id DESC LIMIT 1`);
        db.release();
        if(rows){
            return {
                success: true,
                data: rows.id,
            };
        }
        return {
            success: true,
            data: 0,
    };
    } catch (err) {
        console.log(err);
        return {
            success: false
        };
    }
}

// Get all data from the table starting from a specific id
const getAllByStartId = async (fastify, startId) => {
    try {
        const db = await getConnection(fastify);
        const [ rows ] = await db.query(`SELECT * FROM ${tableName} WHERE id > ?`, [startId]);
        db.release();
        return {
            success: true,
            data: Array.of(rows),
        };
    } catch (err) {
        console.log(err);
        return {
            success: false
        };
    }
}

const getById = async (fastify, id) => {
    try {
        const db = await getConnection(fastify);
        const [ rows ] = await db.query(`SELECT * FROM ${tableName} WHERE id = ?`, [id]);
        console.log('RowsByID: ', rows);
        db.release();
        return {
            success: true,
            data: Array.of(rows),
        };
    } catch (err) {
        console.log(err);
        return {
            success: false
        };
    }
}

module.exports = {
    getAll,
    insert,
    getLatestId,
    getAllByStartId,
    getById
}