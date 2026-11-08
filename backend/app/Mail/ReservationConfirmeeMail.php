<?php

namespace App\Mail;

use App\Models\Reservation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReservationConfirmeeMail extends Mailable
{
    use Queueable, SerializesModels;

    public Reservation $reservation;
    public string $prenomLocataire;
    public string $referenceReservation;

    /**
     * Create a new message instance.
     */
    public function __construct(Reservation $reservation)
    {
        $this->reservation = $reservation;

        // Extraction du prénom du locataire
        $locataire = $reservation->locataire;
        if (!empty($locataire->prenom)) {
            $this->prenomLocataire = $locataire->prenom;
        } elseif (!empty($locataire->name)) {
            $parts = explode(' ', trim($locataire->name));
            $this->prenomLocataire = $parts[0];
        } else {
            $this->prenomLocataire = 'Cher locataire';
        }

        $this->referenceReservation = 'RES-' . str_pad((string) $reservation->id, 5, '0', STR_PAD_LEFT);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Confirmation de votre réservation — logementPlus',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.reservations.confirmee',
            with: [
                'reservation' => $this->reservation,
                'logement' => $this->reservation->logement,
                'prenomLocataire' => $this->prenomLocataire,
                'referenceReservation' => $this->referenceReservation,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
