<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Paiement extends Model
{
    use HasFactory;

    protected $fillable = [
        'reservation_id',
        'montant',
        'type',
        'moyen',
        'statut',
        'reference_transaction',
        'commission_plateforme',
        'montant_reverse_admin',
        'statut_reversement',
        'date_paiement',
    ];

    protected $casts = [
        'montant' => 'float',
        'commission_plateforme' => 'float',
        'montant_reverse_admin' => 'float',
        'date_paiement' => 'datetime',
    ];

    public function reservation()
    {
        return $this->belongsTo(Reservation::class);
    }

    public function remboursements()
    {
        return $this->hasMany(Remboursement::class);
    }
}
