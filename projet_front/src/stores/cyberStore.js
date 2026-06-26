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

    async createCompany(newCompanyData) {
      try {
        const response = await axios.post(`${API_URL}/company`, {
          nom: newCompanyData.name,
          secteur: newCompanyData.sector,
          nombreEmployes: newCompanyData.employees,
          nombreServeurs: newCompanyData.servers,
          nombrePostes: newCompanyData.workstations,
          servicesExposes: newCompanyData.exposedServices ? newCompanyData.exposedServices.split(', ') : []
        })

        // Une fois créée en BDD, on bascule le store sur cette nouvelle entreprise
        this.company = {
          id: response.data.id,
          name: newCompanyData.name,
          sector: newCompanyData.sector,
          employees: newCompanyData.employees,
          servers: newCompanyData.servers,
          workstations: newCompanyData.workstations,
          exposedServices: newCompanyData.exposedServices
        }

        // On recalcule le risque par rapport à cette nouvelle entreprise
        await this.triggerRiskCalculation()
        // On recharge les actifs (qui seront vides pour cette nouvelle entreprise)
        await this.loadAssets()
      } catch (error) {
        console.error("Erreur lors de la création de l'entreprise:", error)
      }
    },

    async loadAssets() {
      try {
        const response = await axios.get(`${API_URL}/assets`)

        this.assets = response.data.map(asset => {
          // On extrait proprement les vulnérabilités de l'actif
          const rawVulns = asset.vulnerabilites || asset.vulnerabilities || []
          // On s'assure d'avoir TOUJOURS un tableau d'IDs numériques uniques
          const parsedIds = rawVulns.map(v => typeof v === 'object' ? v.id : v)

          return {
            id: asset.id,
            name: asset.nom || asset.name,
            type: asset.type,
            internetExposed: asset.expose_internet !== undefined ? !!asset.expose_internet : !!asset.exposeInternet,
            vulnerabilities: parsedIds, // Tableau d'IDs pour le Front
            vulnerabilites: rawVulns   // Conserve les objets au cas où
          }
        })
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
        // Après l'ajout, on RECHARGE proprement depuis le serveur pour avoir le bon format
        await this.loadAssets()
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

    async updateAsset(id, assetData) {
      try {
        await axios.put(`${API_URL}/assets/${id}`, {
          nom: assetData.name,          // Convertit 'name' du front en 'nom' pour le back
          type: assetData.type,         // Reste 'type'
          exposeInternet: assetData.internetExposed // Convertit pour le back
        })

        // On force le rechargement immédiat de l'affichage depuis MySQL
        await this.loadAssets()
        await this.triggerRiskCalculation()
      } catch (error) {
        console.error("Erreur lors de la modification de l'actif:", error)
      }
    },

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

        // Source propre basée sur notre loadAssets unifié
        const currentVulnIds = currentAsset.vulnerabilities || []

        // Anti-duplication strict
        const added = nextVulnIds.filter(id => !currentVulnIds.includes(id))

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

        // On rafraîchit tout l'état
        await this.loadAssets()
        await this.triggerRiskCalculation()
      } catch (error) {
        console.error("Erreur de synchronisation des vulnérabilités:", error)
      }
    },

    async triggerRiskCalculation() {
      try {
        const response = await axios.post(`${API_URL}/risk/calculate`)
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