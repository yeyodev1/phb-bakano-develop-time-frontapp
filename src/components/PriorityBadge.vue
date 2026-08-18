<script setup lang="ts">
import { computed } from 'vue'
import { PRIORITY_LABELS } from '@/config/constants'
import type { RequestPriority } from '@/types'

const props = defineProps<{ priority: RequestPriority }>()

const label = computed(() => PRIORITY_LABELS[props.priority])
const bars = computed(() => ({ low: 1, medium: 2, high: 3, urgent: 4 })[props.priority])
</script>

<template>
  <span class="priority" :class="`is-${priority}`" :title="`Prioridad ${label}`">
    <span class="priority__bars">
      <i v-for="index in 4" :key="index" :class="{ on: index <= bars }" />
    </span>
    {{ label }}
  </span>
</template>

<style scoped lang="scss">
.priority {
  @include row(0.4rem);
  flex: 0 0 auto;
  font-size: 0.7rem;
  font-weight: 600;
  color: $text-3;

  &__bars {
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    gap: 2px;
    height: 10px;

    > i {
      display: block;
      width: 3px;
      height: 100%;
      border-radius: 1px;
      background-color: $border-medium;

      &:nth-child(1) { height: 40%; }
      &:nth-child(2) { height: 60%; }
      &:nth-child(3) { height: 80%; }
      &:nth-child(4) { height: 100%; }
    }
  }

  &.is-low { color: $priority-low; .priority__bars > i.on { background-color: $priority-low; } }
  &.is-medium { color: $priority-medium; .priority__bars > i.on { background-color: $priority-medium; } }
  &.is-high { color: $priority-high; .priority__bars > i.on { background-color: $priority-high; } }
  &.is-urgent { color: $priority-urgent; .priority__bars > i.on { background-color: $priority-urgent; } }
}
</style>
