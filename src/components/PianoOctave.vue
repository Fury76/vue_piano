<template>
  <g>
    <!-- 显示最低分区的特殊键 -->
    <g v-if="octaveIndex === visibleOctaves[0] && octaveIndex === 0">
      <WhiteKey
        v-for="(note, index) in ['A', 'B']"
        :key="`lowest-${note}`"
        :note="note"
        :octave="0"
        :x="calculatedKeyX(octaveIndex, index)"
        :width="whiteKeyWidth"
        :height="whiteKeyHeight"
        :borderRadius="whiteKeyBorderRadius"
        :fill="whiteKeyFill"
        :pressedFill="whiteKeyPressedFill"
        :strokeColor="whiteKeyStrokeColor"
        :strokeWidth="whiteKeyStrokeWidth"
        :isPressed="pressedKeys.has(JSON.stringify({ keyIndex: index, octave: 0, note: note+0, scaleNote: note }))"
        :data-key="JSON.stringify({ keyIndex: index, octave: 0, note: note+0, scaleNote: note})"
      />
      <BlackKey
        :key="'lowest-black-A#'"
        :note="'A#'"
        :x="whiteKeyWidth - (whiteKeyWidth / 4)"
        :octave="0"
        :width="blackKeyWidth"
        :height="blackKeyHeight"
        :borderRadius="blackKeyBorderRadius"
        :fill="blackKeyFill"
        :pressedFill="blackKeyPressedFill"
        :strokeColor="blackKeyStrokeColor"
        :strokeWidth="blackKeyStrokeWidth"
        :isPressed="pressedKeys.has(JSON.stringify({ keyIndex: 2, octave: 0, note: 'A#0', scaleNote: 'A#'}))"
        :data-key="JSON.stringify({ keyIndex: 2, octave: 0, note: 'A#0', scaleNote: 'A#'  })"
      />
    </g>
    <!-- 普通八度白键和黑键 -->
    <g v-else-if="octaveIndex !== 8">
      <WhiteKey
        v-for="(note, index) in whiteNotes"
        :key="`white-${note}`"
        :keyIndex="octaveIndex * 12 + index"
        :octave="octaveIndex"
        :note="note"
        :x="calculatedKeyX(octaveIndex, index)"
        :width="whiteKeyWidth"
        :height="whiteKeyHeight"
        :borderRadius="whiteKeyBorderRadius"
        :fill="whiteKeyFill"
        :pressedFill="whiteKeyPressedFill"
        :strokeColor="whiteKeyStrokeColor"
        :strokeWidth="whiteKeyStrokeWidth"
        :isPressed="pressedKeys.has(JSON.stringify({ keyIndex: octaveIndex * 12 + index, octave: octaveIndex, note: note+octaveIndex, scaleNote: note }))"
        :data-key="JSON.stringify({ keyIndex: octaveIndex * 12 + index, octave: octaveIndex, note: note+octaveIndex, scaleNote: note  })"
      />
      <BlackKey
        v-for="(note, index) in blackNotes"
        :key="`black-${note}`"
        :keyIndex="octaveIndex * 12 + whiteNotes.indexOf(note.replace('#', '')) + 1"
        :octave="octaveIndex"
        :note="note"
        :x="caculatedBlackX(index)"
        :width="blackKeyWidth"
        :height="blackKeyHeight"
        :borderRadius="blackKeyBorderRadius"
        :fill="blackKeyFill"
        :pressedFill="blackKeyPressedFill"
        :strokeColor="blackKeyStrokeColor"
        :strokeWidth="blackKeyStrokeWidth"
        :isPressed="pressedKeys.has(JSON.stringify({ keyIndex: octaveIndex * 12 + whiteNotes.indexOf(note.replace('#', '')) + 1, octave: octaveIndex, note: note+octaveIndex, scaleNote: note  }))"
        :data-key="JSON.stringify({ keyIndex: octaveIndex * 12 + whiteNotes.indexOf(note.replace('#', '')) + 1, octave: octaveIndex, note: note+octaveIndex, scaleNote: note  })"
      />
    </g>
        <!-- 最后一个特殊键 -->
    <g v-if="octaveIndex === visibleOctaves[visibleOctaves.length - 1] && octaveIndex === 8">
      <WhiteKey
        :key="`highest-C8`"
        note="C"
        :octave="8"
        :x="calculatedKeyX(octaveIndex, 0)"
        :width="whiteKeyWidth"
        :height="whiteKeyHeight"
        :borderRadius="whiteKeyBorderRadius"
        :fill="whiteKeyFill"
        :pressedFill="whiteKeyPressedFill"
        :strokeColor="whiteKeyStrokeColor"
        :strokeWidth="whiteKeyStrokeWidth"
        :isPressed="pressedKeys.has(JSON.stringify({ keyIndex: 88, octave: octaveIndex, note: 'C8', scaleNote: 'C'  }))"
        :data-key="JSON.stringify({ keyIndex: 88, octave: octaveIndex, note: 'C8', scaleNote: 'C'  })"
      />
    </g>
    <!-- 分区显示（如果非边界 octave） -->
    <g v-if="showSections && !isBoundaryOctave">
      <path
        :key="calculatedSection(octaveIndex).name"
        :d="`
          M${calculatedSection(octaveIndex).start + topLeftRadius},${-(whiteKeyHeight * 0.1)}
          h${octaveWidth - topLeftRadius - topRightRadius} 
          a${topRightRadius},${topRightRadius} 0 0 1 ${topRightRadius},${topRightRadius}
          v${whiteKeyHeight * 1.1 - topRightRadius - bottomRightRadius}
          a${bottomRightRadius},${bottomRightRadius} 0 0 1 -${bottomRightRadius},${bottomRightRadius}
          h-${octaveWidth - bottomRightRadius - bottomLeftRadius}
          a${bottomLeftRadius},${bottomLeftRadius} 0 0 1 -${bottomLeftRadius},-${bottomLeftRadius}
          v-${whiteKeyHeight * 1.1 - bottomLeftRadius - topLeftRadius}
          a${topLeftRadius},${topLeftRadius} 0 0 1 ${topLeftRadius},-${topLeftRadius}
          Z
        `"
        fill="none"
        stroke="red"
        stroke-width="1"
        stroke-linejoin="round"
      />
      <text
        :key="`text-${calculatedSection(octaveIndex)}`"
        :x="calculatedSection(octaveIndex).start + octaveWidth / 2"
        :y="-(whiteKeyHeight * 0.1) / 2 / 2"
        text-anchor="middle"
        :font-size="whiteKeyHeight * 0.06"
        fill="red"
      >
        {{ calculatedSection(octaveIndex).name }}
      </text>
    </g>
  </g>
</template>

<script setup lang="ts">
import { defineProps, withDefaults, computed } from 'vue';
import WhiteKey from './WhiteKey.vue';
import BlackKey from './BlackKey.vue';
const bottomRightRadius = 2
const bottomLeftRadius = 2
const topLeftRadius = 8 
const topRightRadius = 8 
const props = withDefaults(defineProps<{
  octaveIndex: number;
  pressedKeys: Map<string, boolean>;
  whiteKeyWidth?: number;
  whiteKeyHeight?: number;
  whiteKeyBorderRadius?: number;
  whiteKeyFill?: string;
  whiteKeyPressedFill?: string;
  whiteKeyStrokeColor?: string;
  whiteKeyStrokeWidth?: number;
  blackKeyWidth?: number;
  blackKeyHeight?: number;
  blackKeyBorderRadius?: number;
  blackKeyFill?: string;
  blackKeyPressedFill?: string;
  blackKeyStrokeColor?: string;
  blackKeyStrokeWidth?: number;
  visibleOctaves: number[]; // 父组件传入的可见八度
  sectionTexts?: string[];
  showSections?: boolean;
}>(), {
  sectionTexts: () => ["大字1组", '大字组', '小字组', '小字1组', '小字2组', '小字3组', '小字4组'],
  showSections: false,
  whiteKeyWidth: 23,
  whiteKeyHeight: 120,
  whiteKeyBorderRadius: 3,
  whiteKeyFill: 'url(#whiteKeyGradient)',
  whiteKeyPressedFill: 'url(#whiteKeyPressedGradient)',
  whiteKeyStrokeColor: '#000',
  whiteKeyStrokeWidth: 1,
  blackKeyWidth: 13,
  blackKeyHeight: 80,
  blackKeyBorderRadius: 2,
  blackKeyFill: 'url(#blackKeyGradient)',
  blackKeyPressedFill: 'url(#blackKeyPressedGradient)',
  blackKeyStrokeColor: '#000',
  blackKeyStrokeWidth: 1,
});


const whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const blackNotes = ['C#', 'D#', 'F#', 'G#', 'A#'];
const blackKeyPositions = computed(() => calculateBlackKeyPositions());
const caculatedBlackX = computed(() => {
  return (noteIndex: number) => {
    return blackKeyPositions.value[noteIndex]
  }  
})
// 默认属性
const whiteKeyWidth = props.whiteKeyWidth || 23;
const octaveWidth = whiteKeyWidth * 7;

// 判断是否为边界分区（最低或最高）
const isBoundaryOctave = computed(() => props.octaveIndex === 0 || props.octaveIndex === 8);

const calculatedSection = computed(() => {
  return (octaveIndex: number) => {
    return {name: props.sectionTexts[octaveIndex-1], start: calculatedOctaveX.value, end: calculatedOctaveX.value + octaveWidth}
  }
})

const calculatedOctaveX = computed(() => {
  let startOffset = 0
    if (props.octaveIndex !== 0) {
      startOffset = props.visibleOctaves[0] === 0 ? 2 * props.whiteKeyWidth : 0;
    }
    // 当前 octave 的起始 x 值
    const skipWidth = skippedOctavesCount.value * octaveWidth
    let x = 0;
    if (props.octaveIndex !== 0) {
      x = startOffset + (props.octaveIndex - 1) * props.whiteKeyWidth * 7 - skipWidth;
    }
    return x
});

const skippedOctavesCount = computed(() => {
  // 计算跳过的分区数量
  let skippedOctavesCount = 0;
  for (let i = props.visibleOctaves[0]; i < props.octaveIndex; i++) {
    if (!props.visibleOctaves.includes(i)) {
      skippedOctavesCount++;
    }
  }
  return skippedOctavesCount
})

const calculatedKeyX = computed(() => {
  return (octaveIndex: number, noteIndex: number) => {
    // 判断是否有前置特殊分区（如前两个白键）
    let startOffset = 0
    if (octaveIndex !== 0) {
      startOffset = props.visibleOctaves[0] === 0 ? 2 * props.whiteKeyWidth : 0;
    }
    
    // 当前 octave 的起始 x 值
    const octaveX = calculatedOctaveX.value

    // 每个白键的 x 值
    return octaveX + noteIndex * props.whiteKeyWidth;
  };
});


// 计算黑键位置
function calculateBlackKeyPositions(): number[] {
  const keyOffsets = [1, 2, 4, 5, 6]; // 黑键相对于白键的默认位置
  const octaveX = calculatedOctaveX.value

  // 返回调整后的黑键位置
  return keyOffsets.map(offset => octaveX + offset * whiteKeyWidth - (whiteKeyWidth / 4));
}


</script>
