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

    /**
     * Mettre à jour une agence existante (avec possibilité de nouveau logo)
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        if ($user && !in_array($user->role, ['admin', 'superadmin'])) {
            return response()->json(['message' => 'Action réservée aux administrateurs'], 403);
        }

        $agence = Agence::findOrFail($id);

        $validated = $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'ville' => 'sometimes|required|string|max:255',
            'adresse' => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'site_web' => 'nullable|string|max:255',
            'icone' => 'nullable|string|max:50',
            'logo_url' => 'nullable|string',
            'logo' => 'nullable|image|max:5120',
            'description' => 'nullable|string',
            'est_partenaire_certifie' => 'nullable',
            'nombre_biens' => 'nullable|integer',
        ]);

        if (isset($validated['nom'])) $agence->nom = $validated['nom'];
        if (isset($validated['ville'])) $agence->ville = $validated['ville'];
        if (array_key_exists('adresse', $validated)) $agence->adresse = $validated['adresse'];
        if (array_key_exists('telephone', $validated)) $agence->telephone = $validated['telephone'];
        if (array_key_exists('email', $validated)) $agence->email = $validated['email'];
        if (array_key_exists('site_web', $validated)) $agence->site_web = $validated['site_web'];
        if (array_key_exists('description', $validated)) $agence->description = $validated['description'];
        if (isset($validated['icone'])) $agence->icone = $validated['icone'];
        if (isset($validated['nombre_biens'])) $agence->nombre_biens = (int)$validated['nombre_biens'];

        if (isset($validated['est_partenaire_certifie'])) {
            $agence->est_partenaire_certifie = filter_var($validated['est_partenaire_certifie'], FILTER_VALIDATE_BOOLEAN);
        }

        // Upload de nouveau logo
        if ($request->hasFile('logo')) {
            $file = $request->file('logo');
            $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $destinationPath = public_path('uploads/agences');
            if (!file_exists($destinationPath)) {
                mkdir($destinationPath, 0777, true);
            }
            $file->move($destinationPath, $fileName);
            $agence->logo_url = '/uploads/agences/' . $fileName;
        } elseif (isset($validated['logo_url']) && !empty($validated['logo_url'])) {
            $agence->logo_url = $validated['logo_url'];
        }

        $agence->save();

        return response()->json([
            'message' => 'Agence modifiée avec succès',
            'agence' => $agence,
            'data' => $agence
        ]);
    }

    /**
     * Supprimer une agence partenaire
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        if ($user && !in_array($user->role, ['admin', 'superadmin'])) {
            return response()->json(['message' => 'Action réservée aux administrateurs'], 403);
        }

        $agence = Agence::findOrFail($id);
        $nom = $agence->nom;
        $agence->delete();

        return response()->json([
            'message' => "L'agence « {$nom} » a été supprimée avec succès.",
            'id' => (int)$id
        ]);
    }

    /**
     * Basculer le statut de certification d'une agence
     */
    public function toggleCertification(Request $request, $id)
    {
        $user = $request->user();
        if ($user && !in_array($user->role, ['admin', 'superadmin'])) {
            return response()->json(['message' => 'Action réservée aux administrateurs'], 403);
        }

        $agence = Agence::findOrFail($id);
        $agence->est_partenaire_certifie = !$agence->est_partenaire_certifie;
        $agence->save();

        return response()->json([
            'message' => 'Statut de certification mis à jour',
            'agence' => $agence
        ]);
    }
}
