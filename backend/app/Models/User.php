<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'nom',
        'prenom',
        'email',
        'telephone',
        'password',
        'role',
        'statut',
        'piece_identite',
        'avatar_url',
        'preferences',
        'raison_sociale',
        'statut_validation',
        'two_factor_enabled',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'preferences' => 'array',
            'two_factor_enabled' => 'boolean',
        ];
    }

    /**
     * Accesseur pour garantir une URL d'avatar absolue et valide
     */
    public function getAvatarUrlAttribute($value)
    {
        if (!$value) {
            return null;
        }
        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://') || str_starts_with($value, 'data:')) {
            return $value;
        }
        return url($value);
    }

    // Un Admin gère 0 à n logements (CDC 10.2)
    public function logements()
    {
        return $this->hasMany(Logement::class, 'admin_id');
    }

    // Un Locataire effectue 0 à n réservations (CDC 10.2)
    public function reservations()
    {
        return $this->hasMany(Reservation::class, 'locataire_id');
    }

    public function avis()
    {
        return $this->hasMany(Avis::class, 'locataire_id');
    }

    public function favoris()
    {
        return $this->hasMany(Favori::class, 'locataire_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function messagesEnvoyes()
    {
        return $this->hasMany(Message::class, 'expediteur_id');
    }

    public function messagesRecus()
    {
        return $this->hasMany(Message::class, 'destinataire_id');
    }

    public function rapports()
    {
        return $this->hasMany(Rapport::class);
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'superadmin';
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, ['admin', 'superadmin']);
    }

    public function isLocataire(): bool
    {
        return $this->role === 'locataire';
    }
}
