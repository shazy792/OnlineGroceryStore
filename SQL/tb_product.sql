CREATE TABLE product(
    productId        int  PRIMARY KEY,
    productName      varchar(100) NOT NULL,
    productSize      float,
    details          varchar(200),
    categoryId       int,
    
    FOREIGN KEY (categoryId) REFERENCES category(categoryId)
);
