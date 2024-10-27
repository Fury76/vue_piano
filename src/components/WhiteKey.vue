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
      key-type="white"
      :class="{ 'key-pressed': isPressed }"
    />
    <text
      :x="width / 2"
      :y="height - 5"
      text-anchor="middle"
      font-size="10"
      fill="#888"
      class="unselectable"
    >{{ note }}</text>
  </PianoKey>
</template>

<script setup lang="ts">
import { defineProps, withDefaults } from 'vue';
import PianoKey from './PianoKey.vue';

// 设置 props，增加通用性
const props = withDefaults(defineProps<{
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
  width: 23, // 默认宽度
  height: 120, // 默认高度
  borderRadius: 3, // 默认圆角半径
  fill: 'url(#whiteKeyGradient)', // 默认填充
  pressedFill: 'url(#whiteKeyPressedGradient)', // 按下时的填充
  strokeColor: '#000', // 默认边框颜色
  strokeWidth: 1, // 默认边框宽度
});

</script>

<style scoped>
.key-pressed {
  /* 按下时的样式 */
  fill: url(#whiteKeyPressedGradient);
}
.unselectable {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
</style>
