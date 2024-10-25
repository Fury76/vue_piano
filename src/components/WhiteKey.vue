<template>
    <PianoKey 
    v-bind="$props" 
    :data-key="$attrs['data-key']" 
    @keyPress="$emit('keyPress', $event)" 
    @keyRelease="$emit('keyRelease', $event)" 
    @mouseEnter="$emit('mouseEnter', $event)" 
    @mouseLeave="$emit('mouseLeave', $event)">
      <rect
        width="23"
        height="120"
        rx="3"
        ry="3"
        fill="url(#whiteKeyGradient)"
        stroke="#000"
        stroke-width="1"
        :class="{ 'key-pressed': isPressed }"
      />
      <text x="11.5" y="115" text-anchor="middle" font-size="10" fill="#888" class="unselectable">{{ note }}</text>
    </PianoKey>
  </template>
  
  <script setup lang="ts">
  import { defineProps } from 'vue'
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
    fill: url(#whiteKeyPressedGradient);
  }
  .unselectable {
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  }
  </style>