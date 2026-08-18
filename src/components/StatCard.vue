<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  hint?: string
  icon?: string
}>()
</script>

<template>
  <article class="stat">
    <header class="stat__head">
      <p class="stat__label">{{ label }}</p>
      <i v-if="icon" class="fa-solid stat__icon" :class="icon" />
    </header>
    <p class="stat__value">{{ value }}</p>
    <p v-if="hint" class="stat__hint">{{ hint }}</p>
  </article>
</template>

<style scoped lang="scss">
.stat {
  @include stack(0.3rem);
  flex: 1 1 150px;
  min-width: 150px;
  background-color: $surface-1;
  border: 1px solid $border;
  border-radius: $radius-lg;
  padding: $space-lg;
  @include surface-hover;

  &__head {
    @include row($space-sm);
    justify-content: space-between;
  }

  &__label {
    @include eyebrow;
  }

  &__icon {
    font-size: 0.75rem;
    color: $text-4;
  }

  &__value {
    font-size: 1.75rem;
    font-weight: 700;
    line-height: 1.05;
    letter-spacing: -0.03em;
    font-variant-numeric: tabular-nums;
  }

  &__hint {
    font-size: 0.75rem;
    color: $text-3;
  }
}
</style>
