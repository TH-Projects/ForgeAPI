
// Possible communication types between nodes
const communicationTypes = Object.freeze({
    ADDCONNECTION: "ADDCONNECTION",
});

const consensusTypes = Object.freeze({
    VOTERESPONSE: "VOTERESPONSE",
    LEADERELECTION: "LEADERELECTION",
    HEARBEAT: "HEARBEAT",
    ELECTIONRESULT: "ELECTIONRESULT"
});

module.exports = {
    communicationTypes,
    consensusTypes
}