CREATE TABLE orderInfo(
    orderId           int  PRIMARY KEY,
    customerId        int  NOT NULL,
    cardNumber        char(16),
    orderDate         float,
    status            varchar(25),
 
    
    FOREIGN KEY (customerId) REFERENCES customer(customerId),
    FOREIGN KEY (cardNumber) REFERENCES creditcard(cardNumber)
);

