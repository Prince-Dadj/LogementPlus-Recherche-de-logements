<?php

namespace Database\Seeders;

use App\Models\Equipement;
use App\Models\Logement;
use App\Models\Photo;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SenegalLogementsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer ou récupérer un admin gestionnaire sénégalais
        $admin = User::firstOrCreate(
            ['email' => 'admin1@example.com'],
            [
                'name' => 'Moussa Ndiaye (Gestionnaire)',
                'nom' => 'Ndiaye',
                'prenom' => 'Moussa',
                'telephone' => '+221 77 200 00 01',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'statut' => 'actif',
                'raison_sociale' => 'Dakar Prestige Immobilier',
                'statut_validation' => 'valide',
            ]
        );

        $logements = [
            [
                'admin_id' => $admin->id,
                'titre' => 'Villa Prestige avec Piscine & Vue Océan - Les Almadies',
                'description' => 'Somptueuse villa d\'architecte située dans le quartier le plus exclusif de Dakar, Les Almadies. 4 chambres autonomes avec salles de bain attenantes, salon majestueux ouvert sur jardin arboré et piscine à débordement.',
                'type' => 'maison',
                'adresse' => 'Route de la Pointe des Almadies',
                'ville' => 'Dakar',
                'quartier' => 'Almadies',
                'latitude' => 14.7432,
                'longitude' => -17.5190,
                'prix_par_mois' => 1200000,
                'caution' => 2400000,
                'frais_service' => 60000,
                'nb_pieces' => 5,
                'surface' => 360,
                'meuble' => true,
                'statut' => 'publie',
                'mode_reservation' => 'immediate',
                'politique_annulation' => 'gratuite',
                'image_principale' => 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
            ],
            [
                'admin_id' => $admin->id,
                'titre' => 'Appartement Haut Standing F4 Vue Mer - Fann Résidence Corniche',
                'description' => 'Superbe appartement 4 pièces lumineux face à l\'océan Atlantique sur la Corniche Ouest. Vaste séjour traversant avec terrasse panoramique, suite parentale avec dressing.',
                'type' => 'appartement',
                'adresse' => 'Corniche Ouest, Fann Résidence',
                'ville' => 'Dakar',
                'quartier' => 'Fann Résidence',
                'latitude' => 14.6892,
                'longitude' => -17.4725,
                'prix_par_mois' => 650000,
                'caution' => 1300000,
                'frais_service' => 35000,
                'nb_pieces' => 4,
                'surface' => 165,
                'meuble' => true,
                'statut' => 'publie',
                'mode_reservation' => 'immediate',
                'politique_annulation' => 'gratuite',
                'image_principale' => 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
            ],
            [
                'admin_id' => $admin->id,
                'titre' => 'Studio Cosy Meublé & Équipé - Dakar Plateau Centre',
                'description' => 'Charmant studio entièrement refait à neuf en plein centre d\'affaires de Dakar Plateau. Lit double grand confort, kitchenette moderne tout équipée, Wi-Fi très haut débit.',
                'type' => 'studio',
                'adresse' => 'Rue Félix Faure x Rue Vincens, Dakar Plateau',
                'ville' => 'Dakar',
                'quartier' => 'Plateau',
                'latitude' => 14.6710,
                'longitude' => -17.4320,
                'prix_par_mois' => 250000,
                'caution' => 500000,
                'frais_service' => 15000,
                'nb_pieces' => 1,
                'surface' => 42,
                'meuble' => true,
                'statut' => 'publie',
                'mode_reservation' => 'sur_validation',
                'politique_annulation' => 'partielle',
                'image_principale' => 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
            ],
            [
                'admin_id' => $admin->id,
                'titre' => 'Villa Balnéaire avec Piscine & Jardin - Saly Portudal',
                'description' => 'Magnifique villa de plain-pied au cœur de la station balnéaire de Saly Portudal sur la Petite Côte. 3 suites indépendantes, terrasse ombragée bordant une piscine privative.',
                'type' => 'maison',
                'adresse' => 'Boulevard des Cocotiers, Saly Portudal',
                'ville' => 'Saly Portudal',
                'quartier' => 'Saly Portudal',
                'latitude' => 14.4420,
                'longitude' => -16.9850,
                'prix_par_mois' => 550000,
                'caution' => 1100000,
                'frais_service' => 30000,
                'nb_pieces' => 4,
                'surface' => 220,
                'meuble' => true,
                'statut' => 'publie',
                'mode_reservation' => 'immediate',
                'politique_annulation' => 'gratuite',
                'image_principale' => 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
            ],
            [
                'admin_id' => $admin->id,
                'titre' => 'Appartement F3 Neuf Standing - Ngor Virage / Mamelles',
                'description' => 'Superbe appartement 3 pièces neuf avec vue sur le Phare des Mamelles et l\'Île de Ngor. Grand salon carrelé, cuisine américaine avec plan de travail en quartz, 2 chambres avec dressings.',
                'type' => 'appartement',
                'adresse' => 'Route de la Corniche, Ngor Virage',
                'ville' => 'Dakar',
                'quartier' => 'Ngor',
                'latitude' => 14.7501,
                'longitude' => -17.5084,
                'prix_par_mois' => 390000,
                'caution' => 780000,
                'frais_service' => 25000,
                'nb_pieces' => 3,
                'surface' => 98,
                'meuble' => true,
                'statut' => 'publie',
                'mode_reservation' => 'immediate',
                'politique_annulation' => 'gratuite',
                'image_principale' => 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
            ],
            [
                'admin_id' => $admin->id,
                'titre' => 'Chambre Meublée Confort & Moderne - Dakar Point E',
                'description' => 'Chambre individuelle moderne et lumineuse dans un immeuble de standing au Point E. Salle d\'eau privative, climatisation réversible, bureau de travail et placard intégré.',
                'type' => 'chambre',
                'adresse' => 'Avenue Cheikh Anta Diop x Rue de Kaolack, Point E',
                'ville' => 'Dakar',
                'quartier' => 'Point E',
                'latitude' => 14.6950,
                'longitude' => -17.4600,
                'prix_par_mois' => 150000,
                'caution' => 300000,
                'frais_service' => 10000,
                'nb_pieces' => 1,
                'surface' => 25,
                'meuble' => true,
                'statut' => 'publie',
                'mode_reservation' => 'immediate',
                'politique_annulation' => 'gratuite',
                'image_principale' => 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80',
            ],
        ];

        foreach ($logements as $data) {
            Logement::updateOrCreate(
                ['titre' => $data['titre']],
                $data
            );
        }
    }
}
