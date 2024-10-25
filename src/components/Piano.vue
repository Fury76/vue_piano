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
          :isPressed="pressedKeys.has(JSON.stringify({ keyIndex: index, octave: 0, note }))"
          :data-key="JSON.stringify({ keyIndex: index, octave: 0, note })"
        />
        <BlackKey
          :key="'lowest-black-A#'"
          :keyIndex="1"
          :octave="0"
          :note="'A#'"
          :x="18"
          :isPressed="pressedKeys.has(JSON.stringify({ keyIndex: 1, octave: 0, note: 'A#' }))"
          :data-key="JSON.stringify({ keyIndex: 1, octave: 0, note: 'A#' })"
        />
        <!-- 7个八度 -->
        <PianoOctave
          v-for="octave in 7"
          :key="`octave-${octave}`"
          :octaveIndex="octave"
          :startOctave="0"
          :pressedKeys="pressedKeys"
        />
        <!-- 最高音部分的键 -->
        <WhiteKey
          v-for="(note, index) in ['C', 'D', 'E', 'F']"
          :key="`highest-white-${note}`"
          :keyIndex="84 + index"
          :octave="8"
          :note="note"
          :x="1224 + (index) * 24"
          :isPressed="pressedKeys.has(JSON.stringify({ keyIndex: 84 + index, octave: 8, note }))"
          :data-key="JSON.stringify({ keyIndex: 84 + index, octave: 8, note })"
        />
        <BlackKey
          v-for="(note, index) in ['C#', 'D#']"
          :key="`highest-black-${note}`"
          :keyIndex="85 + index"
          :octave="8"
          :note="note"
          :x="1242 + index * 24"
          :isPressed="pressedKeys.has(JSON.stringify({ keyIndex: 85 + index, octave: 8, note }))"
          :data-key="JSON.stringify({ keyIndex: 85 + index, octave: 8, note })"
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
import { defineProps, defineEmits, withDefaults, onBeforeUnmount, onMounted } from 'vue'
import PianoOctave from './PianoOctave.vue'
import WhiteKey from './WhiteKey.vue'
import BlackKey from './BlackKey.vue'

const props = withDefaults(defineProps<{
  showSections?: boolean
}>(), {
  showSections: false
})

const pressedKeys = ref<Map<string, boolean>>(new Map<string, boolean>())

  
defineEmits<{
    (e: 'keyPress', data: { keyIndex: number; octave: number; note: string }, originalEvent: MouseEvent): void
    (e: 'keyRelease', data: { keyIndex: number; octave: number; note: string }, originalEvent: MouseEvent): void
    (e: 'mouseEnter', data: { keyIndex: number; octave: number; note: string }, originalEvent: MouseEvent): void
    (e: 'mouseLeave', data: { keyIndex: number; octave: number; note: string }, originalEvent: MouseEvent): void
}>()


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

// 公共函数：从事件中提取键数据
const getKeyDataFromEvent = (event: MouseEvent) => {
  const target = (event.target as HTMLElement).closest('[item-key="piano-key-single-item"]') as HTMLElement | null;

  if (target) {
    const dataKey = target.getAttribute('data-key');

    if (dataKey) {
      try {
        const keyData = JSON.parse(dataKey);
        keyData.itemKey = dataKey
        return keyData;
      } catch (error) {
        console.error("Failed to parse data-key JSON:", error);
      }
    } else {
      console.warn("data-key attribute not found on the target element.");
    }
  } else {
    console.warn('No element with item-key="piano-key-single-item" found.');
  }

  return null; // 如果未找到或解析失败，返回 null
};

// 处理按键按下的事件
const emitKeyPress = (data: { keyData: { keyIndex: number; octave: number; note: string }; originalEvent: MouseEvent }) => {
  console.log("Key Pressed:", data.keyData);
  console.log("Original Event:", data.originalEvent);
};

const emitKeyRelease = (payload: { keyData: { keyIndex: number; octave: number; note: string }; originalEvent: MouseEvent }) => {
  console.log("Key Released:", payload.keyData);
};

const emitKeyMove = (payload: { keyData: { keyIndex: number; octave: number; note: string }; originalEvent: MouseEvent }) => {
  console.log("Key Moved:", payload.keyData);

};

const activeKeys = new Map<number, { keyIndex: number; octave: number; note: string; itemKey: string}>();

const handlePointerDown = (event: PointerEvent) => {
  event.preventDefault();
  event.stopPropagation();

  const result = getKeyDataFromEvent(event);
  if (result) {
    const key = result.itemKey;
    if (!pressedKeys.value.has(key)) {
      pressedKeys.value.set(key, true); // 记录按键状态
      emitKeyPress({ keyData: result, originalEvent: event }); // 将键数据和事件一起传递
    }
    activeKeys.set(event.pointerId, result); // 将 pointerId 和当前按键 key 绑定
  }
};

const handlePointerMove = (event: PointerEvent) => {
  const result = getKeyDataFromEvent(event);
  const previousKey = activeKeys.get(event.pointerId); // 获取当前触控点上次的按键 key

  if (result) {
    const currentKey = result.itemKey;

    // 检查当前按键与之前按键是否不同
    if (previousKey && previousKey !== currentKey && pressedKeys.value.has(previousKey.itemKey)) {
      emitKeyRelease({ keyData: previousKey, originalEvent: event });
      pressedKeys.value.delete(previousKey.itemKey); // 移除之前按键的状态
    }

    // 如果当前按键未被按下，触发按下事件
    if (!pressedKeys.value.has(currentKey)) {
      pressedKeys.value.set(currentKey, true); // 记录按键状态
      emitKeyPress({ keyData: result, originalEvent: event }); // 将键数据和事件一起传递
    }

    // 更新 activeKeys 中该触控点的按键为当前按键
    activeKeys.set(event.pointerId, currentKey);
  } else if (previousKey) {
    // 如果滑出所有按键区域，则触发上一个按键的松开事件
    emitKeyRelease({ keyData:  previousKey, originalEvent: event });
    pressedKeys.value.delete(previousKey.itemKey); // 移除按键状态
    activeKeys.delete(event.pointerId); // 从 activeKeys 中移除该触控点
  }
};

const handlePointerUp = (event: PointerEvent) => {
  const currentKeyData = activeKeys.get(event.pointerId); // 获取当前触控点的按键信息

  if (currentKeyData && pressedKeys.value.has(currentKeyData.itemKey)) {
    // 触发松开事件并传递按键信息
    emitKeyRelease({ keyData: currentKeyData, originalEvent: event });
    pressedKeys.value.delete(currentKeyData.itemKey); // 从 pressedKeys 中移除该按键
  }

  activeKeys.delete(event.pointerId); // 从 activeKeys 中移除该触控点
};


// 在组件挂载时添加事件监听
onMounted(() => {
  window.addEventListener('pointerdown', handlePointerDown);
  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', handlePointerUp);
});

// 在组件卸载时移除事件监听
onBeforeUnmount(() => {
  window.removeEventListener('pointerdown', handlePointerDown);
  window.removeEventListener('pointermove', handlePointerMove);
  window.removeEventListener('pointerup', handlePointerUp);
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