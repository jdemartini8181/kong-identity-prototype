<template>
  <div class="event-gateway-form-page">
    <AppPageHeader :title="isEdit ? 'Edit event gateway' : 'New event gateway'" :breadcrumbs="breadcrumbs" />

    <EntityBaseForm
      :is-editing="isEdit"
      :can-submit="isFormValid"
      entity-type="event gateway"
      :error-message="errorMessage"
      :save-button-text="isEdit ? 'Save' : 'Create'"
      @submit="handleSubmit"
      @cancel="router.push({ name: 'event-gateway-list' })"
    >
      <EntityFormBlock
        :step="1"
        title="Gateway details"
        description="Provide a name and optional description for this event gateway."
      >
        <KInput
          v-model.trim="form.name"
          data-testid="input-name"
          label="Name"
          placeholder="e.g., production-event-gateway"
          required
        />

        <KTextArea
          v-model.trim="form.description"
          :character-limit="false"
          data-testid="input-description"
          label="Description"
          placeholder="e.g., Primary event gateway for production workloads."
          resizable
          :rows="2"
        />

        <KInput
          v-model.trim="form.min_runtime_version"
          data-testid="input-min-runtime-version"
          label="Minimum runtime version"
          placeholder="e.g., 3.10"
        />
      </EntityFormBlock>
    </EntityBaseForm>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { KInput, KTextArea } from '@kong/kongponents'
import AppPageHeader from '@/components/AppPageHeader.vue'
import EntityBaseForm from '@/components/EntityBaseForm.vue'
import EntityFormBlock from '@/components/EntityFormBlock.vue'
import { useEventGatewayStore } from '@/composables/useEventGatewayStore'

const route = useRoute()
const router = useRouter()
const store = useEventGatewayStore()

const id = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!id.value)
const existing = computed(() => isEdit.value ? store.getById(id.value!) : undefined)

const form = reactive({
  name: existing.value?.name || '',
  description: existing.value?.description || '',
  min_runtime_version: existing.value?.min_runtime_version || '',
})

const errorMessage = ref('')
const isFormValid = computed(() => !!form.name.trim())

const breadcrumbs = computed(() => [
  { key: 'event-gateway', text: 'Event Gateway', to: { name: 'event-gateway-list' } },
  { key: 'action', text: isEdit.value ? 'Edit' : 'New event gateway' },
])

const handleSubmit = () => {
  errorMessage.value = ''
  try {
    if (isEdit.value && id.value) {
      store.update(id.value, {
        name: form.name,
        description: form.description || undefined,
        min_runtime_version: form.min_runtime_version || undefined,
      })
      router.push({ name: 'event-gateway-overview', params: { id: id.value } })
    } else {
      const created = store.create({
        name: form.name,
        description: form.description || undefined,
        min_runtime_version: form.min_runtime_version || undefined,
      })
      router.push({ name: 'event-gateway-overview', params: { id: created.id } })
    }
  } catch {
    errorMessage.value = 'An unexpected error occurred. Try again.'
  }
}
</script>
