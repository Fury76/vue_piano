<template>
  <div ref="pianoElement" 
  class="piano-container" 
  :style="{ overflowX: props.allowScroll ? 'auto' : 'hidden' }"
  @dblclick="onDoubleClick"
  >
    <svg :width="pianoWidth" :height="whiteKeyHeight + headerHeight" :viewBox="`0 0 ${pianoWidth} ${whiteKeyHeight + headerHeight}`">
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
    showSections?: boolean,
    showHighestKey?: boolean,
    showLowestKeys?: boolean,
    visibleOctaves?: number[],
    displayKeyNums?: number, // 显示多少个音阶
  }>(),
  {
    visibleOctaves: () => [0, 1,2, 3, 4, 5, 6, 7, 8],
    allowScroll: true,
    displayHeader: true,
    whiteKeyHeight: 120,
    startNote: 'A0',
    showHighestKey: true,
    showLowestKeys: false,
    showSections: false,
    displayKeyNums: 88,
  },
)

const pianoWidth = computed(() => {
  return whiteKeyWidth.value * 88
})

const headerHeight = computed(() => {
    return props.displayHeader ? props.whiteKeyHeight * 0.1 : 0
})

const whiteKeyWidth = computed(() => {
  return props.whiteKeyHeight / 5
})

const blackKeyWidth = computed(() => {
  return whiteKeyWidth.value * 0.68
})

const blackKeyHeight = computed(() => {
  return props.whiteKeyHeight * 0.67
})

// let playerPool: Tone.Players | null = null; // 用于存储加载好的音效

const notes = {
"A1": "A1.ogg", 
"A2": "A2.ogg", 
"A3": "A3.ogg", 
"A4": "A4.ogg", 
"A5": "A5.ogg", 
"A6": "A6.ogg", 
"A7": "A7.ogg", 
"A#1": "As1.ogg", 
"A#2": "As2.ogg", 
"A#3": "As3.ogg", 
"A#4": "As4.ogg", 
"A#5": "As5.ogg", 
"A#6": "As6.ogg", 
"A#7": "As7.ogg", 
"B1": "B1.ogg", 
"B2": "B2.ogg", 
"B3": "B3.ogg", 
"B4": "B4.ogg", 
"B5": "B5.ogg", 
"B6": "B6.ogg", 
"B7": "B7.ogg", 
"C1": "C1.ogg", 
"C2": "C2.ogg", 
"C3": "C3.ogg", 
"C4": "C4.ogg", 
"C5": "C5.ogg", 
"C6": "C6.ogg", 
"C7": "C7.ogg", 
"C8": "C8.ogg", 
"C#1": "Cs1.ogg", 
"C#2": "Cs2.ogg", 
"C#3": "Cs3.ogg", 
"C#4": "Cs4.ogg", 
"C#5": "Cs5.ogg", 
"C#6": "Cs6.ogg", 
"C#7": "Cs7.ogg", 
"D1": "D1.ogg", 
"D2": "D2.ogg", 
"D3": "D3.ogg", 
"D4": "D4.ogg", 
"D5": "D5.ogg", 
"D6": "D6.ogg", 
"D7": "D7.ogg", 
"D#1": "Ds1.ogg", 
"D#2": "Ds2.ogg", 
"D#3": "Ds3.ogg", 
"D#4": "Ds4.ogg", 
"D#5": "Ds5.ogg", 
"D#6": "Ds6.ogg", 
"D#7": "Ds7.ogg", 
"E1": "E1.ogg", 
"E2": "E2.ogg", 
"E3": "E3.ogg", 
"E4": "E4.ogg", 
"E5": "E5.ogg", 
"E6": "E6.ogg", 
"E7": "E7.ogg", 
"F1": "F1.ogg", 
"F2": "F2.ogg", 
"F3": "F3.ogg", 
"F4": "F4.ogg", 
"F5": "F5.ogg", 
"F6": "F6.ogg", 
"F7": "F7.ogg", 
"F#1": "Fs1.ogg", 
"F#2": "Fs2.ogg", 
"F#3": "Fs3.ogg", 
"F#4": "Fs4.ogg", 
"F#5": "Fs5.ogg", 
"F#6": "Fs6.ogg", 
"F#7": "Fs7.ogg", 
"G1": "G1.ogg", 
"G2": "G2.ogg", 
"G3": "G3.ogg", 
"G4": "G4.ogg", 
"G5": "G5.ogg", 
"G6": "G6.ogg", 
"G7": "G7.ogg", 
"G#1": "Gs1.ogg", 
"G#2": "Gs2.ogg", 
"G#3": "Gs3.ogg", 
"G#4": "Gs4.ogg", 
"G#5": "Gs5.ogg", 
"G#6": "Gs6.ogg", 
"G#7": "Gs7.ogg"
}

