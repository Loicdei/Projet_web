<template>
  <div class="page-fade-in report-workspace">
    <div class="workspace-header no-print">
      <div>
        <h2 class="workspace-title">Livrable d'Audit & Conformité</h2>
        <p class="workspace-subtitle">Rapport d'évaluation de la posture de sécurité et score de criticité cyber.</p>
      </div>
      <button @click="printReport" class="btn-audit-primary">
        <Printer class="btn-icon" /> Exporter le rapport PDF
      </button>
    </div>

    <div class="audit-sheet sheet-shadow">
      <div class="audit-header">
        <div class="brand-side">
          <div class="audit-indicator">CLASSIFICATION : INTERNE</div>
          <h1 class="audit-main-title">CYBER SECURITY REPORT</h1>
          <p class="audit-timestamp">ID Audit : #{{ auditId }} — {{ currentDate }}</p>
        </div>
        <div class="company-side">
          <div class="company-badge-name">{{ store.company.name || 'PME' }}</div>
          <div class="company-meta-line"><span>Secteur:</span> {{ store.company.sector || 'N/A' }}</div>
          <div class="company-meta-line"><span>Effectif:</span> {{ store.company.employees || 0 }} ETP</div>
        </div>
      </div>

      <div class="audit-layout-grid">
        <div class="audit-sidebar-panel">
          <div class="panel-section">
            <h4 class="panel-title">Posture de Risque</h4>
            <div class="risk-kpi-block" :class="store.riskResult.level">
              <div class="risk-kpi-value">{{ store.riskResult.score }}<span>%</span></div>
              <div class="risk-kpi-badge" :class="store.riskResult.level">
                CRITICITÉ {{ store.riskResult.level.toUpperCase() }}
              </div>
            </div>
          </div>

          <div class="panel-section">
            <h4 class="panel-title">Résumé de l'Infrastructure</h4>
            <ul class="infra-list">
              <li><span>Serveurs logiques :</span> <strong>{{ store.company.servers || 0 }}</strong></li>
              <li><span>Postes de travail :</span> <strong>{{ store.company.workstations || 0 }}</strong></li>
              <li><span>Périmètre exposé :</span> <p class="exposed-text-tag">{{ store.company.exposedServices || 'Aucun service déclaré' }}</p></li>
            </ul>
          </div>
        </div>

        <div class="audit-main-panel">
          <div class="panel-section">
            <h4 class="panel-title">Recommandations & Actions Correctives</h4>
            <div v-if="store.riskResult.recommendations.length > 0" class="recommendations-stack">
              <div v-for="(rec, index) in store.riskResult.recommendations" :key="index" class="rec-item">
                <ShieldCheck class="rec-icon" />
                <p class="rec-text">{{ rec }}</p>
              </div>
            </div>
            <div v-else class="empty-state-text">
              Aucune faille critique détectée. Maintenir la politique de sécurité actuelle.
            </div>
          </div>
        </div>
      </div>

      <div class="audit-section-full" style="margin-top: 40px;">
        <h4 class="panel-title">Registre Technique de Cartographie des Actifs</h4>
        <table class="audit-table">
          <thead>
            <tr>
              <th>Désignation de l'Actif</th>
              <th>Type d'Équipement</th>
              <th>Statut Réseau</th>
              <th>Vulnérabilités & CVE Associées</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="asset in store.assets" :key="asset.id">
              <td class="asset-name-cell">{{ asset.name }}</td>
              <td><span class="asset-type-tag">{{ asset.type }}</span></td>
              <td>
                <span :class="['network-status-tag', asset.internetExposed ? 'is-exposed' : 'is-isolated']">
                  {{ asset.internetExposed ? 'EXPOSÉ INTERNET' : 'RÉSEAU INTERNE' }}
                </span>
              </td>
              <td>
                <div class="cve-tags-container">
                  <span 
                    v-for="vulnId in asset.vulnerabilities" 
                    :key="vulnId" 
                    class="cve-pill"
                    :class="getVulnSeverity(vulnId)"
                  >
                    {{ getVulnName(vulnId) }}
                  </span>
                  <span v-if="!asset.vulnerabilities?.length" class="no-cve-text">
                    0 Faille détectée
                  </span>
                </div>
              </td>
            </tr>
            <tr v-if="!store.assets.length">
              <td colspan="4" class="table-empty-row">Aucun actif répertorié dans le périmètre actuel.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useCyberStore } from '../stores/cyberStore'
import { Printer, ShieldCheck } from 'lucide-vue-next'

const store = useCyberStore()

onMounted(() => {
  store.loadCompany()
  store.loadAssets()
  store.loadCatalog()
  store.triggerRiskCalculation()
})

const auditId = computed(() => {
  return Math.floor(100000 + Math.random() * 900000)
})

const currentDate = computed(() => {
  return new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).toUpperCase()
})

const getVulnName = (id) => {
  const v = store.vulnerabilitiesCatalog.find(item => item.id === id)
  return v ? v.name : id
}

const getVulnSeverity = (id) => {
  const v = store.vulnerabilitiesCatalog.find(item => item.id === id)
  return v ? v.severity : ''
}

const printReport = () => {
  window.print()
}
</script>