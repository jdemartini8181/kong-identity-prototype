<template>
  <KSlideout
    :visible="visible"
    :close-on-blur="!showKeyModal && !showBasicAuthModal && !showDpaModal"
    max-width="768px"
    @close="emit('update:visible', false)"
  >
    <template #title>
      <div class="slideout-title">
        <AccountTreeIcon :size="20" decorative class="slideout-title-icon" />
        {{ isEditMode ? editTitle : 'Add authentication' }}
      </div>
    </template>

    <div class="slideout-body">

      <!-- Description -->
      <p class="slideout-description">
        <template v-if="isEditMode">Update the configuration for this authentication type.</template>
        <template v-else>
          Choose how this principal authenticates.
          <a href="#" class="slideout-description-link" @click.prevent>View documentation</a>.
        </template>
      </p>

      <!-- DPA warning — org admin, not yet accepted -->
      <KAlert
        v-if="isOrgAdmin && !dpaAccepted"
        appearance="warning"
        :show-icon="false"
      >
        Basic auth is unavailable for your organization until you accept the updated Data Protection Addendum. <a class="dpa-warning-link" href="#" @click.prevent="openModal">Review and accept.</a>
      </KAlert>

      <!-- DPA info — non-org admin -->
      <KAlert
        v-if="!isOrgAdmin"
        appearance="info"
        :show-icon="false"
      >
        An organization administrator must accept the updated Data Protection Addendum before basic auth can be configured.
      </KAlert>

      <!-- Content card -->
      <div class="slideout-content">

        <!-- Method select (add mode only) -->
        <div v-if="!isEditMode" class="field-group">
          <KLabel required>Authentication type</KLabel>
          <KSelect
            v-model="method"
            :items="methodOptions"
            placeholder="Select authentication type"
          />
        </div>

        <!-- ── Key method ──────────────────────────────────── -->
        <template v-if="method === 'key'">
          <template v-if="!isEditMode">
            <div class="radio-cards-row">
              <KRadio
                v-model="form.keyGeneration"
                selected-value="auto"
                card
                card-orientation="horizontal"
                label="Generate automatically"
                description="A key is generated for you."
              />
              <KRadio
                v-model="form.keyGeneration"
                selected-value="manual"
                card
                card-orientation="horizontal"
                label="Enter manually"
                description="Use an existing key from your system."
              />
            </div>
            <div v-if="form.keyGeneration === 'manual'" class="field-group">
              <KLabel>Key value</KLabel>
              <KInput
                v-model="form.keyValue"
                placeholder="Enter an API key"
              />
            </div>
          </template>
          <div v-else-if="form.keyGeneration === 'manual'" class="field-group">
            <KLabel>Key value</KLabel>
            <KInput
              v-model="form.keyValue"
              placeholder="Enter an API key"
            />
          </div>
          <div class="field-group">
            <KLabel required>Expiration</KLabel>
            <KDateTimePicker
              :model-value="expiresAtValue"
              mode="relativeDateTime"
              :time-periods="EXPIRY_PRESETS"
              :min-date="new Date()"
              placeholder="Select a date and time"
              @change="handleExpiresAtChange"
            />
          </div>
        </template>

        <!-- ── Basic auth method ───────────────────────────── -->
        <template v-else-if="method === 'basic_auth'">
          <div class="field-group">
            <KLabel required>Username</KLabel>
            <KInput
              v-model="form.username"
              placeholder="e.g., payments-service"
            />
          </div>
          <div class="field-group">
            <KLabel required>Password</KLabel>
            <!-- Edit mode: single editable password field -->
            <template v-if="isEditMode">
              <div class="password-field-wrapper">
                <KInput
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Enter a password"
                  class="password-field-input"
                />
                <button
                  type="button"
                  class="password-visibility-toggle"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                  @click.stop="showPassword = !showPassword"
                >
                  <VisibilityOffIcon v-if="showPassword" :size="16" decorative />
                  <VisibilityIcon v-else :size="16" decorative />
                </button>
              </div>
            </template>
            <!-- Add mode: radio cards -->
            <template v-else>
              <div class="radio-stack">
                <KRadio v-model="form.passwordGeneration" selected-value="auto" label="Generate password automatically" />
                <div class="radio-inline">
                  <KRadio v-model="form.passwordGeneration" selected-value="manual" label="Enter password manually" />
                  <div v-if="form.passwordGeneration === 'manual'" class="password-field-wrapper">
                    <KInput
                      v-model="form.password"
                      :type="showPassword ? 'text' : 'password'"
                      placeholder="Enter a password"
                      class="password-field-input"
                    />
                    <button
                      type="button"
                      class="password-visibility-toggle"
                      :aria-label="showPassword ? 'Hide password' : 'Show password'"
                      @click.stop="showPassword = !showPassword"
                    >
                      <VisibilityOffIcon v-if="showPassword" :size="16" decorative />
                      <VisibilityIcon v-else :size="16" decorative />
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </div>
          <div class="field-group">
            <KLabel required>Expiration</KLabel>
            <KDateTimePicker
              :model-value="expiresAtValue"
              mode="relativeDateTime"
              :time-periods="EXPIRY_PRESETS"
              :min-date="new Date()"
              placeholder="Select a date and time"
              @change="handleExpiresAtChange"
            />
          </div>
        </template>

        <!-- ── OAuth method ────────────────────────────────── -->
        <template v-else-if="method === 'oauth'">
          <div class="radio-cards-row">
            <KRadio
              v-model="form.oauthServerType"
              selected-value="kong"
              card
              card-orientation="horizontal"
              label="Use Kong Identity auth server"
              description="Kong manages the OAuth provider and handles token issuance and validation."
            />
            <KRadio
              v-model="form.oauthServerType"
              selected-value="external"
              card
              card-orientation="horizontal"
              label="Use external auth server"
              description="Connect to your existing OAuth provider to manage authentication outside of Kong."
            />
          </div>

          <!-- Kong Identity fields -->
          <template v-if="form.oauthServerType === 'kong'">
            <div class="field-group">
              <KLabel required>Authorization server</KLabel>
              <KSelect
                v-model="form.authServer"
                :items="authServerOptions"
                placeholder="Select authorization server"
                @update:model-value="handleAuthServerSelect"
              >
                <template #item-template="{ item }">
                  <div v-if="item.isAction" class="select-action-item">
                    <span class="select-action-label">
                      <AddIcon :size="14" decorative class="select-action-icon" />
                      {{ item.label }}
                    </span>
                    <p class="select-action-desc">{{ item.description }}</p>
                  </div>
                  <span v-else>{{ item.label }}</span>
                </template>
              </KSelect>
            </div>
            <div class="field-group">
              <KLabel required>Client</KLabel>
              <KSelect
                v-model="form.oauthClient"
                :items="clientOptions"
                placeholder="Select a client"
                :disabled="!form.authServer"
                @update:model-value="handleClientSelect"
              >
                <template #item-template="{ item }">
                  <div v-if="item.isAction" class="select-action-item">
                    <span class="select-action-label">
                      <AddIcon :size="14" decorative class="select-action-icon" />
                      {{ item.label }}
                    </span>
                    <p class="select-action-desc">{{ item.description }}</p>
                  </div>
                  <span v-else>{{ item.label }}</span>
                </template>
              </KSelect>
            </div>
          </template>

          <!-- External auth server fields -->
          <template v-else>
            <div class="field-group">
              <KLabel required>Issuer</KLabel>
              <KInput
                v-model="form.issuer"
                placeholder="e.g., https://acme.okta.com"
              />
              <p class="field-help">The issuer URL of the external identity provider.</p>
            </div>
            <div class="field-group">
              <KLabel required>Client ID</KLabel>
              <KInput
                v-model="form.clientId"
                placeholder="e.g., my-client-id-12345"
              />
              <p class="field-help">The client ID provided by your OAuth provider to identify this application.</p>
            </div>
            <div class="field-group">
              <KLabel required>Client secret</KLabel>
              <div class="password-field-wrapper">
                <KInput
                  v-model="form.clientSecret"
                  :type="showClientSecret ? 'text' : 'password'"
                  placeholder="Enter client secret"
                  class="password-field-input"
                />
                <button
                  type="button"
                  class="password-visibility-toggle"
                  :aria-label="showClientSecret ? 'Hide client secret' : 'Show client secret'"
                  @click.stop="showClientSecret = !showClientSecret"
                >
                  <VisibilityOffIcon v-if="showClientSecret" :size="16" decorative />
                  <VisibilityIcon v-else :size="16" decorative />
                </button>
              </div>
              <p class="field-help">The client secret provided by your OAuth provider to authenticate this application.</p>
            </div>
          </template>
        </template>

        <!-- ── Consumer method ─────────────────────────────── -->
        <template v-else-if="method === 'consumer'">
          <p class="consumer-note">
            Principals are an alternative to consumers, designed to simplify authentication.
            Link a consumer to maintain existing configurations.
            <a href="#" class="slideout-description-link" @click.prevent>Learn when to link a consumer</a>.
          </p>
          <div class="field-group">
            <KLabel required>Control plane</KLabel>
            <KSelect
              v-model="form.controlPlane"
              :items="CONTROL_PLANE_OPTIONS"
              enable-filtering
              :filter-function="controlPlaneFilter"
              placeholder="Search by name or UUID"
            />
            <p class="field-help">Choose the control plane where the consumer exists.</p>
          </div>
          <div class="field-group">
            <KLabel required>Consumer</KLabel>
            <KSelect
              v-model="form.consumer"
              :items="CONSUMER_OPTIONS"
              enable-filtering
              :filter-function="consumerFilter"
              placeholder="Search by username or custom ID"
              :disabled="!form.controlPlane"
            />
            <p class="field-help">Choose the consumer that represents this principal.</p>
          </div>
        </template>

        <!-- ── External identifier method ─────────────────── -->
        <template v-else-if="method === 'external_identifier'">
          <div class="field-group">
            <KLabel required>Name</KLabel>
            <KInput
              v-model="form.extName"
              placeholder="e.g., acme_workload_id"
            />
            <p class="field-help">A unique key that defines the identifier type.</p>
          </div>
          <div class="field-group">
            <KLabel required>Value</KLabel>
            <KInput
              v-model="form.extValue"
              placeholder="e.g., wl-3414-us-west"
            />
            <p class="field-help">The identifier value from your system.</p>
          </div>
        </template>

      </div>

      <!-- Footer actions -->
      <div class="slideout-actions">
        <KButton
          appearance="primary"
          :disabled="!isValid"
          @click="handleAdd"
        >
          {{ isEditMode ? 'Update' : 'Add' }}
        </KButton>
        <KButton
          v-if="!isEditMode"
          appearance="secondary"
          :disabled="!isValid"
          @click="handleAddAnother"
        >
          Add and create another
        </KButton>
        <KButton appearance="tertiary" @click="emit('update:visible', false)">
          Cancel
        </KButton>
      </div>

    </div>
  </KSlideout>

  <KModal
    :visible="showKeyModal"
    :z-index="10000"
    title="Key created"
    :action-button-text="isAddAnother ? 'Copy and continue' : 'Copy secret and close'"
    cancel-button-text="Cancel"
    @proceed="copyAndClose"
    @cancel="dismissKeyModal"
  >
    <div class="key-modal-body">
      <KAlert appearance="info" :show-icon="false" :show-close="false">
        The secret is shown only once. Please copy it now and store it securely.
      </KAlert>
      <div class="key-secret-field">
        <KLabel>Secret</KLabel>
        <div class="key-secret-display">
          <code class="key-secret-value">{{ generatedKey }}</code>
          <button class="key-secret-copy" type="button" aria-label="Copy secret" @click="copyKeyInline">
            <CopyIcon :size="16" decorative />
          </button>
        </div>
      </div>
    </div>
  </KModal>

  <DpaModal
    v-if="showDpaModal"
    @accept="acceptDpa"
    @dismiss="dismissModal"
  />

  <KModal
    :visible="showBasicAuthModal"
    :z-index="10000"
    title="Credentials created"
    action-button-text="Copy password and close"
    cancel-button-text="Cancel"
    @proceed="copyBasicAuthAndClose"
    @cancel="dismissBasicAuthModal"
  >
    <div class="key-modal-body">
      <KAlert appearance="info" :show-icon="false" :show-close="false">
        The password is shown only once. Please copy it now and store it securely.
      </KAlert>
      <div class="key-secret-field">
        <KLabel>Username</KLabel>
        <div class="key-secret-display">
          <code class="key-secret-value">{{ basicAuthUsername }}</code>
          <button class="key-secret-copy" type="button" aria-label="Copy username" @click="copyUsernameInline">
            <CopyIcon :size="16" decorative />
          </button>
        </div>
      </div>
      <div class="key-secret-field">
        <KLabel>Password</KLabel>
        <div class="key-secret-display">
          <code class="key-secret-value">{{ generatedPassword }}</code>
          <button class="key-secret-copy" type="button" aria-label="Copy password" @click="copyPasswordInline">
            <CopyIcon :size="16" decorative />
          </button>
        </div>
      </div>
    </div>
  </KModal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { AccountTreeIcon, AddIcon, CopyIcon, VisibilityIcon, VisibilityOffIcon } from '@kong/icons'
