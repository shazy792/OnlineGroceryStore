CREATE TABLE customer (
    customerId  int     PRIMARY KEY,
    firstName   varchar(25) NOT NULL,
    lastName    varchar(25) NOT NULL,
    email       varchar(100) NOT NULL,
    balance     float ,
    addressId   int,
    cardNumber  char(16),

    FOREIGN KEY (addressId) REFERENCES address(addressId),
    FOREIGN KEY (cardNumber) REFERENCES creditCard(cardNumber)
);
