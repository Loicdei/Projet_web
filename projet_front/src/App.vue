<template>
  <div class="app-layout">
    <ExpandableTabs :tabs="navigationTabs" />

    <main class="main-viewport">
      <div class="viewport-container">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import ExpandableTabs from './components/ExpandableTabs.vue'
import { Home, Building2, HardDrive, LayoutDashboard, FileBarChart2 } from 'lucide-vue-next'

const navigationTabs = [
  { title: "Accueil", icon: Home, path: "/" },
  { type: "separator" },
  { title: "Entreprise", icon: Building2, path: "/entreprise" },
  { title: "Actifs & Failles", icon: HardDrive, path: "/actifs" },
  { title: "Tableau de Bord", icon: LayoutDashboard, path: "/dashboard" },
  { type: "separator" },
  { title: "Rapport Final", icon: FileBarChart2, path: "/rapport" }
]
</script>