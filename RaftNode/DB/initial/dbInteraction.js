
// Interact with the database with the given query and values of the consensus leader
const dbInteraction = async (fastify, query, values) => {
    // Check if the payload is empty
    if(!query){
        console.log('Missing data');
        return {
            success: false
        }
    }
    console.log('Query: ', query);
    const client = await fastify.pg.connect();
    try {
        // Check if the payload has parameters
        if(values){
            const { rows } = await client.query(query, values);
            return {
                success: true,
                data: rows,
            };
        }
        const { rows } = await client.query(query);
        console.log('Rows: ', rows);
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
    dbInteraction
}