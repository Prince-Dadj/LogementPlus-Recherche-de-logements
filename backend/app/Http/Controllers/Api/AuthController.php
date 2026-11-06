<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // RF-01 : Inscription locataire ou admin
    public function register(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'telephone' => 'required|string|max:20',
            'password' => 'required|string|min:6',
            'role' => 'nullable|in:locataire,admin',
            'raison_sociale' => 'nullable|string|max:255',
        ]);

        $emailUser = User::where('email', $validated['email'])->first();
        if($emailUser){
            return response()->json(['message' => 'email existe deja'], 422);
        }
        
        $role = $validated['role'] ?? 'locataire';

        $user = User::create([
            'name' => $validated['prenom'] . ' ' . $validated['nom'],
            'nom' => $validated['nom'],
            'prenom' => $validated['prenom'],
            'email' => $validated['email'],
            'telephone' => $validated['telephone'],
            'password' => Hash::make($validated['password']),
            'role' => $role,
            'statut' => 'actif',
            'raison_sociale' => $validated['raison_sociale'] ?? null,
            'statut_validation' => $role === 'admin' ? 'en_attente' : 'valide',
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Compte créé avec succès',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    // RF-02 : Connexion
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants fournis sont incorrects.'],
            ]);
        }

        if ($user->statut === 'suspendu') {
            return response()->json(['message' => 'Ce compte a été suspendu par l\'administrateur.'], 403);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie',
            'user' => $user,
            'token' => $token,
        ]);
    }

    // Utilisateur courant
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    // Liste des utilisateurs de démo pour faciliter la navigation rapide entre espaces
    public function demoUsers()
    {
        $users = User::select('id', 'name', 'nom', 'prenom', 'email', 'role', 'statut', 'raison_sociale')
            ->get();
        return response()->json($users);
    }

    // Déconnexion
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnexion effectuée avec succès']);
    }
}
