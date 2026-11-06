<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rapport extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'periode_debut',
        'periode_fin',
        'donnees',
        'format',
        'date_generation',
    ];

    protected $casts = [
        'periode_debut' => 'date',
        'periode_fin' => 'date',
        'donnees' => 'array',
        'date_generation' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
