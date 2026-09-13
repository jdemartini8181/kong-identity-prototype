<template>
  <div class="auth-server-entity-form-page">
    <AppPageHeader :title="config.pageTitle" :breadcrumbs="breadcrumbs" />

    <EntityBaseForm
      :is-editing="isEdit"
      :can-submit="isFormValid"
      :entity-type="config.entityType"
      :error-message="errorMessage"
      :save-button-text="isEdit ? 'Save' : 'Create'"
      @submit="handleSubmit"
      @cancel="handleCancel"
    >
      <EntityFormBlock
        :step="1"
        :title="config.blockTitle"
        :description="config.blockDescription"
      >
        <KInput
          v-model.trim="state.name"
          data-testid="input-name"
          label="Name"
          :placeholder="config.namePlaceholder"
          required
        />

        <KTextArea
          v-if="config.hasDescription"
          v-model.trim="state.description"
          :character-limit="false"
          data-testid="input-description"
          label="Description"
          :placeholder="config.descriptionPlaceholder"
          resizable
          :rows="2"
        />

        <KSelect
          v-if="config.hasClaimType"
          v-model="state.claim_type"
          data-testid="select-claim-type"
          label="Type"
          :items="claimTypeOptions"
        />
      </EntityFormBlock>
    </EntityBaseForm>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { KInput, KTextArea, KSelect } from '@kong/kongponents'
import AppPageHeader from '@/components/AppPageHeader.vue'
import EntityBaseForm from '@/components/EntityBaseForm.vue'
import EntityFormBlock from '@/components/EntityFormBlock.vue'
import { useAuthServerStore } from '@/composables/useAuthServerStore'

const route = useRoute()
const router = useRouter()
const store = useAuthServerStore()

const authServerId = computed(() => route.params.id as string)
const entityId = computed(() => route.params.entityId as string | undefined)
const isEdit = computed(() => !!entityId.value)
const authServer = computed(() => store.getById(authServerId.value))

type EntityType = 'scope' | 'claim' | 'client'

const ROUTE_ENTITY_MAP: Record<string, EntityType> = {
  'auth-server-scope-create': 'scope',
  'auth-server-scope-edit': 'scope',
  'auth-server-claim-create': 'claim',
  'auth-server-claim-edit': 'claim',
  'auth-server-client-create': 'client',
  'auth-server-client-edit': 'client',
}

const ENTITY_LIST_ROUTES: Record<EntityType, string> = {
  scope: 'auth-server-scopes',
  claim: 'auth-server-claims',
  client: 'auth-server-clients',
}

type EntityFormConfig = {
  entityType: EntityType
  pageTitle: string
  blockTitle: string
  blockDescription: string
  namePlaceholder: string
  descriptionPlaceholder?: string
  hasDescription: boolean
  hasClaimType: boolean
}

const ENTITY_CONFIGS: Record<EntityType, EntityFormConfig> = {
  scope: {
    entityType: 'scope',
    pageTitle: isEdit.value ? 'Edit scope' : 'New scope',
    blockTitle: 'Scope details',
    blockDescription: 'Define the scope name and an optional description.',
    namePlaceholder: 'e.g., read:services',
    descriptionPlaceholder: 'e.g., Read access to services',
    hasDescription: true,
    hasClaimType: false,
  },
  claim: {
    entityType: 'claim',
    pageTitle: isEdit.value ? 'Edit claim' : 'New claim',
    blockTitle: 'Claim details',
    blockDescription: 'Define the claim name and its value type.',
    namePlaceholder: 'e.g., user.email',
    hasDescription: false,
    hasClaimType: true,
  },
  client: {
    entityType: 'client',
    pageTitle: isEdit.value ? 'Edit client' : 'New client',
    blockTitle: 'Client details',
    blockDescription: 'Provide a name for this OAuth client.',
    namePlaceholder: 'e.g., Kong Gateway Plugin',
    hasDescription: false,
    hasClaimType: false,
  },
}

const entityType = computed((): EntityType => ROUTE_ENTITY_MAP[route.name as string] ?? 'scope')
const config = computed(() => ENTITY_CONFIGS[entityType.value])

const claimTypeOptions = [
  { label: 'String', value: 'string' },
  { label: 'Number', value: 'number' },
  { label: 'Boolean', value: 'boolean' },
  { label: 'Array', value: 'array' },
]

const existingEntity = computed(() => {
  if (!isEdit.value || !entityId.value) return undefined
  if (entityType.value === 'scope') return store.getScopeById(authServerId.value, entityId.value)
  if (entityType.value === 'claim') return store.getClaimById(authServerId.value, entityId.value)
  return store.getClientById(authServerId.value, entityId.value)
})

const state = reactive({
  name: (existingEntity.value as any)?.name || '',
  description: (existingEntity.value as any)?.description || '',
  claim_type: (existingEntity.value as any)?.claim_type || 'string',
})

const errorMessage = ref('')
const isFormValid = computed(() => !!state.name.trim())

const breadcrumbs = computed(() => [
  { key: 'identity', text: 'Identity', to: { name: 'auth-servers-list' } },
  { key: 'auth-servers', text: 'Authorization servers', to: { name: 'auth-servers-list' } },
  { key: 'server', text: authServer.value?.name || authServerId.value, to: { name: 'auth-server-overview', params: { id: authServerId.value } } },
  { key: 'list', text: config.value.entityType + 's', to: { name: ENTITY_LIST_ROUTES[entityType.value], params: { id: authServerId.value } } },
  { key: 'action', text: isEdit.value ? 'Edit' : `New ${config.value.entityType}` },
])

const listRoute = computed(() => ({ name: ENTITY_LIST_ROUTES[entityType.value], params: { id: authServerId.value } }))

const handleSubmit = () => {
  errorMessage.value = ''
  try {
    if (entityType.value === 'scope') {
      const data = { name: state.name, description: state.description || undefined }
      if (isEdit.value && entityId.value) {
        store.updateScope(authServerId.value, entityId.value, data)
      } else {
        store.createScope(authServerId.value, data)
      }
    } else if (entityType.value === 'claim') {
      const data = { name: state.name, claim_type: state.claim_type }
      if (isEdit.value && entityId.value) {
        store.updateClaim(authServerId.value, entityId.value, data)
      } else {
        store.createClaim(authServerId.value, data)
      }
    } else {
      const data = { name: state.name }
      if (isEdit.value && entityId.value) {
        store.updateClient(authServerId.value, entityId.value, data)
      } else {
        store.createClient(authServerId.value, data)
      }
    }
    router.push(listRoute.value)
  } catch {
    errorMessage.value = 'An unexpected error occurred. Try again.'
  }
}

const handleCancel = () => {
  router.push(listRoute.value)
}
</script>
