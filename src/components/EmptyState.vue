<script setup lang="ts">
defineProps<{ title: string; message?: string; icon?: string }>()
</script>

<template>
  <div class="empty">
    <span class="empty__icon"><i class="fa-solid" :class="icon || 'fa-inbox'" /></span>
    <p class="empty__title">{{ title }}</p>
    <p v-if="message" class="empty__message">{{ message }}</p>
    <slot />
  </div>
</template>

<style scoped lang="scss">
.empty {
  @include stack($space-md);
  align-items: center;
  text-align: center;
  padding: $space-2xl $space-lg;
  border: 1px dashed $border-medium;
  border-radius: $radius-lg;

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background-color: $surface-2;
    color: $text-3;
    font-size: 1rem;
  }

  &__title {
    font-size: 0.92rem;
    font-weight: 600;
  }

  &__message {
    font-size: 0.82rem;
    color: $text-3;
    max-width: 38ch;
    line-height: 1.55;
  }
}
</style>
