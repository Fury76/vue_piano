<template>
  <!-- 最前面三个特殊键 -->
  <g v-if="showLowestKeys">
    <WhiteKey
      v-for="(note, index) in ['A', 'B']"
      :key="`lowest-${note}`"
      :keyIndex="index"
      :octave="0"
      :note="note"
      :x="index * whiteKeyWidth"
      :width="whiteKeyWidth"
      :height="whiteKeyHeight"
      :borderRadius="whiteKeyBorderRadius"
      :fill="whiteKeyFill"
      :pressedFill="whiteKeyPressedFill"
      :strokeColor="whiteKeyStrokeColor"
      :strokeWidth="whiteKeyStrokeWidth"
      :isPressed="pressedKeys.has(JSON.stringify({ keyIndex: index, octave: 0, note }))"
      :data-key="JSON.stringify({ keyIndex: index, octave: 0, note })"
    />
    <BlackKey
      :key="'lowest-black-A#'"
      :keyIndex="2"
      :octave="0"
      :note="'A#'"
      :x="calculateBlackKeyPositions(whiteKeyWidth)[0]"
      :width="blackKeyWidth"
      :height="blackKeyHeight"
      :borderRadius="blackKeyBorderRadius"
      :fill="blackKeyFill"
      :pressedFill="blackKeyPressedFill"
      :strokeColor="blackKeyStrokeColor"
      :strokeWidth="blackKeyStrokeWidth"
      :isPressed="pressedKeys.has(JSON.stringify({ keyIndex: 2, octave: 0, note: 'A#' }))"
      :data-key="JSON.stringify({ keyIndex: 2, octave: 0, note: 'A#' })"
    />
  </g>

  <!-- 指定八度的白键和黑键 -->
  <g v-for="octave in visibleOctaves" 
  :key="`octave-${octave}`" 
  :transform="`translate(${((octave - 1) * octaveWidth) + (showLowestKeys ? 2 * whiteKeyWidth : 0)}, 0)`">
    <WhiteKey
      v-for="(note, index) in whiteNotes"
      :key="`white-${note}`"
      :keyIndex="octave * 12 + index"
      :octave="octave"
      :note="note"
      :x="index * whiteKeyWidth"
      :width="whiteKeyWidth"
      :height="whiteKeyHeight"
      :borderRadius="whiteKeyBorderRadius"
      :fill="whiteKeyFill"
      :pressedFill="whiteKeyPressedFill"
      :strokeColor="whiteKeyStrokeColor"
      :strokeWidth="whiteKeyStrokeWidth"
      :isPressed="pressedKeys.has(JSON.stringify({ keyIndex: octave * 12 + index, octave, note }))"
      :data-key="JSON.stringify({ keyIndex: octave * 12 + index, octave, note })"
    />
    <BlackKey
      v-for="(note, index) in blackNotes"
      :key="`black-${note}`"
      :keyIndex="octave * 12 + whiteNotes.indexOf(note.replace('#', '')) + 1"
      :octave="octave"
      :note="note"
      :x="blackKeyPositions[index]"
      :width="blackKeyWidth"
      :height="blackKeyHeight"
      :borderRadius="blackKeyBorderRadius"
      :fill="blackKeyFill"
      :pressedFill="blackKeyPressedFill"
      :strokeColor="blackKeyStrokeColor"
      :strokeWidth="blackKeyStrokeWidth"
      :isPressed="pressedKeys.has(JSON.stringify({ keyIndex: octave * 12 + whiteNotes.indexOf(note.replace('#', '')) + 1, octave, note }))"
      :data-key="JSON.stringify({ keyIndex: octave * 12 + whiteNotes.indexOf(note.replace('#', '')) + 1, octave, note })"
    />
  </g>

  <!-- 最后一个特殊键 -->
  <g v-if="showHighestKey" 
  :transform="`translate(${(visibleOctaves.length * octaveWidth) + (showLowestKeys ? (2 * whiteKeyWidth) : 0)}, 0)`">
    <WhiteKey
      :key="`highest-C8`"
      :keyIndex="88"
      :octave="8"
      note="C"
      :x="0"
      :width="whiteKeyWidth"
      :height="whiteKeyHeight"
      :borderRadius="whiteKeyBorderRadius"
      :fill="whiteKeyFill"
      :pressedFill="whiteKeyPressedFill"
      :strokeColor="whiteKeyStrokeColor"
      :strokeWidth="whiteKeyStrokeWidth"
      :isPressed="pressedKeys.has(JSON.stringify({ keyIndex: 88, octave: 8, note: 'C' }))"
      :data-key="JSON.stringify({ keyIndex: 88, octave: 8, note: 'C' })"
    />
  </g>
  <!-- 动态显示分区 -->
  <g v-if="showSections">
    <rect
      v-for="(section, index) in calculatedSections"
      :key="section.name"
      :x="section.start * whiteKeyWidth"
      y="0"
      :width="(section.end - section.start + 1) * whiteKeyWidth"
      height="140"
      fill="none"
      stroke="red"
      stroke-width="1"
    />
    <text
      v-for="(section, index) in calculatedSections"
      :key="`text-${section.name}`"
      :x="section.start * whiteKeyWidth + ((section.end - section.start + 1) * whiteKeyWidth) / 2"
      y="15"
      text-anchor="middle"
      font-size="12"
      fill="red"
    >
      {{ section.name + section.start + "|" + section.end }}
    </text>
  </g>
