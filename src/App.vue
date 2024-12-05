<template>
  <div class="app">
    <h1></h1>
    <button @click="toggleSections">
      {{ showSections ? '隐藏分区' : '显示分区' }}
    </button>

    <button v-for="note in startNotes" @click="handleStartNoteClick(note)">{{ note }}</button>
    <div style="width: 340px; height: 120px;">
      <Piano :showSections="showSections" :startNote="startNote" :allowScroll="true" :displayHeader="true" :whiteKeyHeight="120" @keyEvent="handleKeyEvent" />
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Piano from './components/Piano.vue'

const startNote = ref('A0')

const startNotes = ['A0', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7']
const showSections = ref(false)
const toggleSections = () => {
  showSections.value = !showSections.value
}

const handleStartNoteClick = (note: string) => {
  startNote.value = note
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
