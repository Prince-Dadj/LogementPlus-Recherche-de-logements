<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Photo extends Model
{
    use HasFactory;

    protected $fillable = ['logement_id', 'url', 'ordre'];

    public function logement()
    {
        return $this->belongsTo(Logement::class);
    }
}
