<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Avis;
use App\Models\JournalAudit;
use App\Models\Logement;
use App\Models\PlateformeParametre;
use App\Models\User;
use Illuminate\Http\Request;

class SuperAdminController extends Controller
{
    // RF-50 : Liste de tous les utilisateurs avec filtres
    public function users(Request $request)
    {
        $query = User::orderBy('id', 'desc');
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }
        return response()->json($query->get());
    }

    // RF-04 / RF-05 : Valider ou suspendre un compte
    public function updateStatutUser(Request $request, $id)
    {
        $request->validate([
            'statut' => 'nullable|in:actif,en_attente,suspendu',
            'statut_validation' => 'nullable|in:valide,en_attente,rejete',
        ]);

        $user = User::findOrFail($id);
        if ($request->filled('statut')) {
            $user->statut = $request->statut;
        }
        if ($request->filled('statut_validation')) {
            $user->statut_validation = $request->statut_validation;
        }
        $user->save();

        // RF-53 : Trace dans le journal d'audit
        JournalAudit::create([
            'user_id' => $request->user()->id,
            'action' => 'MODIFICATION_STATUT_UTILISATEUR',
            'entite' => 'User',
            'entite_id' => $user->id,
            'adresse_ip' => $request->ip(),
            'details' => ['nouvel_etat' => $user->statut, 'validation' => $user->statut_validation],
        ]);

        return response()->json(['message' => 'Utilisateur mis à jour avec succès', 'user' => $user]);
    }

    // RF-51 : Modération des avis
    public function avis()
    {
        $avis = Avis::with(['locataire:id,name', 'logement:id,titre'])->orderBy('id', 'desc')->get();
        return response()->json($avis);
    }

    public function toggleModerationAvis($id)
    {
        $avis = Avis::findOrFail($id);
        $avis->est_modere = !$avis->est_modere;
        $avis->save();
        return response()->json(['message' => 'Statut de modération mis à jour', 'avis' => $avis]);
    }

    // RF-52 : Paramétrage de la plateforme
    public function getParametres()
    {
        return response()->json(PlateformeParametre::all());
    }

    public function updateParametre(Request $request, $id)
    {
        $request->validate(['valeur' => 'required|string']);
        $param = PlateformeParametre::findOrFail($id);
        $param->valeur = $request->valeur;
        $param->save();
        return response()->json(['message' => 'Paramètre mis à jour', 'parametre' => $param]);
    }

    // RF-53 : Journal d'audit
    public function journalAudit()
    {
        $journaux = JournalAudit::with('user:id,name,email')->orderBy('id', 'desc')->take(100)->get();
        return response()->json($journaux);
    }
}
