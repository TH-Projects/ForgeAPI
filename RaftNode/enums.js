
// Possible communication types between nodes
const communicationTypes = Object.freeze({
    ADDCONNECTION: "ADDCONNECTION"
});

const consensusTypes = Object.freeze({
    VOTERESPONSE: "VOTERESPONSE",
    LEADERELECTION: "LEADERELECTION",
    HEARBEAT: "HEARBEAT",
    ELECTIONRESULT: "ELECTIONRESULT",
    MISSINGLOG: "MISSINGLOG",
    APPENDLOG: "APPENDLOG",
    REQUESTCONSENSUSVOTING: "REQUESTCONSENSUSVOTING",
    RESPONSECONSENSUSVOTING: "RESPONSECONSENSUSVOTING",
    APPLYLOG: "APPLYLOG",
    DELETELOG: "DELETELOG"
});

const dbMethods = Object.freeze({
    GET: "GET",
    POST: "POST"
});


module.exports = {
    communicationTypes,
    consensusTypes,
    dbMethods
}