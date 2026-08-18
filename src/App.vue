<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import AppLayout from '@/layout/AppLayout.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isPublic = computed(() => route.meta.public === true)

onMounted(() => {
  window.addEventListener('auth:token-expired', () => {
    userStore.logout()
    router.push('/login')
  })
})
</script>

<template>
  <RouterView v-if="isPublic" />
  <AppLayout v-else>
    <RouterView />
  </AppLayout>
</template>
