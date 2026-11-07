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
        Schema::table('logements', function (Blueprint $table) {
            $table->text('points_interet')->nullable()->after('reglement_interieur');
            $table->text('accessibilite')->nullable()->after('points_interet');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('logements', function (Blueprint $table) {
            $table->dropColumn(['points_interet', 'accessibilite']);
        });
    }
};
