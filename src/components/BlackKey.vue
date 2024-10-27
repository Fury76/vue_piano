<template>
  <PianoKey v-bind="$props" :data-key="$attrs['data-key']">
    <rect
      :width="width"
      :height="height"
      :rx="borderRadius"
      :ry="borderRadius"
      :fill="isPressed ? pressedFill : fill"
      :stroke="strokeColor"
      :stroke-width="strokeWidth"
      :class="{ 'key-pressed': isPressed }"
    />
  </PianoKey>
</template>

<script setup lang="ts">
import PianoKey from './PianoKey.vue';
import { defineProps, withDefaults } from 'vue';

const props = withDefaults(defineProps<{
  keyIndex: number;
  octave: number;
  note: string;
  x: number;
  isPressed: boolean;
  width?: number; // 键宽度
  height?: number; // 键高度
  borderRadius?: number; // 圆角半径
  fill?: string; // 默认填充颜色
  pressedFill?: string; // 按下时的填充颜色
  strokeColor?: string; // 边框颜色
  strokeWidth?: number; // 边框宽度
}>(), {
  width: 13, // 默认宽度
  height: 80, // 默认高度
  borderRadius: 2, // 默认圆角半径
  fill: 'url(#blackKeyGradient)', // 默认填充
  pressedFill: 'url(#blackKeyPressedGradient)', // 按下时的填充
  strokeColor: '#000', // 默认边框颜色
  strokeWidth: 1, // 默认边框宽度
});

</script>

<style scoped>
.key-pressed {
  /* 如果按下状态的样式还需要进一步定制，可以在这里扩展 */
}
</style>
