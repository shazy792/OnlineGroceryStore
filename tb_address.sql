CREATE TABLE address (
  addressId   int           PRIMARY KEY,
  street      varchar(100)  NOT NULL,
  city        varchar(25)   NOT NULL, 
  state       char(2)       NOT NULL,
  zipcode     varchar(15)   NOT NULL
);