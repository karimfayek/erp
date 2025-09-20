<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Support\Str;
class Role extends Model
{
    use HasFactory;

    protected $fillable = ['name','slug','description'];

    public function setNameAttribute($value)
    {
        $this->attributes['name'] = $value;
        $this->attributes['slug'] = Str::slug($value);
    }

    public function users() { return $this->belongsToMany(User::class); }
    
  public function permissions()
{
    return $this->belongsToMany(Permission::class, 'permission_role');
}
}
