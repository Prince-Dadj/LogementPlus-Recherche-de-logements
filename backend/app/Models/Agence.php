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

    /**
     * Accesseur pour garantir une URL de logo absolue
     */
    public function getLogoUrlAttribute($value)
    {
        if (!$value) {
            return null;
        }
        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://') || str_starts_with($value, 'data:')) {
            return $value;
        }
        return url($value);
    }
}
