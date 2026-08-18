<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRequestsStore } from '@/stores/requests'
import { useUserStore } from '@/stores/user'
import StatusBadge from '@/components/StatusBadge.vue'
import PriorityBadge from '@/components/PriorityBadge.vue'
import AppAvatar from '@/components/AppAvatar.vue'
import LoadingState from '@/components/LoadingState.vue'
import AppModal from '@/components/AppModal.vue'
import TimeLogForm from '@/components/TimeLogForm.vue'
import TimeLogItem from '@/components/TimeLogItem.vue'
import { timeLogService } from '@/services/timeLog.service'
import { STATUS_LABELS, STATUS_ORDER } from '@/config/constants'
import { formatDate, formatDateTime, formatHours, relativeTime } from '@/composables/useFormat'
import type { RequestStatus } from '@/types'

const route = useRoute()
const router = useRouter()
const requests = useRequestsStore()
const userStore = useUserStore()

const id = route.params.id as string
const tab = ref<'horas' | 'actividad' | 'comentarios'>('horas')
const showLogForm = ref(false)
const comment = ref('')
const statusNote = ref('')
const busy = ref(false)

const detail = computed(() => requests.current)
const request = computed(() => requests.current?.request)

const progress = computed(() => {
  if (!request.value?.estimatedHours) return 0
  return Math.min(100, Math.round((request.value.loggedHours / request.value.estimatedHours) * 100))
})

onMounted(() => requests.fetchOne(id))

async function setStatus(status: RequestStatus) {
  if (!request.value || request.value.status === status) return
  busy.value = true
  try {
    await requests.changeStatus(id, status, statusNote.value)
    statusNote.value = ''
    await requests.fetchOne(id)
  } finally {
    busy.value = false
  }
}

async function sendComment() {
  if (!comment.value.trim()) return
  await requests.comment(id, comment.value.trim())
  comment.value = ''
}

async function onLogged() {
  showLogForm.value = false
  await requests.fetchOne(id)
}

async function removeLog(logId: string) {
  await timeLogService.remove(logId)
  await requests.fetchOne(id)
}

async function removeRequest() {
  await requests.remove(id)
  router.push('/solicitudes')
}
</script>

