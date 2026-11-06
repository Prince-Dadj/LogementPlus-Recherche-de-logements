<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Remboursement extends Model
{
    use HasFactory;

    protected $fillable = [
        'paiement_id',
        'montant',
        'motif',
        'statut',
        'date_remboursement',
    ];

    protected $casts = [
        'montant' => 'float',
        'date_remboursement' => 'datetime',
    ];

    public function paiement()
    {
        return $this->belongsTo(Paiement::class);
    }
}