import {
  KSlideout,
  KSelect,
  KInput,
  KLabel,
  KRadio,
  KButton,
  KAlert,
  KModal,
  KDateTimePicker,
} from '@kong/kongponents'
import type { TimeRange, TimeFrameSection } from '@kong/kongponents'
import { useAuthServerStore } from '@/composables/useAuthServerStore'
import { useDpaState } from '@/composables/useDpaState'
import DpaModal from '@/components/DpaModal.vue'
import type { PrincipalIdentitySource, IdentitySourceMethod } from '@/types'

const authServerStore = useAuthServerStore()
const router = useRouter()
const { dpaAccepted, showDpaModal, isOrgAdmin, acceptDpa, dismissModal, openModal } = useDpaState()

const props = defineProps<{
  visible: boolean
  editSource?: Omit<PrincipalIdentitySource, 'id'> | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'add': [source: Omit<PrincipalIdentitySource, 'id'>]
  'update': [source: Omit<PrincipalIdentitySource, 'id'>]
}>()

const methodOptions = computed(() => {
  const basicRestricted = !dpaAccepted.value || !isOrgAdmin.value
  return [
    { label: 'Key', value: 'key' },
    { label: 'Basic auth', value: 'basic_auth', disabled: basicRestricted },
    { label: 'OAuth client', value: 'oauth' },
    { label: 'Consumer linking', value: 'consumer' },
    { label: 'External identifier', value: 'external_identifier' },
  ]
})

