<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Temoignage extends Model
{
    use HasFactory;

    protected $table = 'temoignages';

    protected $fillable = [
        'user_id',
        'nom_auteur',
        'role_auteur',
        'ville',
        'note',
        'commentaire',
        'avatar_url',
        'badge',
        'est_affiche',
        'est_verifie',
    ];

    protected $casts = [
        'note' => 'integer',
        'est_affiche' => 'boolean',
        'est_verifie' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
