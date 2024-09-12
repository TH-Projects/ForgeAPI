const {startLeaderElection} = require('./leaderElection');
const {sendHeartbeat} = require('./heartbeat');

class Consensus{
    constructor(fastify) {
        //Define Timeout durations
        this.heartbeatTimeoutDuration = 500;
        this.voteTimeoutDuration = 2000;

        //Define Timeouts
        this.selectLeaderTimeout = null;
        this.heartbeatTimeout = null;
        this.voteTimeout = null;

        //Define Consensus Variables
        this.leader = null;
        this.fastify = fastify;


        //Call initial Methods
        this.startsVoteTimeout();
        this.startsHeartbeatTimeout();

    }

    //Returns a random Timeout Duration for Select Leader
    getLeaderTimeoutDuration() {
        return Math.floor(Math.random() * (1500 - 1000 + 1)) + 200;
    }

    //Starts the Select Leader Timeout
    startsSelectLeaderTimeout() {
        if(this.selectLeaderTimeout) {
            clearTimeout(this.selectLeaderTimeout);
        }
        this.selectLeaderTimeout = setTimeout(() => {
            this.selectLeader();
        }, this.getLeaderTimeoutDuration());
    }

    //stops the Select Leader Timeout
    stopsSelectLeaderTimeout() {
        if(this.selectLeaderTimeout) {
            clearTimeout(this.selectLeaderTimeout);
        }
    }

    //Starts the Heartbeat Timeout
    startsHeartbeatTimeout() {
        if(this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
        }
        if(!this.leader || this.leader.toString() !== this.fastify.serverId.toString()) {
            return;
        }
        this.heartbeatTimeout = setTimeout(() => {
            this.sendHeartbeat();
        }, this.heartbeatTimeoutDuration);
    }

    //Starts the Vote Timeout
    startsVoteTimeout() {
        if(this.voteTimeout) {
            clearTimeout(this.voteTimeout);
        }
        this.voteTimeout = setTimeout(() => {
            this.vote();
        }, this.voteTimeoutDuration);
    }

    //Starts the Select Leader Routine
    async selectLeader() {
        console.log('Selecting Leader');
        await startLeaderElection(this.fastify);
    }

    //Starts the Send Heartbeat Routine
    sendHeartbeat() {
        this.startsHeartbeatTimeout();
        if(!this.leader || this.leader.toString() !== this.fastify.serverId.toString()) {
            return;
        }
        console.log('Sending Heartbeat');
        sendHeartbeat(this.fastify);
    }

    //Starts the Vote Routine
    vote() {
        if(this.leader && this.leader.toString() === this.fastify.serverId.toString()) {
            return;
        }
        this.startsVoteTimeout();
        console.log('Voting');
        this.startsSelectLeaderTimeout();
    }

    //Receives Heartbeat
    receiveHeartbeat(payload) {
        console.log('Recieved Heartbeat');
        if(!this.leader){
            this.setLeader(payload.serverId);
        }
        this.startsVoteTimeout();
    }

    //sets the leader
    setLeader(leader) {
        console.log('Leader is: ', leader);
        this.leader = leader;
        this.startsHeartbeatTimeout();
    }

    //gets the leader
    getLeader() {
        return this.leader;
    }

    //checks if the Id is the leader
    checkLeader(Id) {
        if(!this.leader) {
            return false;
        }
        return this.leader.toString() === Id.toString();
    }

    //removes the leader
    removeLeader() {
        this.leader = null;
    }

}

module.exports = Consensus;