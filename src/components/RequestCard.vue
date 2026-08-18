<script setup lang="ts">
import { computed } from 'vue'
import StatusBadge from './StatusBadge.vue'
import PriorityBadge from './PriorityBadge.vue'
import AppAvatar from './AppAvatar.vue'
import { CATEGORY_ICONS } from '@/config/constants'
import { formatHours, relativeTime } from '@/composables/useFormat'
import type { DevRequest } from '@/types'

const props = defineProps<{ request: DevRequest }>()

const progress = computed(() => {
  if (!props.request.estimatedHours) return 0
  return Math.min(100, Math.round((props.request.loggedHours / props.request.estimatedHours) * 100))
})

const overBudget = computed(
  () => props.request.estimatedHours > 0 && props.request.loggedHours > props.request.estimatedHours,
)

const categoryIcon = computed(() => CATEGORY_ICONS[props.request.category] || 'fa-tag')
</script>

<template>
  <RouterLink class="card" :to="`/solicitudes/${request._id}`">
    <header class="card__head">
      <span class="card__code">{{ request.code }}</span>
      <StatusBadge :status="request.status" small />
    </header>

    <h3 class="card__title">{{ request.title }}</h3>

    <div class="card__meta">
      <PriorityBadge :priority="request.priority" />
      <span class="card__category">
        <i class="fa-solid" :class="categoryIcon" />
        {{ request.category }}
      </span>
    </div>

    <div class="card__track">
      <div class="card__track-fill" :class="{ over: overBudget }" :style="{ width: `${progress}%` }" />
    </div>

    <footer class="card__foot">
      <span class="card__hours" :class="{ over: overBudget }">
        <i class="fa-solid fa-stopwatch" />
        {{ formatHours(request.loggedHours) }}
        <em v-if="request.estimatedHours">/ {{ formatHours(request.estimatedHours) }}</em>
      </span>

      <div class="card__people">
        <AppAvatar
          v-for="person in request.assignees.slice(0, 3)"
          :key="person._id"
          :name="person.name"
          :size="24"
        />
        <span v-if="request.assignees.length > 3" class="card__more">
          +{{ request.assignees.length - 3 }}
        </span>
      </div>
    </footer>

    <p class="card__time">
      <i class="fa-regular fa-clock" /> {{ relativeTime(request.updatedAt) }}
    </p>
  </RouterLink>
</template>

<style scoped lang="scss">
.card {
  @include card;
  gap: $space-sm;
  @include surface-hover;

  &__head {
    @include row($space-sm);
    justify-content: space-between;
  }

  &__code {
    font-family: $font-mono;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: $text-3;
  }

  &__title {
    font-size: 0.95rem;
    font-weight: 600;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__meta {
    @include row($space-md);
    flex-wrap: wrap;
  }

  &__category {
    @include row(0.35rem);
    font-size: 0.72rem;
    color: $text-3;
    text-transform: capitalize;

    > i {
      font-size: 0.65rem;
    }
  }

  &__track {
    display: flex;
    height: 3px;
    width: 100%;
    background-color: $surface-3;
    border-radius: $radius-pill;
    overflow: hidden;
    margin-top: $space-xs;
  }

  &__track-fill {
    display: block;
    height: 100%;
    background-color: $text-1;
    border-radius: $radius-pill;
    transition: width 0.3s ease;

    &.over {
      background-color: $tone-sand;
    }
  }

  &__foot {
    @include row($space-sm);
    justify-content: space-between;
  }

  &__hours {
    @include row(0.4rem);
    font-size: 0.82rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;

    > i {
      font-size: 0.7rem;
      color: $text-4;
    }

    em {
      font-style: normal;
      font-weight: 400;
      color: $text-3;
      font-size: 0.76rem;
    }

    &.over {
      color: $tone-sand;
    }
  }

  &__people {
    @include row(-8px);
  }

  &__more {
    font-size: 0.68rem;
    color: $text-3;
    padding-left: 12px;
  }

  &__time {
    @include row(0.35rem);
    font-size: 0.68rem;
    color: $text-4;
  }
}
</style>
