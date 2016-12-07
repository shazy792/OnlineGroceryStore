CREATE TABLE supplies(
    productId        int  NOT NULL,
    supplierId        int  NOT NULL,
    supplierPrice      float,
    
    PRIMARY KEY (productId, supplierId),
    FOREIGN KEY (productId) REFERENCES product(productId),
    FOREIGN KEY (supplierId) REFERENCES supplier(supplierId)
);
