<template>
  <div class="virtual-cluster-form-page">
    <AppPageHeader
      :title="isEdit ? 'Edit virtual cluster' : 'New virtual cluster'"
      :breadcrumbs="breadcrumbs"
    />

    <EntityBaseForm
      :is-editing="isEdit"
      :can-submit="isFormValid"
      entity-type="virtual-cluster"
      :error-message="errorMessage"
      :save-button-text="isEdit ? 'Save' : 'Create'"
      @submit="handleSubmit"
      @cancel="handleCancel"
    >
      <!-- Step 1: General information -->
      <EntityFormBlock
        :step="1"
        title="General information"
        description="Provide a name and select a backend cluster destination."
      >
        <KInput
          v-model.trim="form.name"
          data-testid="input-name"
          label="Name"
          placeholder="e.g., payments-cluster"
          required
        />

        <KInput
          v-model.trim="form.description"
          data-testid="input-description"
          label="Description"
          placeholder="e.g., Virtual cluster for payment services."
        />

        <KSelect
          v-model="form.destination_id"
          data-testid="select-destination"
          :items="backendClusterItems"
          label="Backend cluster"
          placeholder="Select a backend cluster"
          required
        />
      </EntityFormBlock>

      <!-- Step 2: Configuration -->
      <EntityFormBlock
        :step="2"
        title="Configuration"
        description="Configure access control and routing for this virtual cluster."
      >
        <div class="field-group">
          <KLabel>ACL mode</KLabel>
          <div class="radio-options">
            <KRadio
              v-model="form.acl_mode"
              card
              card-orientation="horizontal"
              description="Access control lists are enforced by the gateway."
              label="Enforce on gateway"
              selected-value="enforce_on_gateway"
            />
            <KRadio
              v-model="form.acl_mode"
              card
              card-orientation="horizontal"
              description="ACL enforcement is passed through to the backend cluster."
              label="Passthrough"
              selected-value="passthrough"
            />
          </div>
        </div>

        <KInput
          v-model.trim="form.dns_label"
          data-testid="input-dns-label"
          label="DNS label"
          :label-attributes="{ info: 'A DNS-compatible label used to construct the virtual cluster hostname. Must be lowercase alphanumeric and hyphens only.' }"
          placeholder="e.g., payments"
        />
      </EntityFormBlock>

      <!-- Step 3: Authentication -->
      <EntityFormBlock
        :step="3"
        title="Authentication"
        description="Define one or more authentication rules for clients connecting to this virtual cluster."
      >
        <div
          v-for="(auth, idx) in form.authentication"
          :key="idx"
          class="auth-rule-card"
          :data-testid="`auth-rule-${idx}`"
        >
          <div class="auth-rule-header">
            <span class="auth-rule-title">Authentication strategy</span>
            <KButton
              appearance="tertiary"
              class="remove-btn"
              :data-testid="`remove-auth-${idx}`"
              :disabled="form.authentication.length <= 1"
              @click="removeAuth(idx)"
            >
              Remove
            </KButton>
          </div>

          <!-- Type + Mediation row -->
          <div class="auth-rule-fields">
            <KSelect
              :model-value="auth.type"
              :items="authTypeItems"
              label="Authentication type"
              placeholder="Select an authentication type"
              required
              @update:model-value="(val) => onAuthTypeChange(idx, val as string)"
            />
            <KSelect
              v-if="showMediation(auth.type)"
              :model-value="auth.mediation"
              :items="getMediationItems(auth.type)"
              label="Mediation"
              required
              @update:model-value="(val) => onMediationChange(idx, val as MediationType)"
            >
              <template #item-template="{ item }">
                <div class="mediation-item">
                  <div class="mediation-item-title">{{ item.label }}</div>
                  <div class="mediation-item-description">{{ MEDIATION_DESCRIPTIONS[item.value as MediationType] }}</div>
                </div>
              </template>
            </KSelect>
          </div>

          <!-- SASL/PLAIN credentials -->
          <template v-if="auth.type === 'sasl_plain' && auth.mediation">
            <div class="field-group">
              <div class="credential-pair-header">
                <KLabel>Username</KLabel>
                <KLabel>Password</KLabel>
              </div>
              <div
                v-for="(cred, ci) in (auth.sasl_plain_credentials ?? [])"
                :key="ci"
                class="credential-pair-row"
              >
                <div class="credential-pair-col">
                  <KInput
                    v-model.trim="cred.username"
                    placeholder="e.g., username, ${vault.env.kafka_username}"
                  />
                </div>
                <div class="credential-pair-col">
                  <KInput
                    v-model.trim="cred.password"
                    type="password"
                    placeholder="e.g., password, ${vault.env.kafka_password}"
                  />
                </div>
                <KButton
                  appearance="tertiary"
                  size="small"
                  :disabled="(auth.sasl_plain_credentials ?? []).length <= 1"
                  @click="removeSaslPlainCredential(idx, ci)"
                >
                  <CloseIcon decorative />
                </KButton>
              </div>
              <KButton
                appearance="tertiary"
                class="array-add-btn"
                @click="addSaslPlainCredential(idx)"
              >
                <AddIcon decorative />
                Add a username and password
              </KButton>
            </div>

            <hr class="auth-divider" />

            <!-- Advanced configuration -->
            <div class="advanced-section">
              <KButton
                appearance="tertiary"
                class="advanced-toggle-btn"
                @click="auth._showAdvanced = !auth._showAdvanced"
              >
                <ChevronDownIcon
                  class="advanced-chevron"
                  :class="{ 'advanced-chevron--open': auth._showAdvanced }"
                  decorative
                />
                {{ auth._showAdvanced ? 'Hide advanced configuration' : 'Show advanced configuration' }}
              </KButton>

              <div v-if="auth._showAdvanced" class="advanced-config">
                <div class="field-group">
                  <KInputSwitch
                    :model-value="auth.principal_lookup ?? false"
                    label="Use principal lookup"
                    :label-attributes="{ info: 'When enabled, Kong Identity will attempt to resolve the principal associated with these credentials.' }"
                    @update:model-value="(v) => (form.authentication[idx].principal_lookup = v as boolean)"
                  />

                  <template v-if="auth.principal_lookup">
                    <div class="radio-group">
                      <KLabel>If principal lookup fails</KLabel>
                      <div class="radio-option">
                        <KRadio
                          :model-value="auth.principal_lookup_failure ?? 'reject_request'"
                          selected-value="reject_request"
                          label="Reject the request"
                          @update:model-value="() => (form.authentication[idx].principal_lookup_failure = 'reject_request')"
                        />
                        <span class="radio-help-text">Fail authentication if Kong Identity cannot resolve the principal.</span>
                      </div>
                      <div class="radio-option">
                        <KRadio
                          :model-value="auth.principal_lookup_failure ?? 'reject_request'"
                          selected-value="continue_without_principal"
                          label="Continue without a principal"
                          @update:model-value="() => (form.authentication[idx].principal_lookup_failure = 'continue_without_principal')"
                        />
                        <span class="radio-help-text">Allow the request to continue without principal enrichment.</span>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </template>

          <!-- Auth server — SASL/OAUTHBEARER + validate_forward or terminate only -->
          <template v-if="showAuthServer(auth)">
            <div class="field-group">
              <KLabel>Who should manage authentication and credentials?</KLabel>
              <div class="option-cards-row">
                <button
                  class="option-card"
                  :class="{ 'option-card--selected': auth.auth_server_type === 'kong_managed' }"
                  type="button"
                  @click="onAuthServerTypeChange(idx, 'kong_managed')"
                >
                  <div class="option-card-radio" />
                  <div class="option-card-body">
                    <div class="option-card-icon">
                      <KeyIcon decorative />
                    </div>
                    <div class="option-card-name">Kong Identity</div>
                    <div class="option-card-description">Use Kong to generate, authenticate, and authorize API access. Kong Identity provides OAuth 2.0 and OpenID Connect authentication.</div>
                  </div>
                </button>
                <button
                  class="option-card"
                  :class="{ 'option-card--selected': auth.auth_server_type === 'external' }"
                  type="button"
                  @click="onAuthServerTypeChange(idx, 'external')"
                >
                  <div class="option-card-radio" />
                  <div class="option-card-body">
                    <div class="option-card-icon">
                      <NetworkIcon decorative />
                    </div>
                    <div class="option-card-name">External auth server</div>
                    <div class="option-card-description">Connect to your existing identity provider to manage authentication outside of Kong.</div>
                  </div>
                </button>
              </div>
            </div>

            <KSelect
              v-if="auth.auth_server_type === 'kong_managed'"
              :model-value="auth.auth_server_id"
              :items="authServerItems"
              data-testid="select-auth-server"
              label="Authentication server"
              placeholder="Select an authentication server"
              required
              @update:model-value="(val) => { form.authentication[idx].auth_server_id = (val as string) || undefined }"
            >
              <template #dropdown-footer-text>
                <div class="create-auth-server-footer" @click="router.push({ name: 'auth-server-create' })">
                  <span class="create-auth-server-link">+ Create auth server</span>
                  <span class="create-auth-server-hint">You'll need to return here after creating a auth server in Kong Identity. Your progress won't be saved.</span>
                </div>
              </template>
            </KSelect>

            <VirtualClusterOAuthBearerConfig
              v-if="auth.auth_server_type"
              v-model="form.authentication[idx]"
              :auth-index="idx"
            />

          </template>
        </div>

        <KButton
          appearance="tertiary"
          class="add-auth-btn"
          data-testid="add-auth-btn"
          @click="addAuth"
        >
          <AddIcon decorative />
          Add authentication
        </KButton>
      </EntityFormBlock>
    </EntityBaseForm>
  </div>