const ADD_AUTH_SERVER_ITEM = {
  label: 'Add authorization server',
  value: '__add_auth_server__',
  isAction: true,
  description: "You'll need to return here after creating an authorization server. Your progress won't be saved.",
}

const ADD_CLIENT_ITEM = {
  label: 'Add client',
  value: '__add_client__',
  isAction: true,
  description: "You'll need to return here after creating a client. Your progress won't be saved.",
}

const authServerOptions = computed(() => [
  ...authServerStore.getAll().map(s => ({ label: s.name, value: s.id })),
  ADD_AUTH_SERVER_ITEM,
])

const CONTROL_PLANE_OPTIONS = [
  { label: 'prod-us-west-control-plane', value: 'prod-us-west', uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
  { label: 'staging-control-plane', value: 'staging', uuid: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' },
]

const CONSUMER_OPTIONS = [
  { label: 'payments-consumer', value: 'payments-consumer', username: 'payments-user', customId: 'pay-001' },
  { label: 'analytics-consumer', value: 'analytics-consumer', username: 'analytics-user', customId: 'ana-002' },
]

const controlPlaneFilter = ({ items, query }: { items: typeof CONTROL_PLANE_OPTIONS, query: string }) => {
  const q = (query || '').toLowerCase()
  return items.filter(item =>
    item.label.toLowerCase().includes(q) || item.uuid.toLowerCase().includes(q),
  )
}

const consumerFilter = ({ items, query }: { items: typeof CONSUMER_OPTIONS, query: string }) => {
  const q = (query || '').toLowerCase()
  return items.filter(item =>
    item.label.toLowerCase().includes(q) ||
    item.username.toLowerCase().includes(q) ||
    item.customId.toLowerCase().includes(q),
  )
}

const addDays = (n: number): Date => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d
}

const addYears = (n: number): Date => {
  const d = new Date()
  d.setFullYear(d.getFullYear() + n)
  return d
}

const NEVER_SENTINEL = new Date(9999, 11, 31)

const EXPIRY_PRESETS: TimeFrameSection[] = [
  {
    section: 'Preset durations',
    values: [
      { key: 'never', display: 'Never', timeframeText: 'Never', start: () => NEVER_SENTINEL, end: () => NEVER_SENTINEL },
      { key: '30d', display: '30 days', timeframeText: '30 days', start: () => addDays(30), end: () => addDays(30) },
      { key: '60d', display: '60 days', timeframeText: '60 days', start: () => addDays(60), end: () => addDays(60) },
      { key: '90d', display: '90 days', timeframeText: '90 days', start: () => addDays(90), end: () => addDays(90) },
      { key: '180d', display: '180 days', timeframeText: '180 days', start: () => addDays(180), end: () => addDays(180) },
      { key: '1y', display: '1 year', timeframeText: '1 year', start: () => addYears(1), end: () => addYears(1) },
    ],
  },
]

const isEditMode = computed(() => !!props.editSource)

const editTitle = computed(() => {
  const option = methodOptions.value.find(o => o.value === props.editSource?.type)
  return `Edit ${option?.label ?? ''}`
})

const method = ref<IdentitySourceMethod | ''>('')
const showPassword = ref(false)
const showClientSecret = ref(false)

const form = reactive({
  // Key
  keyGeneration: 'auto' as 'auto' | 'manual',
  keyValue: '',
  expiresAt: 'date' as 'never' | 'date',
  expiresAtDate: addDays(90) as Date | null,
  // Basic auth
  username: '',
  passwordGeneration: 'auto' as 'auto' | 'manual',
  password: '',
  // OAuth - Kong
  oauthServerType: 'kong' as 'kong' | 'external',
  authServer: '',
  oauthClient: '',
  // OAuth - External
  issuer: '',
  clientId: '',
  clientSecret: '',
  // Consumer
  controlPlane: '',
  consumer: '',
  // External identifier
  extName: '',
  extValue: '',
})

const clientOptions = computed(() => [
  ...authServerStore.getClients(form.authServer).map(c => ({ label: c.name, value: c.id })),
  ADD_CLIENT_ITEM,
])

function handleAuthServerSelect(val: string) {
  if (val === '__add_auth_server__') {
    form.authServer = ''
    router.push({ name: 'auth-server-create' })
  }
}

function handleClientSelect(val: string) {
  if (val === '__add_client__') {
    form.oauthClient = ''
    router.push({ name: 'auth-server-client-create', params: { id: form.authServer } })
  }
}

const EXPIRES_AT_DEFAULT: TimeRange = { start: null, end: null, timePeriodsKey: '__none__' }
const expiresAtValue = ref<TimeRange>({ start: addDays(90), end: addDays(90), timePeriodsKey: '90d' })

function handleExpiresAtChange(val: TimeRange | null) {
  if (val?.timePeriodsKey === 'never') {
    form.expiresAt = 'never'
    expiresAtValue.value = { ...EXPIRES_AT_DEFAULT }
    form.expiresAtDate = null
    return
  }
  if (!val?.start) {
    expiresAtValue.value = { ...EXPIRES_AT_DEFAULT }
    form.expiresAtDate = null
    return
  }
  const date = val.start instanceof Date ? val.start : new Date(val.start as string)
  form.expiresAtDate = date
  form.expiresAt = 'date'
  expiresAtValue.value = {
    start: date,
    end: null,
    ...(val.timePeriodsKey ? { timePeriodsKey: val.timePeriodsKey } : {}),
  }
}

watch(() => props.visible, async (visible) => {
  if (!visible) return
  if (!props.editSource) {
    resetForm()
    return
  }
  const src = props.editSource
  resetForm()
  await nextTick()
  method.value = src.type as IdentitySourceMethod
  if (src.expires_at) {
    form.expiresAt = 'date'
    const d = new Date(src.expires_at)
    form.expiresAtDate = d
    expiresAtValue.value = { start: d, end: null }
  }
  if (src.type === 'key') {
    form.keyGeneration = src.key_generation ?? 'auto'
    form.keyValue = src.key_value ?? ''
  } else if (src.type === 'basic_auth') {
    form.username = src.username ?? ''
    form.passwordGeneration = src.password_generation ?? 'auto'
    form.password = generatePassword()
  } else if (src.type === 'oauth') {
    form.oauthServerType = src.oauth_server_type ?? 'kong'
    if (src.oauth_server_type === 'kong') {
      const server = authServerStore.getAll().find(s => s.name === src.auth_server)
      form.authServer = server?.id ?? ''
      if (server) {
        const client = authServerStore.getClients(server.id).find(c => c.name === src.oauth_client)
        form.oauthClient = client?.id ?? ''
      }
    } else {
      form.issuer = src.issuer ?? ''
      form.clientId = src.client_id ?? ''
      form.clientSecret = ''
    }
  } else if (src.type === 'consumer') {
    form.controlPlane = src.control_plane ?? ''
    form.consumer = src.consumer_id ?? ''
  } else if (src.type === 'external_identifier') {
    form.extName = src.ext_name ?? ''
    form.extValue = src.ext_value ?? ''
  }
})

watch(() => form.authServer, () => {
  form.oauthClient = ''
})

const isValid = computed(() => {
  if (!method.value) return false
  switch (method.value) {
    case 'key': return (form.keyGeneration === 'auto' || !!form.keyValue.trim()) && (form.expiresAt === 'never' || !!form.expiresAtDate)
    case 'basic_auth':
      if (isEditMode.value) {
        return !!form.username.trim() && !!form.password.trim() && (form.expiresAt === 'never' || !!form.expiresAtDate)
      }
      return !!form.username.trim() && (form.expiresAt === 'never' || !!form.expiresAtDate)
    case 'oauth':
      if (form.oauthServerType === 'external') {
        return !!form.issuer.trim() && !!form.clientId.trim() && !!form.clientSecret.trim()
      }
      return !!form.authServer && !!form.oauthClient
    case 'consumer': return !!form.controlPlane && !!form.consumer
    case 'external_identifier': return !!form.extName.trim() && !!form.extValue.trim()
    default: return false
  }
})

function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const hex = '0123456789abcdef'
  const rand = (set: string, len: number) =>
    Array.from({ length: len }, () => set[Math.floor(Math.random() * set.length)]).join('')
  return `1_${rand(chars, 32)}_${rand(chars, 32)}_${rand(hex, 8)}`
}

