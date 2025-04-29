

CREATE DATABASE motherai


use motherai


DROP TABLE Records
CREATE TABLE Records (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    originalCommand TEXT,
    parsedTask TEXT,
    channel VARCHAR(200),
    status VARCHAR(200),
    UserId INT,
    output TEXT,
    Timestamp DATETIME DEFAULT GETDATE()
);

CREATE OR ALTER PROCEDURE InsertRecord
    @originalCommand TEXT,
    @parsedTask TEXT,
    @channel VARCHAR(200),
    @status VARCHAR(200),
    @output TEXT,
    @UserId INT
AS
BEGIN
    INSERT INTO Records (originalCommand, parsedTask, channel, status, output,UserId)
    VALUES (@originalCommand, @parsedTask, @channel, @status, @output,@UserId);
END;




CREATE PROCEDURE GetAllRecords
AS
BEGIN
    SELECT Id, originalCommand, parsedTask, status, output, Timestamp
    FROM Records;
END;



CREATE OR ALTER PROCEDURE GetUserRecords(@UserId INT)
AS
BEGIN
    SELECT *  FROM Records WHERE UserId = @UserId;
END;


-- Create the Company table
CREATE TABLE Company (
    Id INT PRIMARY KEY IDENTITY(1,1),
    CompanyName VARCHAR(255) NOT NULL
);

-- Create the Users table
CREATE TABLE Users (
    Id INT PRIMARY KEY IDENTITY(1,1),
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Role VARCHAR(50) DEFAULT 'Employee',
    CompanyId INT,
    CreatedAt DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (CompanyId) REFERENCES Company(Id)
);


CREATE PROCEDURE AddCompany
    @CompanyName VARCHAR(255)
AS
BEGIN
    INSERT INTO Company (CompanyName)
    VALUES (@CompanyName);
END


CREATE PROCEDURE GetAllCompanies
AS
BEGIN
    SELECT * FROM Company;
END



CREATE PROCEDURE AddUser
    @FirstName VARCHAR(100),
    @LastName VARCHAR(100),
    @Email VARCHAR(255),
    @Password VARCHAR(255),
    @Role VARCHAR(50),
    @CompanyId INT
AS
BEGIN
    INSERT INTO Users (FirstName, LastName, Email, Password, Role, CompanyId)
    VALUES (@FirstName, @LastName, @Email, @Password, @Role, @CompanyId);
END


CREATE PROCEDURE GetAllUsers
AS
BEGIN
    SELECT 
       *
    FROM 
        Users U
    LEFT JOIN Company C ON U.CompanyId = C.Id;
END



CREATE PROCEDURE GetUserById
    @UserId INT
AS
BEGIN
    SELECT 
     *
    FROM 
        Users U
    LEFT JOIN Company C ON U.CompanyId = C.Id
    WHERE U.Id = @UserId;
END


CREATE PROCEDURE UpdateUser
    @UserId INT,
    @FirstName VARCHAR(100),
    @LastName VARCHAR(100),
    @Email VARCHAR(255),
    @Password VARCHAR(255),
    @Role VARCHAR(50),
    @CompanyId INT
AS
BEGIN
    UPDATE Users
    SET 
        FirstName = @FirstName,
        LastName = @LastName,
        Email = @Email,
        Password = @Password,
        Role = @Role,
        CompanyId = @CompanyId
    WHERE Id = @UserId;
END


CREATE PROCEDURE DeleteUser
    @UserId INT
AS
BEGIN
    DELETE FROM Users
    WHERE Id = @UserId;
END


CREATE PROCEDURE  getUserByEmail(@Email VARCHAR(150))
AS
BEGIN
 SELECT * FROM Users WHERE Email = @Email
END



EXEC getUserByEmail 'joendambuki16@gmail.com'