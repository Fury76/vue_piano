<template>
  <div ref="pianoElement" class="piano-container" @dblclick="onDoubleClick">
    <svg width="1416" height="220" viewBox="0 0 1416 220">
      <defs>
        <linearGradient id="whiteKeyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color: #f0f0f0; stop-opacity: 1" />
          <stop offset="100%" style="stop-color: #ffffff; stop-opacity: 1" />
        </linearGradient>
        <linearGradient
          id="whiteKeyPressedGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" style="stop-color: #e0e0e0; stop-opacity: 1" />
          <stop offset="100%" style="stop-color: #f0f0f0; stop-opacity: 1" />
        </linearGradient>
        <linearGradient
          id="blackKeyGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" style="stop-color: #000000; stop-opacity: 1" />
          <stop offset="100%" style="stop-color: #404040; stop-opacity: 1" />
        </linearGradient>
        <linearGradient
          id="blackKeyPressedGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" style="stop-color: #202020; stop-opacity: 1" />
          <stop offset="100%" style="stop-color: #606060; stop-opacity: 1" />
        </linearGradient>
      </defs>

      <g transform="translate(8, 30)">
        <!-- 7个八度 -->
        <PianoOctave
          v-for="octave in 7"
          :key="`octave-${octave}`"
          :octaveIndex="octave"
          :startOctave="0"
          :show-sections="showSections"
          :pressedKeys="pressedKeys"
        />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  defineProps,
  defineEmits,
  withDefaults,
  onBeforeUnmount,
  onMounted,
} from 'vue'
import PianoOctave from './PianoOctave.vue'
import WhiteKey from './WhiteKey.vue'
import BlackKey from './BlackKey.vue'

const props = withDefaults(
  defineProps<{
    showSections?: boolean
  }>(),
  {
    showSections: false,
  },
)

const pianoElement = ref<HTMLElement | null>(null); // 引用目标 DOM 元素
const pressedKeys = ref<Map<string, boolean>>(new Map<string, boolean>())

defineEmits<{
  (
    e: 'keyPress',
    data: { keyIndex: number; octave: number; note: string },
    originalEvent: MouseEvent,
  ): void
  (
    e: 'keyRelease',
    data: { keyIndex: number; octave: number; note: string },
    originalEvent: MouseEvent,
  ): void
  (
    e: 'mouseEnter',
    data: { keyIndex: number; octave: number; note: string },
    originalEvent: MouseEvent,
  ): void
  (
    e: 'mouseLeave',
    data: { keyIndex: number; octave: number; note: string },
    originalEvent: MouseEvent,
  ): void
}>()

const sections = [
  { name: '大字1组', start: 2, end: 8 },
  { name: '大字组', start: 9, end: 15 },
  { name: '小字组', start: 16, end: 22 },
  { name: '小字1组', start: 23, end: 29 },
  { name: '小字2组', start: 30, end: 36 },
  { name: '小字3组', start: 37, end: 43 },
  { name: '小字4组', start: 44, end: 50 },
]

const getSectionForKey = (keyIndex: number) => {
  return sections.find(
    section => keyIndex >= section.start && keyIndex <= section.end,
  )
}

// 公共函数：从事件中提取键数据
const getKeyDataFromEvent = (event: MouseEvent) => {
  const target = (event.target as HTMLElement).closest(
    '[item-key="piano-key-single-item"]',
  ) as HTMLElement | null

  if (!target) {
    return null
  }

  const dataKey = target.getAttribute('data-key')
  if (dataKey) {
    try {
      const keyData = JSON.parse(dataKey)
      keyData.itemKey = dataKey
      return keyData
    } catch (error) {
      console.error('Failed to parse data-key JSON:', error)
    }
  } else {
    console.warn('data-key attribute not found on the target element.')
  }

  return null // 如果未找到或解析失败，返回 null
}

