<template>
  <g :transform="`translate(${x}, 0)`" :data-key="$attrs['data-key']" item-key="piano-key-single-item">
    <path
      :d="`M0,0 
        H${width} 
        V${height - borderRadius} 
        Q${width},${height} ${width - borderRadius},${height} 
        H${borderRadius} 
        Q0,${height} 
        0,${height - borderRadius} 
        Z`"
      :fill="isPressed ? pressedFill : fill"
      :stroke="strokeColor"
      :stroke-width="strokeWidth"
      :key-type="keyType"
      :class="{ 'key-pressed': isPressed }"
    />

    <text v-if="isWhiteKey"
      :x="width / 2"
      :y="height - height * 0.1"
      text-anchor="middle"
      font-size="10"
      fill="#888"
      class="unselectable"
    >{{ note }}</text>
  </g>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue'

const props = defineProps<{
  x: number;
  note: string;
  isPressed: boolean;
  width: number; // 键宽度
  height: number; // 键高度
  borderRadius: number; // 圆角半径
  isWhiteKey: boolean
}>()

const blackFill = 'url(#blackKeyGradient)' // 默认填充
const blackPressedFill = 'url(#blackKeyPressedGradient)' // 按下时的填充
const strokeColor = '#000'; // 默认边框颜色
const strokeWidth = 1 // 默认边框宽度

const whiteFill = 'url(#whiteKeyGradient)' // 默认填充
const whitePressedFill = 'url(#whiteKeyPressedGradient)' // 按下时的填充
const fill = computed(() => props.isWhiteKey ? whiteFill : blackFill)
const pressedFill = computed(() => props.isWhiteKey ? whitePressedFill : blackPressedFill)
const keyType = computed(() => props.isWhiteKey ? 'white' : 'black')

</script>

<style scoped>
.key-pressed {
  /* 如果按下状态的样式还需要进一步定制，可以在这里扩展 */
}
</style>