function generatePassword(): string {
  const lower = 'abcdefghijklmnopqrstuvwxyz'
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const digits = '0123456789'
  const special = '!@#$%^&*'
  const all = lower + upper + digits + special
  const rand = (set: string) => set[Math.floor(Math.random() * set.length)]
  const body = Array.from({ length: 8 }, () => rand(all)).join('')
  return rand(upper) + rand(digits) + rand(special) + body
}

const showKeyModal = ref(false)
const generatedKey = ref('')
const pendingSource = ref<Omit<PrincipalIdentitySource, 'id'> | null>(null)
const isAddAnother = ref(false)

const showBasicAuthModal = ref(false)
const generatedPassword = ref('')
const basicAuthUsername = ref('')
const pendingBasicAuthSource = ref<Omit<PrincipalIdentitySource, 'id'> | null>(null)
const isBasicAuthAddAnother = ref(false)

function buildSource(): Omit<PrincipalIdentitySource, 'id'> {
  const m = method.value as IdentitySourceMethod
  switch (m) {
    case 'key':
      return {
        type: m,
        key_id: crypto.randomUUID(),
        key_generation: form.keyGeneration,
        key_value: form.keyGeneration === 'manual' ? form.keyValue : undefined,
        expires_at: form.expiresAt === 'date' && form.expiresAtDate ? form.expiresAtDate.toISOString() : undefined,
      }
    case 'basic_auth':
      return {
        type: m,
        username: form.username,
        password_generation: form.passwordGeneration,
        expires_at: form.expiresAt === 'date' && form.expiresAtDate ? form.expiresAtDate.toISOString() : undefined,
      }
    case 'oauth':
      if (form.oauthServerType === 'external') {
        return {
          type: m,
          oauth_server_type: 'external',
          issuer: form.issuer,
          client_id: form.clientId,
        }
      }
      {
        const server = authServerStore.getById(form.authServer)
        const client = authServerStore.getClients(form.authServer).find(c => c.id === form.oauthClient)
        return {
          type: m,
          oauth_server_type: 'kong' as const,
          auth_server: server?.name || form.authServer,
          oauth_client: client?.name || form.oauthClient,
        }
      }
    case 'consumer':
      return {
        type: m,
        control_plane: form.controlPlane,
        consumer_id: form.consumer,
      }
    case 'external_identifier':
      return {
        type: m,
        ext_name: form.extName,
        ext_value: form.extValue,
      }
  }
}

