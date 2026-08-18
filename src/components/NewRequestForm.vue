<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRequestsStore } from '@/stores/requests'
import { userService } from '@/services/user.service'
import { CATEGORIES, PRIORITY_LABELS, PRIORITY_ORDER, TOOL_SUGGESTIONS } from '@/config/constants'
import type { User } from '@/types'

const emit = defineEmits<{ (event: 'created'): void; (event: 'cancel'): void }>()

const requests = useRequestsStore()
const team = ref<User[]>([])
const saving = ref(false)
const error = ref('')

const form = ref({
  title: '',
  description: '',
  category: CATEGORIES[0],
  priority: 'medium' as (typeof PRIORITY_ORDER)[number],
  estimatedHours: 0,
  dueDate: '',
  assignees: [] as string[],
  tools: [] as string[],
})

onMounted(async () => {
  team.value = (await userService.list()).filter((user) => user.role !== 'client')
})

function toggle(list: 'assignees' | 'tools', value: string) {
  const current = form.value[list]
  form.value[list] = current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value]
}

async function submit() {
  error.value = ''

  if (!form.value.title.trim()) {
    error.value = 'El título es obligatorio'
    return
  }

  saving.value = true
  try {
    await requests.create({ ...form.value, estimatedHours: Number(form.value.estimatedHours) })
    emit('created')
  } catch (createError) {
    error.value = (createError as { message?: string }).message || 'No se pudo crear la solicitud'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="new-request" @submit.prevent="submit">
    <label class="new-request__field">
      <span>Título</span>
      <input v-model="form.title" type="text" placeholder="¿Qué necesitas del equipo?" />
    </label>

    <label class="new-request__field">
      <span>Descripción</span>
      <textarea v-model="form.description" rows="4" placeholder="Contexto, objetivo y criterio de aceptación" />
    </label>

    <div class="new-request__row">
      <label class="new-request__field">
        <span>Categoría</span>
        <select v-model="form.category">
          <option v-for="category in CATEGORIES" :key="category" :value="category">{{ category }}</option>
        </select>
      </label>

      <label class="new-request__field">
        <span>Prioridad</span>
        <select v-model="form.priority">
          <option v-for="priority in PRIORITY_ORDER" :key="priority" :value="priority">
            {{ PRIORITY_LABELS[priority] }}
          </option>
        </select>
      </label>
    </div>

    <div class="new-request__row">
      <label class="new-request__field">
        <span>Horas estimadas</span>
        <input v-model.number="form.estimatedHours" type="number" min="0" step="0.5" />
      </label>

      <label class="new-request__field">
        <span>Fecha límite</span>
        <input v-model="form.dueDate" type="date" />
      </label>
    </div>

    <div class="new-request__field">
      <span>Responsables</span>
      <div class="new-request__chips">
        <button
          v-for="member in team"
          :key="member.id"
          type="button"
          class="new-request__chip"
          :class="{ active: form.assignees.includes(member.id) }"
          @click="toggle('assignees', member.id)"
        >
          {{ member.name }}
        </button>
      </div>
    </div>

    <div class="new-request__field">
      <span>Herramientas previstas</span>
      <div class="new-request__chips">
        <button
          v-for="tool in TOOL_SUGGESTIONS"
          :key="tool"
          type="button"
          class="new-request__chip"
          :class="{ active: form.tools.includes(tool) }"
          @click="toggle('tools', tool)"
        >
          {{ tool }}
        </button>
      </div>
    </div>

    <p v-if="error" class="new-request__error"><i class="fa-solid fa-circle-exclamation" /> {{ error }}</p>

    <div class="new-request__actions">
      <button type="button" class="new-request__ghost" @click="$emit('cancel')">Cancelar</button>
      <button type="submit" class="new-request__submit" :disabled="saving">
        <i class="fa-solid" :class="saving ? 'fa-spinner fa-spin' : 'fa-paper-plane'" />
        {{ saving ? 'Creando…' : 'Crear solicitud' }}
      </button>
    </div>
  </form>
</template>

<style scoped lang="scss">
.new-request {
  @include stack($space-lg);

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

  &__chips {
    @include row($space-xs);
    flex-wrap: wrap;
  }

  &__chip {
    @include chip;
    font-size: 0.7rem;
    padding: 0.32rem 0.6rem;
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
