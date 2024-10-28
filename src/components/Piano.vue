<template>
  <div ref="pianoElement" 
  class="piano-container" 
  @dblclick="onDoubleClick"
  @contextmenu="onRightClick"
  @mousedown="onMouseDown"
  @mouseup="onMouseUp"
  @touchstart="onTouchStart"
  @touchmove="onTouchMove"
  @touchend="onTouchEnd"
  >
    <svg :width="1196" :height="120" viewBox="0 0 {{ pianoWidth }} {{ pianoHeight }}">
      <defs>
        <linearGradient id="whiteKeyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color: #f0f0f0; stop-opacity: 1" />
          <stop offset="100%" style="stop-color: #ffffff; stop-opacity: 1" />
        </linearGradient>
        <linearGradient id="whiteKeyPressedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color: #e0e0e0; stop-opacity: 1" />
          <stop offset="100%" style="stop-color: #f0f0f0; stop-opacity: 1" />
        </linearGradient>
        <linearGradient id="blackKeyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color: #000000; stop-opacity: 1" />
          <stop offset="100%" style="stop-color: #404040; stop-opacity: 1" />
        </linearGradient>
        <linearGradient id="blackKeyPressedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color: #202020; stop-opacity: 1" />
          <stop offset="100%" style="stop-color: #606060; stop-opacity: 1" />
        </linearGradient>
      </defs>

      <g :transform="`translate(0, ${whiteKeyHeight * 0})`">
        <PianoOctave
          v-for="octaveIndex in visibleOctaves"
          :key="`octave-${octaveIndex}`"
          :octaveIndex="octaveIndex"
          :pressedKeys="pressedKeys"
          :showSections="showSections"
          :visibleOctaves="visibleOctaves"
        />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import * as Tone from 'tone';
import {
  defineProps,
  defineEmits,
  withDefaults,
  onBeforeUnmount,
  onMounted,
} from 'vue'
import PianoOctave from './PianoOctave.vue'

// 用于存储当前按下的音轨
const activeNotes = new Map();

const props = withDefaults(
  defineProps<{
    whiteKeyHeight?: number,
    showSections?: boolean,
    showHighestKey?: boolean,
    showLowestKeys?: boolean,
    visibleOctaves?: number[],
    pianoWidth?: number,
    pianoHeight?: number,
  }>(),
  {
    visibleOctaves: () => [0, 1,2, 3, 4, 5, 6, 7, 8],
    showHighestKey: true,
    showLowestKeys: false,
    showSections: false,
    pianoWidth: 1416,
    pianoHeight: 220,
    whiteKeyHeight: 120,
  },
)

const pianoElement = ref<HTMLElement | null>(null); // 引用目标 DOM 元素
const pressedKeys = ref<Map<string, boolean>>(new Map<string, boolean>())

defineEmits<{
  (
    e: 'keyPress',
    data: { keyIndex: number; octave: number; note: string, itemKey: string },
    originalEvent: MouseEvent,
  ): void
  (
    e: 'keyRelease',
    data: { keyIndex: number; octave: number; note: string, itemKey: string },
    originalEvent: MouseEvent,
  ): void
  (
    e: 'mouseEnter',
    data: { keyIndex: number; octave: number; note: string, itemKey: string },
    originalEvent: MouseEvent,
  ): void
  (
    e: 'mouseLeave',
    data: { keyIndex: number; octave: number; note: string, itemKey: string },
    originalEvent: MouseEvent,
  ): void
}>()

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

const onRightClick = (event: MouseEvent) => {
  event.preventDefault()
  event.stopPropagation()
}

const longPressTimer = ref<number | null>(null)

const onMouseDown = () => {
  // 如果按下超过一定时间（如 500ms），则判断为长按
  longPressTimer.value = window.setTimeout(() => {
    // 阻止长按触发的操作
    console.log('Long press detected')
  }, 500)
}

const onMouseUp = () => {
  // 释放时清除长按计时器
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
}

const onTouchStart = (event: TouchEvent) => {
  // 仅在长按时阻止默认行为
  longPressTimer.value = window.setTimeout(() => {
    event.preventDefault(); // 阻止长按的默认行为
    console.log('Long press detected on touch')
  }, 300)
}

const onTouchEnd = (event: TouchEvent) => {
  // 触摸结束时清除长按计时器
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
}

const onTouchMove = (event: TouchEvent) => {
  // 在移动时清除长按计时器，允许拖动
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
}

// 处理按键按下的事件
const emitKeyPress = (data: {
  keyData: { keyIndex: number; octave: number; note: string, itemKey: string }
  originalEvent: MouseEvent
}) => {
  console.log(data.keyData.note)
  if (!activeNotes.has(data.keyData.note)) {
    // 创建一个新的合成器并启动音频播放
    const synth = new Tone.Synth().toDestination();
    synth.triggerAttack(data.keyData.note);
    activeNotes.set(data.keyData.note, synth);
  }
  console.log('Key Pressed:', data.keyData)
}

const emitKeyRelease = (data: {
  keyData: { keyIndex: number; octave: number; note: string, itemKey: string }
  originalEvent: MouseEvent
}) => {
  if (activeNotes.has(data.keyData.note)) {
    const synth = activeNotes.get(data.keyData.note);
    synth.triggerRelease();
    activeNotes.delete(data.keyData.note);
  }
  console.log('Key Released:', data.keyData)
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

document.addEventListener('touchstart', () => {
  if (Tone.context.state !== 'running') {
    Tone.context.resume();
  }
}, { once: true });
</script>

<style scoped>
.piano-container {
  /*overflow-x: auto;*/
  border-radius: 10px;
  border: 1px solid #ccc;
  user-select: none; /* 防止文本选择 */
}
</style>
