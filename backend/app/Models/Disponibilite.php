<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Disponibilite extends Model
{
    use HasFactory;

    protected $fillable = [
        'logement_id',
        'date_debut',
        'date_fin',
        'prix_specifique',
        'bloquee',
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin' => 'date',
        'prix_specifique' => 'float',
        'bloquee' => 'boolean',
    ];

    public function logement()
    {
        return $this->belongsTo(Logement::class);
    }
}
