<template>
  <div class="route-form-page">
    <AppPageHeader
      :title="isEdit ? 'Edit route' : 'New route'"
      :breadcrumbs="breadcrumbs"
    />

    <EntityBaseForm
      :is-editing="isEdit"
      :can-submit="isFormValid"
      entity-type="route"
      :error-message="errorMessage"
      :save-button-text="isEdit ? 'Save' : 'Create'"
      @submit="handleSubmit"
      @cancel="handleCancel"
    >
      <EntityFormBlock
        :step="1"
        title="General information"
        description="Provide a name and associate this route with a service."
      >
        <KInput
          v-model.trim="form.name"
          data-testid="input-name"
          label="Name"
          placeholder="e.g., payments-api-v1"
          required
        />

        <KSelect
          v-model="form.service_id"
          data-testid="select-service"
          :items="serviceItems"
          label="Service"
          :label-attributes="{ info: 'The service this route forwards traffic to. Leave unset to create a serviceless route.' }"
          placeholder="Select a service (optional)"
        />
      </EntityFormBlock>

      <EntityFormBlock
        :step="2"
        title="Routing rules"
        description="Define the protocols, methods, hosts, and paths that this route matches."
      >
        <div class="field-group">
          <KLabel>Protocols</KLabel>
          <div class="checkbox-group">
            <KCheckbox v-model="form.protocols_http" label="HTTP" />
            <KCheckbox v-model="form.protocols_https" label="HTTPS" />
          </div>
        </div>

        <div class="field-group">
          <KLabel>Methods</KLabel>
          <div class="checkbox-group">
            <KCheckbox
              v-for="method in HTTP_METHODS"
              :key="method"
              v-model="form.methods[method]"
              :label="method"
            />
          </div>
        </div>

        <div class="field-group">
          <KLabel>Paths</KLabel>
          <div
            v-for="(path, idx) in form.paths"
            :key="idx"
            class="list-input-row"
          >
            <KInput
              v-model.trim="form.paths[idx]"
              :data-testid="`path-${idx}`"
              placeholder="e.g., /api/v1/payments"
            />
            <KButton
              appearance="tertiary"
              class="remove-btn"
              @click="form.paths.splice(idx, 1)"
            >
              Remove
            </KButton>
          </div>
          <KButton
            appearance="tertiary"
            class="add-btn"
            @click="form.paths.push('')"
          >
            <AddIcon decorative />
            Add path
          </KButton>
        </div>

        <div class="field-group">
          <KLabel>Hosts</KLabel>
          <div
            v-for="(host, idx) in form.hosts"
            :key="idx"
            class="list-input-row"
          >
            <KInput
              v-model.trim="form.hosts[idx]"
              :data-testid="`host-${idx}`"
              placeholder="e.g., api.example.com"
            />
            <KButton
              appearance="tertiary"
              class="remove-btn"
              @click="form.hosts.splice(idx, 1)"
            >
              Remove
            </KButton>
          </div>
          <KButton
            appearance="tertiary"
            class="add-btn"
            @click="form.hosts.push('')"
          >
            <AddIcon decorative />
            Add host
          </KButton>
        </div>
      </EntityFormBlock>

      <EntityFormBlock
        :step="3"
        title="Configuration"
        description="Additional configuration for this route."
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
import { KInput, KSelect, KLabel, KCheckbox, KInputSwitch, KButton } from '@kong/kongponents'
import { AddIcon } from '@kong/icons'
import AppPageHeader from '@/components/AppPageHeader.vue'
import EntityBaseForm from '@/components/EntityBaseForm.vue'
import EntityFormBlock from '@/components/EntityFormBlock.vue'
import { useApiGatewayStore } from '@/composables/useApiGatewayStore'

const route = useRoute()
const router = useRouter()
const store = useApiGatewayStore()

const gatewayId = computed(() => route.params.id as string)
const routeId = computed(() => route.params.routeId as string | undefined)
const isEdit = computed(() => !!routeId.value)
const gateway = computed(() => store.getById(gatewayId.value))
const existing = computed(() => isEdit.value ? store.getRouteById(gatewayId.value, routeId.value!) : undefined)

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

const serviceItems = computed(() =>
  store.getServices(gatewayId.value).map(s => ({ label: s.name, value: s.id })),
)

const existingMethods = existing.value?.methods ?? []
const form = reactive({
  name: existing.value?.name ?? '',
  service_id: existing.value?.service_id ?? '',
  protocols_http: existing.value?.protocols?.includes('http') ?? true,
  protocols_https: existing.value?.protocols?.includes('https') ?? true,
  methods: HTTP_METHODS.reduce((acc, m) => ({ ...acc, [m]: existingMethods.length === 0 ? false : existingMethods.includes(m) }), {} as Record<string, boolean>),
  paths: existing.value?.paths ? [...existing.value.paths] : [''],
  hosts: existing.value?.hosts ? [...existing.value.hosts] : [],
  enabled: existing.value?.enabled ?? true,
})

const errorMessage = ref('')
const isFormValid = computed(() => !!form.name.trim() && (form.protocols_http || form.protocols_https))

const breadcrumbs = computed(() => [
  { key: 'api-gateway', text: 'API Gateway', to: { name: 'api-gateway-list' } },
  { key: 'gateway', text: gateway.value?.name ?? gatewayId.value, to: { name: 'api-gateway-routes', params: { id: gatewayId.value } } },
  { key: 'action', text: isEdit.value ? 'Edit route' : 'New route' },
])

const handleSubmit = () => {
  errorMessage.value = ''
  try {
    const protocols: ('http' | 'https')[] = []
    if (form.protocols_http) protocols.push('http')
    if (form.protocols_https) protocols.push('https')
    const methods = HTTP_METHODS.filter(m => form.methods[m])
    const data = {
      name: form.name,
      service_id: form.service_id || undefined,
      protocols,
      methods: methods.length > 0 ? methods : undefined,
      paths: form.paths.filter(p => p.trim()),
      hosts: form.hosts.filter(h => h.trim()),
      enabled: form.enabled,
    }
    if (isEdit.value && routeId.value) {
      store.updateRoute(gatewayId.value, routeId.value, data)
    } else {
      store.createRoute(gatewayId.value, data)
    }
    router.push({ name: 'api-gateway-routes', params: { id: gatewayId.value } })
  } catch {
    errorMessage.value = 'An unexpected error occurred. Try again.'
  }
}

const handleCancel = () => {
  router.push({ name: 'api-gateway-routes', params: { id: gatewayId.value } })
}
</script>

<style scoped lang="scss">
@use "@kong/design-tokens/tokens/scss/variables" as *;

.route-form-page {
  display: flex;
  flex-direction: column;
  gap: $kui-space-70;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: $kui-space-40;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: $kui-space-50;
}

.list-input-row {
  align-items: center;
  display: flex;
  gap: $kui-space-50;
  margin-bottom: $kui-space-40;

  > :first-child {
    flex: 1;
  }

  .remove-btn {
    color: $kui-color-text-danger;
    flex-shrink: 0;

    &:not(:disabled):hover {
      background: $kui-color-background-danger-weakest !important;
      color: $kui-color-text-danger !important;
    }
  }
}

.add-btn {
  align-self: flex-start;
}
</style>
