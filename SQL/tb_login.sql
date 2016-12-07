CREATE TABLE login (
    email       varchar(100) NOT NULL PRIMARY KEY,
    password    varchar(500) NOT NULL,
    type        varchar(10)  NOT NULL
);