</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { KInput, KSelect, KRadio, KButton, KLabel, KInputSwitch } from '@kong/kongponents'
import { AddIcon, CloseIcon, ChevronDownIcon, KeyIcon, NetworkIcon } from '@kong/icons'
import AppPageHeader from '@/components/AppPageHeader.vue'
import EntityBaseForm from '@/components/EntityBaseForm.vue'
import EntityFormBlock from '@/components/EntityFormBlock.vue'
import VirtualClusterOAuthBearerConfig from '@/components/event-gateway/VirtualClusterOAuthBearerConfig.vue'
import { useEventGatewayStore } from '@/composables/useEventGatewayStore'
import { useAuthServerStore } from '@/composables/useAuthServerStore'
import type { VirtualClusterAuthItem } from '@/types'

type MediationType = 'passthrough' | 'validate_forward' | 'terminate'

const MEDIATION_DESCRIPTIONS: Record<MediationType, string> = {
  passthrough: 'Credentials are forwarded to the backend cluster as-is.',
  validate_forward: 'Credentials are validated by the gateway and then forwarded.',
  terminate: 'Authentication is terminated at the gateway; credentials are not forwarded.',
}

const route = useRoute()
const router = useRouter()
const store = useEventGatewayStore()
const authServerStore = useAuthServerStore()

