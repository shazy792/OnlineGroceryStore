CREATE TABLE orderDetails(
    orderId           int,
    productID         int,
    Quantity          int,
 
    PRIMARY KEY (orderId,productID),
    FOREIGN KEY (orderId) REFERENCES orderInfo(orderId),
    FOREIGN KEY (productID) REFERENCES product(productID)
);
