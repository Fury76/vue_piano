<template>
  <g :transform="`translate(${(octaveIndex * 168) - 120}, 0)`">
    <WhiteKey
      v-for="(note, index) in whiteNotes"
      :key="`white-${note}`"
      :keyIndex="octaveIndex * 12 + index"
      :octave="octaveIndex + startOctave"
      :note="note"
      :x="index * 24"
      :isPressed="pressedKeys.includes(`${note}${octaveIndex + startOctave}`)"
      :data-key="JSON.stringify({ keyIndex: octaveIndex * 12 + index, octave: octaveIndex + startOctave, note })"
      @keyPress="$emit('keyPress', $event)"
      @keyRelease="$emit('keyRelease', $event)"
      @mouseEnter="$emit('mouseEnter', $event)"
      @mouseLeave="$emit('mouseLeave', $event)"
      
    />
    <BlackKey
      v-for="(note, index) in blackNotes"
      :key="`black-${note}`"
      :keyIndex="octaveIndex * 12 + whiteNotes.indexOf(note.replace('#', '')) + 1"
      :octave="octaveIndex + startOctave"
      :note="note"
      :x="blackKeyPositions[index]"
      :isPressed="pressedKeys.includes(`${note}${octaveIndex + startOctave}`)"
      :data-key="JSON.stringify({ keyIndex: octaveIndex * 12 + whiteNotes.indexOf(note.replace('#', '')) + 1, octave: octaveIndex + startOctave, note })"
      @keyPress="$emit('keyPress', $event)"
      @keyRelease="$emit('keyRelease', $event)"
      @mouseEnter="$emit('mouseEnter', $event)"
      @mouseLeave="$emit('mouseLeave', $event)"
    />
  </g>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import WhiteKey from './WhiteKey.vue'
import BlackKey from './BlackKey.vue'

defineProps<{
  octaveIndex: number
  startOctave: number
  pressedKeys: string[]
}>()

defineEmits<{
  (e: 'keyPress', data: { keyIndex: number; octave: number; note: string }, originalEvent: MouseEvent): void
  (e: 'keyRelease', data: { keyIndex: number; octave: number; note: string }, originalEvent: MouseEvent): void
  (e: 'mouseEnter', data: { keyIndex: number; octave: number; note: string }, originalEvent: MouseEvent): void
  (e: 'mouseLeave', data: { keyIndex: number; octave: number; note: string }, originalEvent: MouseEvent): void
}>()

const whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const blackNotes = ['C#', 'D#', 'F#', 'G#', 'A#']
const blackKeyPositions = [18, 42, 90, 114, 138]
</script>