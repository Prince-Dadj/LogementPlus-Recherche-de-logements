<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Logements (Section 10.1 & RF-10/40)
        Schema::create('logements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_id')->constrained('users')->onDelete('cascade');
            $table->string('titre');
            $table->text('description');
            $table->enum('type', ['chambre', 'studio', 'appartement', 'maison']);
            $table->string('adresse');
            $table->string('ville')->default('Abidjan');
            $table->string('quartier')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->decimal('prix_par_mois', 12, 2);
            $table->decimal('caution', 12, 2)->default(0);
            $table->decimal('frais_service', 12, 2)->default(0);
            $table->integer('nb_pieces')->default(1);
            $table->decimal('surface', 8, 2);
            $table->boolean('meuble')->default(false);
            $table->enum('statut', ['publie', 'brouillon', 'en_attente', 'hors_ligne'])->default('publie');
            $table->enum('mode_reservation', ['immediate', 'sur_validation'])->default('sur_validation');
            $table->enum('politique_annulation', ['gratuite', 'partielle', 'non_remboursable'])->default('gratuite');
            $table->text('reglement_interieur')->nullable();
            $table->string('image_principale')->nullable();
            $table->timestamps();
        });

        // 2. Photos (Section 10.1 & RF-41)
        Schema::create('photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('logement_id')->constrained('logements')->onDelete('cascade');
            $table->string('url');
            $table->integer('ordre')->default(0);
            $table->timestamps();
        });

        // 3. Equipements (Section 10.1 & RF-11)
        Schema::create('equipements', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('icone');
            $table->string('categorie')->default('confort');
            $table->timestamps();
        });

        Schema::create('equipement_logement', function (Blueprint $table) {
            $table->id();
            $table->foreignId('logement_id')->constrained('logements')->onDelete('cascade');
            $table->foreignId('equipement_id')->constrained('equipements')->onDelete('cascade');
        });

        // 4. Disponibilites (Section 10.1 & RF-42)
        Schema::create('disponibilites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('logement_id')->constrained('logements')->onDelete('cascade');
            $table->date('date_debut');
            $table->date('date_fin');
            $table->decimal('prix_specifique', 12, 2)->nullable();
            $table->boolean('bloquee')->default(false);
            $table->timestamps();
        });

        // 5. Reservations (Section 10.1 & RF-20..25)
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('locataire_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('logement_id')->constrained('logements')->onDelete('cascade');
            $table->date('date_debut');
            $table->date('date_fin');
            $table->integer('duree_jours')->default(30);
            $table->decimal('montant_total', 12, 2);
            $table->decimal('montant_loyer', 12, 2);
            $table->decimal('montant_caution', 12, 2)->default(0);
            $table->decimal('montant_frais_service', 12, 2)->default(0);
            $table->enum('statut', [
                'en_attente', 'confirmee', 'payee', 'en_cours', 'terminee', 'annulee', 'refusee'
            ])->default('en_attente');
            $table->text('motif_refus')->nullable();
            $table->timestamp('date_annulation')->nullable();
            $table->string('politique_annulation_appliquee')->nullable();
            $table->timestamps();
        });

        // 6. Paiements (Section 10.1 & RF-30..36)
        Schema::create('paiements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->constrained('reservations')->onDelete('cascade');
            $table->decimal('montant', 12, 2);
            $table->enum('type', ['acompte', 'premier_loyer', 'caution', 'loyer_recurrent']);
            $table->enum('moyen', ['carte', 'orange_money', 'mtn_money', 'wave'])->default('carte');
            $table->enum('statut', ['en_attente', 'reussi', 'echoue', 'rembourse'])->default('reussi');
            $table->string('reference_transaction')->unique();
            $table->decimal('commission_plateforme', 12, 2)->default(0);
            $table->decimal('montant_reverse_admin', 12, 2)->default(0);
            $table->enum('statut_reversement', ['en_attente', 'effectue'])->default('en_attente');
            $table->timestamp('date_paiement')->nullable();
            $table->timestamps();
        });

        // 7. Remboursements (Section 10.1 & RF-34)
        Schema::create('remboursements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paiement_id')->constrained('paiements')->onDelete('cascade');
            $table->decimal('montant', 12, 2);
            $table->text('motif');
            $table->enum('statut', ['en_attente', 'effectue'])->default('effectue');
            $table->timestamp('date_remboursement')->useCurrent();
            $table->timestamps();
        });

        // 8. Contrats (Section 10.1 & RF-24)
        Schema::create('contrats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->constrained('reservations')->onDelete('cascade');
            $table->string('numero')->unique();
            $table->string('fichier_pdf')->nullable();
            $table->timestamp('date_signature')->nullable();
            $table->enum('statut_signature', ['en_attente', 'signe'])->default('signe');
            $table->timestamps();
        });

        // 9. Avis (Section 10.1 & RF-60)
        Schema::create('avis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('locataire_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('logement_id')->constrained('logements')->onDelete('cascade');
            $table->integer('note')->default(5);
            $table->text('commentaire');
            $table->boolean('est_modere')->default(false);
            $table->timestamps();
        });

        // 10. Favoris (Section 10.1 & RF-15)
        Schema::create('favoris', function (Blueprint $table) {
            $table->id();
            $table->foreignId('locataire_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('logement_id')->constrained('logements')->onDelete('cascade');
            $table->timestamps();
            $table->unique(['locataire_id', 'logement_id']);
        });

        // 11. Notifications (Section 10.1 & RF-61)
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('canal', ['email', 'sms', 'push'])->default('email');
            $table->string('titre');
            $table->text('message');
            $table->boolean('lu')->default(false);
            $table->timestamps();
        });

        // 12. Messages (Section 10.1 & RF-44)
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('expediteur_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('destinataire_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('reservation_id')->nullable()->constrained('reservations')->onDelete('set null');
            $table->text('contenu');
            $table->boolean('lu')->default(false);
            $table->timestamps();
        });

        // 13. Rapports (Section 10.1 & Section 5)
        Schema::create('rapports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('type'); // 'locataire', 'activite_admin', 'financier', 'global_plateforme', 'performance'
            $table->date('periode_debut')->nullable();
            $table->date('periode_fin')->nullable();
            $table->json('donnees');
            $table->enum('format', ['pdf', 'excel', 'csv'])->default('pdf');
            $table->timestamp('date_generation')->useCurrent();
            $table->timestamps();
        });

        // 14. Journal Audit (Section 10.1 & RF-53)
        Schema::create('journaux_audit', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('action');
            $table->string('entite');
            $table->unsignedBigInteger('entite_id')->nullable();
            $table->string('adresse_ip', 45)->nullable();
            $table->json('details')->nullable();
            $table->timestamps();
        });

        // 15. Paramètres Plateforme (RF-52)
        Schema::create('plateforme_parametres', function (Blueprint $table) {
            $table->id();
            $table->string('cle')->unique();
            $table->text('valeur');
            $table->string('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plateforme_parametres');
        Schema::dropIfExists('journaux_audit');
        Schema::dropIfExists('rapports');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('favoris');
        Schema::dropIfExists('avis');
        Schema::dropIfExists('contrats');
        Schema::dropIfExists('remboursements');
        Schema::dropIfExists('paiements');
        Schema::dropIfExists('reservations');
        Schema::dropIfExists('disponibilites');
        Schema::dropIfExists('equipement_logement');
        Schema::dropIfExists('equipements');
        Schema::dropIfExists('photos');
        Schema::dropIfExists('logements');
    }
};
