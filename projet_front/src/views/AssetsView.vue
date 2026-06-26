<template>
  <div class="page-fade-in">
    <div class="page-header">
      <div>
        <h2 class="page-title">Cartographie des Actifs</h2>
        <p class="page-subtitle">Gérez votre inventaire et associez les vulnérabilités identifiées pour chaque équipement.</p>
      </div>
    </div>

    <div class="kpi-card" :style="isEditing ? 'border-left: 4px solid #3182ce;' : ''">
      <h3 class="form-section-title" style="margin-bottom: 15px;">
        {{ isEditing ? "Modifier l'Actif Sélectionné" : "Nouvel Actif Éligible" }}
      </h3>
      <form @submit.prevent="submitAsset" class="inline-form modern-inline">
        <input v-model="newAsset.name" type="text" placeholder="Nom de l'équipement (ex: Serveur Cloud NAS)" required />

        <select v-model="newAsset.type">
          <option>Serveur Web</option>
          <option>Base de données</option>
          <option>Poste utilisateur</option>
          <option>Routeur</option>
          <option>Pare-feu</option>
          <option>Application métier</option>
        </select>

        <label class="check-toggle">
          <input type="checkbox" v-model="newAsset.internetExposed" />
          <span>Exposition Internet</span>
        </label>

        <button type="submit" class="btn" :class="isEditing ? 'btn-primary' : 'btn-add'">
          {{ isEditing ? "Confirmer" : "Enregistrer l'actif" }}
        </button>
        
        <button v-if="isEditing" type="button" @click="cancelEdit" class="btn btn-del" style="background-color: #718096;">
          Annuler
        </button>
      </form>
    </div>

    <div class="grid" style="margin-top: 30px;">
      <div v-for="asset in store.assets" :key="asset.id" class="kpi-card asset-pro-card">
        <div class="asset-pro-header">
          <div>
            <h4 class="asset-title">{{ asset.name }}</h4>
            <span class="badge-type">{{ asset.type }}</span>
          </div>
          <span :class="['badge-exposure', asset.internetExposed ? 'exp-danger' : 'exp-success']">
            {{ asset.internetExposed ? 'Exposé' : 'Isolé' }}
          </span>
        </div>

        <div class="vuln-picker-section">
          <span class="section-micro-title">Vulnérabilités associées:</span>
          <div class="badge-selector-group">
            <button v-for="vuln in store.vulnerabilitiesCatalog" :key="vuln.id" type="button"
              :class="['badge-toggle', { 'selected': asset.vulnerabilities && asset.vulnerabilities.includes(vuln.id) }, vuln.severity]"
              @click="toggleVuln(asset, vuln.id)">
              {{ vuln.name }}
            </button>
          </div>
        </div>

        <div class="asset-pro-footer" style="display: flex; gap: 10px;">
          <button @click="startEdit(asset)" class="btn btn-sm" style="background-color: #3182ce; color: white;">
            Modifier
          </button>
          <button @click="store.removeAsset(asset.id)" class="btn btn-del btn-sm">
            Supprimer l'actif
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCyberStore } from '../stores/cyberStore'

const store = useCyberStore()

// États pour gérer l'édition
const isEditing = ref(false)
const editingAssetId = ref(null)

const newAsset = ref({ name: '', type: 'Serveur Web', internetExposed: false })

onMounted(() => {
  store.loadAssets()
  store.loadCatalog()
})

// Active le mode édition et charge l'actif dans le formulaire du haut
const startEdit = (asset) => {
  isEditing.value = true
  editingAssetId.value = asset.id
  newAsset.value = {
    name: asset.name,
    type: asset.type,
    internetExposed: asset.internetExposed
  }
  // Remonte doucement en haut de la page pour le confort visuel
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Annule le mode édition
const cancelEdit = () => {
  isEditing.value = false
  editingAssetId.value = null
  newAsset.value = { name: '', type: 'Serveur Web', internetExposed: false }
}

// Soumission du formulaire (gère l'ajout OU la modification)
const submitAsset = async () => {
  if (isEditing.value) {
    // Mode Modification : on appelle notre nouvelle action Pinia
    await store.updateAsset(editingAssetId.value, { ...newAsset.value })
    isEditing.value = false
    editingAssetId.value = null
  } else {
    // Mode Ajout classique
    await store.addAsset({ ...newAsset.value })
  }
  // Reset du formulaire
  newAsset.value = { name: '', type: 'Serveur Web', internetExposed: false }
}

const toggleVuln = async (asset, vulnId) => {
  let list = asset.vulnerabilities ? [...asset.vulnerabilities] : []
  
  if (list.includes(vulnId)) {
    list = list.filter(id => id !== vulnId)
  } else {
    list.push(vulnId)
  }
  await store.updateAssetVulnerabilities(asset.id, list)
}
</script>