function resetForm() {
  method.value = ''
  showPassword.value = false
  showClientSecret.value = false
  expiresAtValue.value = { start: addDays(90), end: addDays(90), timePeriodsKey: '90d' }
  Object.assign(form, {
    keyGeneration: 'auto',
    keyValue: '',
    expiresAt: 'date',
    expiresAtDate: addDays(90),
    username: '',
    passwordGeneration: 'auto',
    password: '',
    oauthServerType: 'kong',
    authServer: '',
    oauthClient: '',
    issuer: '',
    clientId: '',
    clientSecret: '',
    controlPlane: '',
    consumer: '',
    extName: '',
    extValue: '',
  })
}

function handleAdd() {
  if (isEditMode.value) {
    emit('update', buildSource())
    resetForm()
    emit('update:visible', false)
    return
  }
  if (method.value === 'key' && form.keyGeneration === 'auto') {
    const key = generateApiKey()
    generatedKey.value = key
    pendingSource.value = { ...buildSource(), key_value: key }
    isAddAnother.value = false
    showKeyModal.value = true
  } else if (method.value === 'basic_auth' && form.passwordGeneration === 'auto') {
    const pwd = generatePassword()
    generatedPassword.value = pwd
    basicAuthUsername.value = form.username
    pendingBasicAuthSource.value = { ...buildSource(), password_generation: 'auto' }
    isBasicAuthAddAnother.value = false
    showBasicAuthModal.value = true
  } else {
    emit('add', buildSource())
    resetForm()
    emit('update:visible', false)
  }
}

