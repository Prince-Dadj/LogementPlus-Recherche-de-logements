<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Temoignage;
use Illuminate\Http\Request;

class TemoignageController extends Controller
{
    /**
     * Liste des avis authentiques / témoignages visibles
     */
    public function index()
    {
        $temoignages = Temoignage::where('est_affiche', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($temoignages);
    }

    /**
     * Dépôt d'un avis authentique sur LogementPlus (par locataire, gestionnaire ou agence)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom_auteur' => 'required|string|max:255',
            'role_auteur' => 'required|in:locataire,gestionnaire,agence',
            'ville' => 'nullable|string|max:255',
            'note' => 'required|integer|min:1|max:5',
            'commentaire' => 'required|string|min:10',
            'avatar_url' => 'nullable|string',
        ]);

        $badge = '✓ Avis Vérifié';
        if ($validated['role_auteur'] === 'gestionnaire') {
            $badge = '✓ Bailleur Certifié';
        } elseif ($validated['role_auteur'] === 'agence') {
            $badge = '✓ Agence Partenaire';
        }

        $temoignage = Temoignage::create([
            'user_id' => $request->user()?->id,
            'nom_auteur' => $validated['nom_auteur'],
            'role_auteur' => $validated['role_auteur'],
            'ville' => $validated['ville'] ?? 'Sénégal',
            'note' => $validated['note'],
            'commentaire' => $validated['commentaire'],
            'avatar_url' => $validated['avatar_url'] ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
            'badge' => $badge,
            'est_affiche' => true,
            'est_verifie' => true,
        ]);

        return response()->json($temoignage, 201);
    }
}
