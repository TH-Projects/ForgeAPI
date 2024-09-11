const tableName = 'Consensus_Node_Log';

// Get all data from the table
const getAll = async (fastify) => {
    const client = await fastify.pg.connect();
    try {
        const { rows } = await client.query(`SELECT * FROM ${tableName}`);
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
    finally {
        client.release();
    }
}

// Insert data into the table
const insert = async (fastify, command) => {
    const client = await fastify.pg.connect();
    try {
        const { rows } = await client.query(`INSERT INTO ${tableName} (command) VALUES ($1) RETURNING id`, [command]);
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
    finally {
        client.release();
    }
}

// Get the latest id from the table
const getLatestId = async (fastify) => {
    const client = await fastify.pg.connect();
    try {
        const { rows } = await client.query(`SELECT id FROM ${tableName} ORDER BY id DESC LIMIT 1`);
        if(rows.length > 0){
            return {
                success: true,
                data: rows[0].id,
            };
        }
        console.log('Error getting data');
        return {
            success: false
    };
    } catch (err) {
        console.log(err);
        return {
            success: false
        };
    }
    finally {
        client.release();
    }
}

module.exports = {
    getAll,
    insert,
    getLatestId
}