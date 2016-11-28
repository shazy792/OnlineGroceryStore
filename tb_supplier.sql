CREATE TABLE supplier (
    supplierId        int PRIMARY KEY,
    email     varchar(100) NOT NULL,
    phone     varchar(10) NOT NULL,
    addressId           int,
    
    FOREIGN KEY (addressId) REFERENCES address(addressID)
);
