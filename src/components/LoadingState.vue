<template>
  <div class="loading">
    <span class="loading__spinner" />
    <p class="loading__text"><slot>Cargando…</slot></p>
  </div>
</template>

<style scoped lang="scss">
.loading {
  @include stack($space-md);
  align-items: center;
  padding: $space-2xl 0;

  &__spinner {
    display: block;
    width: 22px;
    height: 22px;
    border: 2px solid $border-medium;
    border-top-color: $text-1;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  &__text {
    font-size: 0.8rem;
    color: $text-3;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