<template>
  <section class="detail">
    <button class="detail__back" type="button" @click="router.back()"><i class="fa-solid fa-arrow-left" /> Volver</button>

    <LoadingState v-if="requests.loading && !detail" />

    <template v-else-if="request">
      <header class="detail__head">
        <div class="detail__head-top">
          <span class="detail__code">{{ request.code }}</span>
          <StatusBadge :status="request.status" />
        </div>
        <h1 class="detail__title">{{ request.title }}</h1>
        <div class="detail__meta">
          <PriorityBadge :priority="request.priority" />
          <span class="detail__category"><i class="fa-solid fa-tag" /> {{ request.category }}</span>
          <span class="detail__date"><i class="fa-regular fa-calendar" /> {{ formatDate(request.createdAt) }}</span>
        </div>
      </header>

      <article class="detail__hours-card">
        <div class="detail__hours-top">
          <div class="detail__hours-block">
            <p class="detail__hours-label">Horas registradas</p>
            <p class="detail__hours-value">{{ formatHours(request.loggedHours) }}</p>
          </div>
          <div class="detail__hours-block is-right">
            <p class="detail__hours-label">Estimado</p>
            <p class="detail__hours-value is-muted">{{ formatHours(request.estimatedHours) }}</p>
          </div>
        </div>
        <div class="detail__bar">
          <div class="detail__bar-fill" :style="{ width: `${progress}%` }" />
        </div>
        <p class="detail__hours-hint">{{ progress }}% del estimado · {{ detail?.timeLogs.length || 0 }} acciones</p>
      </article>

      <p v-if="request.description" class="detail__description">{{ request.description }}</p>

      <div v-if="request.tools?.length" class="detail__tools">
        <span v-for="tool in request.tools" :key="tool" class="detail__tool">{{ tool }}</span>
      </div>

      <section class="detail__people">
        <div class="detail__person">
          <p class="detail__person-label">Solicitada por</p>
          <div class="detail__person-row">
            <AppAvatar :name="request.requestedBy?.name" :size="26" />
            <span>{{ request.requestedBy?.name }}</span>
          </div>
        </div>

        <div class="detail__person">
          <p class="detail__person-label">Responsables</p>
          <div class="detail__person-row">
            <span v-for="person in request.assignees" :key="person._id" class="detail__assignee">
              <AppAvatar :name="person.name" :size="26" />
              {{ person.name }}
            </span>
          </div>
        </div>
      </section>

      <section class="detail__status">
        <p class="detail__status-label">Cambiar estado</p>
        <div class="detail__status-chips">
          <button
            v-for="status in STATUS_ORDER"
            :key="status"
            type="button"
            class="detail__status-chip"
            :class="{ active: request.status === status }"
            :disabled="busy"
            @click="setStatus(status)"
          >
            {{ STATUS_LABELS[status] }}
          </button>
        </div>
        <input v-model="statusNote" type="text" placeholder="Nota del cambio (opcional, se envía por correo)" />
      </section>

      <nav class="detail__tabs">
        <button type="button" :class="{ active: tab === 'horas' }" @click="tab = 'horas'">
          <i class="fa-solid fa-stopwatch" /> Horas ({{ detail?.timeLogs.length || 0 }})
        </button>
        <button type="button" :class="{ active: tab === 'actividad' }" @click="tab = 'actividad'">
          <i class="fa-solid fa-clock-rotate-left" /> Actividad
        </button>
        <button type="button" :class="{ active: tab === 'comentarios' }" @click="tab = 'comentarios'">
          <i class="fa-regular fa-comments" /> {{ detail?.comments.length || 0 }}
        </button>
      </nav>

      <section v-if="tab === 'horas'" class="detail__panel">
        <button v-if="userStore.canLogHours" class="detail__add" type="button" @click="showLogForm = true">
          <i class="fa-solid fa-plus" /> Registrar horas
        </button>

        <TimeLogItem
          v-for="log in detail?.timeLogs || []"
          :key="log._id"
          :log="log"
          :can-delete="userStore.isAdmin || log.user?._id === userStore.user?.id"
          @delete="removeLog"
        />

        <p v-if="!detail?.timeLogs.length" class="detail__empty">Aún no hay horas registradas en esta solicitud.</p>
      </section>

      <section v-else-if="tab === 'actividad'" class="detail__panel">
        <article v-for="(event, index) in [...(request.history || [])].reverse()" :key="index" class="detail__event">
          <span class="detail__event-dot" />
          <div class="detail__event-body">
            <p class="detail__event-text">
              <template v-if="event.from">{{ STATUS_LABELS[event.from] }} → </template>
              <b>{{ STATUS_LABELS[event.to] }}</b>
            </p>
            <p v-if="event.note" class="detail__event-note">{{ event.note }}</p>
            <p class="detail__event-meta">{{ event.by?.name || 'Sistema' }} · {{ formatDateTime(event.at) }}</p>
          </div>
        </article>
      </section>

      <section v-else class="detail__panel">
        <form class="detail__comment-form" @submit.prevent="sendComment">
          <textarea v-model="comment" rows="3" placeholder="Escribe un comentario para el equipo" />
          <button type="submit" class="detail__add"><i class="fa-solid fa-paper-plane" /> Comentar</button>
        </form>

        <article v-for="item in detail?.comments || []" :key="item._id" class="detail__comment">
          <AppAvatar :name="item.user?.name" :size="26" />
          <div class="detail__comment-body">
            <p class="detail__comment-name">{{ item.user?.name }} · <em>{{ relativeTime(item.createdAt) }}</em></p>
            <p class="detail__comment-text">{{ item.message }}</p>
          </div>
        </article>

        <p v-if="!detail?.comments.length" class="detail__empty">Sin comentarios todavía.</p>
      </section>

      <button v-if="userStore.isAdmin" class="detail__delete" type="button" @click="removeRequest">
        <i class="fa-regular fa-trash-can" /> Eliminar solicitud
      </button>

      <AppModal v-if="showLogForm" title="Registrar horas" icon="fa-stopwatch" @close="showLogForm = false">
        <TimeLogForm :request-id="id" lock-request @saved="onLogged" @cancel="showLogForm = false" />
      </AppModal>
    </template>
  </section>
</template>

