<?php

use App\Http\Controllers\Api\AgenceController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\LogementController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\PaiementController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\SuperAdminController;
use App\Http\Controllers\Api\TemoignageController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Plateforme LogementPlus (Cahier des charges v1.0)
|--------------------------------------------------------------------------
*/

// --- Authentification & Utilisateurs de Démo (RF-01, RF-02) ---
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/auth/demo-users', [AuthController::class, 'demoUsers']);

// --- Logements publics (RF-10 à RF-14) ---
Route::get('/logements', [LogementController::class, 'index']);
Route::get('/logements/{id}', [LogementController::class, 'show']);
Route::get('/equipements', [LogementController::class, 'equipements']);
Route::get('/quartiers', [LogementController::class, 'quartiers']);
Route::post('/logements/{id}/avis', [LogementController::class, 'ajouterAvis']);

// --- Agences Partenaires (dynamique) ---
Route::get('/agences', [AgenceController::class, 'index']);
Route::post('/agences', [AgenceController::class, 'store']);

// --- Témoignages / Avis Plateforme (dynamique) ---
Route::get('/temoignages', [TemoignageController::class, 'index']);
Route::post('/temoignages', [TemoignageController::class, 'store']);

// --- Statistiques publiques dynamiques pour la page d'accueil ---
Route::get('/plateforme-stats', [DashboardController::class, 'statsPubliques']);

// --- Calcul de devis indicatif (RF-20) ---
Route::post('/reservations/calculate', [ReservationController::class, 'calculate']);

// --- Reçu public ou authentifié (RF-33) ---
Route::get('/paiements/{id}/recu', [PaiementController::class, 'recu']);

// --- Export des rapports CSV (RF-72) ---
Route::get('/reports/export-csv', [DashboardController::class, 'exportRapportCsv']);

// --- Routes nécessitant Authentification (Sanctum) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // --- Profil & Paramètres utilisateur (Sécurité & Mise à jour réelle BDD) ---
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/auth/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'changePassword']);
    Route::post('/profile/password', [ProfileController::class, 'changePassword']);
    Route::post('/auth/change-password', [ProfileController::class, 'changePassword']);
    Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar']);

    // --- Locataire : Réservations et paiements (RF-20..25, RF-30..36) ---
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::get('/mes-reservations', [ReservationController::class, 'mesReservations']);
    Route::post('/reservations/{id}/annuler', [ReservationController::class, 'annuler']);
    Route::post('/paiements/payer', [PaiementController::class, 'payer']);

    // --- Messagerie intégrée (RF-44) ---
    Route::get('/messages', [MessageController::class, 'index']);
    Route::post('/messages', [MessageController::class, 'store']);
    Route::put('/messages/{id}/lire', [MessageController::class, 'marquerLu']);

    // --- Admin (Gestionnaire) : Logements et Réservations (RF-40..45) ---
    Route::get('/admin/logements', [LogementController::class, 'mesLogements']);
    Route::post('/admin/logements', [LogementController::class, 'store']);
    Route::put('/admin/logements/{id}', [LogementController::class, 'update']);
    Route::delete('/admin/logements/{id}', [LogementController::class, 'destroy']);
    Route::patch('/admin/logements/{id}/toggle-statut', [LogementController::class, 'toggleStatut']);
    Route::get('/admin/reservations', [ReservationController::class, 'reservationsGestionnaire']);
    Route::post('/admin/reservations/{id}/valider', [ReservationController::class, 'valider']);
    Route::post('/admin/reservations/{id}/refuser', [ReservationController::class, 'refuser']);
    Route::get('/admin/dashboard-stats', [DashboardController::class, 'statsAdmin']);
    Route::post('/admin/paiements/{id}/rembourser', [PaiementController::class, 'rembourser']);
    Route::get('/admin/agences', [AgenceController::class, 'adminIndex']);
    Route::post('/admin/agences', [AgenceController::class, 'store']);

    // --- Super Admin : Supervision, Paramétrage & Audit (RF-50..54) ---
    Route::get('/superadmin/dashboard-stats', [DashboardController::class, 'statsSuperAdmin']);
    Route::get('/superadmin/users', [SuperAdminController::class, 'users']);
    Route::patch('/superadmin/users/{id}', [SuperAdminController::class, 'updateStatutUser']);
    Route::get('/superadmin/avis', [SuperAdminController::class, 'avis']);
    Route::patch('/superadmin/avis/{id}/toggle-moderation', [SuperAdminController::class, 'toggleModerationAvis']);
    Route::get('/superadmin/parametres', [SuperAdminController::class, 'getParametres']);
    Route::put('/superadmin/parametres/{id}', [SuperAdminController::class, 'updateParametre']);
    Route::get('/superadmin/audit-logs', [SuperAdminController::class, 'journalAudit']);
});
