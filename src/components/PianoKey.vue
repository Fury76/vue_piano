<template>
  <g :transform="`translate(${x}, 0)`" item-key="piano-key-single-item">
    <slot></slot>
  </g>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps<{
  octave: number
  note: string
  x: number
}>()
</script>
