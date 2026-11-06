<?php

namespace Database\Seeders;

use App\Models\Avis;
use App\Models\Contrat;
use App\Models\Disponibilite;
use App\Models\Equipement;
use App\Models\Logement;
use App\Models\Paiement;
use App\Models\Photo;
use App\Models\PlateformeParametre;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Paramètres de la Plateforme (RF-52)
        PlateformeParametre::create([
            'cle' => 'taux_commission',
            'valeur' => '10',
            'description' => 'Pourcentage de commission de la plateforme par réservation (%)',
        ]);
        PlateformeParametre::create([
            'cle' => 'delai_validation_admin_heures',
            'valeur' => '24',
            'description' => 'Délai maximal accordé à l\'administrateur pour valider une demande',
        ]);
        PlateformeParametre::create([
            'cle' => 'moyens_paiement_actifs',
            'valeur' => 'carte,orange_money,mtn_money,wave',
            'description' => 'Moyens de paiement activés sur la plateforme',
        ]);

        // 2. Utilisateurs : Super Admin, Admins (Gestionnaires), Locataires
        $superAdmin = User::create([
            'name' => 'Super Administrateur',
            'nom' => 'Kouassi',
            'prenom' => 'Jean-Marc',
            'email' => 'superadmin@logementplus.com',
            'telephone' => '+225 07 01 02 03 04',
            'password' => Hash::make('password123'),
            'role' => 'superadmin',
            'statut' => 'actif',
            'two_factor_enabled' => true,
        ]);

        $adminAgence1 = User::create([
            'name' => 'Agence Ivoire Habitat Prestige',
            'nom' => 'Diallo',
            'prenom' => 'Amadou',
            'email' => 'admin@ivoire-habitat.com',
            'telephone' => '+225 05 11 22 33 44',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'statut' => 'actif',
            'raison_sociale' => 'Ivoire Habitat Prestige SARL',
            'statut_validation' => 'valide',
            'two_factor_enabled' => true,
        ]);

        $adminProprio2 = User::create([
            'name' => 'Résidences Cocody Confort',
            'nom' => 'Bamba',
            'prenom' => 'Fatou',
            'email' => 'contact@residence-cocody.ci',
            'telephone' => '+225 01 44 55 66 77',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'statut' => 'actif',
            'raison_sociale' => 'SCI Les Merveilles de Cocody',
            'statut_validation' => 'valide',
            'two_factor_enabled' => false,
        ]);

        $tenant1 = User::create([
            'name' => 'Marc Konan',
            'nom' => 'Konan',
            'prenom' => 'Marc',
            'email' => 'locataire@example.com',
            'telephone' => '+225 07 88 99 00 11',
            'password' => Hash::make('password123'),
            'role' => 'locataire',
            'statut' => 'actif',
            'piece_identite' => 'cni_konan_2026.pdf',
            'preferences' => ['ville' => 'Abidjan', 'budget_max' => 350000, 'type' => 'appartement'],
        ]);

        $tenant2 = User::create([
            'name' => 'Sarah Koffi',
            'nom' => 'Koffi',
            'prenom' => 'Sarah',
            'email' => 'sarah.k@example.com',
            'telephone' => '+225 05 99 88 77 66',
            'password' => Hash::make('password123'),
            'role' => 'locataire',
            'statut' => 'actif',
            'piece_identite' => 'passeport_sarah_2026.pdf',
        ]);

        // 3. Équipements de référence (RF-11)
        $eqClim = Equipement::create(['nom' => 'Climatisation', 'icone' => 'bi-snow', 'categorie' => 'confort']);
        $eqWifi = Equipement::create(['nom' => 'Wi-Fi Haut Débit (Fibre)', 'icone' => 'bi-wifi', 'categorie' => 'connectivite']);
        $eqParking = Equipement::create(['nom' => 'Parking sécurisé', 'icone' => 'bi-p-circle', 'categorie' => 'securite']);
        $eqSecu = Equipement::create(['nom' => 'Gardiennage 24/7 & Vidéosurveillance', 'icone' => 'bi-shield-check', 'categorie' => 'securite']);
        $eqCuisine = Equipement::create(['nom' => 'Cuisine tout équipée', 'icone' => 'bi-cup-hot', 'categorie' => 'cuisine']);
        $eqPiscine = Equipement::create(['nom' => 'Piscine privée / résidence', 'icone' => 'bi-water', 'categorie' => 'loisirs']);
        $eqEauElec = Equipement::create(['nom' => 'Groupe électrogène & Réserve eau', 'icone' => 'bi-lightning-charge', 'categorie' => 'essentiel']);
        $eqLavage = Equipement::create(['nom' => 'Machine à laver', 'icone' => 'bi-basket', 'categorie' => 'confort']);
        $eqTerrasse = Equipement::create(['nom' => 'Balcon / Terrasse panoramique', 'icone' => 'bi-sun', 'categorie' => 'confort']);

        // 4. Logements représentatifs avec géolocalisation
        $logementsData = [
            [
                'admin_id' => $adminAgence1->id,
                'titre' => 'Superbe Appartement 3 Pièces - Vue Lagune & Plateau',
                'description' => 'Magnifique appartement moderne situé au cœur de Cocody Danga, comprenant 2 chambres autonomes climatisées, grand salon lumineux, cuisine équipée et terrasse avec vue imprenable sur la baie lagunaire. Idéal cadres et séjours d\'affaires.',
                'type' => 'appartement',
                'adresse' => 'Boulevard Hassan II, Cocody Danga',
                'ville' => 'Abidjan',
                'quartier' => 'Cocody',
                'latitude' => 5.3354,
                'longitude' => -4.0041,
                'prix_par_mois' => 380000,
                'caution' => 380000,
                'frais_service' => 25000,
                'nb_pieces' => 3,
                'surface' => 95,
                'meuble' => true,
                'statut' => 'publie',
                'mode_reservation' => 'immediate',
                'politique_annulation' => 'gratuite',
                'reglement_interieur' => 'Animaux non admis. Fêtes interdites après 22h. Non fumeur à l\'intérieur.',
                'image_principale' => 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
                'equipements' => [$eqClim->id, $eqWifi->id, $eqParking->id, $eqSecu->id, $eqCuisine->id, $eqEauElec->id, $eqTerrasse->id],
                'photos' => [
                    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
                ]
            ],
            [
                'admin_id' => $adminAgence1->id,
                'titre' => 'Studio Cosy Meublé avec Jardin Privé - Plateau Dokui',
                'description' => 'Studio indépendant entièrement rénové et meublé avec goût dans un cadre paisible et verdoyant. Connexion fibre optique très haut débit, cuisine américaine, lit queen size et stationnement privé.',
                'type' => 'studio',
                'adresse' => 'Rue J45, Plateau Dokui',
                'ville' => 'Abidjan',
                'quartier' => 'Plateau',
                'latitude' => 5.3882,
                'longitude' => -4.0195,
                'prix_par_mois' => 160000,
                'caution' => 160000,
                'frais_service' => 15000,
                'nb_pieces' => 1,
                'surface' => 38,
                'meuble' => true,
                'statut' => 'publie',
                'mode_reservation' => 'sur_validation',
                'politique_annulation' => 'partielle',
                'reglement_interieur' => 'Usage strictement résidentiel. Caution demandée à l\'état des lieux.',
                'image_principale' => 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
                'equipements' => [$eqClim->id, $eqWifi->id, $eqParking->id, $eqCuisine->id],
                'photos' => [
                    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
                ]
            ],
            [
                'admin_id' => $adminProprio2->id,
                'titre' => 'Villa Moderne 5 Pièces avec Piscine Privée - Riviera Golf',
                'description' => 'Prestigieuse villa contemporaine dans quartier sécurisé et très prisé. 4 chambres spacieuses avec salles d\'eau privatives, séjour cathédrale de 65m², piscine à débordement, jardin arboré et dépendance gardien.',
                'type' => 'maison',
                'adresse' => 'Allée des Ambassades, Riviera Golf',
                'ville' => 'Abidjan',
                'quartier' => 'Cocody',
                'latitude' => 5.3468,
                'longitude' => -3.9782,
                'prix_par_mois' => 950000,
                'caution' => 1900000,
                'frais_service' => 50000,
                'nb_pieces' => 5,
                'surface' => 320,
                'meuble' => true,
                'statut' => 'publie',
                'mode_reservation' => 'sur_validation',
                'politique_annulation' => 'gratuite',
                'reglement_interieur' => 'Entretien régulier de la piscine et jardin inclus.',
                'image_principale' => 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
                'equipements' => [$eqClim->id, $eqWifi->id, $eqParking->id, $eqSecu->id, $eqCuisine->id, $eqPiscine->id, $eqEauElec->id, $eqTerrasse->id, $eqLavage->id],
                'photos' => [
                    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
                ]
            ],
            [
                'admin_id' => $adminProprio2->id,
                'titre' => 'Chambre Meublée Confort dans Résidence Sécurisée - Marcory Zone 4',
                'description' => 'Grande chambre autonome tout confort avec salle de bain privée, dressing et bureau. Proche de toutes les commodités de Zone 4, restaurants, supermarchés et aéroport FHB à 10 minutes.',
                'type' => 'chambre',
                'adresse' => 'Rue Paul Langevin, Marcory Zone 4C',
                'ville' => 'Abidjan',
                'quartier' => 'Marcory',
                'latitude' => 5.2951,
                'longitude' => -3.9874,
                'prix_par_mois' => 125000,
                'caution' => 125000,
                'frais_service' => 10000,
                'nb_pieces' => 1,
                'surface' => 26,
                'meuble' => true,
                'statut' => 'publie',
                'mode_reservation' => 'immediate',
                'politique_annulation' => 'non_remboursable',
                'reglement_interieur' => 'Chambre non-fumeur. Respect de la quiétude des colocataires.',
                'image_principale' => 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80',
                'equipements' => [$eqClim->id, $eqWifi->id, $eqSecu->id, $eqLavage->id],
                'photos' => [
                    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
                ]
            ],
            [
                'admin_id' => $adminAgence1->id,
                'titre' => 'Appartement F4 Standing Neuf avec Ascenseur - Cocody Angré 8e Tranche',
                'description' => 'Superbe opportunité dans un immeuble standing flambant neuf. 3 chambres avec placards intégrés, grand double salon, balcon filant, cuisine américaine et box fermé en sous-sol.',
                'type' => 'appartement',
                'adresse' => 'Carrefour Soleil 2, Angré 8e Tranche',
                'ville' => 'Abidjan',
                'quartier' => 'Cocody',
                'latitude' => 5.3721,
                'longitude' => -3.9854,
                'prix_par_mois' => 450000,
                'caution' => 900000,
                'frais_service' => 30000,
                'nb_pieces' => 4,
                'surface' => 130,
                'meuble' => false,
                'statut' => 'publie',
                'mode_reservation' => 'sur_validation',
                'politique_annulation' => 'gratuite',
                'reglement_interieur' => 'Bail d\'un an renouvelable. Justificatifs de revenus exigés.',
                'image_principale' => 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
                'equipements' => [$eqClim->id, $eqParking->id, $eqSecu->id, $eqEauElec->id, $eqTerrasse->id],
                'photos' => [
                    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
                ]
            ]
        ];

        $createdLogements = [];
        foreach ($logementsData as $item) {
            $eqs = $item['equipements'];
            $photos = $item['photos'];
            unset($item['equipements'], $item['photos']);

            $logement = Logement::create($item);
            $logement->equipements()->sync($eqs);

            $order = 1;
            foreach ($photos as $url) {
                Photo::create([
                    'logement_id' => $logement->id,
                    'url' => $url,
                    'ordre' => $order++,
                ]);
            }

            Disponibilite::create([
                'logement_id' => $logement->id,
                'date_debut' => now()->startOfMonth(),
                'date_fin' => now()->addMonths(6)->endOfMonth(),
                'bloquee' => false,
            ]);

            $createdLogements[] = $logement;
        }

        // 5. Réservations types avec statuts variés (RF-25)
        // Réservation 1 : Payée et confirmée
        $res1 = Reservation::create([
            'locataire_id' => $tenant1->id,
            'logement_id' => $createdLogements[0]->id,
            'date_debut' => now()->addDays(5)->format('Y-m-d'),
            'date_fin' => now()->addDays(35)->format('Y-m-d'),
            'duree_jours' => 30,
            'montant_loyer' => 380000,
            'montant_caution' => 380000,
            'montant_frais_service' => 25000,
            'montant_total' => 785000,
            'statut' => 'payee',
        ]);

        Paiement::create([
            'reservation_id' => $res1->id,
            'montant' => 785000,
            'type' => 'premier_loyer',
            'moyen' => 'wave',
            'statut' => 'reussi',
            'reference_transaction' => 'TXN-WAVE-20261019-98214',
            'commission_plateforme' => 78500,
            'montant_reverse_admin' => 706500,
            'statut_reversement' => 'effectue',
            'date_paiement' => now()->subHours(2),
        ]);

        Contrat::create([
            'reservation_id' => $res1->id,
            'numero' => 'CTR-2026-0001',
            'fichier_pdf' => 'contrats/contrat_0001.pdf',
            'date_signature' => now()->subHours(2),
            'statut_signature' => 'signe',
        ]);

        // Réservation 2 : En attente de validation admin (RF-21)
        $res2 = Reservation::create([
            'locataire_id' => $tenant2->id,
            'logement_id' => $createdLogements[1]->id,
            'date_debut' => now()->addDays(10)->format('Y-m-d'),
            'date_fin' => now()->addDays(40)->format('Y-m-d'),
            'duree_jours' => 30,
            'montant_loyer' => 160000,
            'montant_caution' => 160000,
            'montant_frais_service' => 15000,
            'montant_total' => 335000,
            'statut' => 'en_attente',
        ]);

        // 6. Avis (RF-60)
        Avis::create([
            'locataire_id' => $tenant1->id,
            'logement_id' => $createdLogements[0]->id,
            'note' => 5,
            'commentaire' => 'Logement impeccable et fidèle aux photos ! Le quartier est très calme et la vue sur la lagune est magique au coucher de soleil. La réservation et le paiement Wave ont été quasi instantanés.',
            'est_modere' => true,
        ]);

        Avis::create([
            'locataire_id' => $tenant2->id,
            'logement_id' => $createdLogements[2]->id,
            'note' => 5,
            'commentaire' => 'Villa sublime, sécurité maximale et très grande disponibilité du gestionnaire. Nous avons passé un séjour inoubliable !',
            'est_modere' => true,
        ]);
    }
}
