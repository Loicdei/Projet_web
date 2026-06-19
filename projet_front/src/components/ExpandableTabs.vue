<template>
  <nav class="sidebar">
    <div class="sidebar-brand">
      <ShieldAlert class="icon-brand" />
      <span>CyberTwin</span>
    </div>
    
    <div class="tabs-list">
      <template v-for="(tab, index) in tabs" :key="index">
        <div v-if="tab.type === 'separator'" class="separator"></div>
        
        <router-link 
          v-else 
          :to="tab.path" 
          class="tab-item"
          v-slot="{ isActive }"
        >
          <div class="tab-content" :class="{ 'active': isActive }">
            <component :is="tab.icon" class="tab-icon" />
            <span class="tab-title">{{ tab.title }}</span>
          </div>
        </router-link>
      </template>
    </div>
  </nav>
</template>

<script setup>
import { ShieldAlert } from 'lucide-vue-next'

defineProps({
  tabs: {
    type: Array,
    required: true
  }
})
</script>