<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Equipement;
use App\Models\Logement;
use App\Models\Photo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LogementController extends Controller
{
    // RF-10 à RF-13 : Recherche, filtres, tri et coordonnées géographiques
    public function index(Request $request)
    {
        $query = Logement::with(['photos', 'equipements', 'admin:id,name,raison_sociale', 'avis'])
            ->where('statut', 'publie');

        // Filtre par recherche textuelle (ville, quartier, titre, adresse)
        if ($request->filled('q')) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->where('titre', 'like', "%{$search}%")
                  ->orWhere('ville', 'like', "%{$search}%")
                  ->orWhere('quartier', 'like', "%{$search}%")
                  ->orWhere('adresse', 'like', "%{$search}%");
            });
        }

        // Filtre par type (chambre, studio, appartement, maison)
        if ($request->filled('type') && $request->type !== 'tous') {
            $query->where('type', $request->type);
        }

        // Filtre par ville
        if ($request->filled('ville') && $request->ville !== 'toutes') {
            $query->where('ville', $request->ville);
        }

        // Filtre par quartier
        if ($request->filled('quartier')) {
            $query->where('quartier', $request->quartier);
        }

        // Filtre par prix min / max
        if ($request->filled('prix_min')) {
            $query->where('prix_par_mois', '>=', (float) $request->prix_min);
        }
        if ($request->filled('prix_max')) {
            $query->where('prix_par_mois', '<=', (float) $request->prix_max);
        }

        // Filtre par surface minimale et maximale
        if ($request->filled('surface_min')) {
            $query->where('surface', '>=', (float) $request->surface_min);
        }
        if ($request->filled('surface_max')) {
            $query->where('surface', '<=', (float) $request->surface_max);
        }

        // Filtre par nombre de pièces
        if ($request->filled('nb_pieces')) {
            $query->where('nb_pieces', '>=', (int) $request->nb_pieces);
        }

        // Filtre meublé ou non
        if ($request->has('meuble') && $request->meuble !== null && $request->meuble !== '' && $request->meuble !== 'tous') {
            $query->where('meuble', filter_var($request->meuble, FILTER_VALIDATE_BOOLEAN));
        }

        // Filtre par disponibilité (masquer les logements occupés)
        if ($request->get('disponibilite') === 'disponible') {
            $query->where(function ($q) {
                $q->whereDoesntHave('reservations', function ($sub) {
                    $sub->whereIn('statut', ['confirmee', 'payee']);
                });
            });
        }

        // Filtre par mode de réservation (immédiate vs sur validation)
        if ($request->filled('mode_reservation') && $request->mode_reservation !== 'tous') {
            $query->where('mode_reservation', $request->mode_reservation);
        }

        // Filtre par équipements spécifiques (RF-11)
        if ($request->filled('equipements')) {
            $equipementValues = is_array($request->equipements)
                ? $request->equipements
                : explode(',', $request->equipements);

            foreach ($equipementValues as $eqVal) {
                $trimmed = trim($eqVal);
                if (empty($trimmed)) continue;
                $query->whereHas('equipements', function ($q) use ($trimmed) {
                    if (is_numeric($trimmed)) {
                        $q->where('equipements.id', (int) $trimmed);
                    } else {
                        $q->where('equipements.nom', 'like', "%{$trimmed}%");
                    }
                });
            }
        }

        // Tri précis (RF-12)
        $tri = $request->get('tri', 'pertinence');
        switch ($tri) {
            case 'prix_asc':
                $query->orderBy('prix_par_mois', 'asc');
                break;
            case 'prix_desc':
                $query->orderBy('prix_par_mois', 'desc');
                break;
            case 'surface_asc':
                $query->orderBy('surface', 'asc');
                break;
            case 'surface_desc':
                $query->orderBy('surface', 'desc');
                break;
            case 'recent':
                $query->orderBy('created_at', 'desc')->orderBy('id', 'desc');
                break;
            default:
                $query->orderBy('id', 'desc');
                break;
        }

        $logements = $query->get()->map(function ($item) {
            $item->note_moyenne = $item->note_moyenne;
            $item->nombre_avis = $item->nombre_avis;
            return $item;
        });

        return response()->json($logements);
    }

    // RF-14 : Fiche détaillée du logement
    public function show($id)
    {
        $logement = Logement::with([
            'photos',
            'equipements',
            'disponibilites',
            'admin:id,name,telephone,email,raison_sociale',
            'avis.locataire:id,name'
        ])->findOrFail($id);

        $logement->note_moyenne = $logement->note_moyenne;
        $logement->nombre_avis = $logement->nombre_avis;

        return response()->json($logement);
    }

    // Liste des équipements globaux pour les filtres (RF-11)
    public function equipements()
    {
        return response()->json(Equipement::all());
    }

    // Helper : Traite et sauvegarde les photos base64 sur le disque public
    private function processPhotoUrl(?string $photoUrl): ?string
    {
        if (!$photoUrl) {
            return null;
        }

        if (str_starts_with($photoUrl, 'data:image')) {
            if (preg_match('/^data:image\/(\w+);base64,/', $photoUrl, $type)) {
                $data = substr($photoUrl, strpos($photoUrl, ',') + 1);
                $type = strtolower($type[1]);
                if (!in_array($type, ['jpg', 'jpeg', 'gif', 'png', 'webp'])) {
                    $type = 'jpg';
                }
                $data = base64_decode($data);
                if ($data !== false) {
                    $filename = 'logements/' . uniqid('logement_', true) . '.' . $type;
                    \Illuminate\Support\Facades\Storage::disk('public')->put($filename, $data);
                    return '/storage/' . $filename;
                }
            }
        }

        return $photoUrl;
    }

    // RF-40 : Logements gérés par l'admin connecté
    public function mesLogements(Request $request)
    {
        $user = $request->user();
        if ($user && $user->role === 'superadmin') {
            $logements = Logement::with(['photos', 'equipements', 'reservations'])
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            $logements = Logement::with(['photos', 'equipements', 'reservations'])
                ->where('admin_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return response()->json($logements);
    }

    // RF-40 / RF-41 : Création d'un logement par l'admin
    public function store(Request $request)
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|in:chambre,studio,appartement,maison',
            'adresse' => 'required|string',
            'ville' => 'required|string',
            'quartier' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'prix_par_mois' => 'required|numeric|min:0',
            'caution' => 'nullable|numeric|min:0',
            'frais_service' => 'nullable|numeric|min:0',
            'nb_pieces' => 'nullable|integer|min:1',
            'surface' => 'required|numeric|min:1',
            'meuble' => 'nullable',
            'mode_reservation' => 'nullable|string|in:immediate,sur_validation,sur_demande',
            'politique_annulation' => 'nullable|string|in:gratuite,partielle,non_remboursable,moderee,stricte',
            'statut' => 'nullable|string|in:publie,hors_ligne,brouillon',
            'reglement_interieur' => 'nullable|string',
            'points_interet' => 'nullable|string',
            'accessibilite' => 'nullable|string',
            'image_principale' => 'nullable|string',
            'equipement_ids' => 'nullable|array',
            'photos' => 'nullable|array',
        ]);

        [$lat, $lng] = $this->resolveCoordinates(
            $validated['ville'],
            $validated['quartier'] ?? null,
            $validated['latitude'] ?? null,
            $validated['longitude'] ?? null
        );

        $modeReservation = ($request->mode_reservation === 'immediate') ? 'immediate' : 'sur_validation';
        $politique = $request->politique_annulation ?? 'gratuite';
        if ($politique === 'moderee') $politique = 'partielle';
        if ($politique === 'stricte') $politique = 'non_remboursable';
        if (!in_array($politique, ['gratuite', 'partielle', 'non_remboursable'])) {
            $politique = 'gratuite';
        }

        // Traitement robuste des photos (conversion base64 vers disque public)
        $photosList = [];
        if (!empty($request->photos) && is_array($request->photos)) {
            foreach ($request->photos as $p) {
                if (is_string($p) && !empty($p)) {
                    $photosList[] = $this->processPhotoUrl($p);
                }
            }
        }

        $imagePrincipale = !empty($photosList[0])
            ? $photosList[0]
            : ($request->image_principale ? $this->processPhotoUrl($request->image_principale) : null);

        $statut = $request->input('statut', 'hors_ligne');
        if (!in_array($statut, ['publie', 'hors_ligne', 'brouillon'])) {
            $statut = 'hors_ligne';
        }

        $logement = Logement::create([
            'admin_id' => $request->user()->id,
            'titre' => $validated['titre'],
            'description' => $validated['description'],
            'type' => $validated['type'],
            'adresse' => $validated['adresse'],
            'ville' => $validated['ville'],
            'quartier' => $validated['quartier'] ?? null,
            'latitude' => $lat,
            'longitude' => $lng,
            'prix_par_mois' => $validated['prix_par_mois'],
            'caution' => $validated['caution'] ?? $validated['prix_par_mois'],
            'frais_service' => $validated['frais_service'] ?? ($validated['prix_par_mois'] * 0.05),
            'nb_pieces' => $validated['nb_pieces'] ?? 1,
            'surface' => $validated['surface'],
            'meuble' => filter_var($request->meuble ?? false, FILTER_VALIDATE_BOOLEAN),
            'statut' => $statut,
            'mode_reservation' => $modeReservation,
            'politique_annulation' => $politique,
            'reglement_interieur' => $validated['reglement_interieur'] ?? null,
            'points_interet' => $validated['points_interet'] ?? null,
            'accessibilite' => $validated['accessibilite'] ?? null,
            'image_principale' => $imagePrincipale,
        ]);

        $equipementIds = $validated['equipement_ids'] ?? [];

        // Traitement des équipements (texte séparé par des virgules ou tableau)
        $nomsEquipements = [];
        if ($request->filled('equipements_texte') && is_string($request->equipements_texte)) {
            $nomsEquipements = explode(',', $request->equipements_texte);
        } elseif ($request->filled('equipements') && is_string($request->equipements)) {
            $nomsEquipements = explode(',', $request->equipements);
        } elseif ($request->filled('equipements_liste') && is_array($request->equipements_liste)) {
            $nomsEquipements = $request->equipements_liste;
        }

        foreach ($nomsEquipements as $eqNom) {
            $nomNettoye = trim($eqNom);
            if (!empty($nomNettoye)) {
                $eq = Equipement::firstOrCreate(
                    ['nom' => $nomNettoye],
                    ['icone' => 'bi-check-circle', 'categorie' => 'confort']
                );
                $equipementIds[] = $eq->id;
            }
        }
        if (!empty($equipementIds)) {
            $logement->equipements()->sync(array_unique($equipementIds));
        }

        if (!empty($photosList)) {
            $order = 1;
            foreach ($photosList as $photoUrl) {
                Photo::create([
                    'logement_id' => $logement->id,
                    'url' => $photoUrl,
                    'ordre' => $order++,
                ]);
            }
        }

        return response()->json($logement->load(['photos', 'equipements']), 201);
    }

    // Modification d'un logement par son gestionnaire
    public function update(Request $request, $id)
    {
        $logement = Logement::findOrFail($id);

        if ($request->user()->role !== 'superadmin' && $logement->admin_id !== $request->user()->id) {
            return response()->json(['message' => 'Action non autorisée'], 403);
        }

        $validated = $request->validate([
            'titre' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'type' => 'sometimes|required|in:chambre,studio,appartement,maison',
            'adresse' => 'sometimes|required|string',
            'ville' => 'sometimes|required|string',
            'quartier' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'prix_par_mois' => 'sometimes|required|numeric|min:0',
            'caution' => 'nullable|numeric|min:0',
            'frais_service' => 'nullable|numeric|min:0',
            'nb_pieces' => 'nullable|integer|min:1',
            'surface' => 'sometimes|required|numeric|min:1',
            'meuble' => 'nullable',
            'mode_reservation' => 'nullable|string|in:immediate,sur_validation,sur_demande',
            'politique_annulation' => 'nullable|string|in:gratuite,partielle,non_remboursable,moderee,stricte',
            'statut' => 'nullable|string|in:publie,hors_ligne,brouillon',
            'reglement_interieur' => 'nullable|string',
            'points_interet' => 'nullable|string',
            'accessibilite' => 'nullable|string',
            'image_principale' => 'nullable|string',
            'equipement_ids' => 'nullable|array',
            'photos' => 'nullable|array',
        ]);

        if ($request->has('ville') || $request->has('quartier') || $request->has('latitude') || $request->has('longitude')) {
            [$lat, $lng] = $this->resolveCoordinates(
                $validated['ville'] ?? $logement->ville,
                $validated['quartier'] ?? $logement->quartier,
                $validated['latitude'] ?? null,
                $validated['longitude'] ?? null
            );
            $validated['latitude'] = $lat;
            $validated['longitude'] = $lng;
        }

        if ($request->has('mode_reservation')) {
            $validated['mode_reservation'] = ($request->mode_reservation === 'immediate') ? 'immediate' : 'sur_validation';
        }

        if ($request->has('politique_annulation')) {
            $pol = $request->politique_annulation;
            if ($pol === 'moderee') $pol = 'partielle';
            if ($pol === 'stricte') $pol = 'non_remboursable';
            $validated['politique_annulation'] = in_array($pol, ['gratuite', 'partielle', 'non_remboursable']) ? $pol : 'gratuite';
        }

        if ($request->has('meuble')) {
            $validated['meuble'] = filter_var($request->meuble, FILTER_VALIDATE_BOOLEAN);
        }

        // Traitement robuste des photos si fournies
        $photosList = [];
        if ($request->filled('photos') && is_array($request->photos)) {
            foreach ($request->photos as $p) {
                if (is_string($p) && !empty($p)) {
                    $photosList[] = $this->processPhotoUrl($p);
                }
            }
        }

        if (!empty($photosList)) {
            $validated['image_principale'] = $photosList[0];
        } elseif ($request->filled('image_principale')) {
            $validated['image_principale'] = $this->processPhotoUrl($request->image_principale);
        }

        $logement->update($validated);

        $equipementIds = $request->input('equipement_ids', []);

        // Traitement des équipements (texte séparé par des virgules ou tableau)
        $nomsEquipements = [];
        if ($request->filled('equipements_texte') && is_string($request->equipements_texte)) {
            $nomsEquipements = explode(',', $request->equipements_texte);
        } elseif ($request->filled('equipements') && is_string($request->equipements)) {
            $nomsEquipements = explode(',', $request->equipements);
        } elseif ($request->filled('equipements_liste') && is_array($request->equipements_liste)) {
            $nomsEquipements = $request->equipements_liste;
        }

        foreach ($nomsEquipements as $eqNom) {
            $nomNettoye = trim($eqNom);
            if (!empty($nomNettoye)) {
                $eq = Equipement::firstOrCreate(
                    ['nom' => $nomNettoye],
                    ['icone' => 'bi-check-circle', 'categorie' => 'confort']
                );
                $equipementIds[] = $eq->id;
            }
        }
        if ($request->has('equipement_ids') || $request->filled('equipements_liste') || $request->filled('equipements_texte') || $request->filled('equipements')) {
            $logement->equipements()->sync(array_unique($equipementIds));
        }

        if (!empty($photosList)) {
            $logement->photos()->delete();
            $order = 1;
            foreach ($photosList as $photoUrl) {
                Photo::create([
                    'logement_id' => $logement->id,
                    'url' => $photoUrl,
                    'ordre' => $order++,
                ]);
            }
            if (empty($validated['image_principale']) && !empty($photosList[0])) {
                $logement->image_principale = $photosList[0];
                $logement->save();
            }
        }

        return response()->json($logement->load(['photos', 'equipements']));
    }

    // Suppression d'un logement par son gestionnaire
    public function destroy(Request $request, $id)
    {
        $logement = Logement::findOrFail($id);

        if ($request->user()->role !== 'superadmin' && $logement->admin_id !== $request->user()->id) {
            return response()->json(['message' => 'Action non autorisée'], 403);
        }

        $logement->photos()->delete();
        $logement->equipements()->detach();
        $logement->delete();

        return response()->json(['message' => 'Logement supprimé avec succès']);
    }

    // RF-40 : Bascule du statut (mise hors ligne / mise en ligne)
    public function toggleStatut($id)
    {
        $logement = Logement::findOrFail($id);
        $logement->statut = $logement->statut === 'publie' ? 'hors_ligne' : 'publie';
        $logement->save();

        return response()->json([
            'message' => "Statut mis à jour : {$logement->statut}",
            'logement' => $logement
        ]);
    }

    // Dépôt d'un avis authentique sur un logement par un locataire
    public function ajouterAvis(Request $request, $id)
    {
        $logement = Logement::findOrFail($id);

        $validated = $request->validate([
            'note' => 'required|integer|min:1|max:5',
            'commentaire' => 'required|string|min:5|max:1500',
        ]);

        $locataireId = $request->user()?->id ?? 1;

        $avis = \App\Models\Avis::create([
            'locataire_id' => $locataireId,
            'logement_id' => $logement->id,
            'note' => $validated['note'],
            'commentaire' => $validated['commentaire'],
            'est_modere' => true,
        ]);

        $avis->load('locataire:id,name');

        return response()->json([
            'message' => 'Avis enregistré avec succès',
            'avis' => $avis,
            'nouvelle_note_moyenne' => $logement->fresh()->note_moyenne,
            'nouveau_nombre_avis' => $logement->fresh()->nombre_avis,
        ], 201);
    }

    // Répartition dynamique des logements par quartier depuis la base de données
    public function quartiers()
    {
        $rawQuartiers = Logement::select('quartier', 'ville', DB::raw('count(*) as count'), DB::raw('MAX(image_principale) as image'))
            ->where('statut', 'publie')
            ->whereNotNull('quartier')
            ->where('quartier', '!=', '')
            ->groupBy('quartier', 'ville')
            ->orderByDesc('count')
            ->get();

        $metadatas = [
            'Almadies' => ['tag' => 'Prestige', 'label' => 'Pointe des Almadies & Ambassades', 'image' => 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80'],
            'Fann Résidence' => ['tag' => 'Résidentiel', 'label' => 'Corniche Ouest & Vue Mer', 'image' => 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80'],
            'Plateau' => ['tag' => 'Affaires', 'label' => 'Centre d\'Affaires & Ministères', 'image' => 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80'],
            'Ngor' => ['tag' => 'Bord de mer', 'label' => 'Ngor Virage & Phare des Mamelles', 'image' => 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'],
            'Ngor Virage' => ['tag' => 'Bord de mer', 'label' => 'Ngor Virage & Corniche Almadies', 'image' => 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'],
            'Point E' => ['tag' => 'Central', 'label' => 'Point E & UCAD', 'image' => 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80'],
            'Saly Portudal' => ['tag' => 'Détente', 'label' => 'Villas Balnéaires & Petite Côte', 'image' => 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80'],
            'Sanar' => ['tag' => 'Saint-Louis', 'label' => 'Sanar • Université Gaston Berger (UGB)', 'image' => 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80'],
            'Sanar Wolof' => ['tag' => 'Saint-Louis', 'label' => 'Sanar Wolof • Campus UGB', 'image' => 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80'],
            'Sor' => ['tag' => 'Saint-Louis', 'label' => 'Sor • Île & Fleuve Sénégal', 'image' => 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600&q=80'],
            'Ngallèle' => ['tag' => 'Saint-Louis', 'label' => 'Ngallèle • Axe Université UGB', 'image' => 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80'],
        ];

        $result = [];
        foreach ($rawQuartiers as $q) {
            $name = $q->quartier;
            $meta = $metadatas[$name] ?? [
                'tag' => $q->ville ?: 'Sénégal',
                'label' => $name . ' • ' . ($q->ville ?: 'Sénégal'),
                'image' => $q->image ?: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=600&q=80'
            ];

            $result[] = [
                'name' => $name,
                'count' => (int) $q->count,
                'ville' => $q->ville,
                'tag' => $meta['tag'],
                'label' => $meta['label'],
                'image' => $q->image ?: $meta['image'],
            ];
        }

        // Si aucun quartier avec quartier renseigné n'est trouvé, fallback sur les quartiers phares
        if (empty($result)) {
            foreach ($metadatas as $name => $meta) {
                $count = Logement::where('statut', 'publie')
                    ->where(function($q) use ($name) {
                        $q->where('quartier', 'like', "%{$name}%")
                          ->orWhere('ville', 'like', "%{$name}%")
                          ->orWhere('titre', 'like', "%{$name}%");
                    })->count();

                if ($count > 0) {
                    $result[] = [
                        'name' => $name,
                        'count' => $count,
                        'ville' => str_contains($meta['label'], 'Saint-Louis') ? 'Saint-Louis' : ($name === 'Saly Portudal' ? 'Saly Portudal' : 'Dakar'),
                        'tag' => $meta['tag'],
                        'label' => $meta['label'],
                        'image' => $meta['image'],
                    ];
                }
            }
        }

        return response()->json($result);
    }

    /**
     * Résout les coordonnées géographiques précises pour une ville et quartier du Sénégal
     */
    private function resolveCoordinates($ville, $quartier, $lat = null, $lng = null): array
    {
        if (!empty($lat) && !empty($lng) && $lat > 11 && $lat < 18 && $lng > -18 && $lng < -11) {
            return [(float) $lat, (float) $lng];
        }

        $v = mb_strtolower(trim($ville ?? ''));
        $q = mb_strtolower(trim($quartier ?? ''));

        // Saint-Louis
        if (str_contains($v, 'louis') || str_contains($q, 'sanar') || str_contains($q, 'ugb') || str_contains($q, 'ngallele')) {
            if (str_contains($q, 'wolof')) return [16.0615, -16.4225];
            if (str_contains($q, 'ngallele') || str_contains($q, 'ngallèle')) return [16.0460, -16.4520];
            if (str_contains($q, 'sanar') || str_contains($q, 'ugb') || str_contains($q, 'universit')) return [16.0592, -16.4258];
            if (str_contains($q, 'sor')) return [16.0245, -16.4950];
            if (str_contains($q, 'ile') || str_contains($q, 'faidherbe')) return [16.0240, -16.5040];
            if (str_contains($q, 'bango')) return [16.0680, -16.4630];
            return [16.0326, -16.4818];
        }

        // Dakar
        if (str_contains($v, 'dakar') || str_contains($q, 'almadies') || str_contains($q, 'ngor') || str_contains($q, 'plateau')) {
            if (str_contains($q, 'almadies')) return [14.7432, -17.5190];
            if (str_contains($q, 'ngor') || str_contains($q, 'virage')) return [14.7501, -17.5084];
            if (str_contains($q, 'fann')) return [14.6892, -17.4725];
            if (str_contains($q, 'point e')) return [14.6950, -17.4600];
            if (str_contains($q, 'plateau')) return [14.6710, -17.4320];
            if (str_contains($q, 'mermoz')) return [14.7080, -17.4760];
            if (str_contains($q, 'yoff')) return [14.7610, -17.4680];
            return [14.7167, -17.4677];
        }

        // Saly
        if (str_contains($v, 'saly') || str_contains($q, 'saly')) {
            return [14.4420, -16.9850];
        }

        return [16.0326, -16.4818];
    }
}
