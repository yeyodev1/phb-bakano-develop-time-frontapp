<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTimeLogsStore } from '@/stores/timeLogs'
import { useRequestsStore } from '@/stores/requests'
import { TOOL_SUGGESTIONS } from '@/config/constants'
import { toInputDate } from '@/composables/useFormat'

const props = defineProps<{ requestId?: string; lockRequest?: boolean }>()
const emit = defineEmits<{ (event: 'saved'): void; (event: 'cancel'): void }>()

const timeLogs = useTimeLogsStore()
const requests = useRequestsStore()

const form = ref({
  request: props.requestId || '',
  hours: 1,
  action: '',
  phase: '',
  date: toInputDate(),
  tools: [] as string[],
})

const saving = ref(false)
const error = ref('')

const options = computed(() => requests.items)

function toggleTool(tool: string) {
  form.value.tools = form.value.tools.includes(tool)
    ? form.value.tools.filter((item) => item !== tool)
    : [...form.value.tools, tool]
}

async function submit() {
  error.value = ''

  if (!form.value.request) {
    error.value = 'Selecciona la solicitud'
    return
  }
  if (!form.value.action.trim()) {
    error.value = 'Describe la acción realizada'
    return
  }

  saving.value = true
  try {
    await timeLogs.create({ ...form.value, hours: Number(form.value.hours) })
    form.value.action = ''
    form.value.phase = ''
    form.value.hours = 1
    form.value.tools = []
    emit('saved')
  } catch (requestError) {
    error.value = (requestError as { message?: string }).message || 'No se pudo registrar'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  if (!requests.items.length) requests.fetchAll()
})
</script>

<template>
  <form class="log-form" @submit.prevent="submit">
    <label v-if="!lockRequest" class="log-form__field">
      <span>Solicitud</span>
      <select v-model="form.request">
        <option value="" disabled>Selecciona una solicitud</option>
        <option v-for="item in options" :key="item._id" :value="item._id">
          {{ item.code }} — {{ item.title }}
        </option>
      </select>
    </label>

    <div class="log-form__row">
      <label class="log-form__field">
        <span>Fecha</span>
        <input v-model="form.date" type="date" />
      </label>

      <label class="log-form__field">
        <span>Horas</span>
        <input v-model.number="form.hours" type="number" step="0.25" min="0.25" max="24" />
      </label>
    </div>

    <label class="log-form__field">
      <span>Fase (opcional)</span>
      <input v-model="form.phase" type="text" placeholder="Ej. Ingeniería de workflows" />
    </label>

    <label class="log-form__field">
      <span>Acción realizada</span>
      <textarea v-model="form.action" rows="4" placeholder="Describe qué se hizo y el resultado" />
    </label>

    <div class="log-form__field">
      <span>Herramientas usadas</span>
      <div class="log-form__tools">
        <button
          v-for="tool in TOOL_SUGGESTIONS"
          :key="tool"
          type="button"
          class="log-form__tool"
          :class="{ active: form.tools.includes(tool) }"
          @click="toggleTool(tool)"
        >
          {{ tool }}
        </button>
      </div>
    </div>

    <p v-if="error" class="log-form__error"><i class="fa-solid fa-circle-exclamation" /> {{ error }}</p>

    <div class="log-form__actions">
      <button type="button" class="log-form__ghost" @click="$emit('cancel')">Cancelar</button>
      <button type="submit" class="log-form__submit" :disabled="saving">
        <i class="fa-solid" :class="saving ? 'fa-spinner fa-spin' : 'fa-check'" />
        {{ saving ? 'Guardando…' : 'Registrar horas' }}
      </button>
    </div>
  </form>
</template>

<style scoped lang="scss">
.log-form {
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
    }
  }

  &__tools {
    @include row($space-xs);
    flex-wrap: wrap;
  }

  &__tool {
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
