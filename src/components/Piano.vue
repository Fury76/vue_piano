<template>
  <div class="piano-container">
    <svg width="1416" height="220" viewBox="0 0 1416 220">
        <defs>
          <linearGradient id="whiteKeyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#f0f0f0;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#ffffff;stop-opacity:1" />
          </linearGradient>
          <linearGradient id="whiteKeyPressedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#e0e0e0;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#f0f0f0;stop-opacity:1" />
          </linearGradient>
          <linearGradient id="blackKeyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#000000;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#404040;stop-opacity:1" />
          </linearGradient>
          <linearGradient id="blackKeyPressedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#202020;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#606060;stop-opacity:1" />
          </linearGradient>
        </defs>

        <g transform="translate(8, 30)">
        <!-- 添加最低音部分的键 -->
        <WhiteKey
          v-for="(note, index) in ['A', 'B']"
          :key="`lowest-white-${note}`"
          :keyIndex="index"
          :octave="0"
          :note="note"
          :x="index * 24"
          :isPressed="pressedKeys.includes(`${note}0`)"
          :data-key="JSON.stringify({ keyIndex: index, octave: 0, note })"
          @keyPress="handleKeyPress($event)"
          @keyRelease="handleKeyRelease($event)"
          @mouseEnter="handleMouseEnter($event)"
          @mouseLeave="handleMouseLeave($event)"
        />
        <BlackKey
          :key="'lowest-black-A#'"
          :keyIndex="1"
          :octave="0"
          :note="'A#'"
          :x="18"
          :isPressed="pressedKeys.includes('A#0')"
          :data-key="JSON.stringify({ keyIndex: 1, octave: 0, note: 'A#' })"
          @keyPress="handleKeyPress($event)"
          @keyRelease="handleKeyRelease($event)"
          @mouseEnter="handleMouseEnter($event)"
          @mouseLeave="handleMouseLeave($event)"
        />
        <!-- 7个八度 -->
        <PianoOctave
          v-for="octave in 7"
          :key="`octave-${octave}`"
          :octaveIndex="octave"
          :startOctave="0"
          :pressedKeys="pressedKeys"
          @keyPress="handleKeyPress($event)"
          @keyRelease="handleKeyRelease($event)"
          @mouseEnter="handleMouseEnter($event)"
          @mouseLeave="handleMouseLeave($event)"
        />
        <!-- 最高音部分的键 -->
        <WhiteKey
          v-for="(note, index) in ['C', 'D', 'E', 'F']"
          :key="`highest-white-${note}`"
          :keyIndex="84 + index"
          :octave="8"
          :note="note"
          :x="1224 + (index) * 24"
          :isPressed="pressedKeys.includes(`${note}8`)"
          :data-key="JSON.stringify({ keyIndex: 84 + index, octave: 8, note })"
          @keyPress="handleKeyPress($event)"
          @keyRelease="handleKeyRelease($event)"
          @mouseEnter="handleMouseEnter($event)"
          @mouseLeave="handleMouseLeave($event)"
        />
        <BlackKey
          v-for="(note, index) in ['C#', 'D#']"
          :key="`highest-black-${note}`"
          :keyIndex="85 + index"
          :octave="8"
          :note="note"
          :x="1242 + index * 24"
          :isPressed="pressedKeys.includes(`${note}8`)"
          :data-key="JSON.stringify({ keyIndex: 85 + index, octave: 8, note })"
          @keyPress="handleKeyPress($event)"
          @keyRelease="handleKeyRelease($event)"
          @mouseEnter="handleMouseEnter($event)"
          @mouseLeave="handleMouseLeave($event)"
        />
        </g>
        <g v-if="showSections" transform="translate(8, 10)">
          <rect
            v-for="(section, index) in sections"
            :key="section.name"
            :x="section.start * 24"
            y="0"
            :width="(section.end - section.start + 1) * 24"
            height="140"
            fill="none"
            stroke="red"
            stroke-width="1"
          />
          <text
            v-for="(section, index) in sections"
            :key="`text-${section.name}`"
            :x="section.start * 24 + ((section.end - section.start + 1) * 24) / 2"
            y="15"
            text-anchor="middle"
            font-size="12"
            fill="red"
          >
            {{ section.name }}
          </text>
        </g>
      </svg>
    </div>
  </template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { defineProps, defineEmits, withDefaults } from 'vue'