// const urls = {};

// for (const note in notes) {
//   urls[note] = `samples/piano/${note}.ogg`;
// }

// console.log(urls)

import PianoSamples from '@/assets/samples/piano/A1.ogg'
console.log(PianoSamples)
const samplesBaseUrl = PianoSamples.replace("A1.ogg", "")
console.log(samplesBaseUrl)

const sampler = new Tone.Sampler({
  urls: notes,
  baseUrl: samplesBaseUrl,
  release: 1,
  onload: () => {
    console.log('采样器已加载完毕!');
  },
  onerror: (error) => {
    console.error('采样器加载失败:', error);
  }
}).toDestination(); 

// 解锁音频上下文
// document.addEventListener('click', async () => {
//   await Tone.start();
//   console.log('音频上下文已解锁');
// }, { once: true });

const playNote = (note: string) => {
  sampler.triggerAttack(note);
}

const stopNote = (note: string) => {
  sampler.triggerRelease(note);
}

onMounted(() => {
  // 处理按键事件
  const keys = document.querySelectorAll('[item-key="piano-key-single-item"]');

  keys.forEach(key => {
    // 获取 data-key 属性的值（JSON 字符串）
    const dataKey = key.getAttribute('data-key');

    if (!dataKey) return ;
    // 解析 JSON 字符串为对象
    const keyData = JSON.parse(dataKey);

    // 从解析后的对象中获取 note 属性
    const note = keyData.note; 

    // console.log("addEventListener, note: ", note);
    key.addEventListener('mousedown', (event) => {
      event.preventDefault(); // 阻止默认事件
      event.stopPropagation()
      playNote(note);
      pressKey(event)
    });
    key.addEventListener('mouseup', (event) => {
      event.preventDefault(); // 阻止默认事件
      event.stopPropagation()
      stopNote(note);
      releaseKey(event)
    });
    key.addEventListener('mouseleave', (event) => {
      event.preventDefault(); // 阻止默认事件
      event.stopPropagation()
      stopNote(note);
      releaseKey(event)
    });

    key.addEventListener('touchstart', (event) => {
      event.preventDefault(); // 阻止默认事件
      event.stopPropagation()
      playNote(note);
      pressKey(event)
    });
    key.addEventListener('touchend', (event) => {
      event.preventDefault(); // 阻止默认事件
      event.stopPropagation()
      stopNote(note);
      releaseKey(event)
    });
  });
})



const pianoElement = ref<HTMLElement | null>(null); // 引用目标 DOM 元素
const pressedKeys = ref<Map<string, boolean>>(new Map<string, boolean>())

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
    return preSkipWhiteKey * whiteKeyWidth.value
  } 
  
  skipWhiteKey = (octave - 1) * 7 + noteIndex + 2
  return skipWhiteKey * whiteKeyWidth.value
}

// 公共函数：从事件中提取键数据
const getKeyDataFromEvent = (event: Event) => {
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

const emit = defineEmits<{
  (
    e: 'keyPress',
    data: { keyIndex: number; octave: number; note: string, itemKey: string },
    originalEvent: Event,
  ): void
  (
    e: 'keyRelease',
    data: { keyIndex: number; octave: number; note: string, itemKey: string },
    originalEvent: Event,
  ): void
}>()

const pressKey = (event: Event) => {
  const keyData = getKeyDataFromEvent(event)
  pressedKeys.value.set(keyData.itemKey, true) // 记录按键状态
  emit('keyPress', keyData, event) // 将键数据和事件一起传递
}

const releaseKey = (event: Event) => {
  //滑出了按键区域
  const keyData = getKeyDataFromEvent(event)
  pressedKeys.value.delete(keyData.itemKey) // 移除按键状态
  emit('keyRelease', keyData, event)
}

// 监听 startNote 的变化
watch(() => props.startNote, (newStartNote) => {
  if (pianoElement.value) {
    const startPosition = calculateStartPosition(newStartNote || 'C1');
    pianoElement.value.scrollLeft = startPosition;
  } else {
    console.log('pianoElement.value is null');
  }
});

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

</style>