const gatewayId = computed(() => route.params.id as string)
const vcId = computed(() => route.params.vcId as string | undefined)
const isEdit = computed(() => !!vcId.value)

const gateway = computed(() => store.getById(gatewayId.value))
const existing = computed(() => isEdit.value ? store.getVirtualClusterById(gatewayId.value, vcId.value!) : undefined)

const form = reactive({
  name: existing.value?.name ?? '',
  description: existing.value?.description ?? '',
  destination_id: existing.value?.destination_id ?? '',
  acl_mode: (existing.value?.acl_mode ?? 'enforce_on_gateway') as 'enforce_on_gateway' | 'passthrough',
  dns_label: existing.value?.dns_label ?? '',
  authentication: (existing.value?.authentication ?? [{ type: 'anonymous' as const }]).map(a => ({ ...a })) as VirtualClusterAuthItem[],
})

const errorMessage = ref('')
const isAuthRuleValid = (auth: VirtualClusterAuthItem): boolean => {
  if (
    auth.type === 'sasl_oauthbearer' &&
    auth.mediation === 'validate_forward' &&
    auth.auth_server_type === 'external'
  ) {
    return !!(auth.jwks?.endpoint ?? auth.jwks_url ?? '').trim()
  }

  return true
}

const isFormValid = computed(() =>
  !!form.name.trim() &&
  !!form.destination_id &&
  form.authentication.every(isAuthRuleValid),
)

