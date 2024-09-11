-- Erstellen der Tabelle Konsensus_Node_Log
CREATE TABLE Consensus_Node_Log (
    Id SERIAL PRIMARY KEY,
    Command TEXT NOT NULL,
    Commandtime TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO Consensus_Node_Log (Command) VALUES ('CREATE TABLE Konsensus_Node_Log');