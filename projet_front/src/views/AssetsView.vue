<template>
  <div class="page-fade-in">
    <div class="page-header">
      <div>
        <h2 class="page-title">Cartographie des Actifs</h2>
        <p class="page-subtitle">Gérez votre inventaire et associez les vulnérabilités identifiées pour chaque équipement.</p>
      </div>
    </div>

    <div class="kpi-card">
      <h3 class="form-section-title" style="margin-bottom: 15px;">Nouvel Actif Éligible</h3>
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

        <button type="submit" class="btn btn-add">Enregistrer l'actif</button>
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
            <button 
              v-for="vuln in store.vulnerabilitiesCatalog" 
              :key="vuln.id"
              type="button"
              :class="['badge-toggle', { 'selected': asset.vulnerabilities.includes(vuln.id) }, vuln.severity]"
              @click="toggleVuln(asset, vuln.id)"
            >
              {{ vuln.name }}
            </button>
          </div>
        </div>
        
        <div class="asset-pro-footer">
          <button @click="store.removeAsset(asset.id)" class="btn btn-del btn-sm">Supprimer l'actif</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCyberStore } from '../stores/cyberStore'

const store = useCyberStore()
const newAsset = ref({ name: '', type: 'Serveur Web', internetExposed: false })

onMounted(() => {
  store.loadAssets()
  store.loadCatalog()
})

const submitAsset = async () => {
  await store.addAsset({ ...newAsset.value })
  newAsset.value = { name: '', type: 'Serveur Web', internetExposed: false }
}

const toggleVuln = async (asset, vulnId) => {
  let list = [...asset.vulnerabilities]
  if (list.includes(vulnId)) {
    list = list.filter(id => id !== vulnId)
  } else {
    list.push(vulnId)
  }
  await store.updateAssetVulnerabilities(asset.id, list)
}
</script>