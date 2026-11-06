<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JournalAudit extends Model
{
    use HasFactory;

    protected $table = 'journaux_audit';

    protected $fillable = [
        'user_id',
        'action',
        'entite',
        'entite_id',
        'adresse_ip',
        'details',
    ];

    protected $casts = [
        'details' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
