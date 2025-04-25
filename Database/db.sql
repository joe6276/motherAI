

CREATE DATABASE motherai


USE motherai

GO

DROp TABLE Records

CREATE TABLE Records (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    originalCommand TEXT,
    parsedTask TEXT,
    channel VARCHAR(200),
    status VARCHAR(200),
    output TEXT,
    Timestamp DATETIME DEFAULT GETDATE()
);

CREATE OR ALTER PROCEDURE InsertRecord
    @originalCommand TEXT,
    @parsedTask TEXT,
    @channel VARCHAR(200),
    @status VARCHAR(200),
    @output TEXT
AS
BEGIN
    INSERT INTO Records (originalCommand, parsedTask, channel, status, output)
    VALUES (@originalCommand, @parsedTask, @channel, @status, @output);
END;


CREATE PROCEDURE GetAllRecords
AS
BEGIN
    SELECT Id, originalCommand, parsedTask, status, output, Timestamp
    FROM Records;
END;
