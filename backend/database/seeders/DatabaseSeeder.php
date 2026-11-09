<?php

namespace Database\Seeders;

use App\Models\Equipement;
use App\Models\PlateformeParametre;
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
        PlateformeParametre::firstOrCreate(['cle' => 'taux_commission'], [
            'valeur' => '10',
            'description' => 'Pourcentage de commission de la plateforme par réservation (%)',
        ]);
        PlateformeParametre::firstOrCreate(['cle' => 'delai_validation_admin_heures'], [
            'valeur' => '24',
            'description' => 'Délai maximal accordé à l\'administrateur pour valider une demande',
        ]);
        PlateformeParametre::firstOrCreate(['cle' => 'moyens_paiement_actifs'], [
            'valeur' => 'carte,orange_money,mtn_money,wave',
            'description' => 'Moyens de paiement activés sur la plateforme',
        ]);

        // 2. Super Administrateur & Locataires de test
        User::firstOrCreate(['email' => 'superadmin@logementplus.com'], [
            'name' => 'Super Administrateur',
            'nom' => 'Kouassi',
            'prenom' => 'Jean-Marc',
            'telephone' => '+221 77 000 00 00',
            'password' => Hash::make('password123'),
            'role' => 'superadmin',
            'statut' => 'actif',
            'two_factor_enabled' => true,
        ]);

        User::firstOrCreate(['email' => 'locataire@example.com'], [
            'name' => 'Fatou Diop (Locataire)',
            'nom' => 'Diop',
            'prenom' => 'Fatou',
            'telephone' => '+221 77 888 99 00',
            'password' => Hash::make('password123'),
            'role' => 'locataire',
            'statut' => 'actif',
            'piece_identite' => 'cni_diop_2026.pdf',
            'preferences' => ['ville' => 'Dakar', 'budget_max' => 500000, 'type' => 'appartement'],
        ]);

        // 3. Équipements de référence (RF-11)
        Equipement::firstOrCreate(['nom' => 'Climatisation'], ['icone' => 'bi-snow', 'categorie' => 'confort']);
        Equipement::firstOrCreate(['nom' => 'Wi-Fi Haut Débit (Fibre)'], ['icone' => 'bi-wifi', 'categorie' => 'connectivite']);
        Equipement::firstOrCreate(['nom' => 'Parking sécurisé'], ['icone' => 'bi-p-circle', 'categorie' => 'securite']);
        Equipement::firstOrCreate(['nom' => 'Gardiennage 24/7 & Vidéosurveillance'], ['icone' => 'bi-shield-check', 'categorie' => 'securite']);
        Equipement::firstOrCreate(['nom' => 'Cuisine tout équipée'], ['icone' => 'bi-cup-hot', 'categorie' => 'cuisine']);
        Equipement::firstOrCreate(['nom' => 'Piscine privée / résidence'], ['icone' => 'bi-water', 'categorie' => 'loisirs']);
        Equipement::firstOrCreate(['nom' => 'Groupe électrogène & Réserve eau'], ['icone' => 'bi-lightning-charge', 'categorie' => 'essentiel']);
        Equipement::firstOrCreate(['nom' => 'Machine à laver'], ['icone' => 'bi-basket', 'categorie' => 'confort']);
        Equipement::firstOrCreate(['nom' => 'Balcon / Terrasse panoramique'], ['icone' => 'bi-sun', 'categorie' => 'confort']);

        // Les anciens gestionnaires supprimés (Moussa Ndiaye, Résidences Cocody Confort, Agence Ivoire Habitat Prestige)
        // et leurs logements ont été définitivement retirés du système.
    }
}