function handleAddAnother() {
  if (method.value === 'key' && form.keyGeneration === 'auto') {
    const key = generateApiKey()
    generatedKey.value = key
    pendingSource.value = { ...buildSource(), key_value: key }
    isAddAnother.value = true
    showKeyModal.value = true
  } else if (method.value === 'basic_auth' && form.passwordGeneration === 'auto') {
    const pwd = generatePassword()
    generatedPassword.value = pwd
    basicAuthUsername.value = form.username
    pendingBasicAuthSource.value = { ...buildSource(), password_generation: 'auto' }
    isBasicAuthAddAnother.value = true
    showBasicAuthModal.value = true
  } else {
    const savedExpiresAt = form.expiresAt
    const savedExpiresAtDate = form.expiresAtDate
    const savedExpiresAtValue = { ...expiresAtValue.value }
    emit('add', buildSource())
    resetForm()
    form.expiresAt = savedExpiresAt
    form.expiresAtDate = savedExpiresAtDate
    expiresAtValue.value = savedExpiresAtValue
  }
}

function dismissKeyModal() {
  if (pendingSource.value) {
    emit('add', pendingSource.value)
    pendingSource.value = null
  }
  showKeyModal.value = false
  if (isAddAnother.value) {
    const savedExpiresAt = form.expiresAt
    const savedExpiresAtDate = form.expiresAtDate
    const savedExpiresAtValue = { ...expiresAtValue.value }
    resetForm()
    form.expiresAt = savedExpiresAt
    form.expiresAtDate = savedExpiresAtDate
    expiresAtValue.value = savedExpiresAtValue
  } else {
    resetForm()
    emit('update:visible', false)
  }
}

