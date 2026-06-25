import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = 'http://localhost:3000'

export const useCyberStore = defineStore('cyber', {
  state: () => ({
    company: {
      id: 1,
      name: '',
      sector: '',
      employees: 0,
      servers: 0,
      workstations: 0,
      exposedServices: ''
    },
    assets: [],
    vulnerabilitiesCatalog: [],
    riskResult: {
      score: 0,
      level: 'Faible',
      recommendations: []
    }
  }),

  actions: {
    // --- ENTREPRISE ---
    async loadCompany() {
      try {
        const response = await axios.get(`${API_URL}/company`)
        const data = response.data
        this.company = {
          id: data.id,
          name: data.nom || '',
          sector: data.secteur || '',
          employees: data.nombre_employes || 0,
          servers: data.nombre_serveurs || 0,
          workstations: data.nombre_postes || 0,
          exposedServices: Array.isArray(data.servicesExposes) 
            ? data.servicesExposes.join(', ') 
            : (data.services_exposes || '')
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'entreprise:", error)
      }
    },

    async saveCompany(updatedCompany) {
      try {
        await axios.put(`${API_URL}/company`, {
          nom: updatedCompany.name,
          secteur: updatedCompany.sector,
          nombreEmployes: updatedCompany.employees,
          nombreServeurs: updatedCompany.servers,
          nombrePostes: updatedCompany.workstations,
          servicesExposes: updatedCompany.exposedServices ? updatedCompany.exposedServices.split(', ') : []
        })
        this.company = { ...updatedCompany }
        await this.triggerRiskCalculation()
      } catch (error) {
        console.error("Erreur lors de la modification de l'entreprise:", error)
      }
    },

    // --- ACTIFS ---
    async loadAssets() {
      try {
        const response = await axios.get(`${API_URL}/assets`)
        this.assets = response.data.map(asset => ({
          id: asset.id,
          name: asset.nom,
          type: asset.type,
          internetExposed: !!asset.expose_internet,
          vulnerabilities: asset.vulnerabilities ? asset.vulnerabilities.map(v => v.id) : []
        }))
      } catch (error) {
        console.error("Erreur lors du chargement des actifs:", error)
      }
    },

    async addAsset(assetData) {
      try {
        const response = await axios.post(`${API_URL}/assets`, {
          nom: assetData.name,
          type: assetData.type,
          exposeInternet: assetData.internetExposed
        })
        const newAsset = response.data
        this.assets.push({
          id: newAsset.id,
          name: newAsset.nom,
          type: newAsset.type,
          internetExposed: newAsset.exposeInternet,
          vulnerabilities: []
        })
        await this.triggerRiskCalculation()
      } catch (error) {
        console.error("Erreur lors de l'ajout de l'actif:", error)
      }
    },

    async removeAsset(id) {
      try {
        await axios.delete(`${API_URL}/assets/${id}`)
        this.assets = this.assets.filter(asset => asset.id !== id)
        await this.triggerRiskCalculation()
      } catch (error) {
        console.error("Erreur lors de la suppression de l'actif:", error)
      }
    },

    // --- CATALOGUE DE VULNÉRABILITÉS & RELATIONS ---
    async loadCatalog() {
      try {
        const response = await axios.get(`${API_URL}/vulnerabilities`)
        this.vulnerabilitiesCatalog = response.data.map(v => ({
          id: v.id,
          name: v.nom_vulnerabilite,
          severity: v.criticite // 'Élevé', 'Moyen', 'Faible'
        }))
      } catch (error) {
        console.error("Erreur lors du chargement du catalogue:", error)
      }
    },

    async updateAssetVulnerabilities(assetId, nextVulnIds) {
      try {
        const currentAsset = this.assets.find(a => a.id === assetId)
        if (!currentAsset) return

        const currentVulns = currentAsset.vulnerabilities
        const added = nextVulnIds.filter(id => !currentVulns.includes(id))
        const removed = nextVulnIds.filter(id => currentVulns.includes(id)) 
        
        // Ajout des nouvelles failles cochées
        for (const id of added) {
          const catalogItem = this.vulnerabilitiesCatalog.find(v => v.id === id)
          if (catalogItem) {
            await axios.post(`${API_URL}/vulnerabilities`, {
              actifId: assetId,
              nomVulnerabilite: catalogItem.name,
              criticite: catalogItem.severity
            })
          }
        }

        // Note: Si ton API ne supporte pas la suppression unitaire des failles, 
        // l'état local est rechargé depuis la base de données MySQL pour rester consistant.
        await this.loadAssets()
        await this.triggerRiskCalculation()
      } catch (error) {
        console.error("Erreur de synchronisation des vulnérabilités:", error)
      }
    },

    // --- MOTEUR DE CALCUL DE RISQUE ---
    async triggerRiskCalculation() {
      try {
        const response = await axios.get(`${API_URL}/risk/calculate`)
        this.riskResult = {
          score: response.data.score || 0,
          level: response.data.level || 'Faible',
          recommendations: response.data.recommendations || []
        }
      } catch (error) {
        console.error("Erreur lors du calcul du risque:", error)
      }
    }
  }
})