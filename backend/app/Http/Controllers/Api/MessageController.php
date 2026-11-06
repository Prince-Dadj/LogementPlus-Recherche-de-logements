<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $messages = Message::with(['expediteur', 'destinataire', 'reservation.logement'])
            ->where('expediteur_id', $userId)
            ->orWhere('destinataire_id', $userId)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($messages);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'destinataire_id' => 'required|exists:users,id',
            'contenu' => 'required|string',
            'reservation_id' => 'nullable|exists:reservations,id',
        ]);

        $message = Message::create([
            'expediteur_id' => $request->user()->id,
            'destinataire_id' => $validated['destinataire_id'],
            'reservation_id' => $validated['reservation_id'] ?? null,
            'contenu' => $validated['contenu'],
            'lu' => false,
        ]);

        return response()->json($message->load(['expediteur', 'destinataire']), 201);
    }

    public function marquerLu(Request $request, $id)
    {
        $message = Message::where('destinataire_id', $request->user()->id)->findOrFail($id);
        $message->lu = true;
        $message->save();

        return response()->json(['message' => 'Message marqué comme lu']);
    }
}
