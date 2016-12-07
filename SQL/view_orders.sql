CREATE VIEW orders AS

SELECT i.orderID, orderDate, status, c.CUSTOMERID,c.EMAIL, d.CARDNUMBER, d.CVC ,d.EXPIRYMONTH,d.EXPIRYYEAR,d.NAMEONCARD,p.*,o.QUANTITY
FROM 
    orderinfo i 
        left join 
    customer  c
          on (i.customerId = c.customerId)
        left join
    creditcard d
          on  (i.cardnumber = d.cardnumber)
        left join
    orderdetails o
          on  (o.orderId = i.orderID)
        left join
    product p
          on (o.productId = p.productId);