<style scoped lang="scss">
.detail {
  @include stack($space-xl);

  &__back {
    @include row(0.45rem);
    align-self: flex-start;
    font-size: 0.8rem;
    font-weight: 500;
    color: $text-3;

    > i {
      font-size: 0.7rem;
    }

    &:hover {
      color: $text-1;
    }
  }

  &__head {
    @include stack($space-sm);
  }

  &__head-top {
    @include row($space-sm);
    justify-content: space-between;
  }

  &__code {
    font-family: $font-mono;
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: $text-3;
  }

  &__title {
    font-size: 1.4rem;
    font-weight: 700;
    line-height: 1.3;
    letter-spacing: -0.03em;
  }

  &__meta {
    @include row($space-lg);
    flex-wrap: wrap;
  }

  &__category,
  &__date {
    @include row(0.35rem);
    font-size: 0.74rem;
    color: $text-3;
    text-transform: capitalize;

    > i {
      font-size: 0.65rem;
      color: $text-4;
    }
  }

  &__hours-card {
    @include card;
    gap: $space-md;
  }

  &__hours-top {
    @include row($space-md);
    justify-content: space-between;
  }

  &__hours-block {
    @include stack(2px);

    &.is-right {
      align-items: flex-end;
    }
  }

  &__hours-label {
    @include eyebrow;
  }

  &__hours-value {
    font-size: 1.6rem;
    font-weight: 700;
    letter-spacing: -0.03em;
    font-variant-numeric: tabular-nums;

    &.is-muted {
      color: $text-3;
      font-size: 1.15rem;
    }
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
    transition: width 0.35s ease;
  }

  &__hours-hint {
    font-size: 0.74rem;
    color: $text-4;
  }

  &__description {
    font-size: 0.88rem;
    line-height: 1.7;
    color: $text-2;
    white-space: pre-line;
    padding: $space-lg;
    background-color: $surface-1;
    border: 1px solid $border;
    border-radius: $radius-md;
  }

  &__tools {
    @include row($space-xs);
    flex-wrap: wrap;
  }

  &__tool {
    font-size: 0.68rem;
    font-weight: 500;
    padding: 0.24rem 0.55rem;
    border-radius: $radius-sm;
    background-color: $surface-2;
    border: 1px solid $border;
    color: $text-3;
  }

  &__people {
    display: flex;
    flex-direction: column;
    gap: $space-lg;

    @include from($bp-sm) {
      flex-direction: row;

      > * {
        flex: 1 1 0;
      }
    }
  }

  &__person {
    @include stack($space-sm);
  }

  &__person-label {
    @include eyebrow;
  }

  &__person-row {
    @include row($space-md);
    flex-wrap: wrap;
    font-size: 0.85rem;
  }

  &__assignee {
    @include row($space-sm);
    font-size: 0.85rem;
  }

  &__status {
    @include stack($space-sm);
  }

  &__status-label {
    @include eyebrow;
  }

  &__status-chips {
    @include scroll-x;
    gap: $space-sm;
    padding-bottom: 2px;
  }

  &__status-chip {
    @include chip;
  }

  &__tabs {
    display: flex;
    flex-direction: row;
    gap: $space-xs;
    border-bottom: 1px solid $border;

    > button {
      @include row(0.4rem);
      justify-content: center;
      flex: 1 1 0;
      font-size: 0.78rem;
      font-weight: 600;
      padding: 0.7rem 0.3rem;
      color: $text-4;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      transition: color 0.16s ease, border-color 0.16s ease;

      > i {
        font-size: 0.72rem;
      }

      &:hover {
        color: $text-2;
      }

      &.active {
        color: $text-1;
        border-bottom-color: $text-1;
      }
    }
  }

  &__panel {
    @include stack($space-md);
  }

  &__add {
    @include btn-primary;
  }

  &__empty {
    font-size: 0.82rem;
    color: $text-4;
    text-align: center;
    padding: $space-xl 0;
  }

  &__event {
    @include row($space-md);
    align-items: flex-start;
    padding-left: $space-xs;
  }

  &__event-dot {
    display: block;
    width: 7px;
    height: 7px;
    margin-top: 6px;
    border-radius: 50%;
    background-color: $text-3;
    flex-shrink: 0;
  }

  &__event-body {
    @include stack(2px);
  }

  &__event-text {
    font-size: 0.85rem;
    color: $text-2;

    b {
      color: $text-1;
    }
  }

  &__event-note {
    font-size: 0.8rem;
    color: $text-3;
  }

  &__event-meta {
    font-size: 0.7rem;
    color: $text-4;
  }

  &__comment-form {
    @include stack($space-sm);
  }

  &__comment {
    @include row($space-md);
    align-items: flex-start;
    background-color: $surface-1;
    border: 1px solid $border;
    border-radius: $radius-md;
    padding: $space-md;
  }

  &__comment-body {
    @include stack(3px);
  }

  &__comment-name {
    font-size: 0.8rem;
    font-weight: 600;

    em {
      font-style: normal;
      font-weight: 400;
      color: $text-4;
      font-size: 0.72rem;
    }
  }

  &__comment-text {
    font-size: 0.86rem;
    color: $text-2;
    line-height: 1.6;
  }

  &__delete {
    @include row(0.45rem);
    align-self: center;
    font-size: 0.78rem;
    color: $text-4;
    padding: $space-md;

    &:hover {
      color: $tone-clay;
    }
  }
}
</style>