</template>

<script setup lang="ts">
import { defineProps, withDefaults, computed } from 'vue';
import WhiteKey from './WhiteKey.vue';
import BlackKey from './BlackKey.vue';

const props = withDefaults(defineProps<{
  octaveIndex: number;
  startOctave?: number;
  pressedKeys: Map<string, boolean>;
  visibleOctaves?: number[]; // 指定显示的八度
  showLowestKeys?: boolean; // 是否显示最前面三个键
  showHighestKey?: boolean; // 是否显示最后一个键
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
  sectionNames?: string[]; // 分区名称列表
  showSections?: boolean;
}>(), {
  visibleOctaves: () => [1,2,3, 4, 5,6,7],
  sectionNames: () => ['大字1组', '大字组', '小字组', '小字1组', '小字2组', '小字3组', '小字4组'],
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
  showLowestKeys: true,
  showHighestKey: true,
});

// 动态计算 octaveWidth
const octaveWidth = computed(() => props.whiteKeyWidth * 7);

const whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const blackNotes = ['C#', 'D#', 'F#', 'G#', 'A#'];
const blackKeyPositions = computed(() => calculateBlackKeyPositions(props.whiteKeyWidth));

// 计算黑键相对位置的函数
function calculateBlackKeyPositions(whiteKeyWidth: number): number[] {
  // 定义黑键在每个八度内的相对位置，单位为白键宽度
  const keyOffsets = [1, 2, 4, 5, 6]; // 表示 C#, D#, F#, G#, A# 的相对位置

  // 动态计算黑键的位置，将其定位在两个白键之间的中心
  return keyOffsets.map(offset => offset * whiteKeyWidth - (whiteKeyWidth / 4));
}

// 基于白键计算分区信息
const calculatedSections = computed(() => {
  const firstFullOctaveIndex = props.showLowestKeys ? 2 : 0; // 如果显示最前面三个键，从 C 开始计算
  return props.visibleOctaves.map((octave, octaveIndex) => {
    const octaveStartIndex = firstFullOctaveIndex + octaveIndex * 7; // 每八度 7 个白键
    const octaveEndIndex = octaveStartIndex + 6; // 每八度最后一个白键的位置

    return {
      name: props.sectionNames[octaveIndex] || `Octave ${octave}`,
      start: octaveStartIndex,
      end: octaveEndIndex,
    };
  });
});



</script>