const breadcrumbs = computed(() => [
  { key: 'event-gateway', text: 'Event Gateway', to: { name: 'event-gateway-list' } },
  {
    key: 'gateway',
    text: gateway.value?.name ?? gatewayId.value,
    to: { name: 'event-gateway-virtual-clusters', params: { id: gatewayId.value } },
  },
  { key: 'action', text: isEdit.value ? 'Edit virtual cluster' : 'New virtual cluster' },
])

// ── Selects ─────────────────────────────────────────────────────────

const backendClusterItems = computed(() =>
  store.getBackendClusters(gatewayId.value).map(bc => ({ label: bc.name, value: bc.id })),
)

// ── Auth type options ────────────────────────────────────────────────

const authTypeItems = [
  { label: 'Anonymous', value: 'anonymous' },
  { label: 'SASL/PLAIN', value: 'sasl_plain' },
  { label: 'SASL/OAUTHBEARER', value: 'sasl_oauthbearer' },
  { label: 'SASL/SCRAM-SHA-256', value: 'sasl_scram_sha256' },
  { label: 'SASL/SCRAM-SHA-512', value: 'sasl_scram_sha512' },
  { label: 'Client certificate', value: 'client_certificate' },
]

const showMediation = (type: string): boolean =>
  type === 'sasl_plain' || type === 'sasl_oauthbearer'

const getMediationItems = (type: string) => {
  const all = [
    { label: 'Passthrough', value: 'passthrough' as MediationType },
    { label: 'Validate and forward', value: 'validate_forward' as MediationType },
    { label: 'Terminate', value: 'terminate' as MediationType },
  ]
  return type === 'sasl_plain' ? all.filter(i => i.value !== 'validate_forward') : all
}

// ── Auth server items ────────────────────────────────────────────────

const authServerItems = computed(() =>
  authServerStore.getAll().map(as => ({ label: as.name, value: as.id })),
)

const showAuthServer = (auth: VirtualClusterAuthItem): boolean =>
  auth.type === 'sasl_oauthbearer' &&
  (auth.mediation === 'validate_forward' || auth.mediation === 'terminate')

// ── Auth rule handlers ───────────────────────────────────────────────

const clearOAuthValidateFields = (auth: VirtualClusterAuthItem): void => {
  delete auth.jwks_url
  delete auth.jwks
  delete auth.claims_mapping
  delete auth.validate
}

const clearPrincipalMappingFields = (auth: VirtualClusterAuthItem): void => {
  delete auth.jwt_claim_name
  delete auth.match_against
  delete auth.custom_identity_name
}

const applyExternalAuthServerDefaults = (auth: VirtualClusterAuthItem): void => {
  auth.auth_server_type = 'external'
  auth.principal_lookup = true
  auth.principal_lookup_failure ??= 'reject_request'
  auth.principal_match_method = 'token_subject'
  delete auth.auth_server_id
  clearPrincipalMappingFields(auth)
}

const applyKongManagedAuthServerDefaults = (auth: VirtualClusterAuthItem): void => {
  auth.auth_server_type = 'kong_managed'
  auth.principal_lookup = true
  auth.principal_lookup_failure ??= 'reject_request'
  auth.principal_match_method = 'kong_identity_client'
  clearOAuthValidateFields(auth)
  clearPrincipalMappingFields(auth)
}

