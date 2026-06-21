<template>
  <div class="page-fade-in home-viewport-clean">
    <div class="hero-section">
      <h1 class="hero-title">Simulateur de Risque Cyber pour PME</h1>
      <p class="hero-subtitle">
        Modélisez votre infrastructure, cartographiez vos actifs critiques et évaluez 
        automatiquement votre niveau d'exposition face aux menaces cybernétiques actuelles.
      </p>
    </div>

    <div class="features-grid">
      <div class="kpi-card feature-card">
        <div class="feature-icon-wrapper">
          <Building2 class="feature-icon" />
        </div>
        <h3 class="feature-title">1. Profil Organisationnel</h3>
        <p class="feature-desc">
          Définissez les caractéristiques structurelles de votre PME fictive : effectifs, serveurs logiques et services exposés.
        </p>
      </div>

      <div class="kpi-card feature-card">
        <div class="feature-icon-wrapper">
          <HardDrive class="feature-icon" />
        </div>
        <h3 class="feature-title">2. Gestion des Actifs</h3>
        <p class="feature-desc">
          Cartographiez vos équipements réseaux, vos bases de données et associez-y directement les vulnérabilités du catalogue.
        </p>
      </div>

      <div class="kpi-card feature-card">
        <div class="feature-icon-wrapper">
          <ShieldAlert class="feature-icon" />
        </div>
        <h3 class="feature-title">3. Analyse et Rapport</h3>
        <p class="feature-desc">
          Visualisez votre score de vulnérabilité global sur le tableau de bord et générez un rapport d'audit imprimable au format PDF.
        </p>
      </div>
    </div>

    <div class="hero-actions bottom-actions">
      <router-link to="/entreprise" class="btn btn-primary home-btn">
        Démarrer la configuration
      </router-link>
      <router-link to="/actifs" class="btn btn-primary home-btn">
        Consulter l'inventaire
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { Building2, HardDrive, ShieldAlert } from 'lucide-vue-next'
</script>