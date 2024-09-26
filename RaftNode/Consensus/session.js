let consensusStorage = null;

let currentLogId = null;

// Add a connection to the storage
const addConsensus = (consensus) => {
    consensusStorage = consensus;
}

//remove consensus from storage
const removeConsensus = () => {
    consensusStorage = null;
}

// Get the consensus from the storage
const getConsensus = () => {
    return consensusStorage;
}

module.exports = {
    addConsensus,
    removeConsensus,
    getConsensus,
    currentLogId
}