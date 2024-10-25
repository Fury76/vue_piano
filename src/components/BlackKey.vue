<template>
    <PianoKey v-bind="$props" :data-key="$attrs['data-key']">
      <rect
        width="13"
        height="80"
        rx="2"
        ry="2"
        fill="url(#blackKeyGradient)"
        stroke="#000"
        stroke-width="1"
        :class="{ 'key-pressed': isPressed }"
      />
    </PianoKey>
  </template>
  
  <script setup lang="ts">
  import { defineProps, defineEmits } from 'vue'
  import PianoKey from './PianoKey.vue'
  
  defineProps<{
    keyIndex: number
    octave: number
    note: string
    x: number
    isPressed: boolean
  }>()

  </script>
  
  <style scoped>
  .key-pressed {
    fill: url(#blackKeyPressedGradient);
  }
  </style>