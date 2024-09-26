-- Erstellen der Tabelle Konsensus_Node_Log
USE konsensus_db;

CREATE TABLE Consensus_Node_Log (
    id SERIAL PRIMARY KEY,
    command TEXT NOT NULL
);

CREATE TABLE TEST (
    Id SERIAL PRIMARY KEY,
    abc INT NOT NULL
);

INSERT INTO Consensus_Node_Log (Command)
VALUES ('CREATE TABLE Konsensus_Node_Log');