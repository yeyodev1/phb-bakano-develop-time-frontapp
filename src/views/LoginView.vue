<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  try {
    await userStore.login(email.value.trim(), password.value)
    router.push('/')
  } catch (loginError) {
    error.value = (loginError as { message?: string }).message || 'No se pudo iniciar sesión'
  }
}
</script>

<template>
  <section class="login">
    <div class="login__panel">
      <header class="login__brand">
        <span class="login__mark">PHB</span>
        <span class="login__brand-text">
          <b>Develop Time</b>
          <em>PowerHouse Biotech × Bakano</em>
        </span>
      </header>

      <div class="login__intro">
        <h1 class="login__title">Panel de desarrollo</h1>
        <p class="login__subtitle">
          Solicitudes, horas y acciones del equipo de tecnología.
        </p>
      </div>

      <form class="login__form" @submit.prevent="submit">
        <label class="login__field">
          <span>Correo</span>
          <span class="login__input">
            <i class="fa-regular fa-envelope" />
            <input v-model="email" type="email" autocomplete="email" placeholder="tucorreo@dominio.com" />
          </span>
        </label>

        <label class="login__field">
          <span>Contraseña</span>
          <span class="login__input">
            <i class="fa-solid fa-lock" />
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="••••••••"
            />
            <button type="button" class="login__eye" @click="showPassword = !showPassword">
              <i class="fa-regular" :class="showPassword ? 'fa-eye-slash' : 'fa-eye'" />
            </button>
          </span>
        </label>

        <p v-if="error" class="login__error">
          <i class="fa-solid fa-circle-exclamation" /> {{ error }}
        </p>

        <button class="login__submit" type="submit" :disabled="userStore.loading">
          <i class="fa-solid" :class="userStore.loading ? 'fa-spinner fa-spin' : 'fa-arrow-right-to-bracket'" />
          {{ userStore.loading ? 'Entrando…' : 'Entrar' }}
        </button>
      </form>
    </div>
  </section>
</template>

<style scoped lang="scss">
.login {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1 1 auto;
  min-height: 100dvh;
  padding: $space-lg;
  background:
    radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255, 255, 255, 0.06), transparent 70%),
    $surface-0;

  &__panel {
    @include stack($space-xl);
    width: 100%;
    max-width: 380px;
    padding: $space-2xl $space-xl;
    background-color: $surface-1;
    border: 1px solid $border;
    border-radius: $radius-lg;
    box-shadow: $shadow-md;
  }

  &__brand {
    @include row($space-sm);
  }

  &__mark {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: $radius-md;
    background-color: $accent;
    color: $accent-ink;
    font-weight: 800;
    font-size: 0.74rem;
  }

  &__brand-text {
    @include stack(1px);

    > b {
      font-size: 0.9rem;
      font-weight: 700;
    }

    > em {
      font-style: normal;
      font-size: 0.68rem;
      color: $text-3;
    }
  }

  &__intro {
    @include stack($space-xs);
  }

  &__title {
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.03em;
  }

  &__subtitle {
    font-size: 0.84rem;
    color: $text-3;
    line-height: 1.55;
  }

  &__form {
    @include stack($space-lg);
  }

  &__field {
    @include stack($space-xs);

    > span:first-child {
      @include field-label;
    }
  }

  &__input {
    @include row($space-sm);
    position: relative;
    background-color: $surface-2;
    border: 1px solid $border;
    border-radius: $radius-md;
    padding-left: 0.85rem;
    transition: border-color 0.16s ease;

    &:focus-within {
      border-color: $border-strong;
    }

    > i {
      font-size: 0.8rem;
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

  &__eye {
    flex: 0 0 auto;
    padding: 0 0.85rem;
    font-size: 0.8rem;
    color: $text-4;

    &:hover {
      color: $text-1;
    }
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