import PianoOctave from './PianoOctave.vue'
import WhiteKey from './WhiteKey.vue'
import BlackKey from './BlackKey.vue'

const props = withDefaults(defineProps<{
  showSections?: boolean
}>(), {
  showSections: false
})

const pressedKeys = ref<string[]>([])
const isMouseDown = ref(false)
const lastPressedKey = ref<string | null>(null)
const emit = defineEmits(['keyEvent'])

const sections = [
  { name: '大字1组', start: 0, end: 11 },
  { name: '大字组', start: 12, end: 23 },
  { name: '小字组', start: 24, end: 35 },
  { name: '小字1组', start: 36, end: 47 },
  { name: '小字2组', start: 48, end: 59 },
  { name: '小字3组', start: 60, end: 71 },
  { name: '小字4组', start: 72, end: 87 }
]

const getSectionForKey = (keyIndex: number) => {
  return sections.find(section => keyIndex >= section.start && keyIndex <= section.end)
}

const handleKeyPress = (eventData: any) => {
  console.log("Custom data:", eventData);
};

const handleKeyRelease = (eventData: { keyIndex: number; octave: number; note: string }) => {
    console.log("key handleKeyRelease: ", eventData)
}

const handleMouseEnter = (eventData: { keyIndex: number; octave: number; note: string }) => {
    console.log("key handleMouseEnter: ", eventData.data.note)
}

const handleMouseLeave = (eventData: { keyIndex: number; octave: number; note: string }) => {
    console.log("key handleMouseLeave: ", eventData)
}

const handleMouseDown = (event: MouseEvent) => {
  event.preventDefault() // 防止文本选择
  isMouseDown.value = true
  handleMouseMove(event)
}

const handleMouseMove = (event: MouseEvent) => {
  event.preventDefault() // 防止文本选择
  if (!isMouseDown.value) return

  const target = event.target as Element
  const keyElement = target.closest('[data-key]')
  if (keyElement) {
    const keyData = JSON.parse(keyElement.getAttribute('data-key') || '{}')
    const key = `${keyData.note}${keyData.octave}`

    if (key !== lastPressedKey.value) {
      if (lastPressedKey.value) {
        removePressedKey(JSON.parse(document.querySelector(`[data-key*="${lastPressedKey.value}"]`)?.getAttribute('data-key') || '{}'))
      }
      addPressedKey(keyData)
      lastPressedKey.value = key
    }
  } else if (lastPressedKey.value) {
    removePressedKey(JSON.parse(document.querySelector(`[data-key*="${lastPressedKey.value}"]`)?.getAttribute('data-key') || '{}'))
    lastPressedKey.value = null
  }
}

const handleMouseUp = (event: MouseEvent) => {
  event.preventDefault() // 防止文本选择
  isMouseDown.value = false
  if (lastPressedKey.value) {
    console.log(lastPressedKey.value, document.querySelector(`[data-key*="${lastPressedKey.value}"]`),  JSON.parse(document.querySelector(`[data-key*="${lastPressedKey.value}"]`)?.getAttribute('data-key') || '{}'))
    removePressedKey(JSON.parse(document.querySelector(`[data-key*="${lastPressedKey.value}"]`)?.getAttribute('data-key') || '{}'))
    lastPressedKey.value = null
  }
}

const addPressedKey = (data: { keyIndex: number; octave: number; note: string }) => {
  const key = `${data.note}${data.octave}`
  if (!pressedKeys.value.includes(key)) {
    pressedKeys.value.push(key)
    const section = getSectionForKey(data.keyIndex)
    emit('keyEvent', { ...data, action: 'press', section: section ? section.name : null })
  }
}

const removePressedKey = (data: { keyIndex: number; octave: number; note: string }) => {
  const key = `${data.note}${data.octave}`
  console.log("key: ", key)
  pressedKeys.value = pressedKeys.value.filter(k => k !== key)
  const section = getSectionForKey(data.keyIndex)
  emit('keyEvent', { ...data, action: 'release', section: section ? section.name : null })
}
</script>

<style scoped>
.piano-container {
  width: 100%;
  overflow-x: auto;
  background: linear-gradient(to bottom, #4a4a4a, #2a2a2a);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  user-select: none; /* 防止文本选择 */
}
</style>