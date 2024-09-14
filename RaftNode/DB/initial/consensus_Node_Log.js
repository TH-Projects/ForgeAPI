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
const insert = async (fastify, query, values) => {
    const client = await fastify.pg.connect();
    try {
        const { rows } = await client.query(query, values);
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

//Insert data into the table with date
const insertWithDate = async (fastify, command, date) => {
    const query = `INSERT INTO ${tableName} (command, commandtime) VALUES ($1, $2) RETURNING id`;
    const values = [command, date];
    console.log('Inserting data command: ', command, ' date: ', date);
    return insert(fastify, query, values);
}


//Insert data into the table without date
const insertWithoutDate = async (fastify, command) => {
    const query = `INSERT INTO ${tableName} (command) VALUES ($1) RETURNING id`;
    const values = [command];
    return insert(fastify, query, values);
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

// Get all data from the table starting from a specific id
const getAllByStartId = async (fastify, startId) => {
    const client = await fastify.pg.connect();
    try {
        const { rows } = await client.query(`SELECT * FROM ${tableName} WHERE id > $1`, [startId]);
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

module.exports = {
    getAll,
    insertWithDate,
    insertWithoutDate,
    getLatestId,
    getAllByStartId
}