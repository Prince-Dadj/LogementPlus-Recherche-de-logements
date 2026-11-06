<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Equipement extends Model
{
    use HasFactory;

    protected $fillable = ['nom', 'icone', 'categorie'];

    public function logements()
    {
        return $this->belongsToMany(Logement::class, 'equipement_logement');
    }
}
