import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { StatsService } from '../../services/stats.service';
import { AgenceService } from '../../services/agence.service';
import { PlateformePublicStats, Agence } from '../../models/models';

interface FaqItem {
  question: string;
  answer: string;
  isOpen?: boolean;
}

@Component({
  selector: 'app-about-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="about-details-page">
      <!-- FIL D'ARIANE -->
      <!-- <section class="details-breadcrumb-bar py-3 border-bottom bg-white">
        <div class="container">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb mb-0 small">
              <li class="breadcrumb-item">
                <a routerLink="/" class="text-decoration-none text-muted">
                  <i class="bi bi-house me-1"></i>Accueil
                </a>
              </li>
              <li class="breadcrumb-item">
                <a routerLink="/about" class="text-decoration-none text-muted">
                  À propos
                </a>
              </li>
              <li class="breadcrumb-item active text-primary fw-semibold" aria-current="page">
                Présentation détaillée
              </li>
            </ol>
          </nav>
        </div>
      </section> -->

      <!-- =================================================================== -->
      <!-- SECTION 1 — HERO DE PRÉSENTATION INSTITUTIONNEL                     -->
      <!-- =================================================================== -->
      <section class="hero-section py-5 text-white position-relative overflow-hidden">
        <div class="hero-bg-overlay"></div>
        <div class="container py-lg-4 position-relative" style="z-index: 2;">
          <div class="row align-items-center g-5">
            <div class="col-lg-7">
              <!-- <span class="badge px-3 py-1 rounded-pill mb-3 hero-pill">
                <i class="bi bi-building me-1"></i> Plateforme Numérique Immobilière
              </span> -->
              <h1 class="display-5 fw-bold mb-3 text-secondary" style="font-family: 'Poppins', sans-serif;">
                À propos de <span class="text-white">Sanar</span> <span style="color: #2DD4BF;">Housings</span>
              </h1>
              <p class="lead text-teal-light fw-semibold mb-3">
                Une plateforme numérique pensée pour simplifier l'expérience du logement.
              </p>
              <p class="text-white-50 mb-4 fs-6" style="line-height: 1.7; max-width: 620px;">
                SanarHousings accompagne les utilisateurs dans leur recherche de logement et facilite les interactions entre locataires, propriétaires et gestionnaires.
              </p>

              <div class="d-flex flex-wrap gap-3">
                <a routerLink="/logements" class="btn btn-accent px-4 py-2-5 rounded-3 fw-semibold shadow d-inline-flex align-items-center gap-2">
                  <i class="bi bi-search"></i>
                  <span>Découvrir les logements</span>
                </a>
                <a href="#qui-sommes-nous" class="btn btn-outline-light px-4 py-2-5 rounded-3 fw-semibold d-inline-flex align-items-center gap-2">
                  <span>En savoir plus</span>
                  <i class="bi bi-arrow-down-short fs-5"></i>
                </a>
              </div>
            </div>

            <!-- Illustration ou composition graphique immobilière -->
            <div class="col-lg-5 text-center">
              <div class="hero-graphic-card p-3 p-sm-4 rounded-4 bg-white text-dark shadow-lg">
                <div class="image-wrapper rounded-3 overflow-hidden position-relative mb-3">
                  <img 
                    src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80" 
                    alt="Architecture moderne SanarHousings" 
                    class="img-fluid object-fit-cover w-100" 
                    style="height: 230px;"
                  >
                  <div class="image-badge-tag">
                    <i class="bi bi-geo-alt-fill text-danger me-1"></i> Résidences & Appartements
                  </div>
                </div>
                <div class="d-flex justify-content-between align-items-center text-start">
                  <div>
                    <h2 class="h6 fw-bold mb-0 text-dark">SanarHousings</h2>
                    <small class="text-muted">Espace moderne & accessible</small>
                  </div>
                  <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-2 px-2 py-1 small">
                    <i class="bi bi-check-circle-fill me-1"></i> Plateforme active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- =================================================================== -->
      <!-- SECTION 2 — QUI SOMMES-NOUS ?                                       -->
      <!-- =================================================================== -->
      <section id="qui-sommes-nous" class="py-5 bg-white border-bottom">
        <div class="container py-lg-4">
          <div class="row align-items-center g-5">
            <div class="col-lg-6 order-lg-2">
              <div class="preview-composition position-relative">
                <div class="preview-backdrop-blur"></div>
                <div class="card border rounded-4 shadow-sm overflow-hidden bg-white">
                  <div class="card-header bg-light border-bottom p-3 d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center gap-2">
                      <span class="d-inline-block rounded-circle bg-danger" style="width: 10px; height: 10px;"></span>
                      <span class="d-inline-block rounded-circle bg-warning" style="width: 10px; height: 10px;"></span>
                      <span class="d-inline-block rounded-circle bg-success" style="width: 10px; height: 10px;"></span>
                      <span class="small fw-semibold ms-2 text-dark font-monospace" style="font-size: 11px;">sanarhousings.sn</span>
                    </div>
                    <span class="badge bg-primary bg-opacity-10 text-primary small rounded-pill">Catalogue & Gestion</span>
                  </div>
                  <img 
                    src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80" 
                    alt="Espace SanarHousings" 
                    class="img-fluid object-fit-cover" 
                    style="height: 280px;"
                  >
                  <div class="p-3 bg-white">
                    <div class="d-flex align-items-center justify-content-between text-muted small">
                      <span><i class="bi bi-check2-circle text-teal me-1"></i>Catalogue centralisé</span>
                      <span><i class="bi bi-phone text-primary me-1"></i>Compatible mobile & PC</span>
                      <span><i class="bi bi-shield-check text-success me-1"></i>Suivi transparent</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-lg-6 order-lg-1">
              <!-- <span class="badge px-3 py-1 rounded-pill bg-light text-primary border fw-semibold small mb-2 text-uppercase">
                Identité de la plateforme
              </span> -->
              <h2 class="h2 fw-bold text-dark mb-3" style="font-family: 'Poppins', sans-serif;">
                Qui sommes-nous ?
              </h2>
              <div class="lead-text mb-4 text-muted" style="line-height: 1.8;">
                <p class="mb-3">
                  <strong>SanarHousings</strong> est une plateforme numérique dédiée à la recherche, à la réservation et à la gestion des logements.
                </p>
                <p class="mb-3">
                  Conçue pour répondre aux attentes d'un marché en pleine évolution, la plateforme cherche à <strong>centraliser les informations essentielles</strong> et à <strong>faciliter les échanges</strong> entre les différents acteurs : locataires en quête d'un bien, propriétaires et gestionnaires immobiliers.
                </p>
                <p class="mb-0">
                  En intégrant les outils de consultation, de soumission de demande et de suivi au sein d'un même environnement, SanarHousings offre une expérience transparente, organisée et accessible depuis n'importe quel terminal.
                </p>
              </div>

              <div class="row g-3 pt-2">
                <div class="col-sm-6">
                  <div class="p-3 rounded-3 bg-light border d-flex align-items-center gap-3">
                    <i class="bi bi-diagram-3-fill fs-3 text-primary"></i>
                    <div>
                      <strong class="d-block small text-dark">Centralisation</strong>
                      <small class="text-muted">Biens et demandes réunis</small>
                    </div>
                  </div>
                </div>
                <div class="col-sm-6">
                  <div class="p-3 rounded-3 bg-light border d-flex align-items-center gap-3">
                    <i class="bi bi-chat-heart-fill fs-3 text-teal"></i>
                    <div>
                      <strong class="d-block small text-dark">Échanges fluides</strong>
                      <small class="text-muted">Liaison locataire & gestionnaire</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- =================================================================== -->
      <!-- SECTION 3 — NOTRE MISSION                                           -->
      <!-- =================================================================== -->
      <section class="py-5 bg-light-gradient border-bottom">
        <div class="container py-lg-4">
          <div class="text-center max-w-750 mx-auto mb-5">
            <!-- <span class="badge px-3 py-1 rounded-pill bg-white text-primary border shadow-sm fw-semibold small mb-2 text-uppercase">
              Raison d'être
            </span> -->
            <h2 class="h2 fw-bold text-dark mb-3" style="font-family: 'Poppins', sans-serif;">
              Notre mission
            </h2>
            <p class="lead text-dark fw-medium mb-0" style="font-size: 1.15rem; line-height: 1.6;">
              « Notre mission est de rendre la recherche et la réservation de logements plus simples et plus accessibles, tout en proposant aux gestionnaires des outils numériques pour organiser et suivre leurs activités. »
            </p>
          </div>

          <div class="row g-4">
            <!-- Objectif 1 -->
            <div class="col-md-6 col-lg-4">
              <div class="mission-card p-4 rounded-4 bg-white border shadow-sm h-100">
                <div class="mission-icon-box mb-3 bg-dark-subtle text-teal">
                  <i class="bi bi-search-heart fs-4"></i>
                </div>
                <h3 class="h6 fw-bold text-dark mb-2">Simplifier la recherche de logements</h3>
                <p class="text-muted small mb-0">
                  Offrir un catalogue lisible avec des filtres précis pour trouver rapidement le logement qui correspond à vos critères et à votre budget.
                </p>
              </div>
            </div>

            <!-- Objectif 2 -->
            <div class="col-md-6 col-lg-4">
              <div class="mission-card p-4 rounded-4 bg-white border shadow-sm h-100">
                <div class="mission-icon-box mb-3 bg-primary-subtle text-primary">
                  <i class="bi bi-calendar-plus fs-4"></i>
                </div>
                <h3 class="h6 fw-bold text-dark mb-2">Faciliter les demandes de réservation</h3>
                <p class="text-muted small mb-0">
                  Permettre de formuler une demande directement en ligne en quelques étapes claires, sans démarches superflues.
                </p>
              </div>
            </div>

            <!-- Objectif 3 -->
            <div class="col-md-6 col-lg-4">
              <div class="mission-card p-4 rounded-4 bg-white border shadow-sm h-100">
                <div class="mission-icon-box mb-3 bg-warning-subtle text-warning">
                  <i class="bi bi-clock-history fs-4"></i>
                </div>
                <h3 class="h6 fw-bold text-dark mb-2">Améliorer le suivi des réservations</h3>
                <p class="text-muted small mb-0">
                  Assurer une visibilité en temps réel sur l'état de chaque dossier, de la soumission initiale jusqu'à la décision finale.
                </p>
              </div>
            </div>

            <!-- Objectif 4 -->
            <div class="col-md-6 col-lg-6">
              <div class="mission-card p-4 rounded-4 bg-white border shadow-sm h-100">
                <div class="mission-icon-box mb-3 bg-info-subtle text-info">
                  <i class="bi bi-folder2-open fs-4"></i>
                </div>
                <h3 class="h6 fw-bold text-dark mb-2">Centraliser les informations</h3>
                <p class="text-muted small mb-0">
                  Rassembler les caractéristiques des logements, les coordonnées, les dates de disponibilité et l'historique des échanges au même endroit.
                </p>
              </div>
            </div>

            <!-- Objectif 5 -->
            <div class="col-md-12 col-lg-6">
              <div class="mission-card p-4 rounded-4 bg-white border shadow-sm h-100">
                <div class="mission-icon-box mb-3 bg-success-subtle text-success">
                  <i class="bi bi-chat-left-text fs-4"></i>
                </div>
                <h3 class="h6 fw-bold text-dark mb-2">Faciliter les échanges entre utilisateurs et gestionnaires</h3>
                <p class="text-muted small mb-0">
                  Établir un canal de communication direct et structuré pour clarifier les questions, transmettre les motifs de décision et coordonner les démarches.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- =================================================================== -->
      <!-- SECTION 4 — NOTRE VISION                                            -->
      <!-- =================================================================== -->
      <section class="py-5 bg-white border-bottom">
        <div class="container py-lg-4">
          <div class="row align-items-center g-5">
            <div class="col-lg-5">
              <!-- <span class="badge px-3 py-1 rounded-pill bg-light text-primary border fw-semibold small mb-2 text-uppercase">
                Perspective d'avenir
              </span> -->
              <h2 class="h2 fw-bold text-dark mb-3" style="font-family: 'Poppins', sans-serif;">
                Notre vision
              </h2>
              <p class="lead text-primary fw-medium mb-3" style="line-height: 1.6;">
                « Nous aspirons à contribuer à la modernisation du secteur immobilier grâce à des outils numériques accessibles, évolutifs et adaptés aux besoins des utilisateurs. »
              </p>
              <p class="text-muted small mb-0" style="line-height: 1.7;">
                Face aux défis traditionnels de la recherche et de la gestion locative, nous croyons qu'une plateforme numérique intuitive apporte une valeur durable à l'ensemble de l'écosystème immobilier.
              </p>
            </div>

            <div class="col-lg-7">
              <div class="row g-3">
                <!-- Pilier 1 : Innovation -->
                <div class="col-sm-6">
                  <div class="vision-pillar-box p-4 rounded-4 border bg-light h-100">
                    <div class="d-flex align-items-center gap-2 mb-2">
                      <i class="bi bi-lightbulb-fill text-warning fs-4"></i>
                      <h3 class="h6 fw-bold mb-0 text-dark">Innovation</h3>
                    </div>
                    <p class="text-muted small mb-0">
                      Moderniser en continu les processus de recherche et d'administration grâce aux technologies web contemporaines.
                    </p>
                  </div>
                </div>

                <!-- Pilier 2 : Accessibilité -->
                <div class="col-sm-6">
                  <div class="vision-pillar-box p-4 rounded-4 border bg-light h-100">
                    <div class="d-flex align-items-center gap-2 mb-2">
                      <i class="bi bi-phone-flip text-teal fs-4"></i>
                      <h3 class="h6 fw-bold mb-0 text-dark">Accessibilité</h3>
                    </div>
                    <p class="text-muted small mb-0">
                      Rendre les services disponibles à tout moment, depuis un ordinateur, une tablette ou un smartphone.
                    </p>
                  </div>
                </div>

                <!-- Pilier 3 : Simplicité -->
                <div class="col-sm-6">
                  <div class="vision-pillar-box p-4 rounded-4 border bg-light h-100">
                    <div class="d-flex align-items-center gap-2 mb-2">
                      <i class="bi bi-check2-circle text-success fs-4"></i>
                      <h3 class="h6 fw-bold mb-0 text-dark">Simplicité</h3>
                    </div>
                    <p class="text-muted small mb-0">
                      Éliminer la complexité inutile avec des interfaces claires, lisibles et faciles à prendre en main.
                    </p>
                  </div>
                </div>

                <!-- Pilier 4 : Modernisation -->
                <div class="col-sm-6">
                  <div class="vision-pillar-box p-4 rounded-4 border bg-light h-100">
                    <div class="d-flex align-items-center gap-2 mb-2">
                      <i class="bi bi-arrow-repeat text-primary fs-4"></i>
                      <h3 class="h6 fw-bold mb-0 text-dark">Modernisation</h3>
                    </div>
                    <p class="text-muted small mb-0">
                      Accompagner l'évolution des pratiques du secteur avec des outils évolutifs et sécurisés.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- =================================================================== -->
      <!-- SECTION 5 — NOS VALEURS                                             -->
      <!-- =================================================================== -->
      <section class="py-5 bg-light-gradient border-bottom">
        <div class="container py-lg-4">
          <div class="text-center max-w-700 mx-auto mb-5">
            <!-- <span class="badge px-3 py-1 rounded-pill bg-white text-primary border shadow-sm fw-semibold small mb-2 text-uppercase">
              Principes fondamentaux
            </span> -->
            <h2 class="h2 fw-bold text-dark mb-2" style="font-family: 'Poppins', sans-serif;">
              Nos valeurs
            </h2>
            <p class="text-muted small mb-0">
              Cinq piliers essentiels guident la conception et l'évolution quotidienne de SanarHousings.
            </p>
          </div>

          <div class="row g-4">
            <!-- 1. Simplicité -->
            <div class="col-md-6 col-lg">
              <div class="value-card p-4 rounded-4 bg-white border text-center h-100 shadow-sm">
                <div class="value-icon-circle mx-auto mb-3 text-primary bg-primary-subtle">
                  <i class="bi bi-sliders fs-4"></i>
                </div>
                <h3 class="h6 fw-bold text-dark mb-2">1. Simplicité</h3>
                <p class="text-muted small mb-0">
                  Proposer une expérience facile à comprendre et à utiliser pour tous les profils d'utilisateurs.
                </p>
              </div>
            </div>

            <!-- 2. Transparence -->
            <div class="col-md-6 col-lg">
              <div class="value-card p-4 rounded-4 bg-white border text-center h-100 shadow-sm">
                <div class="value-icon-circle mx-auto mb-3 text-teal bg-dark-subtle">
                  <i class="bi bi-eye fs-4"></i>
                </div>
                <h3 class="h6 fw-bold text-dark mb-2">2. Transparence</h3>
                <p class="text-muted small mb-0">
                  Rendre les informations relatives aux logements et aux réservations parfaitement lisibles.
                </p>
              </div>
            </div>

            <!-- 3. Accessibilité -->
            <div class="col-md-6 col-lg">
              <div class="value-card p-4 rounded-4 bg-white border text-center h-100 shadow-sm">
                <div class="value-icon-circle mx-auto mb-3 text-info bg-info-subtle">
                  <i class="bi bi-laptop fs-4"></i>
                </div>
                <h3 class="h6 fw-bold text-dark mb-2">3. Accessibilité</h3>
                <p class="text-muted small mb-0">
                  Permettre aux utilisateurs d'accéder aux services depuis différents appareils avec une interface réactive.
                </p>
              </div>
            </div>

            <!-- 4. Confiance -->
            <div class="col-md-6 col-lg">
              <div class="value-card p-4 rounded-4 bg-white border text-center h-100 shadow-sm">
                <div class="value-icon-circle mx-auto mb-3 text-success bg-success-subtle">
                  <i class="bi bi-shield-check fs-4"></i>
                </div>
                <h3 class="h6 fw-bold text-dark mb-2">4. Confiance</h3>
                <p class="text-muted small mb-0">
                  Favoriser des échanges clairs et équilibrés entre les utilisateurs et les gestionnaires.
                </p>
              </div>
            </div>

            <!-- 5. Innovation -->
            <div class="col-md-6 col-lg">
              <div class="value-card p-4 rounded-4 bg-white border text-center h-100 shadow-sm">
                <div class="value-icon-circle mx-auto mb-3 text-warning bg-warning-subtle">
                  <i class="bi bi-cpu fs-4"></i>
                </div>
                <h3 class="h6 fw-bold text-dark mb-2">5. Innovation</h3>
                <p class="text-muted small mb-0">
                  Améliorer continuellement les fonctionnalités et la qualité des services numériques proposés.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- =================================================================== -->
      <!-- SECTION 6 — NOS SERVICES                                            -->
      <!-- =================================================================== -->
      <section class="py-5 bg-white border-bottom">
        <div class="container py-lg-4">
          <div class="text-center max-w-700 mx-auto mb-5">
            <!-- <span class="badge px-3 py-1 rounded-pill bg-light text-primary border fw-semibold small mb-2 text-uppercase">
              Fonctionnalités disponibles
            </span> -->
            <h2 class="h2 fw-bold text-dark mb-2" style="font-family: 'Poppins', sans-serif;">
              Nos services
            </h2>
            <p class="text-muted small mb-0">
              Des fonctionnalités adaptées aux besoins réels de chaque acteur de la plateforme.
            </p>
          </div>

          <div class="row g-4">
            <!-- SERVICES LOCATAIRES -->
            <div class="col-lg-4">
              <div class="service-box p-4 rounded-4 border bg-white h-100 shadow-sm">
                <div class="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
                  <div class="service-badge-icon bg-primary text-white rounded-3 d-flex align-items-center justify-content-center">
                    <i class="bi bi-person-heart fs-4"></i>
                  </div>
                  <div>
                    <h3 class="h5 fw-bold mb-0 text-dark">Pour les locataires</h3>
                    <small class="text-muted">Rechercher & réserver</small>
                  </div>
                </div>

                <ul class="list-unstyled mb-0 d-flex flex-column gap-2 small text-muted">
                  <li class="d-flex align-items-start gap-2">
                    <i class="bi bi-check-circle-fill text-primary mt-1"></i>
                    <span><strong>Consultation</strong> des logements disponibles dans les différentes zones.</span>
                  </li>
                  <li class="d-flex align-items-start gap-2">
                    <i class="bi bi-check-circle-fill text-primary mt-1"></i>
                    <span><strong>Recherche ciblée</strong> selon la ville, le quartier, le type de bien et le budget.</span>
                  </li>
                  <li class="d-flex align-items-start gap-2">
                    <i class="bi bi-check-circle-fill text-primary mt-1"></i>
                    <span><strong>Fiches détaillées</strong> avec photos, équipements, description et tarifs clairs.</span>
                  </li>
                  <li class="d-flex align-items-start gap-2">
                    <i class="bi bi-check-circle-fill text-primary mt-1"></i>
                    <span><strong>Envoi direct</strong> de demandes de réservation avec dates souhaitées.</span>
                  </li>
                  <li class="d-flex align-items-start gap-2">
                    <i class="bi bi-check-circle-fill text-primary mt-1"></i>
                    <span><strong>Suivi en temps réel</strong> du statut de réservation (en attente, confirmée, etc.).</span>
                  </li>
                  <li class="d-flex align-items-start gap-2">
                    <i class="bi bi-check-circle-fill text-primary mt-1"></i>
                    <span><strong>Notifications</strong> par e-mail lors de la prise de décision du gestionnaire (si activé).</span>
                  </li>
                </ul>
              </div>
            </div>

            <!-- SERVICES GESTIONNAIRES -->
            <div class="col-lg-4">
              <div class="service-box p-4 rounded-4 border bg-white h-100 shadow-sm">
                <div class="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
                  <div class="service-badge-icon bg-secondary text-white rounded-3 d-flex align-items-center justify-content-center">
                    <i class="bi bi-buildings-fill fs-4"></i>
                  </div>
                  <div>
                    <h3 class="h5 fw-bold mb-0 text-dark">Pour les gestionnaires</h3>
                    <small class="text-muted">Administrer & décider</small>
                  </div>
                </div>

                <ul class="list-unstyled mb-0 d-flex flex-column gap-2 small text-muted">
                  <li class="d-flex align-items-start gap-2">
                    <i class="bi bi-check-circle-fill text-secondary mt-1"></i>
                    <span><strong>Gestion complète</strong> des logements (création, mise à jour, publication ou mise hors-ligne).</span>
                  </li>
                  <li class="d-flex align-items-start gap-2">
                    <i class="bi bi-check-circle-fill text-secondary mt-1"></i>
                    <span><strong>Configuration des informations</strong> (tarifs, caractéristiques, équipements et règles).</span>
                  </li>
                  <li class="d-flex align-items-start gap-2">
                    <i class="bi bi-check-circle-fill text-secondary mt-1"></i>
                    <span><strong>Consultation organisée</strong> des demandes de réservation reçues.</span>
                  </li>
                  <li class="d-flex align-items-start gap-2">
                    <i class="bi bi-check-circle-fill text-secondary mt-1"></i>
                    <span><strong>Validation ou refus</strong> des demandes avec indication du motif si nécessaire.</span>
                  </li>
                  <li class="d-flex align-items-start gap-2">
                    <i class="bi bi-check-circle-fill text-secondary mt-1"></i>
                    <span><strong>Tableau de bord de suivi</strong> des réservations et des biens administrés.</span>
                  </li>
                  <li class="d-flex align-items-start gap-2">
                    <i class="bi bi-check-circle-fill text-secondary mt-1"></i>
                    <span><strong>Consultation des données clés</strong> nécessaires à l'exercice de l'activité.</span>
                  </li>
                </ul>
              </div>
            </div>

            <!-- ROLE DES PROPRIÉTAIRES (CONFORME À LA RÉALITÉ DU PROJET) -->
            <div class="col-lg-4">
              <div class="service-box p-4 rounded-4 border bg-white h-100 shadow-sm">
                <div class="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
                  <div class="service-badge-icon bg-dark text-white rounded-3 d-flex align-items-center justify-content-center">
                    <i class="bi bi-shield-shaded fs-4"></i>
                  </div>
                  <div>
                    <h3 class="h5 fw-bold mb-0 text-dark">Pour les propriétaires</h3>
                    <small class="text-muted">Mandat & visibilité</small>
                  </div>
                </div>

                <div class="text-muted small" style="line-height: 1.7;">
                  <p class="mb-2">
                    Dans l'organisation actuelle de SanarHousings, les propriétaires confient la commercialisation et l'administration de leurs biens aux <strong>gestionnaires et agences agréés</strong>.
                  </p>
                  <p class="mb-2">
                    Ces gestionnaires professionnels agissent en tant que mandataires : ils référencent les logements sur la plateforme, examinent les demandes des locataires et assurent la gestion opérationnelle.
                  </p>
                  <div class="p-3 bg-light rounded-3 border mt-3">
                    <i class="bi bi-info-circle text-primary me-1"></i>
                    <span class="small text-muted">
                      Ce fonctionnement assure aux propriétaires une diffusion de qualité et une gestion rigoureuse assurée par des professionnels dédiés.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- =================================================================== -->
      <!-- SECTION 7 — COMMENT FONCTIONNE LOGEMENTPLUS ? (TIMELINE 4 ÉTAPES)   -->
      <!-- =================================================================== -->
      <section class="py-5 bg-light-gradient border-bottom">
        <div class="container py-lg-4">
          <div class="text-center max-w-700 mx-auto mb-5">
            <!-- <span class="badge px-3 py-1 rounded-pill bg-white text-primary border shadow-sm fw-semibold small mb-2 text-uppercase">
              Parcours utilisateur
            </span> -->
            <h2 class="h2 fw-bold text-dark mb-2" style="font-family: 'Poppins', sans-serif;">
              Comment fonctionne SanarHousings ?
            </h2>
            <p class="text-muted small mb-0">
              Un parcours clair et séquencé en 4 étapes simples.
            </p>
          </div>

          <!-- TIMELINE RESPONSIVE : HORIZONTALE SUR DESKTOP, VERTICALE SUR MOBILE -->
          <div class="steps-timeline-container position-relative">
            <div class="row g-4 position-relative" style="z-index: 2;">
              <!-- Étape 1 -->
              <div class="col-12 col-md-6 col-lg-3">
                <div class="step-card text-center p-4 rounded-4 bg-white border h-100 shadow-sm position-relative">
                  <div class="step-badge-number mb-3 mx-auto">1</div>
                  <h3 class="h6 fw-bold text-dark mb-2">Étape 1 : Découvrir</h3>
                  <p class="text-muted small mb-0" style="line-height: 1.6;">
                    Le visiteur consulte les logements disponibles sur le catalogue et affine sa sélection selon ses préférences.
                  </p>
                </div>
              </div>

              <!-- Étape 2 -->
              <div class="col-12 col-md-6 col-lg-3">
                <div class="step-card text-center p-4 rounded-4 bg-white border h-100 shadow-sm position-relative">
                  <div class="step-badge-number mb-3 mx-auto">2</div>
                  <h3 class="h6 fw-bold text-dark mb-2">Étape 2 : Choisir</h3>
                  <p class="text-muted small mb-0" style="line-height: 1.6;">
                    Il examine les caractéristiques complètes du logement qui l'intéresse : photos, description, loyer et équipements.
                  </p>
                </div>
              </div>

              <!-- Étape 3 -->
              <div class="col-12 col-md-6 col-lg-3">
                <div class="step-card text-center p-4 rounded-4 bg-white border h-100 shadow-sm position-relative">
                  <div class="step-badge-number mb-3 mx-auto">3</div>
                  <h3 class="h6 fw-bold text-dark mb-2">Étape 3 : Réserver</h3>
                  <p class="text-muted small mb-0" style="line-height: 1.6;">
                    Il soumet une demande de réservation directement à travers la plateforme en renseignant ses dates de séjour.
                  </p>
                </div>
              </div>

              <!-- Étape 4 -->
              <div class="col-12 col-md-6 col-lg-3">
                <div class="step-card text-center p-4 rounded-4 bg-white border h-100 shadow-sm position-relative">
                  <div class="step-badge-number mb-3 mx-auto">4</div>
                  <h3 class="h6 fw-bold text-dark mb-2">Étape 4 : Suivre sa demande</h3>
                  <p class="text-muted small mb-0" style="line-height: 1.6;">
                    Le gestionnaire examine la demande, puis la valide ou la refuse. Le locataire consulte le statut et reçoit une notification.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- =================================================================== -->
      <!-- SECTION 8 — POURQUOI CHOISIR LOGEMENTPLUS ?                         -->
      <!-- =================================================================== -->
      <section class="py-5 bg-white border-bottom">
        <div class="container py-lg-4">
          <div class="text-center max-w-700 mx-auto mb-5">
            <!-- <span class="badge px-3 py-1 rounded-pill bg-light text-primary border fw-semibold small mb-2 text-uppercase">
              Avantages concrets
            </span> -->
            <h2 class="h2 fw-bold text-dark mb-2" style="font-family: 'Poppins', sans-serif;">
              Pourquoi choisir SanarHousings ?
            </h2>
            <p class="text-muted small mb-0">
              Des atouts vérifiables et immédiatement utiles pour vos démarches de logement.
            </p>
          </div>

          <div class="row g-4">
            <!-- Avantage 1 -->
            <div class="col-md-6 col-lg-4">
              <div class="advantage-item p-4 rounded-4 bg-light border h-100">
                <div class="d-flex align-items-center gap-3 mb-2">
                  <div class="advantage-icon text-primary"><i class="bi bi-window-stack fs-4"></i></div>
                  <h3 class="h6 fw-bold text-dark mb-0">Une interface centralisée</h3>
                </div>
                <p class="text-muted small mb-0">
                  Toutes les démarches (recherche, formulation de demande, suivi) sont réunies au même endroit sans dispersion d'information.
                </p>
              </div>
            </div>

            <!-- Avantage 2 -->
            <div class="col-md-6 col-lg-4">
              <div class="advantage-item p-4 rounded-4 bg-light border h-100">
                <div class="d-flex align-items-center gap-3 mb-2">
                  <div class="advantage-icon text-teal"><i class="bi bi-compass fs-4"></i></div>
                  <h3 class="h6 fw-bold text-dark mb-0">Une navigation intuitive</h3>
                </div>
                <p class="text-muted small mb-0">
                  Une ergonomie simple et lisible pensée pour vous permettre d'accéder rapidement à l'information sans formation préalable.
                </p>
              </div>
            </div>

            <!-- Avantage 3 -->
            <div class="col-md-6 col-lg-4">
              <div class="advantage-item p-4 rounded-4 bg-light border h-100">
                <div class="d-flex align-items-center gap-3 mb-2">
                  <div class="advantage-icon text-success"><i class="bi bi-funnel-fill fs-4"></i></div>
                  <h3 class="h6 fw-bold text-dark mb-0">Une recherche de logements simplifiée</h3>
                </div>
                <p class="text-muted small mb-0">
                  Des critères de filtre pertinents pour cibler facilement les biens répondant à vos exigences de localisation et de tarif.
                </p>
              </div>
            </div>

            <!-- Avantage 4 -->
            <div class="col-md-6 col-lg-4">
              <div class="advantage-item p-4 rounded-4 bg-light border h-100">
                <div class="d-flex align-items-center gap-3 mb-2">
                  <div class="advantage-icon text-warning"><i class="bi bi-clipboard-check fs-4"></i></div>
                  <h3 class="h6 fw-bold text-dark mb-0">Un suivi des demandes de réservation</h3>
                </div>
                <p class="text-muted small mb-0">
                  Une transparence totale sur l'évolution de votre demande avec un affichage clair des statuts en cours.
                </p>
              </div>
            </div>

            <!-- Avantage 5 -->
            <div class="col-md-6 col-lg-4">
              <div class="advantage-item p-4 rounded-4 bg-light border h-100">
                <div class="d-flex align-items-center gap-3 mb-2">
                  <div class="advantage-icon text-danger"><i class="bi bi-speedometer2 fs-4"></i></div>
                  <h3 class="h6 fw-bold text-dark mb-0">Un espace dédié à la gestion</h3>
                </div>
                <p class="text-muted small mb-0">
                  Des outils structurés permettant aux gestionnaires de suivre leurs biens, de répondre aux demandes et d'organiser leurs baux.
                </p>
              </div>
            </div>

            <!-- Avantage 6 -->
            <div class="col-md-6 col-lg-4">
              <div class="advantage-item p-4 rounded-4 bg-light border h-100">
                <div class="d-flex align-items-center gap-3 mb-2">
                  <div class="advantage-icon text-primary"><i class="bi bi-phone fs-4"></i></div>
                  <h3 class="h6 fw-bold text-dark mb-0">Une expérience adaptée aux appareils mobiles</h3>
                </div>
                <p class="text-muted small mb-0">
                  Une accessibilité optimale sur smartphone et tablette pour consulter et gérer vos réservations où que vous soyez.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- =================================================================== -->
      <!-- SECTION 9 — NOTRE ENGAGEMENT                                        -->
      <!-- =================================================================== -->
      <!-- <section class="py-5 bg-light-gradient border-bottom">
        <div class="container py-lg-4">
          <div class="p-4 p-md-5 rounded-4 bg-white border shadow-sm max-w-850 mx-auto text-center position-relative">
            <span class="badge px-3 py-1 rounded-pill bg-light text-primary border fw-semibold small mb-3 text-uppercase">
              Amélioration continue
            </span>
            <h2 class="h3 fw-bold text-dark mb-3" style="font-family: 'Poppins', sans-serif;">
              Une expérience qui évolue avec vos besoins
            </h2>
            <div class="mx-auto" style="max-width: 700px;">
              <p class="text-secondary lead fs-6 mb-0" style="line-height: 1.8;">
                « SanarHousings s'inscrit dans une démarche d'amélioration continue. Notre objectif est de proposer une plateforme utile, simple à utiliser et capable d'évoluer en fonction des attentes des utilisateurs et des besoins du secteur immobilier. »
              </p>
            </div>
          </div>
        </div>
      </section> -->

      <!-- =================================================================== -->
      <!-- SECTION 9 — STATISTIQUES DE LA PLATEFORME (CHIFFRES CLÉS)          -->
      <!-- =================================================================== -->
      <section class="py-5 text-white position-relative overflow-hidden details-stats-section">
        <div class="dsg-left"></div>
        <div class="dsg-right"></div>
        <div class="container position-relative py-lg-4" style="z-index:2;">
          <div class="text-center max-w-700 mx-auto mb-5">
            <!-- <span class="badge px-3 py-1 rounded-2 dsg-badge fw-semibold small mb-2 text-uppercase letter-spacing-1">
              <i class="bi bi-graph-up-arrow me-1"></i> Impact & Performance
            </span> -->
            <h2 class="h2 fw-bold text-white mb-2" style="font-family:'Poppins',sans-serif;">
              Sanar<span style="color:#2DD4BF">Housings</span> en Chiffres
            </h2>
            <p class="text-white-50 small mb-0">
              Des données calculées en continu pour mesurer la fiabilité et l'activité de notre écosystème.
            </p>
          </div>

          <div class="row g-4">
            <div class="col-6 col-lg-3">
              <div class="dsg-metric-card h-100 p-4 rounded-4 text-center">
                <div class="dsg-icon-wrap dsg-icon-amber mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle">
                  <i class="bi bi-houses-fill fs-3"></i>
                </div>
                <div class="dsg-number tabular-numbers fw-bold mb-1" style="color:#F59E0B;">
                  {{ stats?.nb_logements ?? 12 }}
                </div>
                <div class="h6 fw-semibold text-white mb-1">Logements vérifiés</div>
                <small class="text-white-50" style="font-size:.8rem;">Biens répertoriés & audités</small>
              </div>
            </div>
            <div class="col-6 col-lg-3">
              <div class="dsg-metric-card h-100 p-4 rounded-4 text-center">
                <div class="dsg-icon-wrap dsg-icon-teal mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle">
                  <i class="bi bi-buildings-fill fs-3"></i>
                </div>
                <div class="dsg-number tabular-numbers fw-bold mb-1" style="color:#2DD4BF;">
                  {{ stats?.nb_agences ?? (agences.length || 4) }}
                </div>
                <div class="h6 fw-semibold text-white mb-1">Agences partenaires</div>
                <small class="text-white-50" style="font-size:.8rem;">Professionnels certifiés</small>
              </div>
            </div>
            <div class="col-6 col-lg-3">
              <div class="dsg-metric-card h-100 p-4 rounded-4 text-center">
                <div class="dsg-icon-wrap dsg-icon-blue mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle">
                  <i class="bi bi-people-fill fs-3"></i>
                </div>
                <div class="dsg-number tabular-numbers fw-bold mb-1" style="color:#38BDF8;">
                  {{ stats?.nb_locataires ?? 48 }}
                </div>
                <div class="h6 fw-semibold text-white mb-1">Locataires accompagnés</div>
                <small class="text-white-50" style="font-size:.8rem;">Dossiers & baux facilités</small>
              </div>
            </div>
            <div class="col-6 col-lg-3">
              <div class="dsg-metric-card h-100 p-4 rounded-4 text-center">
                <div class="dsg-icon-wrap dsg-icon-green mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle">
                  <i class="bi bi-star-fill fs-3"></i>
                </div>
                <div class="dsg-number tabular-numbers fw-bold mb-1" style="color:#34D399;">
                  {{ stats?.taux_satisfaction ?? 98 }}%
                </div>
                <div class="h6 fw-semibold text-white mb-1">Satisfaction globale</div>
                <small class="text-white-50" style="font-size:.8rem;">
                  Note : {{ stats?.note_moyenne ?? 4.9 }}/5
                </small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- =================================================================== -->
      <!-- SECTION 10 — AGENCES PARTENAIRES AVEC MARQUEE AUTOMATIQUE           -->
      <!-- =================================================================== -->
      @if (agences && agences.length > 0) {
        <section class="py-5 bg-white border-top border-bottom position-relative overflow-hidden">
          <div class="container mb-4">
            <div class="row align-items-center g-3">
              <div class="col-lg-8">
                <!-- <span class="badge px-3 py-1 rounded-2 bg-light text-primary border fw-semibold small mb-2 text-uppercase">
                  <i class="bi bi-shield-fill-check me-1" style="color:#14B8A6"></i> Réseau Certifié
                </span> -->
                <h2 class="h2 fw-bold text-dark mb-1" style="font-family:'Poppins',sans-serif;">
                  Les agences qui nous font confiance
                </h2>
                <p class="text-muted small mb-0">
                  Des agences agréées collaborent avec SanarHousings pour proposer des biens audités et sécurisés.
                </p>
              </div>
              <div class="col-lg-4 text-lg-end">
                <span class="badge rounded-pill bg-light text-dark border px-3 py-2 small">
                  <i class="bi bi-buildings me-1 text-primary"></i>
                  {{ agences.length }} agence{{ agences.length > 1 ? 's' : '' }} partenaire{{ agences.length > 1 ? 's' : '' }}
                </span>
              </div>
            </div>
          </div>

          <!-- DÉFILEMENT AUTOMATIQUE (MARQUEE) -->
          <div class="details-marquee-outer">
            <div class="details-marquee-track">
              <!-- Première passe -->
              @for (a of agences; track a.id) {
                <div class="details-agency-card p-3 d-flex align-items-center gap-3">
                  <div class="dac-avatar d-flex align-items-center justify-content-center rounded-circle flex-shrink-0">
                    @if (a.logo_url) {
                      <img [src]="a.logo_url" [alt]="a.nom" class="rounded-circle object-fit-cover" style="width:40px;height:40px;">
                    } @else {
                      <i class="bi {{ a.icone || 'bi-buildings' }} fs-4" style="color:#14B8A6;"></i>
                    }
                  </div>
                  <div class="text-start">
                    <div class="fw-bold text-dark small">{{ a.nom }}</div>
                    <div class="text-muted" style="font-size:.78rem;">
                      <i class="bi bi-geo-alt me-1" style="color:#14B8A6;"></i>{{ a.ville }}
                    </div>
                    @if (a.est_partenaire_certifie) {
                      <span class="badge dac-certif-badge rounded-pill mt-1" style="font-size:.68rem;">
                        <i class="bi bi-patch-check-fill me-1"></i>Agréée
                      </span>
                    }
                  </div>
                </div>
              }
              <!-- Deuxième passe (clone pour boucle infinie) -->
              @for (a of agences; track 'd_' + a.id) {
                <div class="details-agency-card p-3 d-flex align-items-center gap-3">
                  <div class="dac-avatar d-flex align-items-center justify-content-center rounded-circle flex-shrink-0">
                    @if (a.logo_url) {
                      <img [src]="a.logo_url" [alt]="a.nom" class="rounded-circle object-fit-cover" style="width:40px;height:40px;">
                    } @else {
                      <i class="bi {{ a.icone || 'bi-buildings' }} fs-4" style="color:#14B8A6;"></i>
                    }
                  </div>
                  <div class="text-start">
                    <div class="fw-bold text-dark small">{{ a.nom }}</div>
                    <div class="text-muted" style="font-size:.78rem;">
                      <i class="bi bi-geo-alt me-1" style="color:#14B8A6;"></i>{{ a.ville }}
                    </div>
                    @if (a.est_partenaire_certifie) {
                      <span class="badge dac-certif-badge rounded-pill mt-1" style="font-size:.68rem;">
                        <i class="bi bi-patch-check-fill me-1"></i>Agréée
                      </span>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        </section>
      }

      <!-- =================================================================== -->
      <!-- SECTION 11 — QUESTIONS FRÉQUENTES (ACCORDÉON INTERACTIF)           -->
      <!-- =================================================================== -->
      <section class="py-5 bg-white border-bottom">
        <div class="container py-lg-4">
          <div class="text-center max-w-700 mx-auto mb-5">
            <!-- <span class="badge px-3 py-1 rounded-pill bg-light text-primary border fw-semibold small mb-2 text-uppercase">
              FAQ SanarHousings
            </span> -->
            <h2 class="h2 fw-bold text-dark mb-2" style="font-family: 'Poppins', sans-serif;">
              Questions fréquentes
            </h2>
            <p class="text-muted small mb-0">
              Retrouvez les réponses aux questions les plus courantes sur le fonctionnement de la plateforme.
            </p>
          </div>

          <div class="max-w-850 mx-auto">
            <div class="accordion custom-accordion" id="faqAccordion">
              @for (faq of faqs; track $index) {
                <div class="accordion-item mb-3 border rounded-3 overflow-hidden shadow-sm">
                  <h3 class="accordion-header" [id]="'heading' + $index">
                    <button 
                      class="accordion-button fw-semibold py-3 px-4" 
                      [class.collapsed]="activeFaqIndex !== $index"
                      type="button" 
                      (click)="toggleFaq($index)"
                      [attr.aria-expanded]="activeFaqIndex === $index" 
                      [attr.aria-controls]="'collapse' + $index">
                      <span class="me-2 text-primary">Q{{ $index + 1 }}.</span> {{ faq.question }}
                    </button>
                  </h3>
                  <div 
                    [id]="'collapse' + $index" 
                    class="accordion-collapse collapse" 
                    [class.show]="activeFaqIndex === $index"
                    [attr.aria-labelledby]="'heading' + $index">
                    <div class="accordion-body px-4 pb-4 pt-1 text-muted small" style="line-height: 1.7;">
                      {{ faq.answer }}
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- =================================================================== -->
      <!-- SECTION 11 — APPEL À L'ACTION FINAL                                -->
      <!-- =================================================================== -->
      <section class="py-5 bg-light">
        <div class="container py-lg-4">
          <div class="final-cta-card p-4 p-md-5 rounded-4 text-white text-center position-relative overflow-hidden shadow-lg">
            <div class="cta-glow-bg"></div>
            <div class="position-relative" style="z-index: 2; max-width: 720px; margin: 0 auto;">
              <span class="badge bg-white bg-opacity-20 text-muted border border-white border-opacity-25 px-3 py-1 rounded-pill mb-3 small">
                <i class="bi bi-house-door-fill me-1 text-warning"></i> Rejoignez SanarHousings
              </span>
              <h2 class="display-6 fw-bold mb-3 text-white" style="font-family: 'Poppins', sans-serif;">
                Prêt à trouver votre prochain logement ?
              </h2>
              <p class="text-white-50 lead fs-6 mb-4">
                Explorez les logements disponibles et découvrez une expérience de réservation simplifiée avec SanarHousings.
              </p>
              <div class="d-flex flex-wrap justify-content-center gap-3">
                <a routerLink="/logements" class="btn btn-accent btn-lg px-4 py-2-5 rounded-3 fw-semibold shadow d-inline-flex align-items-center gap-2">
                  <i class="bi bi-search"></i>
                  <span>Voir les logements</span>
                </a>
                <a routerLink="/contact" class="btn btn-outline-light btn-lg px-4 py-2-5 rounded-3 fw-semibold d-inline-flex align-items-center gap-2">
                  <i class="bi bi-envelope-fill"></i>
                  <span>Nous contacter</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .about-details-page {
      background-color: #F8FAFC;
    }

    .max-w-700 { max-width: 700px; }
    .max-w-750 { max-width: 750px; }
    .max-w-850 { max-width: 850px; }

    /* Hero Section */
    .hero-section {
      background: linear-gradient(135deg, #072559 0%, #0B3D91 60%, #0d4ba8 100%);
      border-bottom: 3px solid #14B8A6;
    }

    .hero-bg-overlay {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 15% 25%, rgba(20, 184, 166, 0.25) 0%, transparent 45%),
                  radial-gradient(circle at 85% 75%, rgba(11, 61, 145, 0.4) 0%, transparent 50%);
      pointer-events: none;
    }

    .hero-pill {
      background-color: rgba(20, 184, 166, 0.25);
      color: #5EEAD4;
      border: 1px solid rgba(20, 184, 166, 0.4);
      font-size: 0.8rem;
    }

    .hero-graphic-card {
      transition: transform 0.3s ease;
      border: 1px solid rgba(255, 255, 255, 0.2);
      &:hover { transform: translateY(-4px); }
    }

    .image-badge-tag {
      position: absolute;
      bottom: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.75);
      color: #FFFFFF;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.75rem;
      backdrop-filter: blur(4px);
    }

    /* Cartes de Mission, Valeurs et Services */
    .mission-card, .value-card, .service-box, .step-card {
      transition: all 0.3s ease;
      border-color: rgba(11, 61, 145, 0.08) !important;
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 30px -5px rgba(11, 61, 145, 0.1) !important;
        border-color: #14B8A6 !important;
      }
    }

    .mission-icon-box {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .vision-pillar-box {
      transition: transform 0.25s ease, border-color 0.25s ease;
      &:hover {
        transform: translateY(-3px);
        border-color: #14B8A6 !important;
      }
    }

    .value-icon-circle {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .service-badge-icon {
      width: 46px;
      height: 46px;
    }

    /* Timeline Étapes */
    @media (min-width: 992px) {
      .steps-timeline-container::before {
        content: '';
        position: absolute;
        top: 45px;
        left: 12%;
        right: 12%;
        height: 3px;
        background: linear-gradient(90deg, #0B3D91 0%, #14B8A6 100%);
        z-index: 1;
        opacity: 0.35;
        border-radius: 2px;
      }
    }

    .step-badge-number {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0B3D91 0%, #14B8A6 100%);
      color: #FFFFFF;
      font-weight: 700;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(11, 61, 145, 0.2);
    }

    /* Avantages */
    .advantage-item {
      transition: all 0.25s ease;
      border-color: rgba(11, 61, 145, 0.06) !important;
      &:hover {
        background-color: #FFFFFF !important;
        box-shadow: 0 10px 25px -5px rgba(11, 61, 145, 0.08) !important;
        border-color: #14B8A6 !important;
        transform: translateY(-3px);
      }
    }

    .advantage-icon {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Accordéon personnalisé */
    .custom-accordion .accordion-item {
      border-color: rgba(11, 61, 145, 0.1) !important;
    }

    .custom-accordion .accordion-button {
      background-color: #FFFFFF;
      color: #072559;
      font-size: 0.95rem;

      &:not(.collapsed) {
        background-color: rgba(20, 184, 166, 0.08);
        color: #0B3D91;
        box-shadow: none;
      }

      &:focus {
        box-shadow: none;
        border-color: rgba(20, 184, 166, 0.5);
      }
    }

    /* CTA Final */
    .final-cta-card {
      background: linear-gradient(135deg, #072559 0%, #0B3D91 60%, #0F4C81 100%);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .cta-glow-bg {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 20% 40%, rgba(20, 184, 166, 0.3) 0%, transparent 50%),
                  radial-gradient(circle at 80% 60%, rgba(245, 158, 11, 0.2) 0%, transparent 45%);
      pointer-events: none;
    }

    .btn-accent {
      background-color: #14B8A6; border-color: #14B8A6; color: #FFFFFF; transition: all 0.25s ease;
      &:hover { background-color: #0D9488; border-color: #0D9488; color: #FFFFFF; transform: translateY(-2px); }
    }

    /* ---- Stats & Marquee → styles.scss global (dsg-*, details-stats-section, details-marquee-*, dac-*) ---- */
  `]
})
export class AboutDetailsComponent implements OnInit, OnDestroy {
  activeFaqIndex: number | null = 0;

  private statsService = inject(StatsService);
  private agenceService = inject(AgenceService);
  private subs = new Subscription();

  public stats: PlateformePublicStats | null = null;
  public agences: Agence[] = [];

  ngOnInit(): void {
    this.stats = this.statsService.getStatsSync();
    this.agences = this.agenceService.getAgencesSync();
    this.subs.add(this.statsService.stats$.subscribe(s => { if (s) this.stats = s; }));
    this.subs.add(this.agenceService.agences$.subscribe(list => { if (list && Array.isArray(list)) this.agences = list; }));
    this.statsService.refresh();
    this.agenceService.refresh();
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  faqs: FaqItem[] = [
    {
      question: "Qu'est-ce que SanarHousings ?",
      answer: "SanarHousings est une plateforme numérique conçue pour simplifier la mise en relation entre locataires, propriétaires et gestionnaires de biens immobiliers. Elle centralise les logements disponibles, permet l'envoi de demandes de réservation et met à disposition des gestionnaires des outils de suivi adaptés."
    },
    {
      question: "Comment rechercher un logement ?",
      answer: "Rendez-vous dans la rubrique « Explorer & Carte » pour parcourir les logements disponibles. Vous pouvez affiner les résultats grâce aux filtres mis à votre disposition : ville, quartier, type de bien (appartement, villa, studio, chambre), fourchette de prix, surface, nombre de pièces et équipements."
    },
    {
      question: "Comment effectuer une réservation ?",
      answer: "Une fois sur la fiche du logement qui vous intéresse, cliquez sur « Réserver ». Vous sélectionnerez vos dates d'emménagement et de fin de bail, compléterez vos informations locataire et soumettrez votre demande. Celle-ci est alors transmise au gestionnaire responsable du bien."
    },
    {
      question: "Comment suivre ma demande ?",
      answer: "Connectez-vous à votre Espace Locataire via le menu pour accéder à l'onglet « Mes Réservations ». Vous y retrouverez la liste de toutes vos demandes avec leur statut en direct : « En attente », « Confirmée » ou « Refusée »."
    },
    {
      question: "Qui valide les demandes de réservation ?",
      answer: "Ce sont les gestionnaires ou agences mandatés administrant le logement qui examinent votre dossier. Ils vérifient la concordance des dates et la conformité des informations avant de valider ou de refuser la demande."
    },
    {
      question: "Comment contacter le gestionnaire ?",
      answer: "Vous pouvez contacter les gestionnaires agréés via la rubrique « Contact » du site, où sont répertoriés leurs numéros directs (téléphone, WhatsApp ou SMS), ou directement au sein de votre espace locataire une fois une réservation initialisée."
    },
    {
      question: "Comment utiliser SanarHousings sur mobile ?",
      answer: "SanarHousings est entièrement responsive. Vous pouvez y accéder depuis n'importe quel navigateur mobile sur smartphone ou tablette sans installation requise. L'interface s'adapte automatiquement pour offrir une navigation fluide et des menus tactiles ergonomiques."
    }
  ];

  toggleFaq(index: number): void {
    if (this.activeFaqIndex === index) {
      this.activeFaqIndex = null;
    } else {
      this.activeFaqIndex = index;
    }
  }
}
