<template>
  <div class="app">
    <h1>Vue 3 Piano Component</h1>
    <button @click="toggleSections">
      {{ showSections ? '隐藏分区' : '显示分区' }}
    </button>
    <Piano :showSections="showSections" :pianoHeight="220" :pianoWidth="1416" @keyEvent="handleKeyEvent" />
    <div style="width: 320px; height: 125px; background-color:aqua">
      <Piano :showSections="showSections" @keyEvent="handleKeyEvent" />
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Piano from './components/Piano.vue'

const showSections = ref(false)
const toggleSections = () => {
  showSections.value = !showSections.value
}

const handleKeyEvent = (event: any) => {
  console.log(event)
}
</script>

<style>
.app {
  font-family: Arial, sans-serif;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

h1 {
  color: #333;
  margin-bottom: 20px;
}
</style>
