<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Avis extends Model
{
    use HasFactory;

    protected $table = 'avis';

    protected $fillable = [
        'locataire_id',
        'logement_id',
        'note',
        'commentaire',
        'est_modere',
    ];

    protected $casts = [
        'note' => 'integer',
        'est_modere' => 'boolean',
    ];

    public function locataire()
    {
        return $this->belongsTo(User::class, 'locataire_id');
    }

    public function logement()
    {
        return $this->belongsTo(Logement::class);
    }
}
