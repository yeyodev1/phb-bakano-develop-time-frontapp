<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import AppAvatar from '@/components/AppAvatar.vue'

const userStore = useUserStore()
const router = useRouter()
const menuOpen = ref(false)

const navItems = computed(() => {
  const items = [
    { to: '/', label: 'Panel', icon: 'fa-chart-simple' },
    { to: '/solicitudes', label: 'Solicitudes', icon: 'fa-list-check' },
    { to: '/horas', label: 'Horas', icon: 'fa-stopwatch' },
    { to: '/reportes', label: 'Reportes', icon: 'fa-chart-line' },
    { to: '/metricas', label: 'Métricas', icon: 'fa-globe' },
  ]

  if (userStore.isAdmin) items.push({ to: '/equipo', label: 'Equipo', icon: 'fa-users' })

  return items
})

const roleLabel = computed(() => {
  const map: Record<string, string> = { admin: 'Administrador', client: 'Cliente', developer: 'Desarrollo' }
  return userStore.user ? map[userStore.user.role] : ''
})

function logout() {
  userStore.logout()
  menuOpen.value = false
  router.push('/login')
}
</script>

<template>
  <div class="layout">
    <aside class="layout__sidebar">
      <RouterLink class="layout__brand" to="/">
        <span class="layout__brand-mark">PHB</span>
        <span class="layout__brand-text">
          <b>Develop Time</b>
          <em>PowerHouse × Bakano</em>
        </span>
      </RouterLink>

      <nav class="layout__side-nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          class="layout__side-link"
          :to="item.to"
          active-class="is-active"
        >
          <i class="fa-solid" :class="item.icon" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <RouterLink class="layout__side-user" to="/perfil">
        <AppAvatar :name="userStore.user?.name" :size="34" />
        <span class="layout__side-user-body">
          <b>{{ userStore.user?.name }}</b>
          <em>{{ userStore.user?.position || roleLabel }}</em>
        </span>
      </RouterLink>

      <button class="layout__side-logout" type="button" @click="logout">
        <i class="fa-solid fa-arrow-right-from-bracket" />
        <span>Cerrar sesión</span>
      </button>
    </aside>

    <div class="layout__content">
      <header class="layout__topbar">
        <RouterLink class="layout__brand is-compact" to="/">
          <span class="layout__brand-mark">PHB</span>
          <span class="layout__brand-text"><b>Develop Time</b></span>
        </RouterLink>

        <button class="layout__user" type="button" @click="menuOpen = !menuOpen">
          <AppAvatar :name="userStore.user?.name" :size="32" />
        </button>

        <div v-if="menuOpen" class="layout__menu">
          <p class="layout__menu-name">{{ userStore.user?.name }}</p>
          <p class="layout__menu-role">{{ userStore.user?.position || roleLabel }}</p>
          <RouterLink class="layout__menu-link" to="/perfil" @click="menuOpen = false">
            <i class="fa-solid fa-user" /> Mi perfil
          </RouterLink>
          <button class="layout__menu-link is-danger" type="button" @click="logout">
            <i class="fa-solid fa-arrow-right-from-bracket" /> Cerrar sesión
          </button>
        </div>
      </header>

      <main class="layout__main" @click="menuOpen = false">
        <slot />
      </main>
    </div>

    <nav class="layout__tabbar">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        class="layout__tab"
        :to="item.to"
        active-class="is-active"
      >
        <i class="fa-solid" :class="item.icon" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>
  </div>
</template>

