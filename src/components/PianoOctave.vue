<template>
  <g :transform="`translate(${octaveIndex * 168 - 120}, 0)`">
    <WhiteKey
      v-for="(note, index) in whiteNotes"
      :key="`white-${note}`"
      :keyIndex="octaveIndex * 12 + index"
      :octave="octaveIndex + startOctave"
      :note="note"
      :x="index * 24"
      :isPressed="
        pressedKeys.has(
          JSON.stringify({
            keyIndex: octaveIndex * 12 + index,
            octave: octaveIndex + startOctave,
            note,
          }),
        )
      "
      :data-key="
        JSON.stringify({
          keyIndex: octaveIndex * 12 + index,
          octave: octaveIndex + startOctave,
          note,
        })
      "
    />
    <BlackKey
      v-for="(note, index) in blackNotes"
      :key="`black-${note}`"
      :keyIndex="
        octaveIndex * 12 + whiteNotes.indexOf(note.replace('#', '')) + 1
      "
      :octave="octaveIndex + startOctave"
      :note="note"
      :x="blackKeyPositions[index]"
      :isPressed="
        pressedKeys.has(
          JSON.stringify({
            keyIndex:
              octaveIndex * 12 + whiteNotes.indexOf(note.replace('#', '')) + 1,
            octave: octaveIndex + startOctave,
            note,
          }),
        )
      "
      :data-key="
        JSON.stringify({
          keyIndex:
            octaveIndex * 12 + whiteNotes.indexOf(note.replace('#', '')) + 1,
          octave: octaveIndex + startOctave,
          note,
        })
      "
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
  pressedKeys: Map<string, boolean>
}>()

const whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const blackNotes = ['C#', 'D#', 'F#', 'G#', 'A#']
const blackKeyPositions = [18, 42, 90, 114, 138]
</script>
