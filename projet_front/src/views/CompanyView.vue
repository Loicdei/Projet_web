<template>
  <div class="page-fade-in">
    <div class="page-header">
      <div>
        <h2 class="page-title">Profil de l'Entreprise</h2>
        <p class="page-subtitle">Configurez l'identité et l'infrastructure de la PME pour calibrer la simulation.</p>
      </div>
    </div>

    <div class="kpi-card max-width-md">
      <form @submit.prevent="handleSave" class="modern-form">
        <h3 class="form-section-title">
          {{ store.company.name ? "Modifier le Périmètre Actuel" : "Initialiser le Profil de l'Entreprise" }}
        </h3>
        
        <div class="group">
          <label>Nom de l'organisation</label>
          <input v-model="localCompany.name" type="text" placeholder="ex: Global Tech Solutions" required />
        </div>

        <div class="group">
          <label>Secteur d'activité</label>
          <input v-model="localCompany.sector" type="text" placeholder="ex: Logistique, Santé, Industrie" required />
        </div>

        <h3 class="form-section-title" style="margin-top: 30px;">Métriques de l'Infrastructure</h3>
        
        <div class="form-row">
          <div class="group flex-1">
            <label>Effectifs</label>
            <input v-model.number="localCompany.employees" type="number" min="1" required />
          </div>
          <div class="group flex-1">
            <label>Serveurs</label>
            <input v-model.number="localCompany.servers" type="number" min="0" required />
          </div>
          <div class="group flex-1">
            <label>Postes clients</label>
            <input v-model.number="localCompany.workstations" type="number" min="0" required />
          </div>
        </div>

        <div class="group" style="margin-top: 15px;">
          <label>Services exposés sur Internet</label>
          <input v-model="localCompany.exposedServices" type="text" placeholder="ex: HTTPS, SSH, SFTP (séparés par des virgules)" />
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary w-full">
            {{ store.company.name ? "Mettre à jour le périmètre" : "Enregistrer et créer l'entreprise" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCyberStore } from '../stores/cyberStore'

const store = useCyberStore()
const localCompany = ref({ ...store.company })

onMounted(async () => {
  await store.loadCompany()
  localCompany.value = { ...store.company }
})

const handleSave = async () => {
  await store.saveCompany(localCompany.value)
  alert("Périmètre de l'entreprise synchronisé avec succès !")
}
</script>