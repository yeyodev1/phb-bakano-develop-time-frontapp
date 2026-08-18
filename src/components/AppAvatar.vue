<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ name?: string; size?: number }>()

const initials = computed(() =>
  (props.name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join(''),
)
</script>

<template>
  <span
    class="avatar"
    :style="{
      width: `${size || 32}px`,
      height: `${size || 32}px`,
      fontSize: `${(size || 32) * 0.36}px`,
    }"
    :title="name"
  >
    {{ initials }}
  </span>
</template>

<style scoped lang="scss">
.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border-radius: 50%;
  background-color: $surface-3;
  border: 1px solid $border-medium;
  color: $text-1;
  font-weight: 600;
  letter-spacing: -0.02em;
}
</style>
