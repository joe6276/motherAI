

CREATE DATABASE motherai


use motherai


DROP TABLE Records
CREATE TABLE Records (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    originalCommand TEXT,
    parsedTask TEXT,
    channel VARCHAR(200),
    status VARCHAR(200),
    UserId VARCHAR(200),
   
    output TEXT,
    Timestamp DATETIME DEFAULT GETDATE()
);

CREATE OR ALTER PROCEDURE InsertRecord
    @originalCommand TEXT,
    @parsedTask TEXT,
    @channel VARCHAR(200),
    @status VARCHAR(200),
    @output TEXT,
    @UserId VARCHAR(200),
AS
BEGIN
    INSERT INTO Records (originalCommand, parsedTask, channel, status, output,UserId)
    VALUES (@originalCommand, @parsedTask, @channel, @status, @output,@UserId);
END;



CREATE OR ALTER PROCEDURE GetAllRecords
AS
BEGIN
    SELECT *
    FROM Records;
END;



CREATE OR ALTER PROCEDURE GetUserRecords(@UserId VARCHAR(200))
AS
BEGIN
    SELECT *  FROM Records WHERE UserId = @UserId;
END;


-- Create the Company table
CREATE TABLE Company (
    Id INT PRIMARY KEY IDENTITY(1,1),
    CompanyName VARCHAR(255) NOT NULL
);

DROp TABLE Users
-- Create the Users table
CREATE TABLE Users (
    Id INT PRIMARY KEY IDENTITY(1,1),
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Role VARCHAR(50) DEFAULT 'Employee',
    CompanyId INT,
   
    Occupation VARCHAR()
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CompanyId) REFERENCES Company(Id)
);

ALTER TABLE Users
ADD   Department VARCHAR(255);


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



CREATE OR ALTER PROCEDURE AddUser
    @FirstName VARCHAR(100),
    @LastName VARCHAR(100),
    @Email VARCHAR(255),
    @Password VARCHAR(255),
    @Role VARCHAR(50),
    @CompanyId INT,
    @Occupation VARCHAR(200),
    @Department VARCHAR(255)
AS
BEGIN
    INSERT INTO Users (FirstName, LastName, Email, Password, Role, CompanyId, Occupation,  Department)
    VALUES (@FirstName, @LastName, @Email, @Password, @Role, @CompanyId, @Occupation, @Department);
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


CREATE OR ALTER PROCEDURE UpdateUser
    @UserId INT,
    @FirstName VARCHAR(100),
    @LastName VARCHAR(100),
    @Email VARCHAR(255),
    @Password VARCHAR(255),
    @Role VARCHAR(50),
    @CompanyId INT,
    @Occupation VARCHAR(200),
    @Department VARCHAR(255)
AS
BEGIN
    UPDATE Users
    SET 
        FirstName = @FirstName,
        LastName = @LastName,
        Email = @Email,
        Password = @Password,
        Role = @Role,
        CompanyId = @CompanyId,
        Occupation=@Occupation,
        Department= @Department

    WHERE Id = @UserId;
END


CREATE PROCEDURE DeleteUser
    @UserId INT
AS
BEGIN
    DELETE FROM Users
    WHERE Id = @UserId;
END


CREATE OR ALTER PROCEDURE GetAdmin
    @CompanyId INT
AS
BEGIN
SELECT FirstName,LastName,Email  FROM Users WHERE CompanyId=@CompanyId AND Role ='admin'

END

CREATE OR ALTER PROCEDURE  getUserByEmail(@Email VARCHAR(150))
AS
BEGIN
 SELECT * FROM Users WHERE Email = @Email
END

CREATE OR ALTER PROCEDURE getUserById(@Id INT)
AS
BEGIN
 SELECT FirstName,LastName,Email ,Occupation FROM Users WHERE Id = @Id
END


EXEC getUserByEmail '2'

 SELECT FirstName,LastName,Email ,Occupation FROM Users WHERE Id='3'
EXEC getUserByEmail 'joendambuki16@gmail.com'


CREATE TABLE userSessions(
    Id INT PRIMARY KEY IDENTITY,
    Username VARCHAR(200),
    CreatedAt DATETIME DEFAULT GETDATE(),
)


CREATE PROCEDURE CreateOrUpdateUserSession
    @Username VARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM userSessions WHERE Username = @Username)
    BEGIN
        -- Update CreatedAt if the user already exists
        UPDATE userSessions
        SET CreatedAt = GETDATE()
        WHERE Username = @Username;
    END
    ELSE
    BEGIN
        -- Insert new session
        INSERT INTO userSessions (Username)
        VALUES (@Username);
    END
END;


CREATE PROCEDURE GetUserSessionByUsername
    @Username VARCHAR(200)
AS
BEGIN
    SELECT * 
    FROM userSessions
    WHERE Username = @Username
END



CREATE Table Documents (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CompanyId INT,
    Department VARCHAR(255),
    DocumentURL VARCHAR(255),
    FOREIGN KEY (CompanyId) REFERENCES Company(Id)
)

CREATE OR ALTER PROCEDURE addDocument(
    @CompanyId INT,
    @Department VARCHAR(255),
    @DocumentURL VARCHAR(255)
)
AS
BEGIN

INSERT INTO Documents(CompanyId, Department, DocumentURL)
VALUES(@CompanyId,@Department, @DocumentURL)
END



CREATE OR ALTER PROCEDURE GetDocuments(
    @CompanyId INT,
    @Department VARCHAR(255)
)
AS
BEGIN
SELECT DocumentURL FROM Documents WHERE CompanyId=@CompanyId AND Department= @Department
END

