<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRequestsStore } from '@/stores/requests'
import RequestCard from '@/components/RequestCard.vue'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'
import AppModal from '@/components/AppModal.vue'
import NewRequestForm from '@/components/NewRequestForm.vue'
import { STATUS_ORDER, STATUS_LABELS } from '@/config/constants'
import type { RequestStatus } from '@/types'

const requests = useRequestsStore()

const search = ref('')
const activeStatus = ref<RequestStatus | 'all'>('all')
const showForm = ref(false)

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()

  return requests.items.filter((item) => {
    const matchStatus = activeStatus.value === 'all' || item.status === activeStatus.value
    const matchTerm =
      !term ||
      item.title.toLowerCase().includes(term) ||
      item.code.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term)

    return matchStatus && matchTerm
  })
})

const counts = computed(() => {
  const map: Record<string, number> = { all: requests.items.length }
  STATUS_ORDER.forEach((status) => {
    map[status] = requests.items.filter((item) => item.status === status).length
  })
  return map
})

onMounted(() => requests.fetchAll())

function onCreated() {
  showForm.value = false
  requests.fetchAll()
}
</script>

<template>
  <section class="requests">
    <header class="requests__head">
      <div class="requests__titles">
        <h1 class="requests__title">Solicitudes</h1>
        <p class="requests__subtitle">{{ requests.items.length }} registradas · {{ requests.openItems.length }} abiertas</p>
      </div>
      <button class="requests__new" type="button" @click="showForm = true">
        <i class="fa-solid fa-plus" /> Nueva
      </button>
    </header>

    <label class="requests__search">
      <i class="fa-solid fa-magnifying-glass" />
      <input v-model="search" type="search" placeholder="Buscar por código, título o categoría" />
    </label>

    <div class="requests__chips">
      <button
        class="requests__chip"
        :class="{ active: activeStatus === 'all' }"
        type="button"
        @click="activeStatus = 'all'"
      >
        Todas ({{ counts.all }})
      </button>
      <button
        v-for="status in STATUS_ORDER"
        :key="status"
        class="requests__chip"
        :class="{ active: activeStatus === status }"
        type="button"
        @click="activeStatus = status"
      >
        {{ STATUS_LABELS[status] }} ({{ counts[status] }})
      </button>
    </div>

    <LoadingState v-if="requests.loading" />

    <div v-else-if="filtered.length" class="requests__list">
      <RequestCard v-for="item in filtered" :key="item._id" :request="item" />
    </div>

    <EmptyState
      v-else
      title="Sin solicitudes"
      message="Crea una solicitud para que el equipo la reciba por correo y comience a registrar horas."
    >
      <button class="requests__new" type="button" @click="showForm = true">
        <i class="fa-solid fa-plus" /> Nueva solicitud
      </button>
    </EmptyState>

    <AppModal v-if="showForm" title="Nueva solicitud" icon="fa-list-check" @close="showForm = false">
      <NewRequestForm @created="onCreated" @cancel="showForm = false" />
    </AppModal>
  </section>
</template>

<style scoped lang="scss">
.requests {
  @include stack($space-lg);

  &__head {
    @include row($space-md);
    justify-content: space-between;
    align-items: flex-start;
  }

  &__titles {
    @include stack(2px);
  }

  &__title {
    font-size: 1.6rem;
    font-weight: 700;
    letter-spacing: -0.03em;
  }

  &__subtitle {
    font-size: 0.78rem;
    color: $text-3;
  }

  &__new {
    @include btn-primary;
    flex: 0 0 auto;
    padding: 0.65rem 1rem;
  }

  &__search {
    @include row($space-sm);
    background-color: $surface-2;
    border: 1px solid $border;
    border-radius: $radius-md;
    padding-left: 0.85rem;
    transition: border-color 0.16s ease;

    &:focus-within {
      border-color: $border-strong;
    }

    > i {
      font-size: 0.78rem;
      color: $text-4;
    }

    > input {
      background: transparent;
      border: none;
      padding-left: 0;

      &:hover,
      &:focus {
        border: none;
        background: transparent;
      }
    }
  }

  &__chips {
    @include scroll-x;
    gap: $space-sm;
    padding-bottom: 2px;
  }

  &__chip {
    @include chip;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: $space-md;

    @include from($bp-md) {
      flex-direction: row;
      flex-wrap: wrap;

      > * {
        flex: 1 1 300px;
      }
    }
  }
}
</style>
