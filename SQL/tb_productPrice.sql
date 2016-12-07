CREATE TABLE productPrice(
    productId        int  NOT NULL,
    addressId        int  NOT NULL,
    price      float,
    
    PRIMARY KEY (productId, addressId),
    FOREIGN KEY (productId) REFERENCES product(productId),
    FOREIGN KEY (addressId) REFERENCES address(addressId)
);
