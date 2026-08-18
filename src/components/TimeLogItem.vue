<script setup lang="ts">
import AppAvatar from './AppAvatar.vue'
import { formatDate, formatHours } from '@/composables/useFormat'
import type { TimeLog } from '@/types'

defineProps<{ log: TimeLog; showRequest?: boolean; canDelete?: boolean }>()
defineEmits<{ (event: 'delete', id: string): void }>()
</script>

<template>
  <article class="log">
    <header class="log__head">
      <AppAvatar :name="log.user?.name" :size="28" />
      <div class="log__who">
        <p class="log__name">{{ log.user?.name }}</p>
        <p class="log__date">
          <i class="fa-regular fa-calendar" /> {{ formatDate(log.date) }}
        </p>
      </div>
      <span class="log__hours">{{ formatHours(log.hours) }}</span>
    </header>

    <p v-if="log.phase" class="log__phase">{{ log.phase }}</p>
    <p class="log__action">{{ log.action }}</p>

    <RouterLink v-if="showRequest && log.request" class="log__request" :to="`/solicitudes/${log.request._id}`">
      <i class="fa-solid fa-arrow-turn-up" />
      <b>{{ log.request.code }}</b> {{ log.request.title }}
    </RouterLink>

    <footer v-if="log.tools?.length || canDelete" class="log__foot">
      <div class="log__tools">
        <span v-for="tool in log.tools" :key="tool" class="log__tool">{{ tool }}</span>
      </div>

      <button v-if="canDelete" class="log__delete" type="button" title="Eliminar registro" @click="$emit('delete', log._id)">
        <i class="fa-regular fa-trash-can" />
      </button>
    </footer>
  </article>
</template>

<style scoped lang="scss">
.log {
  @include stack($space-sm);
  background-color: $surface-1;
  border: 1px solid $border;
  border-radius: $radius-md;
  padding: $space-lg;
  @include surface-hover;

  &__head {
    @include row($space-sm);
  }

  &__who {
    @include stack(1px);
    flex: 1 1 auto;
    min-width: 0;
  }

  &__name {
    font-size: 0.82rem;
    font-weight: 600;
  }

  &__date {
    @include row(0.3rem);
    font-size: 0.68rem;
    color: $text-4;
  }

  &__hours {
    font-size: 0.95rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;
  }

  &__phase {
    @include eyebrow;
    color: $text-2;
  }

  &__action {
    font-size: 0.85rem;
    line-height: 1.55;
    color: $text-2;
  }

  &__request {
    @include row(0.35rem);
    font-size: 0.72rem;
    color: $text-3;

    > i {
      font-size: 0.6rem;
      transform: rotate(90deg);
    }

    > b {
      font-family: $font-mono;
      color: $text-2;
    }

    &:hover {
      color: $text-1;
    }
  }

  &__foot {
    @include row($space-sm);
    justify-content: space-between;
    align-items: flex-end;
  }

  &__tools {
    @include row($space-xs);
    flex-wrap: wrap;
  }

  &__tool {
    font-size: 0.64rem;
    font-weight: 500;
    padding: 0.18rem 0.45rem;
    border-radius: $radius-sm;
    background-color: $surface-3;
    border: 1px solid $border;
    color: $text-3;
  }

  &__delete {
    flex: 0 0 auto;
    font-size: 0.72rem;
    color: $text-4;
    padding: 0.25rem;

    &:hover {
      color: $tone-clay;
    }
  }
}
</style>
