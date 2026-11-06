<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'locataire_id',
        'logement_id',
        'date_debut',
        'date_fin',
        'duree_jours',
        'montant_total',
        'montant_loyer',
        'montant_caution',
        'montant_frais_service',
        'statut',
        'motif_refus',
        'date_annulation',
        'politique_annulation_appliquee',
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin' => 'date',
        'montant_total' => 'float',
        'montant_loyer' => 'float',
        'montant_caution' => 'float',
        'montant_frais_service' => 'float',
        'date_annulation' => 'datetime',
    ];

    public function locataire()
    {
        return $this->belongsTo(User::class, 'locataire_id');
    }

    public function logement()
    {
        return $this->belongsTo(Logement::class);
    }

    public function paiements()
    {
        return $this->hasMany(Paiement::class);
    }

    public function contrat()
    {
        return $this->hasOne(Contrat::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }
}
