<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { metricsService } from '@/services/metrics.service'
import StatCard from '@/components/StatCard.vue'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'
import { formatDate } from '@/composables/useFormat'
import type { SiteTraffic, TrafficReport } from '@/types'

const report = ref<TrafficReport | null>(null)
const loading = ref(true)
const error = ref('')
const days = ref(30)

const PAISES: Record<string, string> = {
  US: 'Estados Unidos', MX: 'México', EC: 'Ecuador', ES: 'España', FR: 'Francia',
  AU: 'Australia', NL: 'Países Bajos', AE: 'Emiratos Árabes', SG: 'Singapur',
  DE: 'Alemania', CA: 'Canadá', CN: 'China', BR: 'Brasil', SE: 'Suecia',
  CH: 'Suiza', PL: 'Polonia', GB: 'Reino Unido', CO: 'Colombia', AR: 'Argentina',
  PE: 'Perú', CL: 'Chile', IT: 'Italia', EE: 'Estonia', IN: 'India',
}

const nombrePais = (c: string) => PAISES[c] || c

async function load() {
  loading.value = true
  error.value = ''
  try {
    report.value = await metricsService.traffic(days.value)
  } catch (e) {
    error.value = (e as { message?: string }).message || 'No se pudieron cargar las métricas'
  } finally {
    loading.value = false
  }
}

onMounted(load)

function maxDaily(site: SiteTraffic) {
  return Math.max(1, ...site.daily.map((d) => d.uniques))
}

function maxCountry(site: SiteTraffic) {
  return Math.max(1, ...site.countries.map((c) => c.requests))
}

const totalHumanos = computed(() =>
  (report.value?.sites || []).reduce((a, s) => a + s.estimatedHumanUniques, 0),
)
</script>

