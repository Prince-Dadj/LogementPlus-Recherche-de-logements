<?php

namespace Database\Seeders;

use App\Models\Agence;
use App\Models\Temoignage;
use Illuminate\Database\Seeder;

class AgencesAndTemoignagesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Agences partenaires sénégalaises
        $agences = [
            [
                'nom' => 'Dakar Immo Pro',
                'ville' => 'Dakar • Plateau',
                'adresse' => 'Avenue Léopold Sédar Senghor, Dakar',
                'telephone' => '+221 33 821 00 11',
                'email' => 'contact@dakarimmopro.sn',
                'icone' => 'bi-buildings',
                'description' => 'Spécialiste de l\'immobilier d\'affaires et résidentiel haut standing à Dakar.',
                'est_partenaire_certifie' => true,
                'nombre_biens' => 42,
            ],
            [
                'nom' => 'Sénégal Résidence',
                'ville' => 'Almadies • Ngor',
                'adresse' => 'Route des Almadies, en face Ambassade USA',
                'telephone' => '+221 33 820 44 55',
                'email' => 'info@senegalresidence.sn',
                'icone' => 'bi-house-heart',
                'description' => 'Villas de prestige, pieds dans l\'eau et appartements modernes avec vue mer.',
                'est_partenaire_certifie' => true,
                'nombre_biens' => 38,
            ],
            [
                'nom' => 'Petite Côte Habitat',
                'ville' => 'Saly • Mbour',
                'adresse' => 'Boulevard de Saly Portudal, Mbour',
                'telephone' => '+221 33 957 12 34',
                'email' => 'contact@petitecotehabitat.sn',
                'icone' => 'bi-geo-alt',
                'description' => 'Leader de la gestion locative balnéaire et des résidences de vacances à Saly.',
                'est_partenaire_certifie' => true,
                'nombre_biens' => 56,
            ],
            [
                'nom' => 'Capital Realty SN',
                'ville' => 'Dakar • Hann Bel-Air',
                'adresse' => 'Zone Industrielle Bel-Air, Dakar',
                'telephone' => '+221 33 832 99 88',
                'email' => 'direction@capitalrealty.sn',
                'icone' => 'bi-bar-chart',
                'description' => 'Gestion de patrimoine locatif et investissements immobiliers au Sénégal.',
                'est_partenaire_certifie' => true,
                'nombre_biens' => 29,
            ],
            [
                'nom' => 'Teranga Properties',
                'ville' => 'Fann • Point E',
                'adresse' => 'Rue de Diourbel x Rue de Kaolack, Point E',
                'telephone' => '+221 33 825 77 66',
                'email' => 'bonjour@terangaproperties.sn',
                'icone' => 'bi-heart',
                'description' => 'Agence de confiance pour diplomates, cadres expatriés et universitaires.',
                'est_partenaire_certifie' => true,
                'nombre_biens' => 31,
            ],
            [
                'nom' => 'Excellence Immobilier',
                'ville' => 'Ouakam • Yoff',
                'adresse' => 'Cité Avion, Ouakam Corniche',
                'telephone' => '+221 33 860 14 20',
                'email' => 'contact@excellence-immo.sn',
                'icone' => 'bi-patch-check',
                'description' => 'Transactions sécurisées et baux conformes à la législation sénégalaise.',
                'est_partenaire_certifie' => true,
                'nombre_biens' => 24,
            ],
            [
                'nom' => 'Grand Dakar Habitat',
                'ville' => 'Grand Dakar • Liberté',
                'adresse' => 'Sicap Liberté 4, Allée Seydou Nourou Tall',
                'telephone' => '+221 33 824 50 30',
                'email' => 'contact@granddakarhabitat.sn',
                'icone' => 'bi-building',
                'description' => 'Logements familiaux et studios étudiants à proximité des grands axes.',
                'est_partenaire_certifie' => true,
                'nombre_biens' => 35,
            ],
            [
                'nom' => 'Corniche Invest',
                'ville' => 'Corniche Ouest',
                'adresse' => 'Place du Souvenir Africain, Fann',
                'telephone' => '+221 33 822 10 90',
                'email' => 'invest@cornicheinvest.sn',
                'icone' => 'bi-gem',
                'description' => 'Immobilier haut standing le long de la Corniche de Dakar.',
                'est_partenaire_certifie' => true,
                'nombre_biens' => 19,
            ],
            [
                'nom' => 'Saly Balnéaire SARL',
                'ville' => 'Saly • Pointe Sarène',
                'adresse' => 'Route de la Somone, Saly',
                'telephone' => '+221 33 958 40 40',
                'email' => 'resa@salybalneaire.sn',
                'icone' => 'bi-water',
                'description' => 'Résidences avec piscine privée et accès direct aux plages de la Petite Côte.',
                'est_partenaire_certifie' => true,
                'nombre_biens' => 47,
            ],
            [
                'nom' => 'Immo Teranga Plus',
                'ville' => 'Rufisque • Bargny',
                'adresse' => 'Boulevard Maurice Guèye, Rufisque',
                'telephone' => '+221 33 836 22 15',
                'email' => 'service@immoterangaplus.sn',
                'icone' => 'bi-star',
                'description' => 'Développement de nouvelles cités résidentielles et villas modernes.',
                'est_partenaire_certifie' => true,
                'nombre_biens' => 22,
            ],
        ];

        foreach ($agences as $data) {
            Agence::firstOrCreate(['nom' => $data['nom']], $data);
        }

        // 2. Témoignages / Avis Authentiques Plateforme
        $temoignages = [
            [
                'nom_auteur' => 'Fatou Diop',
                'role_auteur' => 'locataire',
                'ville' => 'Fann Résidence (Corniche)',
                'note' => 5,
                'commentaire' => "J'ai trouvé mon appartement 4 pièces à Fann Résidence en 48 heures. Le contrat PDF était prêt instantanément et le paiement Wave a été validé en quelques secondes. Service remarquable !",
                'avatar_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
                'badge' => '✓ Avis Vérifié',
                'est_affiche' => true,
                'est_verifie' => true,
            ],
            [
                'nom_auteur' => 'Mamadou Sy',
                'role_auteur' => 'locataire',
                'ville' => 'Les Almadies, Dakar',
                'note' => 5,
                'commentaire' => "À mon arrivée à Dakar, la garantie anti-délestage était ma priorité numéro 1. La villa aux Almadies dispose d'un groupe automatique silencieux et d'une réserve d'eau impeccable. Bravo à l'équipe.",
                'avatar_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
                'badge' => '✓ Avis Vérifié',
                'est_affiche' => true,
                'est_verifie' => true,
            ],
            [
                'nom_auteur' => 'El Hadj Ndiaye',
                'role_auteur' => 'gestionnaire',
                'ville' => 'Saly Portudal',
                'note' => 5,
                'commentaire' => "En tant que propriétaire bailleur de deux villas à Saly, la plateforme me permet de louer à des locataires vérifiés et de recevoir les loyers à date fixe sans aucun retard.",
                'avatar_url' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
                'badge' => '✓ Bailleur Certifié',
                'est_affiche' => true,
                'est_verifie' => true,
            ],
            [
                'nom_auteur' => 'Dakar Immo Pro (Directeur)',
                'role_auteur' => 'agence',
                'ville' => 'Dakar Plateau',
                'note' => 5,
                'commentaire' => "Notre partenariat avec LogementPlus nous a permis de digitaliser 100% de nos mandats de gestion. La solvabilité des locataires est vérifiée et les litiges sont nuls.",
                'avatar_url' => 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
                'badge' => '✓ Agence Partenaire',
                'est_affiche' => true,
                'est_verifie' => true,
            ],
            [
                'nom_auteur' => 'Aissatou Bâ',
                'role_auteur' => 'locataire',
                'ville' => 'Dakar Plateau Centre',
                'note' => 5,
                'commentaire' => "Le dossier locataire numérique m'a ouvert les portes d'un studio au Plateau sans avoir à me déplacer. Tout est clair, rapide et sécurisé.",
                'avatar_url' => 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&q=80',
                'badge' => '✓ Avis Vérifié',
                'est_affiche' => true,
                'est_verifie' => true,
            ],
            [
                'nom_auteur' => 'Moussa Traoré',
                'role_auteur' => 'locataire',
                'ville' => 'Ngor Virage',
                'note' => 5,
                'commentaire' => "Expatrié depuis Paris, j'ai signé mon bail et payé ma caution à distance via Wave. À mon arrivée à Dakar, les clés m'attendaient. Une sérénité absolue.",
                'avatar_url' => 'https://images.unsplash.com/photo-1542909168-82c3e7fdebef?auto=format&fit=crop&w=150&q=80',
                'badge' => '✓ Diaspora Certifié',
                'est_affiche' => true,
                'est_verifie' => true,
            ],
        ];

        foreach ($temoignages as $t) {
            Temoignage::firstOrCreate(['nom_auteur' => $t['nom_auteur']], $t);
        }
    }
}
