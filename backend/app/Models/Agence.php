<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Agence extends Model
{
    use HasFactory;

    protected $table = 'agences';

    protected $fillable = [
        'nom',
        'ville',
        'adresse',
        'telephone',
        'email',
        'site_web',
        'icone',
        'logo_url',
        'description',
        'est_partenaire_certifie',
        'nombre_biens',
    ];

    protected $casts = [
        'est_partenaire_certifie' => 'boolean',
        'nombre_biens' => 'integer',
    ];
}
