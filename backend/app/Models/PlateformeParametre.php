<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlateformeParametre extends Model
{
    use HasFactory;

    protected $table = 'plateforme_parametres';

    protected $fillable = [
        'cle',
        'valeur',
        'description',
    ];
}
