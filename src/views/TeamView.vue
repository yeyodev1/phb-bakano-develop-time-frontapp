<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { userService, type UserPayload } from '@/services/user.service'
import AppAvatar from '@/components/AppAvatar.vue'
import AppModal from '@/components/AppModal.vue'
import LoadingState from '@/components/LoadingState.vue'
import { formatDateTime } from '@/composables/useFormat'
import type { User, UserRole } from '@/types'

const users = ref<User[]>([])
const loading = ref(true)
const showForm = ref(false)
const saving = ref(false)
const error = ref('')

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  client: 'Cliente',
  developer: 'Desarrollo',
}

const form = ref<UserPayload>({
  name: '',
  email: '',
  password: '',
  role: 'developer',
  position: '',
  color: '#FAFAFA',
})

async function load() {
  loading.value = true
  try {
    users.value = await userService.list()
  } finally {
    loading.value = false
  }
}

async function submit() {
  error.value = ''

  if (!form.value.name || !form.value.email || !form.value.password) {
    error.value = 'Nombre, correo y contraseña son obligatorios'
    return
  }

  saving.value = true
  try {
    await userService.create(form.value)
    showForm.value = false
    form.value = { name: '', email: '', password: '', role: 'developer', position: '', color: '#FAFAFA' }
    await load()
  } catch (createError) {
    error.value = (createError as { message?: string }).message || 'No se pudo crear el usuario'
  } finally {
    saving.value = false
  }
}

async function toggleActive(user: User) {
  if (user.isActive) await userService.deactivate(user.id)
  else await userService.update(user.id, { isActive: true })
  await load()
}

onMounted(load)
</script>

<template>
  <section class="team">
    <header class="team__head">
      <div class="team__titles">
        <h1 class="team__title">Equipo y accesos</h1>
        <p class="team__subtitle">{{ users.length }} usuarios con acceso al panel</p>
      </div>
      <button class="team__new" type="button" @click="showForm = true">
        <i class="fa-solid fa-user-plus" /> Usuario
      </button>
    </header>

    <LoadingState v-if="loading" />

    <div v-else class="team__list">
      <article v-for="user in users" :key="user.id" class="team__card" :class="{ inactive: !user.isActive }">
        <AppAvatar :name="user.name" :size="40" />
        <div class="team__card-body">
          <p class="team__card-name">{{ user.name }}</p>
          <p class="team__card-email">{{ user.email }}</p>
          <p class="team__card-meta">
            {{ ROLE_LABELS[user.role] }}<template v-if="user.position"> · {{ user.position }}</template>
          </p>
          <p class="team__card-login">
            <i class="fa-regular fa-clock" /> {{ formatDateTime(user.lastLoginAt) }}
          </p>
        </div>
        <button
          class="team__toggle"
          type="button"
          :title="user.isActive ? 'Desactivar acceso' : 'Activar acceso'"
          @click="toggleActive(user)"
        >
          <i class="fa-solid" :class="user.isActive ? 'fa-user-slash' : 'fa-user-check'" />
        </button>
      </article>
    </div>

    <AppModal v-if="showForm" title="Nuevo usuario" icon="fa-user-plus" @close="showForm = false">
      <form class="team__form" @submit.prevent="submit">
        <label class="team__field">
          <span>Nombre</span>
          <input v-model="form.name" type="text" />
        </label>

        <label class="team__field">
          <span>Correo</span>
          <input v-model="form.email" type="email" />
        </label>

        <label class="team__field">
          <span>Contraseña temporal</span>
          <input v-model="form.password" type="text" placeholder="Se envía por correo al usuario" />
        </label>

        <div class="team__row">
          <label class="team__field">
            <span>Rol</span>
            <select v-model="form.role">
              <option value="admin">Administrador</option>
              <option value="client">Cliente</option>
              <option value="developer">Desarrollo</option>
            </select>
          </label>

        </div>

        <label class="team__field">
          <span>Cargo</span>
          <input v-model="form.position" type="text" placeholder="Ej. Tech Lead · Bakano" />
        </label>

        <p v-if="error" class="team__error"><i class="fa-solid fa-circle-exclamation" /> {{ error }}</p>

        <div class="team__actions">
          <button type="button" class="team__ghost" @click="showForm = false">Cancelar</button>
          <button type="submit" class="team__submit" :disabled="saving">
            <i class="fa-solid" :class="saving ? 'fa-spinner fa-spin' : 'fa-paper-plane'" />
            {{ saving ? 'Creando…' : 'Crear y enviar' }}
          </button>
        </div>
      </form>
    </AppModal>
  </section>
</template>

<style scoped lang="scss">
.team {
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

  &__card {
    @include row($space-md);
    align-items: flex-start;
    background-color: $surface-1;
    border: 1px solid $border;
    border-radius: $radius-md;
    padding: $space-lg;
    @include surface-hover;

    &.inactive {
      opacity: 0.45;
    }
  }

  &__card-body {
    @include stack(2px);
    flex: 1 1 auto;
    min-width: 0;
  }

  &__card-name {
    font-size: 0.9rem;
    font-weight: 600;
  }

  &__card-email {
    font-size: 0.76rem;
    color: $text-3;
    word-break: break-all;
  }

  &__card-meta {
    font-size: 0.72rem;
    color: $text-2;
    padding-top: 2px;
  }

  &__card-login {
    @include row(0.35rem);
    font-size: 0.68rem;
    color: $text-4;
  }

  &__toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: 30px;
    height: 30px;
    border-radius: $radius-sm;
    font-size: 0.78rem;
    color: $text-4;

    &:hover {
      background-color: $surface-3;
      color: $text-1;
    }
  }

  &__form {
    @include stack($space-lg);
  }

  &__field {
    @include stack($space-xs);

    > span {
      @include field-label;
    }
  }

  &__row {
    display: flex;
    flex-direction: row;
    gap: $space-md;

    > * {
      flex: 1 1 0;
      min-width: 0;
    }
  }

  &__error {
    @include row(0.4rem);
    font-size: 0.8rem;
    color: $alert-error;
  }

  &__actions {
    display: flex;
    flex-direction: row;
    gap: $space-md;

    > * {
      flex: 1 1 0;
    }
  }

  &__ghost {
    @include btn-ghost;
  }

  &__submit {
    @include btn-primary;
  }
}
</style>
