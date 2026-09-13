<template>
  <div class="gateway-service-form-page">
    <AppPageHeader
      :title="isEdit ? 'Edit service' : 'New service'"
      :breadcrumbs="breadcrumbs"
    />

    <EntityBaseForm
      :is-editing="isEdit"
      :can-submit="isFormValid"
      entity-type="service"
      :error-message="errorMessage"
      :save-button-text="isEdit ? 'Save' : 'Create'"
      @submit="handleSubmit"
      @cancel="handleCancel"
    >
      <EntityFormBlock
        :step="1"
        title="General information"
        description="Provide a name and optional description for this service."
      >
        <KInput
          v-model.trim="form.name"
          data-testid="input-name"
          label="Name"
          placeholder="e.g., payments-service"
          required
        />
      </EntityFormBlock>

      <EntityFormBlock
        :step="2"
        title="Upstream"
        description="Configure the upstream host, port, and protocol that this service proxies to."
      >
        <KSelect
          v-model="form.protocol"
          data-testid="select-protocol"
          :items="protocolItems"
          label="Protocol"
          required
        />

        <KInput
          v-model.trim="form.host"
          data-testid="input-host"
          label="Host"
          placeholder="e.g., payments.internal"
          required
        />

        <KInput
          v-model.trim="form.portStr"
          data-testid="input-port"
          label="Port"
          placeholder="e.g., 8080"
          type="number"
          required
        />

        <KInput
          v-model.trim="form.path"
          data-testid="input-path"
          label="Path"
          :label-attributes="{ info: 'Optional path prefix to add to requests forwarded to this service.' }"
          placeholder="e.g., /api/v1"
        />
      </EntityFormBlock>

      <EntityFormBlock
        :step="3"
        title="Configuration"
        description="Additional configuration options for this service."
      >
        <KInputSwitch
          v-model="form.enabled"
          data-testid="switch-enabled"
          label="Enabled"
        />
      </EntityFormBlock>
    </EntityBaseForm>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { KInput, KSelect, KInputSwitch } from '@kong/kongponents'
import AppPageHeader from '@/components/AppPageHeader.vue'
import EntityBaseForm from '@/components/EntityBaseForm.vue'
import EntityFormBlock from '@/components/EntityFormBlock.vue'
import { useApiGatewayStore } from '@/composables/useApiGatewayStore'

const route = useRoute()
const router = useRouter()
const store = useApiGatewayStore()

const gatewayId = computed(() => route.params.id as string)
const serviceId = computed(() => route.params.serviceId as string | undefined)
const isEdit = computed(() => !!serviceId.value)
const gateway = computed(() => store.getById(gatewayId.value))
const existing = computed(() => isEdit.value ? store.getServiceById(gatewayId.value, serviceId.value!) : undefined)

const protocolItems = [
  { label: 'HTTP', value: 'http' },
  { label: 'HTTPS', value: 'https' },
  { label: 'gRPC', value: 'grpc' },
  { label: 'gRPCS', value: 'grpcs' },
  { label: 'TCP', value: 'tcp' },
  { label: 'TLS', value: 'tls' },
]

const form = reactive({
  name: existing.value?.name ?? '',
  host: existing.value?.host ?? '',
  portStr: String(existing.value?.port ?? 80),
  protocol: existing.value?.protocol ?? 'http',
  path: existing.value?.path ?? '',
  enabled: existing.value?.enabled ?? true,
})

const errorMessage = ref('')
const isFormValid = computed(() => !!form.name.trim() && !!form.host.trim() && !!form.portStr.trim())

const breadcrumbs = computed(() => [
  { key: 'api-gateway', text: 'API Gateway', to: { name: 'api-gateway-list' } },
  { key: 'gateway', text: gateway.value?.name ?? gatewayId.value, to: { name: 'api-gateway-services', params: { id: gatewayId.value } } },
  { key: 'action', text: isEdit.value ? 'Edit service' : 'New service' },
])

const handleSubmit = () => {
  errorMessage.value = ''
  try {
    const data = {
      name: form.name,
      host: form.host,
      port: parseInt(form.portStr, 10) || 80,
      protocol: form.protocol as 'http' | 'https' | 'grpc' | 'grpcs' | 'tcp' | 'tls',
      path: form.path || undefined,
      enabled: form.enabled,
    }
    if (isEdit.value && serviceId.value) {
      store.updateService(gatewayId.value, serviceId.value, data)
    } else {
      store.createService(gatewayId.value, data)
    }
    router.push({ name: 'api-gateway-services', params: { id: gatewayId.value } })
  } catch {
    errorMessage.value = 'An unexpected error occurred. Try again.'
  }
}

const handleCancel = () => {
  router.push({ name: 'api-gateway-services', params: { id: gatewayId.value } })
}
</script>

<style scoped lang="scss">
@use "@kong/design-tokens/tokens/scss/variables" as *;

.gateway-service-form-page {
  display: flex;
  flex-direction: column;
  gap: $kui-space-70;
}
</style>
