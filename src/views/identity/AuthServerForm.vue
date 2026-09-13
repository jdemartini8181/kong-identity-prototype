<template>
  <div class="auth-server-form-page">
    <AppPageHeader
      :title="pageTitle"
      :breadcrumbs="breadcrumbs"
    />

    <EntityBaseForm
      :is-editing="isEdit"
      :can-submit="isFormValid"
      entity-type="auth-server"
      :error-message="errorMessage"
      :save-button-text="isEdit ? 'Save' : 'Create'"
      @submit="handleSubmit"
      @cancel="handleCancel"
    >
      <EntityFormBlock
        class="auth-server-form-section"
        :step="1"
        title="General information"
        description="Provide a name and description for this auth server."
      >
        <KInput
          v-model.trim="state.name"
          data-testid="input-name"
          label="Name"
          placeholder="e.g., production-auth-server"
          required
        />

        <KTextArea
          v-model.trim="state.description"
          :character-limit="false"
          data-testid="input-description"
          label="Description"
          placeholder="e.g., Primary auth server for production workloads"
          resizable
          :rows="2"
        />
      </EntityFormBlock>

      <EntityFormBlock
        class="auth-server-form-section"
        :step="2"
        title="Audience"
        description="The audience value identifies the intended recipients of the tokens issued by this auth server."
      >
        <KInput
          v-model.trim="state.audience"
          data-testid="input-audience"
          label="Audience"
          placeholder="e.g., https://api.example.com"
          required
        />

        <KCollapse
          class="advanced-settings"
          trigger-label="Show advanced configuration"
        >
          <div class="advanced-settings-container">
            <KTextArea
              v-model.trim="trustedOriginsInput"
              class="trusted-origins"
              data-testid="input-trusted-origins"
              :character-limit="false"
              label="Trusted origins"
              placeholder="e.g., https://app.example.com, https://portal.example.com"
              help="Comma-separated list of origins allowed to use this auth server."
              resizable
              :rows="2"
            />
          </div>
        </KCollapse>
      </EntityFormBlock>
    </EntityBaseForm>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { KInput, KTextArea, KCollapse } from '@kong/kongponents'
import AppPageHeader from '@/components/AppPageHeader.vue'
import EntityBaseForm from '@/components/EntityBaseForm.vue'
import EntityFormBlock from '@/components/EntityFormBlock.vue'
import { useAuthServerStore } from '@/composables/useAuthServerStore'

const route = useRoute()
const router = useRouter()
const store = useAuthServerStore()

const id = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!id.value)

const existingServer = computed(() => (id.value ? store.getById(id.value) : undefined))

const pageTitle = computed(() => isEdit.value ? 'Edit auth server' : 'New auth server')

const breadcrumbs = computed(() => [
  { key: 'identity', text: 'Identity', to: { name: 'auth-servers-list' } },
  { key: 'auth-servers', text: 'Auth servers', to: { name: 'auth-servers-list' } },
  ...(isEdit.value && existingServer.value
    ? [{ key: 'server', text: existingServer.value.name, to: { name: 'auth-server-overview', params: { id: id.value } } }]
    : []),
  { key: 'action', text: isEdit.value ? 'Edit' : 'New auth server' },
])

const state = reactive({
  name: existingServer.value?.name || '',
  description: existingServer.value?.description || '',
  audience: existingServer.value?.audience || '',
})

const trustedOriginsInput = ref(
  (existingServer.value?.trusted_origins || []).join(', '),
)

const errorMessage = ref('')

const isFormValid = computed(() => !!state.name.trim() && !!state.audience.trim())

const parseTrustedOrigins = (val: string): string[] =>
  val
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

const handleSubmit = () => {
  errorMessage.value = ''
  try {
    const payload = {
      name: state.name,
      description: state.description || undefined,
      audience: state.audience,
      trusted_origins: parseTrustedOrigins(trustedOriginsInput.value),
      issuer: existingServer.value?.issuer || `https://auth.example.com/oauth2/${state.name.toLowerCase().replace(/\s+/g, '-')}`,
      metadata_uri: existingServer.value?.metadata_uri,
      labels: existingServer.value?.labels || {},
    }

    if (isEdit.value && id.value) {
      store.update(id.value, payload)
      router.push({ name: 'auth-server-overview', params: { id: id.value } })
    } else {
      const created = store.create(payload)
      router.push({ name: 'auth-server-overview', params: { id: created.id } })
    }
  } catch {
    errorMessage.value = 'An unexpected error occurred. Try again.'
  }
}

const handleCancel = () => {
  if (isEdit.value && id.value) {
    router.push({ name: 'auth-server-overview', params: { id: id.value } })
  } else {
    router.push({ name: 'auth-servers-list' })
  }
}
</script>

<style scoped lang="scss">
@use "@kong/design-tokens/tokens/scss/variables" as *;

.auth-server-form-section {
  margin: $kui-space-70 $kui-space-0;

  .advanced-settings-container {
    display: flex;
    flex-direction: column;
    gap: $kui-space-70;
  }
}
</style>