async function copyAndClose() {
  try {
    await navigator.clipboard.writeText(generatedKey.value)
  } catch {
    // clipboard unavailable — dismiss anyway
  }
  dismissKeyModal()
}

async function copyKeyInline() {
  try {
    await navigator.clipboard.writeText(generatedKey.value)
  } catch {
    // ignore
  }
}

function dismissBasicAuthModal() {
  if (pendingBasicAuthSource.value) {
    emit('add', pendingBasicAuthSource.value)
    pendingBasicAuthSource.value = null
  }
  showBasicAuthModal.value = false
  if (isBasicAuthAddAnother.value) {
    const savedExpiresAt = form.expiresAt
    const savedExpiresAtDate = form.expiresAtDate
    const savedExpiresAtValue = { ...expiresAtValue.value }
    resetForm()
    form.expiresAt = savedExpiresAt
    form.expiresAtDate = savedExpiresAtDate
    expiresAtValue.value = savedExpiresAtValue
  } else {
    resetForm()
    emit('update:visible', false)
  }
}

async function copyBasicAuthAndClose() {
  try {
    await navigator.clipboard.writeText(generatedPassword.value)
  } catch {
    // clipboard unavailable — dismiss anyway
  }
  dismissBasicAuthModal()
}

async function copyUsernameInline() {
  try {
    await navigator.clipboard.writeText(basicAuthUsername.value)
  } catch {
    // ignore
  }
}

async function copyPasswordInline() {
  try {
    await navigator.clipboard.writeText(generatedPassword.value)
  } catch {
    // ignore
  }
}
</script>

<style scoped lang="scss">
@use "@kong/design-tokens/tokens/scss/variables" as *;

.slideout-title {
  align-items: center;
  display: flex;
  gap: $kui-space-30;

  .slideout-title-icon {
    color: $kui-color-text-decorative-aqua;
    flex-shrink: 0;
  }
}

.slideout-body {
  display: flex;
  flex-direction: column;
  gap: $kui-space-70;
}

.slideout-description {
  color: $kui-color-text-neutral-stronger;
  font-size: $kui-font-size-30;
  line-height: $kui-line-height-30;
  margin: $kui-space-0;
}

