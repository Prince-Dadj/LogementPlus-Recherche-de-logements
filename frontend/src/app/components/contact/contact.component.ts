import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LogementService } from '../../services/logement.service';
import { AgenceService } from '../../services/agence.service';

interface ManagerContact {
  id: number;
  name: string;
  role: string;
  agency: string;
  photo: string;
  phone: string;
  phoneRaw: string;
  whatsappRaw: string;
  email: string;
  zones: string[];
  propertiesCount: number;
  availability: string;
  isOnline: boolean;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- En-tête Contact Sénégal -->
    <section class="position-relative text-white py-4" style="background: linear-gradient(135deg, #072559 0%, #0B3D91 60%, #08387a 100%);">
      <div class="container text-center py-2">
        <!-- <span class="badge px-3 py-1 rounded-2 mb-2 fw-normal" style="background-color: rgba(20, 184, 166, 0.25); color: #14B8A6; border: 1px solid rgba(20, 184, 166, 0.4); font-size: 0.8rem;">
          <i class="bi bi-headset me-1"></i> Support Technique & Gestionnaires Dédiés au Sénégal
        </span> -->
        <h1 class="h3 fw-bold mb-2 text-white">Contactez nos Gestionnaires au Sénégal</h1>
        <p class="text-white-50 small mb-0 mx-auto" style="max-width: 650px;">
          Une question sur un logement, une visite ou un bail ? Contactez directement nos gestionnaires agréés par WhatsApp direct, SMS ou Appel téléphonique.
        </p>
      </div>
    </section>

    <div class="container py-4">
      <!-- Section Cartes des Gestionnaires Officiels au Sénégal -->
      <div class="row mb-3">
        <div class="col-12 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <h2 class="h5 fw-bold mb-1 text-dark">
              <i class="bi bi-shield-check text-primary me-2"></i>Gestionnaires Immobiliers Agréés (Sénégal)
            </h2>
            <p class="text-muted small mb-0">Professionnels certifiés gérant le parc immobilier sur LogementPlus Sénégal</p>
          </div>
          <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-1 rounded-2 small">
            <i class="bi bi-check-circle-fill me-1"></i> Gestionnaires certifiés au Sénégal
          </span>
        </div>
      </div>

