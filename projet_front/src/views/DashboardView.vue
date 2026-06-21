<template>
  <div class="page-fade-in">
    <div class="page-header">
      <div>
        <h2 class="page-title">Tableau de Bord Stratégique</h2>
        <p class="page-subtitle">Indicateurs clés de performance et niveau d'exposition de la PME.</p>
      </div>
    </div>

    <div class="stats-grid">
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-label">Actifs répertoriés</span>
          <HardDrive class="kpi-icon text-muted" />
        </div>
        <div class="kpi-value">{{ store.assets.length }}</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-label">Vulnérabilités totales</span>
          <AlertTriangle class="kpi-icon text-muted" />
        </div>
        <div class="kpi-value text-warning">{{ totalVulns }}</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-label">Niveau de Risque Global</span>
          <ShieldAlert class="kpi-icon" :class="store.riskResult.level" />
        </div>
        <div class="kpi-value" :class="store.riskResult.level">{{ store.riskResult.level }}</div>
      </div>
    </div>

    <div class="chart-grid">
      <div class="kpi-card flex-center">
        <h3 class="card-section-title">Indice de Vulnérabilité Global</h3>
        <div class="gauge-box">
          <svg viewBox="0 0 36 36" class="circular-gauge">
            <path class="gauge-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path class="gauge-fill" :style="{ strokeDasharray: store.riskResult.score + ', 100' }" :class="store.riskResult.level" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <text x="18" y="21" class="gauge-text">{{ store.riskResult.score }}%</text>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useCyberStore } from '../stores/cyberStore'
import { HardDrive, AlertTriangle, ShieldAlert } from 'lucide-vue-next'

const store = useCyberStore()

onMounted(() => {
  store.loadAssets()
  store.triggerRiskCalculation()
})

const totalVulns = computed(() => {
  return store.assets.reduce((sum, asset) => sum + (asset.vulnerabilities?.length || 0), 0)
})
</script>