.slideout-description-link {
  color: $kui-color-text-primary;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

// ─── DPA warning ─────────────────────────────────────────────────────────────

.dpa-warning-link {
  color: $kui-color-text-neutral-stronger;
  display: inline;
  font-weight: $kui-font-weight-semibold;
  text-decoration: underline;

  &:hover {
    color: $kui-color-text;
  }

  &.dpa-info-link {
    color: $kui-color-text-primary;
    display: inline;
    margin-top: 0;

    &:hover {
      color: $kui-color-text-primary-strong;
    }
  }
}

// ─── Content card ─────────────────────────────────────────────────────────────

.slideout-content {
  background-color: $kui-color-background-neutral-weakest;
  border: $kui-border-width-10 solid $kui-color-border;
  border-radius: $kui-border-radius-30;
  display: flex;
  flex-direction: column;
  gap: $kui-space-70;
  padding: $kui-space-70;
}

// ─── Field patterns ───────────────────────────────────────────────────────────

.field-group {
  display: flex;
  flex-direction: column;
  gap: $kui-space-20;
}

.field-help {
  color: $kui-color-text-neutral;
  font-size: $kui-font-size-20;
  line-height: $kui-line-height-20;
  margin: $kui-space-0;
}

// ─── Radio cards ──────────────────────────────────────────────────────────────

.radio-cards-row {
  display: flex;
  gap: $kui-space-70;
}

// ─── Radio stack (expires at / password) ─────────────────────────────────────

.radio-stack {
  display: flex;
  flex-direction: column;
  gap: $kui-space-10;
}

.radio-inline {
  align-items: center;
  display: flex;
  gap: $kui-space-40;
}

// ─── Password visibility toggle ───────────────────────────────────────────────

.password-field-wrapper {
  flex: 1;
  position: relative;

  .password-field-input {
    width: 100%;

    :deep(input) {
      padding-right: 36px;
    }
  }
}

.password-visibility-toggle {
  align-items: center;
  background: none;
  border: none;
  color: $kui-color-text-neutral;
  cursor: pointer;
  display: flex;
  padding: $kui-space-0;
  position: absolute;
  right: $kui-space-50;
  top: 50%;
  transform: translateY(-50%);

  &:hover {
    color: $kui-color-text;
  }
}

// ─── Select action item ───────────────────────────────────────────────────────

.select-action-item {
  border-top: $kui-border-width-10 solid $kui-color-border;
  display: flex;
  flex-direction: column;
  gap: $kui-space-10;
  margin-top: $kui-space-20;
  padding-top: $kui-space-40;
  width: 100%;

  &:hover .select-action-label {
    text-decoration: underline;
  }
}

.select-action-label {
  align-items: center;
  color: $kui-color-text-primary;
  display: flex;
  font-size: $kui-font-size-30;
  font-weight: $kui-font-weight-semibold;
  gap: $kui-space-20;
}

.select-action-icon {
  flex-shrink: 0;
}

.select-action-desc {
  color: $kui-color-text-neutral;
  font-size: $kui-font-size-20;
  line-height: $kui-line-height-20;
  margin: $kui-space-0;
}

// ─── Consumer note ────────────────────────────────────────────────────────────

.consumer-note {
  color: $kui-color-text;
  font-size: $kui-font-size-30;
  line-height: $kui-line-height-30;
  margin: $kui-space-0;
}

// ─── Key created modal ────────────────────────────────────────────────────────

.key-modal-body {
  display: flex;
  flex-direction: column;
  gap: $kui-space-70;
}

.key-secret-field {
  display: flex;
  flex-direction: column;
  gap: $kui-space-20;
}

.key-secret-display {
  align-items: center;
  background-color: $kui-color-background-neutral-weakest;
  border: $kui-border-width-10 solid $kui-color-border;
  border-radius: $kui-border-radius-30;
  display: flex;
  gap: $kui-space-30;
  padding: $kui-space-40 $kui-space-50;
}

.key-secret-value {
  color: $kui-color-text-neutral-strong;
  flex: 1;
  font-family: inherit;
  font-size: $kui-font-size-30;
  line-height: $kui-line-height-30;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.key-secret-copy {
  align-items: center;
  background: none;
  border: none;
  color: $kui-color-text-neutral;
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  padding: $kui-space-0;

  &:hover {
    color: $kui-color-text;
  }
}

// ─── Actions ──────────────────────────────────────────────────────────────────

.slideout-actions {
  align-items: center;
  display: flex;
  gap: $kui-space-60;
}
</style>
