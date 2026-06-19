import { defineStore } from 'pinia'

const API_URL = '/api' // Redirigé automatiquement par le proxy Vite vers localhost:3000

export const useCyberStore = defineStore('cyber', {
  state: () => ({
    company: { name: '', sector: '', employees: 0, servers: 0, workstations: 0, exposedServices: '' },
    assets: [],
    vulnerabilitiesCatalog: [],
    riskResult: { score: 0, level: 'Faible', recommendations: [] }
  }),
  actions: {
    async loadCompany() {
      const res = await fetch(`${API_URL}/company`)
      this.company = await res.json()
    },
    async saveCompany(updatedCompany) {
      const res = await fetch(`${API_URL}/company`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCompany)
      })
      this.company = await res.json()
      this.triggerRiskCalculation()
    },
    async loadAssets() {
      const res = await fetch(`${API_URL}/assets`)
      this.assets = await res.json()
    },
    async addAsset(asset) {
      const res = await fetch(`${API_URL}/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(asset)
      })
      const newAsset = await res.json()
      this.assets.push(newAsset)
      this.triggerRiskCalculation()
    },
    async updateAssetVulnerabilities(assetId, vulnIds) {
      const asset = this.assets.find(a => a.id === assetId)
      if (asset) {
        const res = await fetch(`${API_URL}/assets/${assetId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...asset, vulnerabilities: vulnIds })
        })
        const updated = await res.json()
        const index = this.assets.findIndex(a => a.id === assetId)
        this.assets[index] = updated
        this.triggerRiskCalculation()
      }
    },
    async removeAsset(id) {
      await fetch(`${API_URL}/assets/${id}`, { method: 'DELETE' })
      this.assets = this.assets.filter(a => a.id !== id)
      this.triggerRiskCalculation()
    },
    async loadCatalog() {
      const res = await fetch(`${API_URL}/vulnerabilities`)
      this.vulnerabilitiesCatalog = await res.json()
    },
    async triggerRiskCalculation() {
      const res = await fetch(`${API_URL}/risk/calculate`, { method: 'POST' })
      this.riskResult = await res.json()
    }
  }
})