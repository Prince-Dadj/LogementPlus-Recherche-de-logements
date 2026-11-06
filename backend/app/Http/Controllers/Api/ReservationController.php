<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contrat;
use App\Models\Disponibilite;
use App\Models\Logement;
use App\Models\Message;
use App\Models\Notification;
use App\Models\Reservation;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    // RF-20 : Calcul préalable des montants (devis indicatif)
    public function calculate(Request $request)
    {
        $request->validate([
            'logement_id' => 'required|exists:logements,id',
            'date_debut' => 'required|date|after_or_equal:today',
            'date_fin' => 'required|date|after:date_debut',
        ]);

        $logement = Logement::findOrFail($request->logement_id);
        $debut = Carbon::parse($request->date_debut);
        $fin = Carbon::parse($request->date_fin);
        $jours = $debut->diffInDays($fin);
        $mois = max(1, round($jours / 30, 2));

        $loyer = round($logement->prix_par_mois * $mois, 2);
        $caution = (float) $logement->caution;
        $frais = (float) $logement->frais_service;
        $total = $loyer + $caution + $frais;

        return response()->json([
            'nb_jours' => $jours,
            'nb_mois' => $mois,
            'montant_loyer' => $loyer,
            'montant_caution' => $caution,
            'montant_frais_service' => $frais,
            'montant_total' => $total,
            'mode_reservation' => $logement->mode_reservation,
            'politique_annulation' => $logement->politique_annulation,
        ]);
    }

    // RF-20 & RF-21 : Création de la réservation
    public function store(Request $request)
    {
        $validated = $request->validate([
            'logement_id' => 'required|exists:logements,id',
            'date_debut' => 'required|date|after_or_equal:today',
            'date_fin' => 'required|date|after:date_debut',
        ]);

        $logement = Logement::findOrFail($validated['logement_id']);
        $debut = Carbon::parse($validated['date_debut']);
        $fin = Carbon::parse($validated['date_fin']);
        $jours = $debut->diffInDays($fin);
        $mois = max(1, round($jours / 30, 2));

        // RF-22 : Vérification du blocage pour éviter les doubles réservations
        $conflit = Reservation::where('logement_id', $logement->id)
            ->whereIn('statut', ['confirmee', 'payee', 'en_attente'])
            ->where(function ($q) use ($debut, $fin) {
                $q->whereBetween('date_debut', [$debut, $fin])
                  ->orWhereBetween('date_fin', [$debut, $fin])
                  ->orWhere(function ($sub) use ($debut, $fin) {
                      $sub->where('date_debut', '<=', $debut)
                          ->where('date_fin', '>=', $fin);
                  });
            })->exists();

        if ($conflit) {
            return response()->json([
                'message' => 'Ce logement est déjà réservé ou indisponible pour les dates sélectionnées.'
            ], 422);
        }

        $loyer = round($logement->prix_par_mois * $mois, 2);
        $caution = (float) $logement->caution;
        $frais = (float) $logement->frais_service;
        $total = $loyer + $caution + $frais;

        // Statut initial selon le mode configuré par le logement (RF-21)
        $statutInitial = $logement->mode_reservation !== 'immediate' ? 'confirmee' : 'en_attente';

        $reservation = Reservation::create([
            'locataire_id' => $request->user()->id,
            'logement_id' => $logement->id,
            'date_debut' => $debut->format('Y-m-d'),
            'date_fin' => $fin->format('Y-m-d'),
            'duree_jours' => $jours,
            'montant_loyer' => $loyer,
            'montant_caution' => $caution,
            'montant_frais_service' => $frais,
            'montant_total' => $total,
            'statut' => $statutInitial,
            'politique_annulation_appliquee' => $logement->politique_annulation,
        ]);

        // Génération automatique du contrat si réservation confirmée (RF-24)
        if ($statutInitial === 'confirmee') {
            Contrat::create([
                'reservation_id' => $reservation->id,
                'numero' => 'CTR-' . date('Y') . '-' . str_pad($reservation->id, 5, '0', STR_PAD_LEFT),
                'fichier_pdf' => 'contrats/contrat_' . $reservation->id . '.pdf',
                'date_signature' => now(),
                'statut_signature' => 'signe',
            ]);
        }

        // Notification envoyée au gestionnaire (RF-61)
        Notification::create([
            'user_id' => $logement->admin_id,
            'canal' => 'email',
            'titre' => 'Nouvelle demande de réservation',
            'message' => "Le locataire {$request->user()->name} a formulé une demande pour \"{$logement->titre}\" du {$debut->format('d/m/Y')} au {$fin->format('d/m/Y')}.",
        ]);

        return response()->json($reservation->load(['logement.photos', 'locataire', 'contrat']), 201);
    }

    // RF-25 : Liste des réservations du locataire connecté
    public function mesReservations(Request $request)
    {
        $reservations = Reservation::with(['logement.photos', 'logement.admin', 'locataire', 'paiements', 'contrat'])
            ->where('locataire_id', $request->user()->id)
            ->orderBy('id', 'desc')
            ->get();

        return response()->json($reservations);
    }

    // RF-43 : Liste des réservations pour le gestionnaire admin
    public function reservationsGestionnaire(Request $request)
    {
        $adminId = $request->user()->id;
        $reservations = Reservation::with(['logement', 'locataire', 'paiements', 'contrat'])
            ->whereHas('logement', function ($q) use ($adminId) {
                $q->where('admin_id', $adminId);
            })
            ->orderBy('id', 'desc')
            ->get();

        return response()->json($reservations);
    }

    // RF-43 : Accepter une demande (Admin)
    public function valider(Request $request, $id)
    {
        $reservation = Reservation::with(['logement', 'locataire'])->findOrFail($id);
        $reservation->statut = 'confirmee';
        $reservation->save();

        // RF-24 : Création du contrat associé
        Contrat::firstOrCreate(
            ['reservation_id' => $reservation->id],
            [
                'numero' => 'CTR-' . date('Y') . '-' . str_pad($reservation->id, 5, '0', STR_PAD_LEFT),
                'fichier_pdf' => 'contrats/contrat_' . $reservation->id . '.pdf',
                'date_signature' => now(),
                'statut_signature' => 'signe',
            ]
        );

        $lienPaiement = "/logements/{$reservation->logement_id}/reserver?reservation_id={$reservation->id}&step=3";

        // Message automatique dans la messagerie du compte locataire avec lien Phase 2 de paiement
        Message::create([
            'expediteur_id' => $request->user()->id,
            'destinataire_id' => $reservation->locataire_id,
            'reservation_id' => $reservation->id,
            'contenu' => "Bonjour " . ($reservation->locataire->name ?? 'cher locataire') . ",\n\nJ'ai vérifié vos pièces justificatives et votre dossier locataire. J'ai le plaisir de valider votre réservation pour le logement « {$reservation->logement->titre} » !\n\nVous pouvez dès à présent procéder à la Phase 2 du règlement sécurisé sur la plateforme (Wave / Orange Money / Carte Bancaire) pour bloquer définitivement vos dates en cliquant sur ce lien : {$lienPaiement}\n\nFélicitations et bienvenue !",
            'lu' => false,
        ]);

        Notification::create([
            'user_id' => $reservation->locataire_id,
            'canal' => 'email',
            'titre' => 'Réservation acceptée - Phase 2 de paiement débloquée !',
            'message' => "Votre réservation pour \"{$reservation->logement->titre}\" a été validée par le gestionnaire. Lien de paiement sécurisé : {$lienPaiement}",
        ]);

        return response()->json([
            'message' => 'Réservation validée avec succès',
            'reservation' => $reservation->load(['logement', 'contrat'])
        ]);
    }

    // RF-43 : Refuser une demande avec motif (Admin)
    public function refuser(Request $request, $id)
    {
        $request->validate(['motif' => 'required|string']);
        $reservation = Reservation::with(['logement', 'locataire'])->findOrFail($id);
        $reservation->statut = 'refusee';
        $reservation->motif_refus = $request->motif;
        $reservation->save();

        // Message automatique explicatif dans la messagerie du locataire
        Message::create([
            'expediteur_id' => $request->user()->id,
            'destinataire_id' => $reservation->locataire_id,
            'reservation_id' => $reservation->id,
            'contenu' => "Bonjour " . ($reservation->locataire->name ?? 'cher locataire') . ",\n\nVotre demande de réservation pour le logement « {$reservation->logement->titre} » n'a malheureusement pas pu être retenue pour le motif suivant :\n\n📌 Motif du refus : {$request->motif}\n\nN'hésitez pas à consulter d'autres logements disponibles sur la plateforme ou à mettre à jour vos pièces justificatives.",
            'lu' => false,
        ]);

        Notification::create([
            'user_id' => $reservation->locataire_id,
            'canal' => 'email',
            'titre' => 'Demande de réservation refusée',
            'message' => "Votre demande pour \"{$reservation->logement->titre}\" n'a pas pu être retenue. Motif : {$request->motif}",
        ]);

        return response()->json([
            'message' => 'Réservation refusée',
            'reservation' => $reservation
        ]);
    }

    // RF-23 : Annulation par le locataire
    public function annuler(Request $request, $id)
    {
        $reservation = Reservation::where('locataire_id', $request->user()->id)->findOrFail($id);
        $reservation->statut = 'annulee';
        $reservation->date_annulation = now();
        $reservation->save();

        return response()->json([
            'message' => 'Réservation annulée selon la politique applicable.',
            'reservation' => $reservation
        ]);
    }
}
