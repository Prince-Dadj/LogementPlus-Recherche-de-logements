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
        // 1. Table Agences Partenaires
        Schema::create('agences', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('ville'); // Ex: Dakar • Plateau, Saly • Mbour
            $table->string('adresse')->nullable();
            $table->string('telephone')->nullable();
            $table->string('email')->nullable();
            $table->string('site_web')->nullable();
            $table->string('icone')->default('bi-buildings'); // Icône Bootstrap
            $table->string('logo_url')->nullable();
            $table->text('description')->nullable();
            $table->boolean('est_partenaire_certifie')->default(true);
            $table->integer('nombre_biens')->default(0);
            $table->timestamps();
        });

        // 2. Table Témoignages / Avis Plateforme (Avis authentiques généraux)
        Schema::create('temoignages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('nom_auteur');
            $table->enum('role_auteur', ['locataire', 'gestionnaire', 'agence'])->default('locataire');
            $table->string('ville')->nullable(); // Ex: Fann Résidence, Corniche
            $table->integer('note')->default(5); // 1 à 5
            $table->text('commentaire');
            $table->string('avatar_url')->nullable();
            $table->string('badge')->default('✓ Avis Vérifié');
            $table->boolean('est_affiche')->default(true);
            $table->boolean('est_verifie')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('temoignages');
        Schema::dropIfExists('agences');
    }
};
