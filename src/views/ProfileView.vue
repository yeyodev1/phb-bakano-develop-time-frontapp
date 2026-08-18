<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { reportService } from '@/services/report.service'
import { authService } from '@/services/auth.service'
import AppAvatar from '@/components/AppAvatar.vue'
import StatCard from '@/components/StatCard.vue'
import { formatHours, toInputDate } from '@/composables/useFormat'
import type { DeveloperReport } from '@/types'

const userStore = useUserStore()
const report = ref<DeveloperReport | null>(null)

const passwords = ref({ current: '', next: '' })
const feedback = ref('')
const error = ref('')

onMounted(async () => {
  if (!userStore.user) return
  const now = new Date()
  report.value = await reportService.developer(
    userStore.user.id,
    toInputDate(new Date(now.getFullYear(), now.getMonth() - 2, 1)),
    toInputDate(now),
  )
})

async function changePassword() {
  feedback.value = ''
  error.value = ''

  try {
    const result = await authService.changePassword(passwords.value.current, passwords.value.next)
    feedback.value = result.message
    passwords.value = { current: '', next: '' }
  } catch (changeError) {
    error.value = (changeError as { message?: string }).message || 'No se pudo actualizar'
  }
}
</script>

<template>
  <section class="profile">
    <header class="profile__head">
      <AppAvatar :name="userStore.user?.name" :size="58" />
      <div class="profile__id">
        <h1 class="profile__name">{{ userStore.user?.name }}</h1>
        <p class="profile__role">{{ userStore.user?.position || userStore.user?.role }}</p>
        <p class="profile__email">{{ userStore.user?.email }}</p>
      </div>
    </header>

    <div v-if="report" class="profile__stats">
      <StatCard
        label="Horas (3 meses)"
        :value="formatHours(report.totalHours)"
        :hint="`${report.entries} acciones`"
        icon="fa-stopwatch"
      />
      <StatCard label="Asignadas" :value="report.assignedRequests" icon="fa-list-check" />
      <StatCard label="Entregadas" :value="report.deliveredRequests" icon="fa-check-double" />
    </div>

    <form class="profile__form" @submit.prevent="changePassword">
      <h2 class="profile__form-title"><i class="fa-solid fa-lock" /> Cambiar contraseña</h2>

      <label class="profile__field">
        <span>Contraseña actual</span>
        <input v-model="passwords.current" type="password" autocomplete="current-password" />
      </label>

      <label class="profile__field">
        <span>Nueva contraseña</span>
        <input v-model="passwords.next" type="password" autocomplete="new-password" />
      </label>

      <p v-if="feedback" class="profile__ok"><i class="fa-solid fa-circle-check" /> {{ feedback }}</p>
      <p v-if="error" class="profile__error"><i class="fa-solid fa-circle-exclamation" /> {{ error }}</p>

      <button class="profile__submit" type="submit">
        <i class="fa-solid fa-key" /> Actualizar contraseña
      </button>
    </form>
  </section>
</template>

<style scoped lang="scss">
.profile {
  @include stack($space-xl);

  &__head {
    @include row($space-lg);
  }

  &__id {
    @include stack(2px);
    min-width: 0;
  }

  &__name {
    font-size: 1.3rem;
    font-weight: 700;
    letter-spacing: -0.03em;
  }

  &__role {
    font-size: 0.8rem;
    color: $text-2;
  }

  &__email {
    font-size: 0.76rem;
    color: $text-4;
    word-break: break-all;
  }

  &__stats {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: $space-md;
  }

  &__form {
    @include card;
    gap: $space-lg;
    max-width: 440px;
  }

  &__form-title {
    @include row($space-sm);
    font-size: 0.92rem;
    font-weight: 600;

    > i {
      font-size: 0.76rem;
      color: $text-4;
    }
  }

  &__field {
    @include stack($space-xs);

    > span {
      @include field-label;
    }
  }

  &__ok {
    @include row(0.4rem);
    font-size: 0.8rem;
    color: $tone-sage;
  }

  &__error {
    @include row(0.4rem);
    font-size: 0.8rem;
    color: $alert-error;
  }

  &__submit {
    @include btn-primary;
  }
}
</style>