const onDoubleClick = (event: MouseEvent) => {
  event.preventDefault()
  event.stopPropagation()
  return
}
// 处理按键按下的事件
const emitKeyPress = (data: {
  keyData: { keyIndex: number; octave: number; note: string }
  originalEvent: MouseEvent
}) => {
  console.log('Key Pressed:', data.keyData)
}

const emitKeyRelease = (payload: {
  keyData: { keyIndex: number; octave: number; note: string }
  originalEvent: MouseEvent
}) => {
  console.log('Key Released:', payload.keyData)
}

const activeKeys = new Map<
  number,
  { keyIndex: number; octave: number; note: string; itemKey: string }
>()

const handlePointerDown = (event: PointerEvent) => {
  event.preventDefault()
  event.stopPropagation()

  const result = getKeyDataFromEvent(event)
  if (result) {
    const key = result.itemKey
    if (!pressedKeys.value.has(key)) {
      pressedKeys.value.set(key, true) // 记录按键状态
      emitKeyPress({ keyData: result, originalEvent: event }) // 将键数据和事件一起传递
    }
    activeKeys.set(event.pointerId, result) // 将 pointerId 和当前按键 key 绑定
  }
}

const handlePointerMove = (event: PointerEvent) => {
  if (pressedKeys.value.size === 0) {
    return
  }
  
  const result = getKeyDataFromEvent(event)
  const previousKey = activeKeys.get(event.pointerId) // 获取当前触控点上次的按键 key
  if (!result) { //未在按键区域
    if (previousKey) { //还有上一个按钮
      releaseKey(previousKey, event)
      return
    }
    return
  }
  if (previousKey) { //在按键区域，并且有上一个按键
    const currentKey = result.itemKey
    if (previousKey.itemKey !== currentKey) { //当前的key和上一个不一样
      // console.log("move2: ", previousKey, currentKey)
      if (pressedKeys.value.has(previousKey.itemKey)) {  //并且上一个按键还没松开
        releaseKey(previousKey, event)
      }
      if (!pressedKeys.value.has(currentKey)) { //当前按键未被按下过
        pressKey(result, event)
      }
    }
    // 更新 activeKeys 中该触控点的按键为当前按键
    activeKeys.set(event.pointerId, result)
  } else { //没有上一个
    pressKey(result, event)
  }
}

const pressKey = (keyData: { keyIndex: number; octave: number; note: string; itemKey: string }, event: PointerEvent) => {
  pressedKeys.value.set(keyData.itemKey, true) // 记录按键状态
  emitKeyPress({ keyData: keyData, originalEvent: event }) // 将键数据和事件一起传递
}

const releaseKey = (keyData: { keyIndex: number; octave: number; note: string; itemKey: string }, event: PointerEvent) => {
  //滑出了按键区域
  emitKeyRelease({ keyData: keyData, originalEvent: event })
  pressedKeys.value.delete(keyData.itemKey) // 移除按键状态
  activeKeys.delete(event.pointerId) // 从 activeKeys 中移除该触控点
}

const handlePointerUp = (event: PointerEvent) => {
  const result = getKeyDataFromEvent(event)
  if (result) {
    emitKeyRelease({ keyData: result, originalEvent: event })
    pressedKeys.value.delete(result.itemKey) // 从 pressedKeys 中移除该按键
  }

  activeKeys.delete(event.pointerId) // 从 activeKeys 中移除该触控点
}

// 在组件挂载时添加事件监听
onMounted(() => {
  if (pianoElement.value) {
    // 在特定 DOM 元素上监听 pointer 事件
    pianoElement.value.addEventListener('pointerdown', handlePointerDown);
    pianoElement.value.addEventListener('pointermove', handlePointerMove);
    pianoElement.value.addEventListener('pointerup', handlePointerUp);
  }
});

onBeforeUnmount(() => {
  if (pianoElement.value) {
    // 清除事件监听器
    pianoElement.value.removeEventListener('pointerdown', handlePointerDown);
    pianoElement.value.removeEventListener('pointermove', handlePointerMove);
    pianoElement.value.removeEventListener('pointerup', handlePointerUp);
  }
});
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
