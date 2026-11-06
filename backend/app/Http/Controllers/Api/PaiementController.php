<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\Notification;
use App\Models\Paiement;
use App\Models\PlateformeParametre;
use App\Models\Remboursement;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaiementController extends Controller
{
    // RF-30 / RF-31 : Effectuer un paiement sécurisé (CB ou Mobile Money)
    public function payer(Request $request)
    {
        $validated = $request->validate([
            'reservation_id' => 'required|exists:reservations,id',
            'moyen' => 'required|in:carte,orange_money,mtn_money,wave',
            'type' => 'required|in:acompte,premier_loyer,caution,loyer_recurrent',
            'telephone_paiement' => 'nullable|string', // Pour Orange Money / Wave
        ]);

        $reservation = Reservation::with(['logement', 'locataire'])->findOrFail($validated['reservation_id']);

        // Détermination du montant à payer selon le type
        $montant = match ($validated['type']) {
            'acompte' => round($reservation->montant_loyer * 0.3, 2),
            'caution' => (float) $reservation->montant_caution,
            default => (float) $reservation->montant_total,
        };

        // Calcul de la commission plateforme (ex: 10% - RF-36)
        $tauxCommissionParam = PlateformeParametre::where('cle', 'taux_commission')->first();
        $taux = $tauxCommissionParam ? (float) $tauxCommissionParam->valeur : 10.0;
        $commission = round(($montant * $taux) / 100, 2);
        $reversementAdmin = round($montant - $commission, 2);

        // Simulation de la transaction avec tokenisation (RF-35)
        $reference = 'TXN-' . strtoupper($validated['moyen']) . '-' . date('Ymd') . '-' . strtoupper(Str::random(6));

        $paiement = Paiement::create([
            'reservation_id' => $reservation->id,
            'montant' => $montant,
            'type' => $validated['type'],
            'moyen' => $validated['moyen'],
            'statut' => 'reussi',
            'reference_transaction' => $reference,
            'commission_plateforme' => $commission,
            'montant_reverse_admin' => $reversementAdmin,
            'statut_reversement' => 'effectue',
            'date_paiement' => now(),
        ]);

        // Mise à jour du statut de la réservation
        $reservation->statut = 'payee';
        $reservation->save();

        // Le logement devient occupé
        if ($reservation->logement) {
            $reservation->logement->statut = 'occupe';
            $reservation->logement->save();
        }

        // Message de confirmation de paiement et remise de contrat
        Message::create([
            'expediteur_id' => $reservation->logement->admin_id ?? 1,
            'destinataire_id' => $reservation->locataire_id,
            'reservation_id' => $reservation->id,
            'contenu' => "Félicitations " . ($reservation->locataire->name ?? 'cher locataire') . " !\n\nVotre règlement Phase 2 de " . number_format($montant, 0, ',', ' ') . " FCFA (" . ucfirst($validated['moyen']) . ") a bien été validé sous séquestre 24h (Réf: {$reference}).\n\nLe logement « {$reservation->logement->titre} » vous est désormais attribué et verrouillé comme OCCUPÉ sur la plateforme. Votre contrat de bail est téléchargeable dans votre espace réservations.",
            'lu' => false,
        ]);

        // RF-33 : Génération et notification du reçu automatique
        Notification::create([
            'user_id' => $reservation->locataire_id,
            'canal' => 'email',
            'titre' => "Reçu de paiement : {$reference}",
            'message' => "Votre paiement de " . number_format($montant, 0, ',', ' ') . " FCFA par " . ucfirst($validated['moyen']) . " a bien été validé. Reçu disponible au téléchargement.",
        ]);

        Notification::create([
            'user_id' => $reservation->logement->admin_id,
            'canal' => 'email',
            'titre' => "Paiement perçu pour la réservation #{$reservation->id}",
            'message' => "Un montant de " . number_format($reversementAdmin, 0, ',', ' ') . " FCFA a été crédité sur votre compte (après déduction de {$commission} FCFA de commission plateforme).",
        ]);

        return response()->json([
            'message' => 'Paiement effectué avec succès !',
            'paiement' => $paiement,
            'reservation' => $reservation,
            'recu_url' => "/api/paiements/{$paiement->id}/recu",
        ], 200);
    }

    // RF-33 : Récupération du reçu de paiement
    public function recu($id)
    {
        $paiement = Paiement::with(['reservation.logement', 'reservation.locataire'])->findOrFail($id);

        return response()->json([
            'recu_numero' => 'REC-' . str_pad($paiement->id, 6, '0', STR_PAD_LEFT),
            'reference_transaction' => $paiement->reference_transaction,
            'date' => $paiement->date_paiement ? $paiement->date_paiement->format('d/m/Y H:i') : null,
            'moyen' => ucfirst($paiement->moyen),
            'type' => ucfirst(str_replace('_', ' ', $paiement->type)),
            'montant' => $paiement->montant,
            'locataire' => $paiement->reservation->locataire->name,
            'email' => $paiement->reservation->locataire->email,
            'logement' => $paiement->reservation->logement->titre,
            'adresse' => $paiement->reservation->logement->adresse,
            'periode' => $paiement->reservation->date_debut . ' au ' . $paiement->reservation->date_fin,
            'statut' => $paiement->statut,
        ]);
    }

    // RF-34 : Déclencher un remboursement
    public function rembourser(Request $request, $id)
    {
        $request->validate([
            'montant' => 'required|numeric|min:1',
            'motif' => 'required|string',
        ]);

        $paiement = Paiement::findOrFail($id);

        $remboursement = Remboursement::create([
            'paiement_id' => $paiement->id,
            'montant' => (float) $request->montant,
            'motif' => $request->motif,
            'statut' => 'effectue',
            'date_remboursement' => now(),
        ]);

        $paiement->statut = 'rembourse';
        $paiement->save();

        return response()->json([
            'message' => 'Remboursement exécuté avec succès.',
            'remboursement' => $remboursement,
        ]);
    }
}