      <div class="row g-3 mb-5">
        @for (mgr of managers; track mgr.id) {
          <div class="col-md-6 col-lg-4">
            <div class="manager-card h-100 p-3 d-flex flex-column justify-content-between">
              <div>
                <!-- En-tête gestionnaire : Photo, Nom, Agence & Statut -->
                <div class="d-flex align-items-start gap-3 mb-3">
                  <div class="position-relative">
                    <img [src]="mgr.photo" [alt]="mgr.name" class="rounded-circle object-fit-cover shadow-sm" style="width: 58px; height: 58px; border: 2px solid #0B3D91;">
                    @if (mgr.isOnline) {
                      <span class="position-absolute bottom-0 end-0 p-1 bg-success border border-white rounded-circle" title="En ligne"></span>
                    }
                  </div>
                  <div class="flex-grow-1 min-w-0">
                    <div class="d-flex align-items-center justify-content-between">
                      <h3 class="h6 fw-bold mb-0 text-dark text-truncate">{{ mgr.name }}</h3>
                      <span class="badge bg-primary bg-opacity-10 text-primary small" style="font-size: 11px;">Admin SN</span>
                    </div>
                    <div class="text-muted small text-truncate">{{ mgr.role }}</div>
                    <div class="text-primary fw-semibold small" style="font-size: 12px;">
                      <i class="bi bi-buildings me-1"></i>{{ mgr.agency }}
                    </div>
                  </div>
                </div>

                <!-- Métadonnées : Zones et Disponibilité -->
                <div class="bg-light rounded-3 p-2 mb-3">
                  <div class="d-flex align-items-center justify-content-between small text-muted mb-1" style="font-size: 12px;">
                    <span><i class="bi bi-geo-alt text-danger me-1"></i>Zones (Sénégal) :</span>
                    <span class="fw-semibold text-dark">{{ mgr.zones.join(', ') }}</span>
                  </div>
                  <div class="d-flex align-items-center justify-content-between small text-muted mb-1" style="font-size: 12px;">
                    <span><i class="bi bi-clock text-primary me-1"></i>Disponibilité :</span>
                    <span class="text-dark">{{ mgr.availability }}</span>
                  </div>
                  <div class="d-flex align-items-center justify-content-between small text-muted" style="font-size: 12px;">
                    <span><i class="bi bi-houses text-success me-1"></i>Biens en gestion :</span>
                    <span class="badge bg-secondary text-white rounded-2 px-2">{{ mgr.propertiesCount }} logements</span>
                  </div>
                </div>
              </div>

              <!-- Boutons d'Action Directe (WhatsApp vers appli, Appel, SMS au format Sénégal +221) -->
              <div>
                <div class="d-grid gap-2">
                  <!-- LIEN DIRECT WHATSAPP S'OUVRANT DANS L'APPLICATION WHATSAPP -->
                  <a 
                    [href]="getWhatsAppUrl(mgr)" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="btn btn-whatsapp d-flex align-items-center justify-content-center gap-2 py-2">
                    <i class="bi bi-whatsapp fs-6"></i>
                    <span>Discuter sur WhatsApp</span>
                  </a>

                  <div class="row g-2">
                    <div class="col-6">
                      <!-- Appel direct Sénégal -->
                      <a [href]="'tel:' + mgr.phoneRaw" class="btn btn-phone w-100 py-1 d-flex align-items-center justify-content-center gap-1 small">
                        <i class="bi bi-telephone-fill"></i>
                        <span>Appeler</span>
                      </a>
                    </div>
                    <div class="col-6">
                      <!-- SMS direct -->
                      <a [href]="getSmsUrl(mgr)" class="btn btn-sms w-100 py-1 d-flex align-items-center justify-content-center gap-1 small">
                        <i class="bi bi-chat-dots-fill"></i>
                        <span>SMS</span>
                      </a>
                    </div>
                  </div>
                </div>

                <div class="text-center mt-2">
                  <span class="text-muted small" style="font-size: 11px;">
                    <i class="bi bi-telephone text-muted me-1"></i>{{ mgr.phone }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- Carte 4 : Assistance & Support Central LogementPlus Sénégal -->
        <div class="col-md-6 col-lg-4">
          <div class="manager-card h-100 p-3 d-flex flex-column justify-content-between" style="border: 2px dashed #14B8A6; background: #FAFDFD;">
            <div>
              <div class="d-flex align-items-start gap-3 mb-3">
                <div class="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary text-white shadow-sm" style="width: 58px; height: 58px;">
                  <i class="bi bi-headset fs-3"></i>
                </div>
                <div class="flex-grow-1 min-w-0">
                  <div class="d-flex align-items-center justify-content-between">
                    <h3 class="h6 fw-bold mb-0 text-dark">Support Central</h3>
                    <span class="badge bg-success small" style="font-size: 11px;">24h / 7j</span>
                  </div>
                  <div class="text-muted small">Service Client Sénégal</div>
                  <div class="text-primary fw-semibold small" style="font-size: 12px;">LogementPlus Sénégal</div>
                </div>
              </div>

              <div class="bg-white rounded-3 p-2 mb-3 border">
                <p class="small text-muted mb-2" style="font-size: 12px;">
                  Assistance pour paiements Wave & Orange Money Sénégal, contrats de baux et accompagnement aux visites à Dakar et Saly.
                </p>
                <div class="small text-dark mb-1" style="font-size: 12px;">
                  <i class="bi bi-envelope-at text-primary me-1"></i><strong>Email :</strong> support&#64;logementplus.sn
                </div>
                <div class="small text-dark" style="font-size: 12px;">
                  <i class="bi bi-geo-alt-fill text-danger me-1"></i><strong>Siège :</strong> Avenue Léopold S. Senghor, Dakar Plateau, Sénégal
                </div>
              </div>
            </div>

            <div>
              <div class="d-grid gap-2">
                <a 
                  href="https://wa.me/221770000000?text=Bonjour%20Support%20LogementPlus%20S%C3%A9n%C3%A9gal%2C%20j%27ai%20besoin%20d%27assistance." 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  class="btn btn-whatsapp d-flex align-items-center justify-content-center gap-2 py-2">
                  <i class="bi bi-whatsapp fs-6"></i>
                  <span>WhatsApp Support Sénégal</span>
                </a>

                <div class="row g-2">
                  <div class="col-6">
                    <a href="tel:+221338210011" class="btn btn-phone w-100 py-1 d-flex align-items-center justify-content-center gap-1 small">
                      <i class="bi bi-telephone-fill"></i>
                      <span>Hotline Dakar</span>
                    </a>
                  </div>
                  <div class="col-6">
                    <a href="sms:+221770000000?body=Bonjour%20Support%20LogementPlus%20Senegal" class="btn btn-sms w-100 py-1 d-flex align-items-center justify-content-center gap-1 small">
                      <i class="bi bi-chat-dots-fill"></i>
                      <span>SMS</span>
                    </a>
                  </div>
                </div>
              </div>

              <div class="text-center mt-2">
                <span class="text-muted small" style="font-size: 11px;">
                  <i class="bi bi-telephone me-1"></i>+221 33 821 00 11 (Fixe Dakar)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Formulaire de contact rapide / Rappel sous 15 minutes au Sénégal -->
      <div class="row justify-content-center">
        <div class="col-lg-12">
          <div class="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <div class="d-flex align-items-center gap-2 mb-3">
              <span class="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle" style="width: 58px; height: 58px;">
                <i class="bi bi-envelope-paper fs-1"></i>
              </span>
              <div>
                <h3 class="h6 fw-bold mb-0 text-dark">Vous souhaitez être rappelé au Sénégal ?</h3>
                <small class="text-muted">Laissez vos coordonnées, un gestionnaire vous contacte sous 15 minutes</small>
              </div>
            </div>

            @if (formSent) {
              <div class="alert alert-success d-flex align-items-center gap-2 small py-2 mb-0 rounded-3">
                <i class="bi bi-check-circle-fill fs-5"></i>
                <div>
                  <strong>Message bien transmis !</strong> Un gestionnaire ou notre support à Dakar vous contactera dans les plus brefs délais.
                </div>
              </div>
            } @else {
              <form (ngSubmit)="sendInquiry()">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold">Votre Nom & Prénom  <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" [(ngModel)]="inquiry.name" name="name" placeholder="Ex: Cheikh Ndiaye" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold">Numéro de Téléphone (WhatsApp)  <span class="text-danger">*</span></label>
                    <input type="tel" class="form-control" [(ngModel)]="inquiry.phone" name="phone" placeholder="Ex: +221 77 123 45 67" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold">Gestionnaire au Sénégal</label>
                    <select class="form-select" [(ngModel)]="inquiry.managerId" name="managerId">
                      <option [ngValue]="0">Premier gestionnaire disponible</option>
                      @for (mgr of managers; track mgr.id) {
                        <option [ngValue]="mgr.id">{{ mgr.name }} ({{ mgr.agency }})</option>
                      }
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold">Objet de la demande</label>
                    <select class="form-select" [(ngModel)]="inquiry.subject" name="subject">
                      <option value="visite">Planifier une visite (Dakar ou Saly)</option>
                      <option value="information">Information sur la caution ou loyer</option>
                      <option value="bailleur">Je suis propriétaire / Déposer une annonce</option>
                      <option value="paiement">Assistance paiement Wave / Orange Money</option>
                    </select>
                  </div>
                  <div class="col-12">
                    <label class="form-label small fw-semibold">Votre Message</label>
                    <textarea class="form-control" rows="3" [(ngModel)]="inquiry.message" name="message" placeholder="Précisez la zone (Almadies, Fann, Plateau, Saly...) ou la référence du logement..."></textarea>
                  </div>
                  <div class="col-12 text-end">
                    <button type="submit" class="btn btn-primary px-4 py-2 rounded-2 small fw-semibold" [disabled]="!inquiry.name || !inquiry.phone">
                      <i class="bi bi-send me-1"></i> Envoyer ma demande
                    </button>
                  </div>
                </div>
              </form>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class ContactComponent implements OnInit {
  private logementService = inject(LogementService);
  private agenceService = inject(AgenceService);

  managers: ManagerContact[] = [];

  ngOnInit(): void {
    this.chargerGestionnairesDynamiques();
  }

  private chargerGestionnairesDynamiques(): void {
    const logements = this.logementService.getSenegalCatalog();
    const adminMap = new Map<number, ManagerContact>();

    logements.forEach(l => {
      const adminId = l.admin?.id || l.admin_id || 2;
      const adminName = l.admin?.name || (adminId === 2 ? 'Ibrahima Sow' : 'Ousmane Ba');
      const adminEmail = l.admin?.email || (adminId === 2 ? 'i.sow@teranga-immo.sn' : 'o.ba@dakar-logis.sn');
      const adminAgency = l.admin?.raison_sociale || (adminId === 2 ? 'Teranga Prestige Immobilier Dakar' : 'Dakar Logis & Baux');
      const phone = adminId === 2 ? '+221 77 080 91 10' : '+221 78 443 32 21';
      const phoneRaw = phone.replace(/[^0-9]/g, '');

      if (!adminMap.has(adminId)) {
        adminMap.set(adminId, {
          id: adminId,
          name: adminName,
          role: 'Gestionnaire Immobilier Agréé',
          agency: adminAgency,
          photo: adminId === 2
            ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
            : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
          phone: phone,
          phoneRaw: '+' + phoneRaw,
          whatsappRaw: phoneRaw,
          email: adminEmail,
          zones: [l.quartier || l.ville],
          propertiesCount: logements.filter(x => (x.admin_id === adminId || x.admin?.id === adminId)).length,
          availability: 'Lun - Sam (8h00 - 18h30)',
          isOnline: true
        });
      } else {
        const existing = adminMap.get(adminId)!;
        const zone = l.quartier || l.ville;
        if (zone && !existing.zones.includes(zone)) {
          existing.zones.push(zone);
        }
      }
    });

    this.managers = Array.from(adminMap.values());
  }

  inquiry = {
    name: '',
    phone: '',
    managerId: 0,
    subject: 'visite',
    message: ''
  };

  formSent = false;

  getWhatsAppUrl(mgr: ManagerContact): string {
    const text = encodeURIComponent(
      `Bonjour M./Mme ${mgr.name}, je vous contacte depuis la plateforme LogementPlus Sénégal concernant la réservation ou la visite d'un logement.`
    );
    return `https://wa.me/${mgr.whatsappRaw}?text=${text}`;
  }

  getSmsUrl(mgr: ManagerContact): string {
    const body = encodeURIComponent(
      `Bonjour ${mgr.name}, je souhaite des informations concernant un logement sur LogementPlus Sénégal.`
    );
    return `sms:${mgr.phoneRaw}?body=${body}`;
  }

  sendInquiry(): void {
    if (!this.inquiry.name || !this.inquiry.phone) return;
    this.formSent = true;
  }
}