const onAuthTypeChange = (idx: number, type: string): void => {
  const auth: VirtualClusterAuthItem = { type: type as VirtualClusterAuthItem['type'] }
  if (showMediation(type)) {
    auth.mediation = 'passthrough'
  }
  if (type === 'sasl_plain') {
    auth.sasl_plain_credentials = [{ username: '', password: '' }]
    auth.principal_lookup = false
    auth.principal_lookup_failure = 'reject_request'
    auth._showAdvanced = false
  }
  form.authentication[idx] = auth
}

const addSaslPlainCredential = (idx: number): void => {
  const auth = form.authentication[idx]
  if (!auth.sasl_plain_credentials) auth.sasl_plain_credentials = []
  auth.sasl_plain_credentials.push({ username: '', password: '' })
}

const removeSaslPlainCredential = (idx: number, ci: number): void => {
  form.authentication[idx].sasl_plain_credentials?.splice(ci, 1)
}

const onMediationChange = (idx: number, val: MediationType): void => {
  const auth = form.authentication[idx]
  auth.mediation = val
  if (val === 'validate_forward' || val === 'terminate') {
    if (!auth.auth_server_type) {
      applyKongManagedAuthServerDefaults(auth)
    }
    if (val !== 'validate_forward') {
      clearOAuthValidateFields(auth)
    }
  } else {
    delete auth.auth_server_type
    delete auth.auth_server_id
    delete auth.principal_lookup
    delete auth.principal_lookup_failure
    delete auth.principal_match_method
    clearOAuthValidateFields(auth)
    clearPrincipalMappingFields(auth)
  }
}

const onAuthServerTypeChange = (idx: number, val: 'kong_managed' | 'external'): void => {
  if (val === 'external') {
    applyExternalAuthServerDefaults(form.authentication[idx])
  } else {
    applyKongManagedAuthServerDefaults(form.authentication[idx])
  }
}

const addAuth = (): void => {
  form.authentication.push({ type: 'anonymous' })
}

const removeAuth = (idx: number): void => {
  form.authentication.splice(idx, 1)
}

// ── Submit / cancel ──────────────────────────────────────────────────

const trimEmptyOAuthObjects = (auth: VirtualClusterAuthItem): void => {
  if (auth.jwks_url && !auth.jwks?.endpoint) {
    auth.jwks = { ...auth.jwks, endpoint: auth.jwks_url }
  }
  delete auth.jwks_url

  if (auth.validate?.audiences) {
    auth.validate.audiences = auth.validate.audiences
      .map(audience => ({ name: audience.name.trim() }))
      .filter(audience => !!audience.name)

    if (auth.validate.audiences.length === 0) {
      delete auth.validate.audiences
    }
  }

  if (Object.keys(auth.jwks || {}).length === 0) {
    delete auth.jwks
  }
  if (Object.keys(auth.claims_mapping || {}).length === 0) {
    delete auth.claims_mapping
  }
  if (Object.keys(auth.validate || {}).length === 0) {
    delete auth.validate
  }
}

const sanitizeAuthRule = (authRule: VirtualClusterAuthItem): VirtualClusterAuthItem => {
  const auth: VirtualClusterAuthItem = { ...authRule }
  if (authRule.jwks) {
    auth.jwks = { ...authRule.jwks }
  }
  if (authRule.claims_mapping) {
    auth.claims_mapping = { ...authRule.claims_mapping }
  }
  if (authRule.validate) {
    auth.validate = { ...authRule.validate }
    if (authRule.validate.audiences) {
      auth.validate.audiences = authRule.validate.audiences.map(audience => ({ ...audience }))
    }
  }

  if (auth.auth_server_type !== 'external' || auth.mediation !== 'validate_forward') {
    clearOAuthValidateFields(auth)
  } else {
    trimEmptyOAuthObjects(auth)
  }

  if (auth.auth_server_type !== 'kong_managed') {
    delete auth.auth_server_id
  }

  if (
    auth.principal_match_method !== 'custom_claim' &&
    auth.principal_match_method !== 'custom_jwt_claim'
  ) {
    clearPrincipalMappingFields(auth)
  }

  if (auth.principal_match_method !== 'custom_jwt_claim') {
    delete auth.match_against
  }

  if (auth.principal_match_method === 'custom_jwt_claim' && auth.match_against !== 'custom_identity') {
    delete auth.custom_identity_name
  }

  // Strip UI-only state
  delete auth._showAdvanced

  // Clean up empty SASL/PLAIN credentials
  if (auth.sasl_plain_credentials) {
    auth.sasl_plain_credentials = auth.sasl_plain_credentials.filter(c => c.username.trim() || c.password.trim())
    if (!auth.sasl_plain_credentials.length) delete auth.sasl_plain_credentials
  }

  return auth
}

