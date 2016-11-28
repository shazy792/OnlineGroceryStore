CREATE VIEW storageSpace AS 
with iSpace as (
select warehouseId, productsize * s.quantity as itemSpace
from stock s
        left join 
     product p
        on (s.productId = p.productId)    
), uSpace as (
select warehouseId, SUM(itemSpace) usedSpace
from iSpace
group by warehouseId
)
select u.warehouseId, usedSpace, (usedSpace - storageCapacity) availableSpace
from uSpace u
      inner join 
     warehouse w
        on (u.warehouseId = w.warehouseId)
        
;