<template>
  <section class="met">
    <header class="met__head">
      <div class="met__titles">
        <h1 class="met__title">Métricas de tráfico</h1>
        <p class="met__subtitle">
          Datos reales de Cloudflare · powerhousebiotech.com y juanromangarza.com
        </p>
      </div>
      <button class="met__reload" type="button" :disabled="loading" @click="load">
        <i class="fa-solid" :class="loading ? 'fa-spinner fa-spin' : 'fa-rotate'" />
      </button>
    </header>

    <div class="met__range">
      <button
        v-for="d in [7, 30, 90]"
        :key="d"
        class="met__chip"
        :class="{ active: days === d }"
        type="button"
        @click="days = d; load()"
      >
        {{ d }} días
      </button>
    </div>

    <LoadingState v-if="loading">Consultando Cloudflare…</LoadingState>

    <EmptyState
      v-else-if="error"
      title="No se pudieron cargar las métricas"
      :message="error"
      icon="fa-triangle-exclamation"
    />

    <template v-else-if="report">
      <p class="met__generated">
        <i class="fa-regular fa-clock" />
        Generado {{ formatDate(report.generatedAt) }}
        <span v-if="report.cached"> · desde caché (se refresca cada 10 min)</span>
        · <b>{{ totalHumanos.toLocaleString('es-MX') }}</b> visitantes humanos estimados en total
      </p>

      <article v-for="site in report.sites" :key="site.zoneId" class="site">
        <header class="site__head">
          <h2 class="site__name"><i class="fa-solid fa-globe" /> {{ site.site }}</h2>
          <span class="site__period">
            {{ site.days }} {{ site.days === 1 ? 'día' : 'días' }} con datos
          </span>
        </header>

        <div v-if="site.warnings.length" class="site__warnings">
          <p v-for="(w, i) in site.warnings" :key="i" class="site__warning">
            <i class="fa-solid fa-triangle-exclamation" /> {{ w }}
          </p>
        </div>

        <div class="site__stats">
          <StatCard
            label="Visitantes humanos"
            :value="site.estimatedHumanUniques.toLocaleString('es-MX')"
            :hint="`de ${site.uniques.toLocaleString('es-MX')} en bruto`"
            icon="fa-user"
          />
          <StatCard
            label="Páginas humanas"
            :value="site.humanPageViews.toLocaleString('es-MX')"
            :hint="`${Math.round(site.humanShare * 100)}% del total`"
            icon="fa-file-lines"
          />
          <StatCard
            label="Tráfico automatizado"
            :value="site.botPageViews.toLocaleString('es-MX')"
            hint="bots, crawlers y escáneres"
            icon="fa-robot"
          />
          <StatCard
            v-if="site.peak"
            label="Día pico"
            :value="site.peak.uniques"
            :hint="site.peak.date"
            icon="fa-arrow-trend-up"
          />
        </div>

        <section v-if="site.daily.length > 1" class="site__block">
          <h3 class="site__block-title"><i class="fa-solid fa-chart-column" /> Visitantes por día</h3>
          <div class="chart">
            <div
              v-for="d in site.daily"
              :key="d.day"
              class="chart__col"
              :title="`${d.day}: ${d.uniques} únicos · ${d.pageViews} páginas`"
            >
              <span class="chart__bar" :style="{ height: `${(d.uniques / maxDaily(site)) * 100}%` }" />
              <span class="chart__label">{{ d.day.slice(8) }}</span>
            </div>
          </div>
        </section>

        <section class="site__block">
          <h3 class="site__block-title"><i class="fa-solid fa-earth-americas" /> De dónde visitan</h3>
          <div class="bars">
            <div v-for="c in site.countries" :key="c.code" class="bars__row">
              <span class="bars__label">{{ nombrePais(c.code) }}</span>
              <span class="bars__track">
                <span class="bars__fill" :style="{ width: `${(c.requests / maxCountry(site)) * 100}%` }" />
              </span>
              <span class="bars__value">{{ c.requests.toLocaleString('es-MX') }}</span>
            </div>
          </div>
        </section>

        <section class="site__block">
          <h3 class="site__block-title"><i class="fa-solid fa-window-maximize" /> Con qué navegan</h3>
          <div class="tags">
            <span
              v-for="b in site.browsers"
              :key="b.name"
              class="tag"
              :class="{ 'is-bot': !b.human }"
            >
              <i class="fa-solid" :class="b.human ? 'fa-user' : 'fa-robot'" />
              {{ b.name }} · {{ b.pageViews.toLocaleString('es-MX') }}
            </span>
          </div>
        </section>

        <section v-if="site.scanning.length" class="site__block">
          <h3 class="site__block-title is-alert">
            <i class="fa-solid fa-shield-halved" /> Escaneos de vulnerabilidad · últimas 24 h
          </h3>
          <p class="site__note">
            Sondas buscando WordPress o PHP. El sitio no usa ninguno de los dos, así que todas
            fallan — pero inflan el conteo de visitas.
          </p>
          <div class="tags">
            <span v-for="s in site.scanning" :key="s.path" class="tag is-alert">
              {{ s.path }} · {{ s.count }}
            </span>
          </div>
        </section>

        <section v-if="site.statuses.length" class="site__block">
          <h3 class="site__block-title"><i class="fa-solid fa-signal" /> Respuestas del servidor</h3>
          <div class="tags">
            <span
              v-for="s in site.statuses"
              :key="s.status"
              class="tag"
              :class="{ 'is-alert': s.status >= 400 }"
            >
              HTTP {{ s.status }} · {{ s.requests.toLocaleString('es-MX') }}
            </span>
          </div>
        </section>
      </article>
    </template>
  </section>
</template>

<style scoped lang="scss">
.met {
  @include stack($space-xl);

  &__head {
    @include row($space-md);
    justify-content: space-between;
    align-items: flex-start;
  }

  &__titles { @include stack($space-xs); }

  &__title {
    font-size: 1.6rem;
    font-weight: 700;
    letter-spacing: -0.03em;
  }

  &__subtitle {
    font-size: 0.78rem;
    color: $text-3;
  }

  &__reload {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: 36px;
    height: 36px;
    border-radius: $radius-md;
    border: 1px solid $border-medium;
    color: $text-2;
    font-size: 0.85rem;

    &:hover:not(:disabled) { color: $text-1; border-color: $border-strong; }
  }

  &__range {
    @include row($space-sm);
  }

  &__chip { @include chip; }

  &__generated {
    @include row(0.4rem);
    flex-wrap: wrap;
    font-size: 0.75rem;
    color: $text-3;
  }
}

