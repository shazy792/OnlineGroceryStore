CREATE TABLE warehouse (
    warehouseId        int PRIMARY KEY,
    storageCapacity     int NOT NULL,
    addressId           int,
    
    FOREIGN KEY (addressId) REFERENCES address(addressID)
);
