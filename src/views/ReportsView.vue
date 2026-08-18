<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { reportService } from '@/services/report.service'
import { useUserStore } from '@/stores/user'
import StatCard from '@/components/StatCard.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import AppAvatar from '@/components/AppAvatar.vue'
import LoadingState from '@/components/LoadingState.vue'
import { STATUS_LABELS, STATUS_ORDER } from '@/config/constants'
import { formatDate, formatHours, toInputDate } from '@/composables/useFormat'
import type { ReportSummary } from '@/types'

const userStore = useUserStore()

const summary = ref<ReportSummary | null>(null)
const loading = ref(true)
const sending = ref(false)
const feedback = ref('')

const now = new Date()
const range = ref({
  from: toInputDate(new Date(now.getFullYear(), now.getMonth() - 2, 1)),
  to: toInputDate(now),
})

const maxUserHours = computed(() =>
  Math.max(1, ...(summary.value?.hours.byUser.map((row) => row.hours) || [1])),
)

const maxRequestHours = computed(() =>
  Math.max(1, ...(summary.value?.hours.byRequest.map((row) => row.hours) || [1])),
)

const maxDayHours = computed(() =>
  Math.max(1, ...(summary.value?.hours.byDay.map((row) => row.hours) || [1])),
)

async function load() {
  loading.value = true
  try {
    summary.value = await reportService.summary(range.value.from, range.value.to)
  } finally {
    loading.value = false
  }
}

async function sendDigest() {
  sending.value = true
  feedback.value = ''
  try {
    const result = await reportService.sendWeeklyDigest()
    feedback.value = `Reporte enviado a: ${result.sentTo.join(', ')}`
  } catch (error) {
    feedback.value = (error as { message?: string }).message || 'No se pudo enviar el reporte'
  } finally {
    sending.value = false
  }
}

