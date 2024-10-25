<template>
    <g
      :transform="`translate(${x}, 0)`"
      @mousedown="emitKeyPress"
      @mouseup="emitKeyRelease"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <slot></slot>
    </g>
  </template>
  
  <script setup lang="ts">
  import { defineProps, defineEmits, ref } from 'vue'
  
  const props = defineProps<{
    keyIndex: number
    octave: number
    note: string
    x: number
  }>()
  
const isMouseDown = ref(false); // 用于跟踪鼠标是否按下


const emit = defineEmits<{
  (e: 'keyPress', data: { data: { keyIndex: number; octave: number; note: string }; originalEvent: MouseEvent }): void;
  (e: 'keyRelease', data: { data: { keyIndex: number; octave: number; note: string }; originalEvent: MouseEvent }): void;
  (e: 'mouseEnter', data: { data: { keyIndex: number; octave: number; note: string }; originalEvent: MouseEvent }): void;
  (e: 'mouseLeave', data: { data: { keyIndex: number; octave: number; note: string }; originalEvent: MouseEvent }): void;
}>();

  
const emitKeyPress = (event: MouseEvent) => {
  isMouseDown.value = true;
  emit('keyPress', { data: { keyIndex: props.keyIndex, octave: props.octave, note: props.note }, originalEvent: event });
};

const emitKeyRelease = (event: MouseEvent) => {
  isMouseDown.value = false;
  emit('keyRelease', { data: { keyIndex: props.keyIndex, octave: props.octave, note: props.note }, originalEvent: event });
};

const handleMouseEnter = (event: MouseEvent) => {
  if (isMouseDown.value) {
    emit('mouseEnter', { data: { keyIndex: props.keyIndex, octave: props.octave, note: props.note }, originalEvent: event });
  }
};

const handleMouseLeave = (event: MouseEvent) => {
  if (isMouseDown.value) {
    emit('mouseLeave', { data: { keyIndex: props.keyIndex, octave: props.octave, note: props.note }, originalEvent: event });
  }
};

  </script>