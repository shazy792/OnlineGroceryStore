CREATE VIEW productInfo AS 
select t.*,a.*,price 
from productPrice pp
        left join 
      product t 
          on (pp.productId = t.productId)
        left join
      address a 
          on (pp.addressId = a.addressId);