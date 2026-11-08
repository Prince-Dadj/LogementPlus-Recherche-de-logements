<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mise à jour de votre demande de réservation — logementPlus</title>
    <style>
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        body {
            margin: 0;
            padding: 0;
            width: 100% !important;
            height: 100% !important;
            background-color: #F8FAFC;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #1F2937;
            -webkit-font-smoothing: antialiased;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #FFFFFF;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(11, 61, 145, 0.08);
            border: 1px solid #E2E8F0;
        }
        .header {
            background: linear-gradient(135deg, #0B3D91 0%, #1545A8 100%);
            padding: 32px 24px;
            text-align: center;
        }
        .header-logo {
            font-size: 24px;
            font-weight: 700;
            color: #FFFFFF;
            text-decoration: none;
            letter-spacing: -0.5px;
        }
        .header-logo span {
            color: #14B8A6;
        }
        .header-subtitle {
            color: #E2E8F0;
            font-size: 14px;
            margin-top: 6px;
        }
        .content {
            padding: 32px 28px;
        }
        .badge-danger {
            display: inline-block;
            background-color: #FEE2E2;
            color: #B91C1C;
            border: 1px solid #FCA5A5;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
        }
        .recap-box {
            background-color: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 10px;
            padding: 20px;
            margin: 24px 0;
        }
        .recap-table {
            width: 100%;
            border-collapse: collapse;
        }
        .recap-table td {
            padding: 9px 0;
            font-size: 14px;
            vertical-align: top;
            border-bottom: 1px solid #EDF2F7;
        }
        .recap-table tr:last-child td {
            border-bottom: none;
        }
        .recap-label {
            color: #64748B;
            width: 42%;
            font-weight: 500;
        }
        .recap-value {
            color: #0F172A;
            font-weight: 600;
        }
        .motif-box {
            background-color: #FFFBEB;
            border-left: 4px solid #F59E0B;
            padding: 12px 16px;
            border-radius: 6px;
            margin-top: 16px;
            font-size: 14px;
            color: #92400E;
        }
        .cta-btn {
            display: inline-block;
            background-color: #0B3D91;
            color: #FFFFFF !important;
            text-decoration: none;
            padding: 13px 28px;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            text-align: center;
            box-shadow: 0 4px 12px rgba(11, 61, 145, 0.25);
        }
        .footer {
            background-color: #F1F5F9;
            padding: 24px;
            text-align: center;
            font-size: 12px;
            color: #64748B;
            border-top: 1px solid #E2E8F0;
        }
    </style>
</head>
<body style="background-color: #F8FAFC; padding: 24px 12px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
            <td align="center">
                <div class="container">
                    <!-- En-tête -->
                    <div class="header">
                        <div class="header-logo">
                            Logement<span>Plus</span>
                        </div>
                        <div class="header-subtitle">Plateforme de gestion & réservation de logements</div>
                    </div>

                    <!-- Contenu -->
                    <div class="content">
                        <p style="font-size: 16px; margin-top: 0; color: #0F172A; font-weight: 600;">
                            Bonjour {{ $prenomLocataire }},
                        </p>

                        <p style="font-size: 15px; line-height: 1.6; color: #334155;">
                            Nous vous informons que votre demande de réservation concernant le logement suivant n'a malheureusement pas été acceptée.
                        </p>

                        <!-- Boîte Récapitulatif conforme -->
                        <div class="recap-box">
                            <h3 style="margin-top: 0; margin-bottom: 14px; font-size: 15px; color: #0B3D91; font-weight: 700;">
                                Récapitulatif :
                            </h3>
                            <table class="recap-table" role="presentation">
                                <tr>
                                    <td class="recap-label">Référence de réservation</td>
                                    <td class="recap-value font-monospace" style="color: #0B3D91;">#{{ $referenceReservation }}</td>
                                </tr>
                                <tr>
                                    <td class="recap-label">Logement concerné</td>
                                    <td class="recap-value">{{ $logement->titre ?? 'Logement sélectionné' }}</td>
                                </tr>
                                <tr>
                                    <td class="recap-label">Date d'arrivée</td>
                                    <td class="recap-value">{{ \Carbon\Carbon::parse($reservation->date_debut)->format('d/m/Y') }}</td>
                                </tr>
                                <tr>
                                    <td class="recap-label">Date de départ</td>
                                    <td class="recap-value">{{ \Carbon\Carbon::parse($reservation->date_fin)->format('d/m/Y') }}</td>
                                </tr>
                                <tr>
                                    <td class="recap-label">Statut</td>
                                    <td class="recap-value">
                                        <span class="badge-danger">Refusée</span>
                                    </td>
                                </tr>
                                @if(!empty($motifRefus))
                                <tr>
                                    <td class="recap-label">Motif du refus</td>
                                    <td class="recap-value" style="color: #B91C1C;">
                                        {{ $motifRefus }}
                                    </td>
                                </tr>
                                @endif
                            </table>

                            @if(!empty($motifRefus))
                                <div class="motif-box">
                                    <strong>Précision du gestionnaire :</strong> {{ $motifRefus }}
                                </div>
                            @endif
                        </div>

                        <div style="text-align: center; margin: 30px 0 24px 0;">
                            <a href="{{ config('app.url', 'http://localhost:4200') }}/logements" class="cta-btn">
                                Explorer d'autres logements disponibles
                            </a>
                        </div>

                        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 8px;">
                            Nous vous remercions de votre intérêt pour logementPlus et vous invitons à consulter les autres logements disponibles sur notre plateforme.
                        </p>

                        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-top: 16px; margin-bottom: 0;">
                            Cordialement,<br>
                            <strong style="color: #0B3D91;">L'équipe logementPlus.</strong>
                        </p>
                    </div>

                    <!-- Pied de page -->
                    <div class="footer">
                        <p style="margin: 0 0 6px 0;">
                            Cet e-mail automatique vous est envoyé pour vous tenir informé du statut de votre demande.
                        </p>
                        <p style="margin: 0; color: #94A3B8;">
                            &copy; {{ date('Y') }} logementPlus — Tous droits réservés.
                        </p>
                    </div>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>
