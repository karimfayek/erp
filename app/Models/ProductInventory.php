<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;
class ProductInventory extends Pivot
{
   protected $table ="product_inventories" ;
    
   // إضافة إذا كنت تحتاج Timestamps
   public $timestamps = false;
   
   // إضافة السمات القابلة للتعبئة إذا لزم الأمر
   protected $fillable = [
       'quantity',
       'product_id',
       'warehouse_id',
       'min_quantity'
   ];
}
