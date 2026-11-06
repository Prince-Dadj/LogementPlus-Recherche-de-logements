<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Logement extends Model
{
    use HasFactory;

    protected $fillable = [
        'admin_id',
        'titre',
        'description',
        'type',
        'adresse',
        'ville',
        'quartier',
        'latitude',
        'longitude',
        'prix_par_mois',
        'caution',
        'frais_service',
        'nb_pieces',
        'surface',
        'meuble',
        'statut',
        'mode_reservation',
        'politique_annulation',
        'reglement_interieur',
        'image_principale',
    ];

    protected $casts = [
        'meuble' => 'boolean',
        'prix_par_mois' => 'float',
        'caution' => 'float',
        'frais_service' => 'float',
        'surface' => 'float',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    protected $appends = [
        'note_moyenne',
        'nombre_avis',
    ];

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function photos()
    {
        return $this->hasMany(Photo::class)->orderBy('ordre', 'asc');
    }

    public function equipements()
    {
        return $this->belongsToMany(Equipement::class, 'equipement_logement');
    }

    public function disponibilites()
    {
        return $this->hasMany(Disponibilite::class);
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function avis()
    {
        return $this->hasMany(Avis::class);
    }

    public function favoris()
    {
        return $this->hasMany(Favori::class);
    }

    public function getNoteMoyenneAttribute(): float
    {
        return round($this->avis()->avg('note') ?? 4.8, 1);
    }

    public function getNombreAvisAttribute(): int
    {
        return $this->avis()->count();
    }
}
