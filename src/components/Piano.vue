<template>
  <div ref="pianoElement" 
  class="piano-container" 
  :style="{ overflowX: props.allowScroll ? 'auto' : 'hidden' }"
  @dblclick="onDoubleClick"
  >
    <svg :width="pianoWidth" :height="pianoHeight + headerHeight" :viewBox="`0 0 ${pianoWidth} ${pianoHeight + headerHeight}`">
      <defs>
        <linearGradient id="whiteKeyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color: #f0f0f0; stop-opacity: 20" />
          <stop offset="100%" style="stop-color: #ffffff; stop-opacity: 20" />
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

      <g :transform="`translate(0, ${headerHeight})`">
        <PianoOctave
          v-for="octaveIndex in visibleOctaves"
          :key="`octave-${octaveIndex}`"
          :octaveIndex="octaveIndex"
          :pressedKeys="pressedKeys"
          :whiteKeyHeight="whiteKeyHeight"
          :whiteKeyWidth="whiteKeyWidth"
          :blackKeyWidth="blackKeyWidth"
          :blackKeyHeight="blackKeyHeight"
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
  watch,
} from 'vue'
import PianoOctave from './PianoOctave.vue'

// 用于存储当前按下的音轨
const activeNotes = new Map();

const props = withDefaults(
  defineProps<{
    allowScroll?: boolean,
    displayHeader?: boolean,
    startNote?: string,
    whiteKeyHeight?: number,
    whiteKeyWidth?: number,
    blackKeyWidth?: number,
    blackKeyHeight?: number,
    showSections?: boolean,
    showHighestKey?: boolean,
    showLowestKeys?: boolean,
    visibleOctaves?: number[],
    pianoWidth?: number,
    pianoHeight?: number,
  }>(),
  {
    visibleOctaves: () => [0, 1,2, 3, 4, 5, 6, 7, 8],
    allowScroll: true,
    displayHeader: true,
    whiteKeyWidth: 23,
    startNote: 'A0',
    blackKeyWidth: 13,
    blackKeyHeight: 80,
    showHighestKey: true,
    showLowestKeys: false,
    showSections: false,
    pianoWidth: 52 * 23, 
    pianoHeight: 120,
    whiteKeyHeight: 120,
  },
)

const headerHeight = computed(() => {
    return props.displayHeader ? props.whiteKeyHeight * 0.1 : 0
})
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

// 计算 startNote 的位置
const calculateStartPosition = (note: string): number => {
  const noteOrder = ['C', 'D', 'E', 'F',  'G',  'A',  'B'];
  const octave = parseInt(note.toUpperCase().slice(-1), 10);
  const noteName = note.toUpperCase().slice(0, -1);
  const noteIndex = noteOrder.indexOf(note.toUpperCase().slice(0, -1));
  let skipWhiteKey = 0
  let preSkipWhiteKey = 0
  if (octave === 0) {
    preSkipWhiteKey = noteName === "B" ? 1 : 0
    return preSkipWhiteKey * props.whiteKeyWidth
  } 
  
  skipWhiteKey = (octave - 1) * 7 + noteIndex + 2
  return skipWhiteKey * props.whiteKeyWidth
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

const handleContextMenu = (event: MouseEvent) => {
  event.preventDefault()
  event.stopPropagation()
}

const handleTouchStart = (event: TouchEvent) => {
  event.preventDefault()
  event.stopPropagation()
}

const handleTouchMove = (event: TouchEvent) => {
    event.preventDefault()
    event.stopPropagation()
  if (event.touches.length > 1) {
    event.preventDefault()
    event.stopPropagation()
  }
}

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
    console.log('pointer move', event.pointerId)
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

const handlePointerUp = (event: PointerEvent) => {
  const result = getKeyDataFromEvent(event)
  if (result) {
    emitKeyRelease({ keyData: result, originalEvent: event })
    pressedKeys.value.delete(result.itemKey) // 从 pressedKeys 中移除该按键
  }

  activeKeys.delete(event.pointerId) // 从 activeKeys 中移除该触控点
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

// 监听 startNote 的变化
watch(() => props.startNote, (newStartNote) => {
  if (pianoElement.value) {
    const startPosition = calculateStartPosition(newStartNote || 'C1');
    console.log('startPosition', startPosition)
    pianoElement.value.scrollLeft = startPosition;
  }
});

// 在组件挂载时添加事件监听
onMounted(() => {
  if (pianoElement.value) {
    const startPosition = calculateStartPosition(props.startNote);
    pianoElement.value.scrollLeft = startPosition;
    // 在特定 DOM 元素上监听 pointer 事件
    pianoElement.value.addEventListener('pointerdown', handlePointerDown);
    pianoElement.value.addEventListener('pointermove', handlePointerMove);
    pianoElement.value.addEventListener('pointerup', handlePointerUp);
    pianoElement.value.addEventListener('contextmenu', handleContextMenu);
        // 确保阻止浏览器默认的滚动行为
    pianoElement.value.addEventListener('touchstart', handleTouchStart);
    pianoElement.value.addEventListener('touchmove', handleTouchMove);
  
  }
});

onBeforeUnmount(() => {
  if (pianoElement.value) {
    // 清除事件监听器
    pianoElement.value.removeEventListener('pointerdown', handlePointerDown);
    pianoElement.value.removeEventListener('pointermove', handlePointerMove);
    pianoElement.value.removeEventListener('pointerup', handlePointerUp);
    pianoElement.value.removeEventListener('contextmenu', handleContextMenu);
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
  line-height: 0;
  -webkit-user-select: none; /* 禁用文本选择 */
  user-select: none;
  -webkit-touch-callout: none; /* 禁用长按菜单 */
  scroll-behavior: smooth;
  scrollbar-width: none; /* 适用于 Firefox，隐藏滚动条 */
}
.piano-container::-webkit-scrollbar {
  display: none; /* 隐藏滚动条 (Webkit 浏览器) */
}
</style>