const handleSubmit = (): void => {
  errorMessage.value = ''
  try {
    const data = {
      name: form.name,
      description: form.description || undefined,
      destination_id: form.destination_id || undefined,
      acl_mode: form.acl_mode,
      dns_label: form.dns_label || undefined,
      authentication: form.authentication.map(sanitizeAuthRule),
    }
    if (isEdit.value && vcId.value) {
      store.updateVirtualCluster(gatewayId.value, vcId.value, data)
    } else {
      store.createVirtualCluster(gatewayId.value, data)
    }
    router.push({ name: 'event-gateway-virtual-clusters', params: { id: gatewayId.value } })
  } catch {
    errorMessage.value = 'An unexpected error occurred. Try again.'
  }
}

const handleCancel = (): void => {
  router.push({ name: 'event-gateway-virtual-clusters', params: { id: gatewayId.value } })
}
</script>

<style scoped lang="scss">
@use "@kong/design-tokens/tokens/scss/variables" as *;

.virtual-cluster-form-page {
  display: flex;
  flex-direction: column;
  gap: $kui-space-70;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: $kui-space-40;
}

.radio-options {
  display: flex;
  gap: $kui-space-70;
}

.option-cards-row {
  display: flex;
  gap: $kui-space-70;
}

.option-card {
  align-items: flex-start;
  background: $kui-color-background;
  border: $kui-border-width-10 solid $kui-color-border;
  border-radius: $kui-border-radius-30;
  cursor: pointer;
  display: flex;
  flex: 1;
  flex-direction: row;
  gap: $kui-space-50;
  padding: $kui-space-60;
  text-align: left;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    border-color: $kui-color-border-primary;
    box-shadow: 0 0 0 1px $kui-color-border-primary;
  }

  .option-card-radio {
    border: $kui-border-width-10 solid $kui-color-border-neutral;
    border-radius: $kui-border-radius-circle;
    flex-shrink: 0;
    height: 16px;
    margin-top: 2px;
    position: relative;
    transition: border-color 0.15s ease, background-color 0.15s ease;
    width: 16px;

    &::after {
      background: $kui-color-background;
      border-radius: $kui-border-radius-circle;
      content: '';
      height: 6px;
      left: 50%;
      opacity: 0;
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 6px;
    }
  }

  // --selected must come after .option-card-radio so opacity: 1 wins
  &--selected {
    border-color: $kui-color-border-primary;
    box-shadow: 0 0 0 2px $kui-color-border-primary inset;

    .option-card-radio {
      background-color: $kui-color-background-primary;
      border-color: $kui-color-border-primary;

      &::after {
        opacity: 1;
      }
    }
  }

  .option-card-body {
    display: flex;
    flex-direction: column;
    gap: $kui-space-40;
    min-width: 0;
  }

  .option-card-icon {
    color: $kui-color-text-primary;
    display: flex;
    flex-shrink: 0;
    height: 24px;
    width: 24px;
  }

  .option-card-name {
    color: $kui-color-text;
    font-size: $kui-font-size-30;
    font-weight: $kui-font-weight-semibold;
    line-height: $kui-line-height-40;
  }

  .option-card-description {
    color: $kui-color-text-neutral;
    font-size: $kui-font-size-20;
    line-height: $kui-line-height-30;
  }
}

.auth-rule-card {
  background: $kui-color-background;
  border: $kui-border-width-10 solid $kui-color-border;
  border-radius: $kui-border-radius-30;
  display: flex;
  flex-direction: column;
  gap: $kui-space-70;
  padding: $kui-space-70 $kui-space-80;
}