function exportCsv() {
  if (!summary.value) return

  const rows = [
    ['Tipo', 'Nombre', 'Detalle', 'Horas'],
    ...summary.value.hours.byUser.map((row) => ['Persona', row.name, row.position || row.role, String(row.hours)]),
    ...summary.value.hours.byRequest.map((row) => ['Solicitud', row.code, row.title, String(row.hours)]),
  ]

  const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `reporte-horas-${range.value.from}-a-${range.value.to}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

onMounted(load)
</script>

<template>
  <section class="reports">
    <header class="reports__head">
      <h1 class="reports__title">Reportes</h1>
      <p class="reports__subtitle">Horas, acciones y desempeño del equipo de tecnología</p>
    </header>

    <form class="reports__filters" @submit.prevent="load">
      <div class="reports__filters-row">
        <label class="reports__field">
          <span>Desde</span>
          <input v-model="range.from" type="date" />
        </label>
        <label class="reports__field">
          <span>Hasta</span>
          <input v-model="range.to" type="date" />
        </label>
      </div>
      <button class="reports__apply" type="submit"><i class="fa-solid fa-rotate" /> Actualizar</button>
    </form>

    <LoadingState v-if="loading" />

    <template v-else-if="summary">
      <p class="reports__range">
        Periodo: {{ formatDate(summary.range.from) }} — {{ formatDate(summary.range.to) }}
      </p>

      <div class="reports__stats">
        <StatCard
          label="Horas del periodo"
          :value="formatHours(summary.hours.total)"
          :hint="`${summary.hours.entries} acciones`"
          icon="fa-stopwatch"
        />
        <StatCard label="Abiertas" :value="summary.requests.open" icon="fa-folder-open" />
        <StatCard label="Completadas" :value="summary.requests.byStatus.done" icon="fa-check-double" />
        <StatCard
          label="Cierre promedio"
          :value="`${summary.requests.avgResolutionDays} d`"
          hint="De creación a entrega"
          icon="fa-gauge-high"
        />
      </div>

      <section class="reports__block">
        <h2 class="reports__block-title"><i class="fa-solid fa-users" /> Horas por persona</h2>
        <article v-for="row in summary.hours.byUser" :key="row.userId" class="reports__row">
          <AppAvatar :name="row.name" :size="32" />
          <div class="reports__row-body">
            <div class="reports__row-top">
              <p class="reports__row-name">{{ row.name }}</p>
              <p class="reports__row-value">{{ formatHours(row.hours) }}</p>
            </div>
            <div class="reports__bar">
              <div class="reports__bar-fill" :style="{ width: `${(row.hours / maxUserHours) * 100}%`, backgroundColor: row.color }" />
            </div>
            <p class="reports__row-meta">{{ row.position || row.role }} · {{ row.entries }} acciones</p>
          </div>
        </article>
      </section>

      <section class="reports__block">
        <h2 class="reports__block-title"><i class="fa-solid fa-list-check" /> Horas por solicitud</h2>
        <RouterLink
          v-for="row in summary.hours.byRequest"
          :key="row.requestId"
          class="reports__request"
          :to="`/solicitudes/${row.requestId}`"
        >
          <div class="reports__request-top">
            <span class="reports__request-code">{{ row.code }}</span>
            <StatusBadge :status="row.status" small />
          </div>
          <p class="reports__request-title">{{ row.title }}</p>
          <div class="reports__bar">
            <div class="reports__bar-fill" :style="{ width: `${(row.hours / maxRequestHours) * 100}%` }" />
          </div>
          <p class="reports__row-meta">
            {{ formatHours(row.hours) }} registradas · {{ formatHours(row.estimatedHours) }} estimadas
          </p>
        </RouterLink>
      </section>

      <section class="reports__block">
        <h2 class="reports__block-title"><i class="fa-solid fa-chart-column" /> Actividad diaria</h2>
        <div class="reports__chart">
          <div v-for="day in summary.hours.byDay" :key="day.day" class="reports__chart-col" :title="`${day.day}: ${day.hours} h`">
            <span class="reports__chart-bar" :style="{ height: `${(day.hours / maxDayHours) * 100}%` }" />
            <span class="reports__chart-label">{{ day.day.slice(8) }}</span>
          </div>
        </div>
      </section>

      <section class="reports__block">
        <h2 class="reports__block-title"><i class="fa-solid fa-diagram-project" /> Solicitudes por estado</h2>
        <div class="reports__statuses">
          <div v-for="status in STATUS_ORDER" :key="status" class="reports__status">
            <span class="reports__status-count">{{ summary.requests.byStatus[status] }}</span>
            <span class="reports__status-label">{{ STATUS_LABELS[status] }}</span>
          </div>
        </div>
      </section>

      <div class="reports__actions">
        <button class="reports__ghost" type="button" @click="exportCsv">
          <i class="fa-solid fa-file-csv" /> Exportar CSV
        </button>
        <button v-if="userStore.isAdmin" class="reports__primary" type="button" :disabled="sending" @click="sendDigest">
          <i class="fa-solid" :class="sending ? 'fa-spinner fa-spin' : 'fa-envelope'" />
          {{ sending ? 'Enviando…' : 'Enviar por correo' }}
        </button>
      </div>

      <p v-if="feedback" class="reports__feedback">{{ feedback }}</p>
    </template>
  </section>
</template>

<style scoped lang="scss">
.reports {
  @include stack($space-xl);

  &__head {
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

  &__filters {
    @include stack($space-md);
    background-color: $surface-1;
    border: 1px solid $border;
    border-radius: $radius-md;
    padding: $space-lg;

    @include from($bp-sm) {
      flex-direction: row;
      align-items: flex-end;

      > * {
        flex: 1 1 0;
      }
    }
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

  &__range {
    @include eyebrow;
  }

  &__stats {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: $space-md;
  }

  &__block {
    @include stack($space-md);
  }

  &__block-title {
    @include row($space-sm);
    font-size: 0.95rem;
    font-weight: 600;

    > i {
      font-size: 0.78rem;
      color: $text-4;
    }
  }

  &__row {
    @include row($space-md);
    align-items: flex-start;
    background-color: $surface-1;
    border: 1px solid $border;
    border-radius: $radius-md;
    padding: $space-lg;
    @include surface-hover;
  }

  &__row-body {
    @include stack($space-xs);
    flex: 1 1 auto;
    min-width: 0;
  }

  &__row-top {
    @include row($space-sm);
    justify-content: space-between;
  }

  &__row-name {
    font-size: 0.88rem;
    font-weight: 600;
  }

  &__row-value {
    font-size: 0.92rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;
  }

  &__row-meta {
    font-size: 0.72rem;
    color: $text-4;
  }

  &__bar {
    display: flex;
    height: 4px;
    background-color: $surface-3;
    border-radius: $radius-pill;
    overflow: hidden;
  }

  &__bar-fill {
    display: block;
    height: 100%;
    background-color: $text-1;
    border-radius: $radius-pill;
    transition: width 0.35s ease;
  }

  &__request {
    @include stack($space-sm);
    background-color: $surface-1;
    border: 1px solid $border;
    border-radius: $radius-md;
    padding: $space-lg;
    @include surface-hover;
  }

  &__request-top {
    @include row($space-sm);
    justify-content: space-between;
  }

  &__request-code {
    font-family: $font-mono;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: $text-3;
  }

  &__request-title {
    font-size: 0.86rem;
    font-weight: 500;
    color: $text-2;
  }

  &__chart {
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    gap: 4px;
    height: 140px;
    overflow-x: auto;
    padding: $space-lg;
    background-color: $surface-1;
    border: 1px solid $border;
    border-radius: $radius-md;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &__chart-col {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    gap: 6px;
    flex: 1 0 16px;
    height: 100%;
  }

  &__chart-bar {
    display: block;
    width: 100%;
    min-height: 2px;
    background-color: $text-3;
    border-radius: 2px 2px 0 0;
    transition: background-color 0.16s ease;

    &:hover {
      background-color: $text-1;
    }
  }

  &__chart-label {
    font-family: $font-mono;
    font-size: 0.6rem;
    color: $text-4;
  }

  &__statuses {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: $space-sm;
  }

  &__status {
    @include stack(2px);
    align-items: center;
    flex: 1 1 84px;
    padding: $space-lg $space-sm;
    background-color: $surface-1;
    border: 1px solid $border;
    border-radius: $radius-md;
  }

  &__status-count {
    font-size: 1.35rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.03em;
  }

  &__status-label {
    font-size: 0.66rem;
    color: $text-4;
    text-align: center;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: $space-md;

    @include from($bp-sm) {
      flex-direction: row;

      > * {
        flex: 1 1 0;
      }
    }
  }

  &__ghost {
    @include btn-ghost;
  }

  &__primary {
    @include btn-primary;
  }

  &__feedback {
    @include row(0.4rem);
    font-size: 0.8rem;
    color: $tone-sage;
  }
}
</style>
