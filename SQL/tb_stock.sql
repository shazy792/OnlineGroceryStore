CREATE TABLE stock(
    warehouseId           int,
    productID         int,
    Quantity          int,
 
    PRIMARY KEY (warehouseId,productID),
    FOREIGN KEY (warehouseId) REFERENCES warehouse(warehouseId),
    FOREIGN KEY (productID) REFERENCES product(productID)
);
