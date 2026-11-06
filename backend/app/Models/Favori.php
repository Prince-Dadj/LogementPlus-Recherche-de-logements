<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Favori extends Model
{
    use HasFactory;

    protected $fillable = ['locataire_id', 'logement_id'];

    public function locataire()
    {
        return $this->belongsTo(User::class, 'locataire_id');
    }

    public function logement()
    {
        return $this->belongsTo(Logement::class);
    }
}