.auth-rule-header {
  align-items: center;
  display: flex;
  justify-content: space-between;

  .auth-rule-title {
    color: $kui-color-text;
    font-size: $kui-font-size-40;
    font-weight: $kui-font-weight-bold;
    line-height: $kui-line-height-60;
  }

  .remove-btn {
    color: $kui-color-text-danger;

    &:not(:disabled):hover {
      background: $kui-color-background-danger-weakest !important;
      color: $kui-color-text-danger !important;
    }
  }
}

.auth-rule-fields {
  display: flex;
  gap: $kui-space-70;

  > * {
    flex: 1;
  }

}

.add-auth-btn {
  align-self: flex-start;
}

.create-auth-server-footer {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: $kui-space-20;
  padding: $kui-space-20 $kui-space-0;
  pointer-events: auto;

  .create-auth-server-link {
    color: $kui-color-text-primary;
    font-size: $kui-font-size-30;
    font-weight: $kui-font-weight-medium;
  }

  .create-auth-server-hint {
    color: $kui-color-text-neutral;
    font-size: $kui-font-size-20;
    line-height: $kui-line-height-20;
  }
}

.mediation-item {
  display: flex;
  flex-direction: column;
  gap: $kui-space-10;

  .mediation-item-title {
    font-weight: $kui-font-weight-medium;
  }

  .mediation-item-description {
    color: $kui-color-text-neutral;
    font-size: $kui-font-size-20;
    line-height: $kui-line-height-30;
  }
}

// ── SASL/PLAIN credential rows ───────────────────────────────────────

.credential-pair-header {
  display: flex;
  gap: $kui-space-70;

  // First label matches auth-type column width; second fills the rest
  :deep(.k-label:first-child) {
    flex: 0 0 calc(50% - #{$kui-space-70} / 2);
    min-width: 0;
  }

  :deep(.k-label:last-child) {
    flex: 1;
    min-width: 0;
  }
}


.credential-pair-row {
  align-items: flex-start;
  display: flex;
  gap: $kui-space-70;

  > .k-button {
    flex-shrink: 0;
    margin-top: 4px;
  }
}

.credential-pair-col {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: $kui-space-20;
  min-width: 0;

  // Pin username column to the same width as auth-type above it so
  // password's left edge aligns with mediation's left edge
  &:first-child {
    flex: 0 0 calc(50% - #{$kui-space-70} / 2);
  }
}

.vault-link {
  color: var(--kui-color-text-neutral, $kui-color-text-neutral);
  font-family: var(--kui-font-family-text, $kui-font-family-text);
  font-size: var(--kui-font-size-20, $kui-font-size-20);
  font-weight: var(--kui-font-weight-regular, $kui-font-weight-regular);
  line-height: var(--kui-line-height-20, $kui-line-height-20);

  a {
    color: var(--kui-color-text-primary, $kui-color-text-primary);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.array-add-btn {
  align-self: flex-start;
}

// ── Auth divider & advanced configuration ────────────────────────────

.auth-divider {
  border: none;
  border-top: $kui-border-width-10 solid $kui-color-border;
  margin: 0;
}

.advanced-section {
  display: flex;
  flex-direction: column;
  gap: $kui-space-50;
}

.advanced-toggle-btn {
  align-items: center;
  align-self: flex-start;
  display: flex;
  gap: $kui-space-30;
}

.advanced-chevron {
  transition: transform 0.2s ease;

  &--open {
    transform: rotate(180deg);
  }
}

.advanced-config {
  border: $kui-border-width-10 solid $kui-color-border;
  border-radius: $kui-border-radius-20;
  padding: $kui-space-60;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: $kui-space-40;
}

.radio-option {
  display: flex;
  flex-direction: column;
  gap: $kui-space-10;
}

.radio-help-text {
  color: $kui-color-text-neutral;
  font-size: $kui-font-size-20;
  line-height: $kui-line-height-30;
  padding-left: 24px; // align under radio label
}


</style>
