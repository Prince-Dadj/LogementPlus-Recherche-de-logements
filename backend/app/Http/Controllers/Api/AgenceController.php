<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agence;
use Illuminate\Http\Request;

class AgenceController extends Controller
{
    /**
     * Liste des agences partenaires
     */
    public function index()
    {
        $agences = Agence::where('est_partenaire_certifie', true)
            ->orderBy('id', 'desc')
            ->get();

        return response()->json($agences);
    }

    /**
     * Liste complète des agences pour l'espace administration
     */
    public function adminIndex()
    {
        $agences = Agence::orderBy('id', 'desc')->get();
        return response()->json($agences);
    }

    /**
     * Enregistrer une nouvelle agence partenaire (avec upload de logo et contrôle d'accès)
     */
    public function store(Request $request)
    {
        $user = $request->user();
        if ($user && !in_array($user->role, ['admin', 'superadmin'])) {
            return response()->json(['message' => 'Action réservée aux administrateurs'], 403);
        }

        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'ville' => 'required|string|max:255',
            'adresse' => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'site_web' => 'nullable|string|max:255',
            'icone' => 'nullable|string|max:50',
            'logo_url' => 'nullable|string',
            'logo' => 'nullable|image|max:5120', // Max 5MB
            'description' => 'nullable|string',
            'est_partenaire_certifie' => 'nullable|boolean',
            'nombre_biens' => 'nullable|integer',
        ]);

        $logoUrl = $validated['logo_url'] ?? null;

        // Gestion de l'upload du logo si présent
        if ($request->hasFile('logo')) {
            $file = $request->file('logo');
            $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $destinationPath = public_path('uploads/agences');
            if (!file_exists($destinationPath)) {
                mkdir($destinationPath, 0777, true);
            }
            $file->move($destinationPath, $fileName);
            $logoUrl = '/uploads/agences/' . $fileName;
        }

        $agence = Agence::create([
            'nom' => $validated['nom'],
            'ville' => $validated['ville'],
            'adresse' => $validated['adresse'] ?? null,
            'telephone' => $validated['telephone'] ?? null,
            'email' => $validated['email'] ?? null,
            'site_web' => $validated['site_web'] ?? null,
            'icone' => $validated['icone'] ?? 'bi-buildings',
            'logo_url' => $logoUrl,
            'description' => $validated['description'] ?? null,
            'est_partenaire_certifie' => isset($validated['est_partenaire_certifie']) ? filter_var($validated['est_partenaire_certifie'], FILTER_VALIDATE_BOOLEAN) : true,
            'nombre_biens' => isset($validated['nombre_biens']) ? (int)$validated['nombre_biens'] : 0,
        ]);

        return response()->json($agence, 201);
    }

    /**
     * Détails d'une agence
     */
    public function show($id)
    {
        $agence = Agence::findOrFail($id);
        return response()->json($agence);
    }
}
