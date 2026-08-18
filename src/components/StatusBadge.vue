<script setup lang="ts">
import { computed } from 'vue'
import { STATUS_ICONS, STATUS_LABELS } from '@/config/constants'
import type { RequestStatus } from '@/types'

const props = defineProps<{ status: RequestStatus; small?: boolean }>()

const label = computed(() => STATUS_LABELS[props.status])
const icon = computed(() => STATUS_ICONS[props.status])
</script>

<template>
  <span class="status" :class="[`is-${status}`, { 'is-small': small }]">
    <i class="fa-solid" :class="icon" />
    {{ label }}
  </span>
</template>

<style scoped lang="scss">
.status {
  @include row(0.35rem);
  flex: 0 0 auto;
  padding: 0.26rem 0.6rem;
  border-radius: $radius-pill;
  border: 1px solid currentColor;
  font-size: 0.7rem;
  font-weight: 600;
  white-space: nowrap;

  > i {
    font-size: 0.62rem;
  }

  &.is-small {
    font-size: 0.66rem;
    padding: 0.2rem 0.5rem;
  }

  &.is-pending { color: $status-pending; }
  &.is-approved { color: $status-approved; }
  &.is-in_progress { color: $status-in_progress; background-color: $accent-soft; }
  &.is-blocked { color: $status-blocked; }
  &.is-review { color: $status-review; }
  &.is-done { color: $status-done; }
  &.is-cancelled { color: $status-cancelled; }
}
</style>
