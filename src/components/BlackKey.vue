<template>
    <PianoKey v-bind="$props" :data-key="$attrs['data-key']" @keyPress="$emit('keyPress', $event)" @keyRelease="$emit('keyRelease', $event)" @mouseEnter="$emit('mouseEnter', $event)" @mouseLeave="$emit('mouseLeave', $event)">
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
  
  defineEmits<{
    (e: 'keyPress', data: { keyIndex: number; octave: number; note: string }, originalEvent: MouseEvent): void
    (e: 'keyRelease', data: { keyIndex: number; octave: number; note: string }, originalEvent: MouseEvent): void
    (e: 'mouseEnter', data: { keyIndex: number; octave: number; note: string }, originalEvent: MouseEvent): void
    (e: 'mouseLeave', data: { keyIndex: number; octave: number; note: string }, originalEvent: MouseEvent): void
  }>()
  </script>
  
  <style scoped>
  .key-pressed {
    fill: url(#blackKeyPressedGradient);
  }
  </style>