<style scoped lang="scss">
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  width: 100%;

  @include from($bp-lg) {
    flex-direction: row;
  }

  // ── Sidebar: oculta en móvil, columna fija en escritorio ─────────────────
  &__sidebar {
    display: none;

    @include from($bp-lg) {
      @include stack($space-lg);
      position: sticky;
      top: 0;
      flex: 0 0 $sidebar-width;
      width: $sidebar-width;
      height: 100dvh;
      padding: $space-xl $space-lg;
      background-color: $surface-1;
      border-right: 1px solid $border;
    }
  }

  &__brand {
    @include row($space-sm);

    &.is-compact {
      @include from($bp-lg) {
        display: none;
      }
    }
  }

  &__brand-mark {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: 34px;
    height: 34px;
    border-radius: $radius-md;
    background-color: $accent;
    color: $accent-ink;
    font-weight: 800;
    font-size: 0.72rem;
    letter-spacing: 0.02em;
  }

  &__brand-text {
    @include stack(1px);
    min-width: 0;

    > b {
      font-size: 0.9rem;
      font-weight: 700;
      letter-spacing: -0.01em;
    }

    > em {
      font-style: normal;
      font-size: 0.68rem;
      color: $text-3;
    }
  }

  &__side-nav {
    @include stack(2px);
    flex: 1 1 auto;
    margin-top: $space-md;
  }

  &__side-link {
    @include row($space-md);
    padding: 0.62rem 0.75rem;
    border-radius: $radius-md;
    font-size: 0.875rem;
    font-weight: 500;
    color: $text-3;
    transition: color 0.16s ease, background-color 0.16s ease;

    > i {
      width: 16px;
      text-align: center;
      font-size: 0.9rem;
    }

    &:hover {
      color: $text-1;
      background-color: $surface-2;
    }

    &.is-active {
      color: $accent-ink;
      background-color: $accent;
      font-weight: 600;
    }
  }

  &__side-user {
    @include row($space-sm);
    padding: $space-sm;
    border-radius: $radius-md;
    border: 1px solid $border;
    @include surface-hover;
  }

  &__side-user-body {
    @include stack(1px);
    min-width: 0;

    > b {
      font-size: 0.8rem;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    > em {
      font-style: normal;
      font-size: 0.68rem;
      color: $text-3;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  &__side-logout {
    @include row($space-md);
    padding: 0.55rem 0.75rem;
    border-radius: $radius-md;
    font-size: 0.8rem;
    font-weight: 500;
    color: $text-3;

    > i {
      width: 16px;
      text-align: center;
    }

    &:hover {
      color: $text-1;
    }
  }

  // ── Columna de contenido ─────────────────────────────────────────────────
  &__content {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-width: 0;
  }

  &__topbar {
    @include row($space-md);
    position: sticky;
    top: 0;
    z-index: 20;
    justify-content: space-between;
    padding: $space-md $space-lg;
    background-color: rgba(11, 11, 13, 0.86);
    backdrop-filter: blur(14px);
    border-bottom: 1px solid $border;

    @include from($bp-lg) {
      justify-content: flex-end;
      background-color: transparent;
      border-bottom: none;
      padding: $space-lg $space-xl 0;
    }
  }

  &__user {
    display: flex;
    border-radius: 50%;
    border: 1px solid transparent;
    transition: border-color 0.16s ease;

    &:hover {
      border-color: $border-strong;
    }
  }

  &__menu {
    @include stack(2px);
    position: absolute;
    top: calc(100% - 4px);
    right: $space-lg;
    min-width: 200px;
    padding: $space-md;
    background-color: $surface-2;
    border: 1px solid $border-medium;
    border-radius: $radius-md;
    box-shadow: $shadow-md;
  }

  &__menu-name {
    font-size: 0.85rem;
    font-weight: 600;
  }

  &__menu-role {
    font-size: 0.7rem;
    color: $text-3;
    padding-bottom: $space-sm;
  }

  &__menu-link {
    @include row($space-sm);
    font-size: 0.82rem;
    padding: 0.5rem 0;
    border-top: 1px solid $border;
    color: $text-2;

    > i {
      width: 14px;
      font-size: 0.75rem;
    }

    &:hover {
      color: $text-1;
    }

    &.is-danger:hover {
      color: $tone-clay;
    }
  }

  &__main {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    width: 100%;
    max-width: 1120px;
    margin: 0 auto;
    padding: $space-lg $space-lg calc(80px + #{$space-lg});

    @include from($bp-md) {
      padding: $space-xl $space-xl calc(80px + #{$space-lg});
    }

    @include from($bp-lg) {
      padding: $space-lg $space-xl $space-2xl;
      margin: 0;
    }
  }

  // ── Tab bar inferior: solo móvil / tablet ────────────────────────────────
  &__tabbar {
    display: flex;
    flex-direction: row;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 30;
    padding: $space-sm $space-xs calc(#{$space-sm} + env(safe-area-inset-bottom));
    background-color: rgba(8, 8, 10, 0.94);
    backdrop-filter: blur(14px);
    border-top: 1px solid $border;

    @include from($bp-lg) {
      display: none;
    }
  }

  &__tab {
    @include stack(3px);
    flex: 1 1 0;
    align-items: center;
    padding: 0.35rem 0.2rem;
    color: $text-4;
    transition: color 0.16s ease;

    > i {
      font-size: 1rem;
    }

    > span {
      font-size: 0.64rem;
      font-weight: 600;
      letter-spacing: 0.01em;
    }

    &.is-active {
      color: $text-1;
    }
  }
}
</style>
