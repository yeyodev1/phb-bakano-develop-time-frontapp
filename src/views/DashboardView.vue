<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRequestsStore } from '@/stores/requests'
import { reportService } from '@/services/report.service'
import StatCard from '@/components/StatCard.vue'
import RequestCard from '@/components/RequestCard.vue'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'
import AppAvatar from '@/components/AppAvatar.vue'
import { formatHours } from '@/composables/useFormat'
import type { ReportSummary } from '@/types'

const userStore = useUserStore()
const requests = useRequestsStore()

const summary = ref<ReportSummary | null>(null)
const loading = ref(true)

const highlight = computed(() => requests.openItems.slice(0, 4))

const maxUserHours = computed(() =>
  Math.max(1, ...(summary.value?.hours.byUser.map((row) => row.hours) || [1])),
)

const totalTeamHours = computed(() =>
  (summary.value?.hours.byUser || []).reduce((acc, row) => acc + row.hours, 0),
)

onMounted(async () => {
  await Promise.all([requests.fetchAll(), loadSummary()])
  loading.value = false
})

async function loadSummary() {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString()
  summary.value = await reportService.summary(from)
}

function share(row: { hours: number }) {
  if (!totalTeamHours.value) return 0
  return Math.round((row.hours / totalTeamHours.value) * 100)
}
</script>

<template>
  <section class="dash">
    <header class="dash__head">
      <p class="dash__eyebrow">Últimos 3 meses</p>
      <h1 class="dash__title">Hola, {{ userStore.user?.name?.split(' ')[0] }}</h1>
      <p class="dash__lead">Estado del equipo de tecnología en una sola vista.</p>
    </header>

    <LoadingState v-if="loading" />

    <template v-else>
      <div class="dash__stats">
        <StatCard
          label="Horas registradas"
          :value="formatHours(summary?.hours.total || 0)"
          :hint="`${summary?.hours.entries || 0} acciones documentadas`"
          icon="fa-stopwatch"
        />
        <StatCard
          label="Abiertas"
          :value="summary?.requests.open || 0"
          :hint="`${summary?.requests.total || 0} solicitudes en total`"
          icon="fa-folder-open"
        />
        <StatCard
          label="Completadas"
          :value="summary?.requests.byStatus.done || 0"
          :hint="`Cierre promedio ${summary?.requests.avgResolutionDays || 0} días`"
          icon="fa-check-double"
        />
        <StatCard
          label="Estimado total"
          :value="formatHours(summary?.requests.estimatedHours || 0)"
          hint="Suma de estimaciones"
          icon="fa-scale-balanced"
        />
      </div>

      <section class="dash__block">
        <header class="dash__block-head">
          <h2 class="dash__block-title"><i class="fa-solid fa-users" /> Horas por persona</h2>
          <RouterLink class="dash__link" to="/reportes">
            Reportes <i class="fa-solid fa-chevron-right" />
          </RouterLink>
        </header>

        <div v-if="summary?.hours.byUser.length" class="dash__team">
          <article v-for="row in summary.hours.byUser" :key="row.userId" class="dash__member">
            <AppAvatar :name="row.name" :size="36" />
            <div class="dash__member-body">
              <div class="dash__member-top">
                <p class="dash__member-name">{{ row.name }}</p>
                <p class="dash__member-hours">{{ formatHours(row.hours) }}</p>
              </div>
              <div class="dash__track">
                <div class="dash__track-fill" :style="{ width: `${(row.hours / maxUserHours) * 100}%` }" />
              </div>
              <p class="dash__member-meta">
                {{ row.position || row.role }} · {{ row.entries }} acciones · {{ share(row) }}% del total
              </p>
            </div>
          </article>
        </div>

        <EmptyState
          v-else
          title="Sin horas registradas"
          message="Registra acciones para ver el desempeño del equipo."
          icon="fa-stopwatch"
        />
      </section>

      <section class="dash__block">
        <header class="dash__block-head">
          <h2 class="dash__block-title"><i class="fa-solid fa-list-check" /> Solicitudes en curso</h2>
          <RouterLink class="dash__link" to="/solicitudes">
            Ver todas <i class="fa-solid fa-chevron-right" />
          </RouterLink>
        </header>

        <div v-if="highlight.length" class="dash__list">
          <RequestCard v-for="item in highlight" :key="item._id" :request="item" />
        </div>

        <EmptyState
          v-else
          title="Todo al día"
          message="No hay solicitudes abiertas en este momento."
          icon="fa-circle-check"
        />
      </section>
    </template>
  </section>
</template>

<style scoped lang="scss">
.dash {
  @include stack($space-2xl);

  &__head {
    @include stack($space-xs);
  }

  &__eyebrow {
    @include eyebrow;
  }

  &__title {
    font-size: 1.6rem;
    font-weight: 700;
    letter-spacing: -0.03em;
  }

  &__lead {
    font-size: 0.85rem;
    color: $text-3;
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

  &__block-head {
    @include row($space-sm);
    justify-content: space-between;
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

  &__link {
    @include row(0.35rem);
    font-size: 0.76rem;
    font-weight: 600;
    color: $text-3;

    > i {
      font-size: 0.6rem;
    }

    &:hover {
      color: $text-1;
    }
  }

  &__team {
    @include stack($space-sm);
  }

  &__member {
    @include row($space-md);
    align-items: flex-start;
    background-color: $surface-1;
    border: 1px solid $border;
    border-radius: $radius-md;
    padding: $space-lg;
    @include surface-hover;
  }

  &__member-body {
    @include stack($space-xs);
    flex: 1 1 auto;
    min-width: 0;
  }

  &__member-top {
    @include row($space-sm);
    justify-content: space-between;
  }

  &__member-name {
    font-size: 0.88rem;
    font-weight: 600;
  }

  &__member-hours {
    font-size: 0.95rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;
  }

  &__member-meta {
    font-size: 0.72rem;
    color: $text-4;
  }

  &__track {
    display: flex;
    height: 4px;
    background-color: $surface-3;
    border-radius: $radius-pill;
    overflow: hidden;
  }

  &__track-fill {
    display: block;
    height: 100%;
    background-color: $text-1;
    border-radius: $radius-pill;
    transition: width 0.35s ease;
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
