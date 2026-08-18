<script setup lang="ts">
defineProps<{ title: string; icon?: string }>()
defineEmits<{ (event: 'close'): void }>()
</script>

<template>
  <div class="modal" @click.self="$emit('close')">
    <section class="modal__panel">
      <header class="modal__head">
        <h2 class="modal__title">
          <i v-if="icon" class="fa-solid" :class="icon" />
          {{ title }}
        </h2>
        <button class="modal__close" type="button" aria-label="Cerrar" @click="$emit('close')">
          <i class="fa-solid fa-xmark" />
        </button>
      </header>
      <div class="modal__body">
        <slot />
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.modal {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background-color: $overlay;
  backdrop-filter: blur(3px);

  @include from($bp-md) {
    justify-content: center;
    align-items: center;
    padding: $space-lg;
  }

  &__panel {
    display: flex;
    flex-direction: column;
    background-color: $surface-1;
    border: 1px solid $border-medium;
    border-radius: $radius-lg $radius-lg 0 0;
    box-shadow: $shadow-md;
    max-height: 92dvh;
    width: 100%;

    @include from($bp-md) {
      border-radius: $radius-lg;
      max-width: 580px;
      max-height: 88dvh;
    }
  }

  &__head {
    @include row($space-sm);
    justify-content: space-between;
    padding: $space-lg;
    border-bottom: 1px solid $border;
  }

  &__title {
    @include row($space-sm);
    font-size: 0.95rem;
    font-weight: 600;

    > i {
      font-size: 0.8rem;
      color: $text-3;
    }
  }

  &__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: $radius-sm;
    font-size: 0.85rem;
    color: $text-3;

    &:hover {
      background-color: $surface-3;
      color: $text-1;
    }
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: $space-lg;
    padding: $space-lg;
    overflow-y: auto;
  }
}
</style>
