<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useTimeLogsStore } from '@/stores/timeLogs'
import { useUserStore } from '@/stores/user'
import { userService } from '@/services/user.service'
import TimeLogItem from '@/components/TimeLogItem.vue'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'
import AppModal from '@/components/AppModal.vue'
import TimeLogForm from '@/components/TimeLogForm.vue'
import StatCard from '@/components/StatCard.vue'
import { formatHours, toInputDate } from '@/composables/useFormat'
import type { User } from '@/types'

const timeLogs = useTimeLogsStore()
const userStore = useUserStore()

const team = ref<User[]>([])
const showForm = ref(false)

const now = new Date()
const filters = ref({
  from: toInputDate(new Date(now.getFullYear(), now.getMonth(), 1)),
  to: toInputDate(now),
  user: '',
  mine: '',
})

const grouped = computed(() => {
  const map = new Map<string, typeof timeLogs.items>()
  timeLogs.items.forEach((log) => {
    const key = log.date.slice(0, 10)
    map.set(key, [...(map.get(key) || []), log])
  })
  return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1))
})

async function load() {
  await timeLogs.fetchAll({ ...filters.value })
}

onMounted(async () => {
  team.value = (await userService.list()).filter((user) => user.role !== 'client')
  await load()
})

async function onSaved() {
  showForm.value = false
  await load()
}

async function removeLog(id: string) {
  await timeLogs.remove(id)
}

function dayLabel(day: string) {
  return new Date(`${day}T12:00:00`).toLocaleDateString('es-MX', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })
}
</script>

<template>
  <section class="time">
    <header class="time__head">
      <div class="time__titles">
        <h1 class="time__title">Horas y acciones</h1>
        <p class="time__subtitle">Registro detallado del trabajo ejecutado</p>
      </div>
      <button v-if="userStore.canLogHours" class="time__new" type="button" @click="showForm = true">
        <i class="fa-solid fa-plus" /> Registrar
      </button>
    </header>

    <div class="time__stats">
      <StatCard
        label="Total del periodo"
        :value="formatHours(timeLogs.totalHours)"
        :hint="`${timeLogs.items.length} registros`"
        icon="fa-stopwatch"
      />
      <StatCard
        label="Días con actividad"
        :value="grouped.length"
        hint="Jornadas documentadas"
        icon="fa-calendar-check"
      />
    </div>

    <form class="time__filters" @submit.prevent="load">
      <div class="time__filters-row">
        <label class="time__field">
          <span>Desde</span>
          <input v-model="filters.from" type="date" />
        </label>
        <label class="time__field">
          <span>Hasta</span>
          <input v-model="filters.to" type="date" />
        </label>
      </div>

      <label class="time__field">
        <span>Persona</span>
        <select v-model="filters.user">
          <option value="">Todo el equipo</option>
          <option v-for="member in team" :key="member.id" :value="member.id">{{ member.name }}</option>
        </select>
      </label>

      <button class="time__apply" type="submit"><i class="fa-solid fa-filter" /> Aplicar filtros</button>
    </form>

    <LoadingState v-if="timeLogs.loading" />

    <div v-else-if="grouped.length" class="time__groups">
      <section v-for="[day, logs] in grouped" :key="day" class="time__group">
        <header class="time__group-head">
          <h2 class="time__group-title">{{ dayLabel(day) }}</h2>
          <span class="time__group-hours">
            {{ formatHours(logs.reduce((acc, log) => acc + log.hours, 0)) }}
          </span>
        </header>

        <TimeLogItem
          v-for="log in logs"
          :key="log._id"
          :log="log"
          show-request
          :can-delete="userStore.isAdmin || log.user?._id === userStore.user?.id"
          @delete="removeLog"
        />
      </section>
    </div>

    <EmptyState
      v-else
      title="Sin registros"
      message="No hay horas registradas en el rango seleccionado."
      icon="fa-stopwatch"
    />

    <AppModal v-if="showForm" title="Registrar horas" icon="fa-stopwatch" @close="showForm = false">
      <TimeLogForm @saved="onSaved" @cancel="showForm = false" />
    </AppModal>
  </section>
</template>

<style scoped lang="scss">
.time {
  @include stack($space-xl);

  &__head {
    @include row($space-md);
    justify-content: space-between;
    align-items: flex-start;
  }

  &__titles {
    @include stack($space-xs);
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

  &__stats {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: $space-md;
  }

  &__filters {
    @include stack($space-md);
    background-color: $surface-1;
    border: 1px solid $border;
    border-radius: $radius-md;
    padding: $space-lg;
  }

  &__filters-row {
    display: flex;
    flex-direction: row;
    gap: $space-md;

    > * {
      flex: 1 1 0;
      min-width: 0;
    }
  }

  &__field {
    @include stack($space-xs);

    > span {
      @include field-label;
    }
  }

  &__apply {
    @include btn-ghost;
  }

  &__groups {
    @include stack($space-xl);
  }

  &__group {
    @include stack($space-sm);
  }

  &__group-head {
    @include row($space-sm);
    justify-content: space-between;
    border-bottom: 1px solid $border;
    padding-bottom: $space-sm;
  }

  &__group-title {
    @include eyebrow;
    font-size: 0.72rem;
    color: $text-2;
  }

  &__group-hours {
    font-size: 0.82rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
}
</style>
