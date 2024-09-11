let consensusStorage = null;

// Add a connection to the storage
const addConsensus = (consensus) => {
    consensusStorage = consensus;
}

//remove consensus from storage
const removeConsensus = () => {
    consensusStorage = null;
}

module.exports = {
    addConsensus,
    removeConsensus
}