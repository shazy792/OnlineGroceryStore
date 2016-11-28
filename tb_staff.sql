CREATE TABLE staff (
    staffId     int PRIMARY KEY,
    firstName   varchar(25) NOT NULL,
    lastName    varchar(25) NOT NULL,
    email       varchar(100) NOT NULL,
    salary      float ,
    title       varchar(25),
    addressId   int,

    FOREIGN KEY (addressId) REFERENCES address(addressId)
);
