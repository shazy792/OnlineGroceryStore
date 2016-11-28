CREATE TABLE creditCard(
    cardNumber  char(16) PRIMARY KEY,
    cvc         char(3)   NOT NULL,
    nameOnCard  varchar(100)  NOT NULL,
    expiryMonth char(2)       NOT NULL,
    expiryYear  char(2)       NOT NULL,
    paymentAddress  int       NOT NULL,
    
    FOREIGN KEY (paymentAddress) REFERENCES address(addressID)
);