.site {
  @include stack($space-lg);
  background-color: $surface-1;
  border: 1px solid $border;
  border-radius: $radius-lg;
  padding: $space-lg;

  @include from($bp-md) { padding: $space-xl; }

  &__head {
    @include row($space-md);
    justify-content: space-between;
    flex-wrap: wrap;
    border-bottom: 1px solid $border;
    padding-bottom: $space-md;
  }

  &__name {
    @include row($space-sm);
    font-size: 1.05rem;
    font-weight: 700;
    letter-spacing: -0.02em;

    > i { font-size: 0.8rem; color: $text-4; }
  }

  &__period {
    @include eyebrow;
  }

  &__warnings { @include stack($space-sm); }

  &__warning {
    @include row($space-sm);
    align-items: flex-start;
    font-size: 0.78rem;
    line-height: 1.5;
    color: $tone-sand;
    background-color: rgba(185, 165, 126, 0.08);
    border: 1px solid rgba(185, 165, 126, 0.22);
    border-radius: $radius-md;
    padding: $space-md;

    > i { margin-top: 2px; font-size: 0.72rem; flex: 0 0 auto; }
  }

  &__stats {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: $space-md;
  }

  &__block { @include stack($space-md); }

  &__block-title {
    @include row($space-sm);
    font-size: 0.9rem;
    font-weight: 600;

    > i { font-size: 0.76rem; color: $text-4; }

    &.is-alert { color: $tone-clay; > i { color: $tone-clay; } }
  }

  &__note {
    font-size: 0.78rem;
    color: $text-3;
    line-height: 1.55;
  }
}

.chart {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 3px;
  height: 130px;
  overflow-x: auto;
  padding: $space-md;
  background-color: $surface-2;
  border: 1px solid $border;
  border-radius: $radius-md;
  scrollbar-width: none;

  &::-webkit-scrollbar { display: none; }

  &__col {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    gap: 5px;
    flex: 1 0 14px;
    height: 100%;
  }

  &__bar {
    display: block;
    width: 100%;
    min-height: 2px;
    background-color: $text-3;
    border-radius: 2px 2px 0 0;
    transition: background-color 0.16s ease;

    &:hover { background-color: $text-1; }
  }

  &__label {
    font-family: $font-mono;
    font-size: 0.58rem;
    color: $text-4;
  }
}

.bars {
  @include stack($space-sm);

  &__row {
    @include row($space-md);
  }

  &__label {
    flex: 0 0 120px;
    font-size: 0.8rem;
    color: $text-2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    @include from($bp-sm) { flex-basis: 150px; }
  }

  &__track {
    display: flex;
    flex: 1 1 auto;
    height: 6px;
    background-color: $surface-3;
    border-radius: $radius-pill;
    overflow: hidden;
  }

  &__fill {
    display: block;
    height: 100%;
    background-color: $text-1;
    border-radius: $radius-pill;
    transition: width 0.35s ease;
  }

  &__value {
    flex: 0 0 auto;
    font-size: 0.76rem;
    font-variant-numeric: tabular-nums;
    color: $text-3;
    min-width: 52px;
    text-align: right;
  }
}

.tags {
  @include row($space-xs);
  flex-wrap: wrap;
}

.tag {
  @include row(0.35rem);
  font-size: 0.7rem;
  font-weight: 500;
  padding: 0.28rem 0.6rem;
  border-radius: $radius-sm;
  background-color: $surface-2;
  border: 1px solid $border;
  color: $text-2;

  > i { font-size: 0.62rem; color: $text-4; }

  &.is-bot { color: $text-3; }

  &.is-alert {
    color: $tone-clay;
    border-color: rgba(181, 120, 111, 0.3);
    background-color: rgba(181, 120, 111, 0.08);
    font-family: $font-mono;
  }
}
</style>
