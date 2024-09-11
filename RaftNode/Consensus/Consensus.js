class Consensus{
    constructor() {
        //Define Timeout durations
        this.heartbeatTimeoutDuration = 500;
        this.voteTimeoutDuration = 1500;

        //Define Timeouts
        this.selectLeaderTimeout = null;
        this.heartbeatTimeout = null;
        this.voteTimeout = null;

        //Define Consensus Variables
        this.leader = null;


        //Call initial Methods
        this.startsSelectLeaderTimeout();
        this.startsHeartbeatTimeout();
        this.startsVoteTimeout();

    }

    //Returns a random Timeout Duration for Select Leader
    getLeaderTimeoutDuration() {
        return Math.floor(Math.random() * (1000 - 200 + 1)) + 200;
    }

    //Starts the Select Leader Timeout
    startsSelectLeaderTimeout() {
        if(this.selectLeaderTimeout) {
            clearTimeout(this.selectLeaderTimeout);
        }
        if(this.leader) {
            return;
        }
        this.selectLeaderTimeout = setTimeout(() => {
            this.selectLeader();
        }, this.getLeaderTimeoutDuration());
    }

    //Starts the Heartbeat Timeout
    startsHeartbeatTimeout() {
        if(this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
        }
        if(!this.leader) {
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
        if(this.leader) {
            return;
        }
        this.voteTimeout = setTimeout(() => {
            this.vote();
        }, this.voteTimeoutDuration);
    }

    //Starts the Select Leader Routine
    selectLeader() {
        console.log('Selecting Leader');
        this.startsSelectLeaderTimeout();
        this.startsVoteTimeout();
    }

    //Starts the Send Heartbeat Routine
    sendHeartbeat() {
        console.log('Sending Heartbeat');
        this.startsHeartbeatTimeout();
    }

    //Starts the Vote Routine
    vote() {
        console.log('Voting');
    }

    //Recieves Heartbeat
    recieveHeartbeat() {
        console.log('Recieved Heartbeat');
        this.startsHeartbeatTimeout();
        this.startsSelectLeaderTimeout();
    }
}

module.exports = Consensus;