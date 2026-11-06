<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    /**
     * Récupérer les informations du profil utilisateur connecté
     */
    public function show(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Mettre à jour les informations personnelles (nom, prénom, e-mail, téléphone)
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'email' => 'required|email|max:150|unique:users,email,' . $user->id,
            'telephone' => 'nullable|string|max:30',
        ], [
            'nom.required' => 'Le nom de famille est obligatoire.',
            'prenom.required' => 'Le prénom est obligatoire.',
            'email.required' => 'L\'adresse e-mail est obligatoire.',
            'email.email' => 'L\'adresse e-mail n\'est pas valide.',
            'email.unique' => 'Cette adresse e-mail est déjà utilisée par un autre compte.',
        ]);

        $user->nom = trim($validated['nom']);
        $user->prenom = trim($validated['prenom']);
        $user->name = trim($validated['prenom'] . ' ' . $validated['nom']);
        $user->email = trim($validated['email']);
        $user->telephone = isset($validated['telephone']) ? trim($validated['telephone']) : null;
        $user->save();

        return response()->json([
            'message' => 'Vos informations personnelles ont été mises à jour avec succès.',
            'user' => $user,
        ]);
    }

    /**
     * Modifier le mot de passe avec vérification de l'ancien mot de passe
     */
    public function changePassword(Request $request)
    {
        $user = $request->user();

        $oldPassword = $request->input('old_password') ?? $request->input('current_password');

        if (!$oldPassword) {
            return response()->json([
                'message' => 'L\'ancien mot de passe est obligatoire.',
                'errors' => ['old_password' => ['L\'ancien mot de passe est obligatoire.']]
            ], 422);
        }

        if (!Hash::check($oldPassword, $user->password)) {
            return response()->json([
                'message' => 'L\'ancien mot de passe saisi est incorrect.',
                'errors' => ['old_password' => ['L\'ancien mot de passe saisi est incorrect.']]
            ], 422);
        }

        $validated = $request->validate([
            'new_password' => 'required|string|min:6',
        ], [
            'new_password.required' => 'Le nouveau mot de passe est obligatoire.',
            'new_password.min' => 'Le nouveau mot de passe doit comporter au moins 6 caractères.',
        ]);

        // Si confirmation envoyée, vérifier la concordance
        if ($request->has('new_password_confirmation') && $request->input('new_password_confirmation') !== $validated['new_password']) {
            return response()->json([
                'message' => 'La confirmation du mot de passe ne correspond pas.',
                'errors' => ['new_password_confirmation' => ['La confirmation du mot de passe ne correspond pas.']]
            ], 422);
        }

        $user->password = Hash::make($validated['new_password']);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Votre mot de passe a été modifié avec succès.',
        ]);
    }

    /**
     * Téléverser une photo de profil (avatar)
     */
    public function uploadAvatar(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,webp,gif|max:3072',
        ], [
            'avatar.required' => 'Veuillez sélectionner une image.',
            'avatar.image' => 'Le fichier doit être une image valide.',
            'avatar.mimes' => 'Les formats autorisés sont : jpeg, png, jpg, webp, gif.',
            'avatar.max' => 'L\'image ne doit pas dépasser 3 Mo.',
        ]);

        $file = $request->file('avatar');
        $fileName = 'avatar_' . $user->id . '_' . time() . '.' . $file->getClientOriginalExtension();
        $destinationPath = public_path('uploads/avatars');

        if (!file_exists($destinationPath)) {
            mkdir($destinationPath, 0777, true);
        }

        $file->move($destinationPath, $fileName);
        $avatarUrl = '/uploads/avatars/' . $fileName;

        $user->avatar_url = $avatarUrl;
        $user->save();

        return response()->json([
            'message' => 'Photo de profil mise à jour avec succès.',
            'user' => $user,
            'avatar_url' => $avatarUrl,
        ]);
    }
}
