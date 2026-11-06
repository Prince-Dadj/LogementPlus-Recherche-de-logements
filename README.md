# LogementPlus - Plateforme de Recherche, Réservation et Paiement de Logements en Ligne

> Conforme au **Cahier des charges Version 1.0 (19 octobre 2026)**.

---

## 🏗️ Architecture Technique

- **Frontend** : **Angular 22** + **Bootstrap 5.3** + **Bootstrap Icons** + **Leaflet** (Cartographie interactive) + **Chart.js** (Tableaux de bord & graphiques)
- **Backend** : **Laravel 12 / PHP 8.4** REST API documentée + **Laravel Sanctum** (authentification par token)
- **Base de Données** : **MySQL 8.0** (support natif configuré dans `.env`) / SQLite préconfiguré pour tests immédiats
- **Charte Graphique** (Section 8 du CDC) :
  - **Primaire** : Bleu profond `#0B3D91` (En-têtes, boutons principaux, liens)
  - **Secondaire** : Turquoise `#14B8A6` (Accents, badges de succès, marqueurs)
  - **Accent** : Orange chaud `#F59E0B` (Appels à l'action forte, paiements)
  - **Fond** : Blanc cassé `#F8FAFC`
  - **Typographies** : *Poppins* (Titres) et *Inter* (Corps et montants tabulaires)
  - **Boutons & Cartes** : Boutons arrondis 8px, cartes ratio 16:9 arrondis 12px avec ombre légère

---

## 👥 Comptes de Démonstration (Prêts à l'emploi)

Le header de l'application intègre un **sélecteur de rôles en un clic** (`Visiteur`, `Locataire`, `Admin`, `Super Admin`) permettant de tester instantanément tous les espaces sans avoir à retaper les identifiants.

| Rôle | Nom / Raison Sociale | Email | Mot de passe | Droits principaux |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | Jean-Marc Kouassi | `superadmin@logementplus.com` | `password123` | Supervision globale, validation des gestionnaires, modération, commissions & journal d'audit |
| **Admin (Agence)** | Ivoire Habitat Prestige | `admin@ivoire-habitat.com` | `password123` | Gestion catalogue, traitement des réservations (valider/refuser), suivi des loyers nets (90%) |
| **Admin (Propriétaire)** | Résidences Cocody Confort | `contact@residence-cocody.ci` | `password123` | Gestion villas & studios, disponibilités, validation réservations sous 24h |
| **Locataire** | Marc Konan | `locataire@example.com` | `password123` | Recherche carte, réservation en 4 étapes, paiement Wave/CB, reçus et contrats PDF |
| **Visiteur** | Non connecté | *Aucun* | *Aucun* | Consultation fiches, recherche avec filtres, exploration carte |

---

## 🚀 Démarrage Rapide

### 1. Démarrer le Backend Laravel (Port 8000)

Ouvrez un premier terminal dans le dossier `backend` :
```bash
cd backend
php artisan serve --port 8000
```
> Le serveur API démarrera sur `http://localhost:8000`.

### 2. Démarrer le Frontend Angular (Port 4200)

Ouvrez un second terminal dans le dossier `frontend` :
```bash
cd frontend
npm start
```
> L'application sera accessible sur **`http://localhost:4200`**.

---

## 📋 Fonctionnalités Implémentées par Rapport au CDC

### 1. Espace Public & Locataire
- **RF-10 à RF-13** : Barre de recherche héro proéminente, filtres par type (appartement, studio, maison, chambre), prix max, pièces, surface, meublé, équipements, et bascule **Liste / Carte interactive Leaflet**.
- **RF-14** : Fiche détaillée avec galerie photos (min 3 photos), équipements avec icônes, règlement intérieur, politique d'annulation, carte et avis notés.
- **RF-20 à RF-25 (CDC 8.6)** : **Parcours de réservation en 4 étapes maximum** :
  1. *Choix des dates* (calcul automatique loyer, caution, frais de service).
  2. *Récapitulatif* (conditions, politique d'annulation, validation immédiate ou sous 24h).
  3. *Paiement sécurisé* (Carte bancaire certifiée, Wave Mobile Money ou Orange Money CI, acompte 30% ou loyer complet).
  4. *Confirmation* (référence dossier, contrat de bail dématérialisé, reçu de paiement téléchargeable).
- **RF-25** : Tableau de bord locataire avec historique des réservations et badges de statut conformes (en attente en ambre, confirmée en vert, payée en turquoise, annulée en rouge).

### 2. Espace Administrateur (Gestionnaire)
- **CDC 8.6** : Interface avec **barre latérale à gauche**, indicateurs clés en haut, graphiques au centre.
- **RF-40 & RF-41** : Gestion des logements avec formulaire de publication (minimum 3 photos) et mise hors ligne/en ligne en 1 clic.
- **RF-43** : Traitement des demandes reçues avec boutons **Valider** (vert) ou **Refuser avec motif obligatoire** (rouge).
- **RF-45 & RF-36** : Suivi des paiements, reversements automatiques à 90% (déduction de la commission de 10%).
- **RF-70 & RF-72** : Histogramme mensuel des revenus, répartition par type de bien et export des rapports en CSV.
- **RF-73** : Cloisonnement strict (chaque admin ne voit que ses propres logements et réservations).

### 3. Espace Super Administrateur
- **RF-50 & RF-04/05** : Gestion de tous les comptes, validation des candidatures d'agences et suspension/activation.
- **RF-51** : Modération des avis clients.
- **RF-52** : Paramétrage centralisé (taux de commission %, délais de validation, devises).
- **RF-53** : Journal d'audit horodaté avec traçabilité IP des actions sensibles.
- **Section 5** : Rapport global de performance de la plateforme avec indicateurs de réussite (CDC 1.3).

### 4. Sécurité & Mobile First
- **CDC 8.6** : Navigation basse mobile (`Accueil`, `Recherche`, `Réservations`, `Espace`).
- **Section 11** : Mots de passe chiffrés sous Bcrypt, architecture sans stockage de données cartes (tokenisation prestataire), en-têtes CORS configurés.

---

## 🗄️ Configuration MySQL (Optionnel)

Pour brancher directement l'instance MySQL locale `MySQL80` qui tourne sur la machine, modifiez `backend/.env` :
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=logement_db
DB_USERNAME=root
DB_PASSWORD=votre_mot_de_passe
```
Puis exécutez :
```bash
cd backend
php artisan migrate:fresh --seed
```
