<template>
  <div class="principal-create-form">
    <AppPageHeader title="Create principal" :breadcrumbs="breadcrumbs" />

    <!-- Onboarding stepper bar -->
    <div class="wizard-stepper">
      <template v-for="(step, i) in STEPS" :key="step.key">
        <div
          class="wizard-step"
          :class="{
            'wizard-step--active': currentStep === i + 1,
            'wizard-step--completed': currentStep > i + 1,
          }"
        >
          <div class="wizard-step-circle">
            <span v-if="currentStep > i + 1" class="wizard-step-checkmark">✓</span>
            <span v-else>{{ i + 1 }}</span>
          </div>
          <span class="wizard-step-label">{{ step.label }}</span>
        </div>
        <div
          v-if="i < STEPS.length - 1"
          class="wizard-connector"
          :class="{ 'wizard-connector--done': currentStep > i + 1 }"
        />
      </template>
    </div>

    <!-- Scrollable body -->
    <div class="wizard-body">
      <div class="wizard-inner">

        <!-- Top section: heading + description + diagram -->
        <div class="top-section">
          <div class="top-header">
            <h2 class="top-heading">{{ STEPS[currentStep - 1]?.heading }}</h2>
            <p class="top-desc">
              {{ STEPS[currentStep - 1]?.description }}
              <a
                v-if="STEPS[currentStep - 1]?.learnMorePage"
                class="top-desc-link"
                href="#"
                @click.prevent="openLearningHub(STEPS[currentStep - 1]!.learnMorePage!)"
              >Learn more.</a>
            </p>
          </div>

          <!-- Principal model diagram -->
          <div class="diagram-area">
            <div class="diagram-dots" aria-hidden="true" />
            <div class="diagram-card">
              <div class="diagram-card-header">
                <KeyIcon :size="15" decorative class="diagram-key-icon" />
                <span class="diagram-card-title">Kong Identity</span>
              </div>
              <div class="diagram-principal">
                <span class="diagram-principal-label">Principal</span>
                <div class="diagram-steps">
                  <div
                    v-for="(step, si) in DIAGRAM_BOXES"
                    :key="step.key"
                    class="diagram-step-outer"
                    :class="{
                      'diagram-step-outer--active': currentStep === si + 1,
                      'diagram-step-outer--flex': si !== 1,
                    }"
                  >
                    <div
                      class="diagram-step-inner"
                      :class="{
                        'diagram-step-inner--completed': currentStep > si + 1 && !skippedSteps.includes(si + 1),
                        'diagram-step-inner--skipped': skippedSteps.includes(si + 1),
                      }"
                    >
                      <CheckCircleIcon
                        v-if="currentStep > si + 1 && !skippedSteps.includes(si + 1)"
                        :color="KUI_ICON_COLOR_SUCCESS"
                        :size="12"
                        decorative
                      />
                      <ClearIcon
                        v-else-if="skippedSteps.includes(si + 1)"
                        :color="KUI_ICON_COLOR_NEUTRAL"
                        :size="12"
                        decorative
                      />
                      <div
                        v-else
                        class="diagram-step-dot"
                        :class="{ 'diagram-step-dot--active': currentStep === si + 1 }"
                      />
                      <KPop
                        hide-close-icon
                        placement="bottom"
                        :popover-timeout="0"
                        trigger="hover"
                        :width="220"
                      >
                        <span
                          class="diagram-step-label"
                          :class="{
                            'diagram-step-label--active': currentStep === si + 1,
                            'diagram-step-label--inactive': currentStep !== si + 1,
                          }"
                        >{{ step.label }}</span>
                        <template #content>
                          {{ step.hint }}
                        </template>
                      </KPop>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Step 1: General information -->
        <div v-if="currentStep === 1" class="bottom-section">
          <h3 class="section-heading">General information</h3>
          <div class="section-card section-card--padded">
            <div class="general-fields">
              <div class="field-group">
                <KLabel>Name</KLabel>
                <KInput
                  v-model="formState.name"
                  placeholder="Enter a name (e.g., payments-service)"
                />
                <p class="field-help">
                  Used to identify this principal in observability and the principals list. A default name is generated, but you can change it.
                </p>
              </div>
              <div class="field-group">
                <KLabel>Description</KLabel>
                <KTextArea
                  v-model="formState.description"
                  placeholder="Describe your new principal"
                  :rows="3"
                />
              </div>
              <div class="labels-toggle-row">
                <KButton
                  appearance="tertiary"
                  class="labels-toggle-btn"
                  @click="labelsExpanded = !labelsExpanded"
                >
                  <ChevronRightIcon
                    :size="14"
                    decorative
                    :class="['labels-chevron', { 'labels-chevron--open': labelsExpanded }]"
                  />
                  {{ labelsExpanded ? 'Hide labels' : 'Show labels' }}
                </KButton>
              </div>
              <div v-if="labelsExpanded" class="labels-content">
                <div
                  v-for="(label, li) in formState.labels"
                  :key="li"
                  class="label-pair-row"
                >
                  <div class="label-key-col">
                    <KLabel v-if="li === 0">Labels</KLabel>
                    <KInput v-model="label.key" placeholder="Enter a key" />
                  </div>
                  <span class="label-colon">:</span>
                  <KInput v-model="label.value" placeholder="Enter a value" class="label-value-input" />
                  <KButton appearance="tertiary" size="small" @click="removeLabel(li)">
                    <CloseIcon decorative />
                  </KButton>
                </div>
                <KButton appearance="tertiary" class="add-label-btn" @click="addLabel">
                  <AddIcon decorative />
                  Add another label
                </KButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Authentication -->
        <div v-else-if="currentStep === 2" class="bottom-section">
          <h3 class="section-heading">Authentication</h3>
          <div class="section-card">
            <template v-if="formState.identitySources.length === 0">
              <div class="identity-empty">
                <AccountTreeIcon :size="20" decorative class="empty-icon" />
                <p class="empty-title">Authentication</p>
                <p class="empty-desc">
                  Add credentials or link identities to identify and authenticate this principal.
                </p>
                <KButton appearance="tertiary" @click="addIdentitySource">
                  <AddIcon decorative />
                  Add authentication
                </KButton>
              </div>
            </template>
            <template v-else>
              <div class="sources-table">
                <div class="sources-row sources-row--header">
                  <span class="sources-col sources-col--type">Authentication type</span>
                  <span class="sources-col sources-col--details">Details</span>
                  <span class="sources-col sources-col--actions" />
                </div>
                <div
                  v-for="(source, si) in formState.identitySources"
                  :key="si"
                  class="sources-row"
                >
                  <span class="sources-col sources-col--type sources-type-label">{{ getSourceLabel(source) }}</span>
                  <span class="sources-col sources-col--details sources-details">
                    <template v-for="(detail, di) in getSourceDetails(source)" :key="di">
                      <span v-if="di > 0" class="sources-detail-sep">, </span>
                      <span class="sources-detail-key">{{ detail.label }}: </span>
                      <span class="sources-detail-value">{{ detail.value }}</span>
                    </template>
                  </span>
                  <span class="sources-col sources-col--actions">
                    <KDropdown :kpop-attributes="{ placement: 'bottom-end' }">
                      <KButton appearance="tertiary" size="small">
                        <MoreIcon decorative />
                      </KButton>
                      <template #items>
                        <KDropdownItem @click="editIdentitySource(si)">Edit</KDropdownItem>
                        <KDropdownItem danger @click="promptRemove(si)">Remove</KDropdownItem>
                      </template>
                    </KDropdown>
                  </span>
                </div>
              </div>
              <div class="card-actions">
                <KButton appearance="tertiary" @click="addIdentitySource">
                  <AddIcon decorative />
                  Add authentication
                </KButton>
              </div>
            </template>
          </div>
        </div>

        <!-- Step 3: Metadata -->
        <div v-else-if="currentStep === 3" class="bottom-section">
          <h3 class="section-heading">Metadata</h3>
          <div class="section-card section-card--form">
            <div v-if="formState.metadata.length > 0" class="metadata-rows">
              <div
                v-for="(meta, mi) in formState.metadata"
                :key="mi"
                class="metadata-row"
              >
                <div class="meta-key-col">
                  <KLabel v-if="mi === 0">Key</KLabel>
                  <KInput v-model="meta.key" placeholder="e.g., environment" />
                </div>
                <span class="meta-colon">:</span>
                <div class="meta-value-group">
                  <div class="meta-type-col">
                    <KLabel v-if="mi === 0">Value</KLabel>
                    <KSelect
                      :model-value="meta.value_type"
                      :items="VALUE_TYPE_OPTIONS"
                      @update:model-value="setMetaType(meta, $event as string)"
                    />
                  </div>
                  <!-- String -->
                  <KInput
                    v-if="meta.value_type === 'string'"
                    v-model="meta.value"
                    placeholder="e.g., production"
                    class="meta-value-input"
                  />
                  <!-- Number -->
                  <KInput
                    v-else-if="meta.value_type === 'number'"
                    v-model="meta.value"
                    type="number"
                    placeholder="e.g., 3"
                    class="meta-value-input"
                  />
                  <!-- Boolean -->
                  <div v-else-if="meta.value_type === 'boolean'" class="meta-bool-radios">
                    <KRadio v-model="meta.value" selected-value="true">True</KRadio>
                    <KRadio v-model="meta.value" selected-value="false">False</KRadio>
                  </div>
                  <!-- Date and time -->
                  <KInput
                    v-else-if="meta.value_type === 'date_time'"
                    v-model="meta.value"
                    type="datetime-local"
                    class="meta-value-input"
                  />
                  <!-- List -->
                  <div v-else-if="meta.value_type === 'list'" class="meta-list-input meta-value-input">
                    <div v-if="meta.listValues.length" class="meta-list-tags">
                      <span
                        v-for="(v, vi) in meta.listValues"
                        :key="vi"
                        class="meta-list-tag"
                      >
                        {{ v }}
                        <button type="button" class="meta-list-tag-remove" @click="meta.listValues.splice(vi, 1)">
                          <CloseIcon :size="10" decorative />
                        </button>
                      </span>
                    </div>
                    <div class="meta-list-add-row">
                      <KInput
                        v-model="meta.listInput"
                        placeholder="e.g., value1"
                        class="meta-list-add-input"
                        @keydown.enter.prevent="addListValue(meta)"
                      />
                      <KButton appearance="tertiary" size="small" @click="addListValue(meta)">Add</KButton>
                    </div>
                  </div>
                </div>
                <div class="meta-remove">
                  <KButton appearance="tertiary" :disabled="formState.metadata.length === 1" @click="removeMetadata(mi)">
                    <CloseIcon decorative />
                  </KButton>
                </div>
              </div>
            </div>
            <div class="card-actions">
              <KButton appearance="tertiary" @click="addMetadata">
                <AddIcon decorative />
                Add metadata
              </KButton>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Footer -->
    <div class="wizard-footer">
      <KButton appearance="tertiary" @click="exitSetup">Exit setup</KButton>
      <div class="wizard-footer-right">
        <KButton v-if="currentStep < 3" appearance="tertiary" @click="skip">Skip</KButton>
        <KButton v-if="currentStep > 1" appearance="tertiary" @click="goBack">
          Back
        </KButton>
        <KButton v-if="currentStep < 3" appearance="primary" @click="nextStep">
          Next
          <ChevronRightIcon decorative />
        </KButton>
        <KButton
          v-if="currentStep === 3"
          appearance="primary"
          :disabled="!formState.name.trim()"
          @click="handleSubmit"
        >
          Create
        </KButton>
      </div>
    </div>

    <AddIdentitySourceSlideout
      v-model:visible="showSourceSlideout"
      :edit-source="editSourceIndex !== null ? formState.identitySources[editSourceIndex] : null"
      @add="handleSourceAdded"
      @update="handleSourceUpdated"
    />

    <KModal
      :visible="removeConfirmIndex !== null"
      :title="`Remove ${removeConfirmLabel}`"
      action-button-text="Yes, remove"
      cancel-button-text="Cancel"
      @proceed="confirmRemove"
      @cancel="cancelRemove"
    >
      Are you sure you want to remove this {{ removeConfirmLabel }}? This action cannot be undone.
    </KModal>

    <KModal
      :visible="showExitConfirm"
      title="Exit setup?"
      action-button-text="Exit without saving"
      cancel-button-text="Continue setup"
      @proceed="confirmExit"
      @cancel="showExitConfirm = false"
    >
      This setup hasn't been saved yet. If you exit now, the information entered on this page will be discarded.
    </KModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { KUI_ICON_COLOR_NEUTRAL, KUI_ICON_COLOR_SUCCESS } from '@kong/design-tokens'
import { useRouter } from 'vue-router'
import {
  AddIcon,
  CloseIcon,
  AccountTreeIcon,
  CheckCircleIcon,
  ClearIcon,
  MoreIcon,
  ChevronRightIcon,
  KeyIcon,
} from '@kong/icons'
import {
  KButton,
  KInput,
  KTextArea,
  KSelect,
  KLabel,
  KRadio,
  KDropdown,
  KDropdownItem,
  KModal,
  KPop,
} from '@kong/kongponents'
import AppPageHeader from '@/components/AppPageHeader.vue'
import AddIdentitySourceSlideout from '@/components/principals/AddIdentitySourceSlideout.vue'
import { useLearningHub } from '@/composables/useLearningHub'
import { usePrincipalStore } from '@/composables/usePrincipalStore'
import type { PrincipalIdentitySource, PrincipalMetadata } from '@/types'

type MetaValueType = PrincipalMetadata['value_type']

interface MetaFormItem {
  key: string
  value: string
  value_type: MetaValueType
  listValues: string[]
  listInput: string
}

const router = useRouter()
const store = usePrincipalStore()
const { openTo: openLearningHub } = useLearningHub()

const breadcrumbs = [
  { key: 'principals', text: 'Principals', to: { name: 'principals-list' } },
  { key: 'current', text: 'Create principal' },
]

const STEPS = [
  {
    key: 'general-info',
    label: 'Add general information',
    heading: 'Create your first principal',
    description: 'A principal represents a system or application that authenticates with your APIs. Start by adding general information.',
    learnMorePage: 'learn-about-identity' as const,
  },
  {
    key: 'identity-sources',
    label: 'Add authentication',
    heading: 'Add authentication',
    description: 'A principal represents a system or application that authenticates with the platform. Add authentication to define how it authenticates.',
  },
  {
    key: 'metadata',
    label: 'Add metadata',
    heading: 'Add metadata',
    description: 'Add key-value pairs to store additional context about this principal, making it easier to organize, search, and understand across the platform—for example, environment, region, or expiration date.',
  },
]


const SOURCE_TYPE_LABELS: Record<string, string> = {
  key: 'Key',
  basic_auth: 'Basic auth',
  oauth: 'OAuth client',
  consumer: 'Consumer linking',
  external_identifier: 'External identifier',
}

const VALUE_TYPE_OPTIONS = [
  { label: 'String', value: 'string' },
  { label: 'Number', value: 'number' },
  { label: 'Boolean', value: 'boolean' },
  { label: 'List', value: 'list' },
]

const defaultName = (() => {
  const now = new Date()
  const date = now.toISOString().slice(0, 10)
  const time = now.toTimeString().slice(0, 5).replace(':', '')
  return `principal-${date}-${time}`
})()

const currentStep = ref(1)
const skippedSteps = ref<number[]>([])
const labelsExpanded = ref(false)
const showSourceSlideout = ref(false)
const editSourceIndex = ref<number | null>(null)
const removeConfirmIndex = ref<number | null>(null)
const showExitConfirm = ref(false)

const formState = reactive({
  name: defaultName,
  description: '',
  identitySources: [] as Array<Omit<PrincipalIdentitySource, 'id'>>,
  metadata: [{ key: '', value: '', value_type: 'string' as MetaValueType, listValues: [] as string[], listInput: '' }] as MetaFormItem[],
  labels: [{ key: '', value: '' }] as Array<{ key: string; value: string }>,
})

function addIdentitySource() {
  editSourceIndex.value = null
  showSourceSlideout.value = true
}

function editIdentitySource(i: number) {
  editSourceIndex.value = i
  showSourceSlideout.value = true
}

function handleSourceAdded(source: Omit<PrincipalIdentitySource, 'id'>) {
  formState.identitySources.push(source)
}

function handleSourceUpdated(source: Omit<PrincipalIdentitySource, 'id'>) {
  if (editSourceIndex.value !== null) {
    formState.identitySources.splice(editSourceIndex.value, 1, source)
    editSourceIndex.value = null
  }
}

function promptRemove(i: number) {
  removeConfirmIndex.value = i
}

function confirmRemove() {
  if (removeConfirmIndex.value !== null) {
    formState.identitySources.splice(removeConfirmIndex.value, 1)
    removeConfirmIndex.value = null
  }
}

function cancelRemove() {
  removeConfirmIndex.value = null
}

function getSourceLabel(source: Omit<PrincipalIdentitySource, 'id'>): string {
  if (source.type === 'oauth') {
    return source.oauth_server_type === 'external' ? 'OAuth client (External)' : 'OAuth client (Kong)'
  }
  return SOURCE_TYPE_LABELS[source.type] || source.type
}

function getSourceDetails(source: Omit<PrincipalIdentitySource, 'id'>): Array<{ label: string; value: string }> {
  switch (source.type) {
    case 'key':
      return [{ label: 'Key ID', value: source.key_id || '–' }]
    case 'basic_auth':
      return [{ label: 'Username', value: source.username || '–' }]
    case 'oauth':
      if (source.oauth_server_type === 'external') {
        return [
          { label: 'Issuer', value: source.issuer || '–' },
          { label: 'Client ID', value: source.client_id || '–' },
        ]
      }
      return [
        { label: 'Auth server', value: source.auth_server || '–' },
        { label: 'Client name', value: source.oauth_client || '–' },
      ]
    case 'consumer':
      return [
        { label: 'Control plane', value: source.control_plane || '–' },
        { label: 'Consumer', value: source.consumer_id || '–' },
      ]
    case 'external_identifier':
      return [
        { label: 'Name', value: source.ext_name || '–' },
        { label: 'Value', value: source.ext_value || '–' },
      ]
    default:
      return []
  }
}

function setMetaType(meta: MetaFormItem, newType: string) {
  meta.value_type = newType as MetaValueType
  meta.value = newType === 'boolean' ? 'true' : ''
  meta.listValues = []
  meta.listInput = ''
}

function addListValue(meta: MetaFormItem) {
  const val = meta.listInput.trim()
  if (val && !meta.listValues.includes(val)) {
    meta.listValues.push(val)
  }
  meta.listInput = ''
}

function addMetadata() {
  formState.metadata.push({ key: '', value: '', value_type: 'string', listValues: [], listInput: '' })
}


function removeMetadata(i: number) {
  formState.metadata.splice(i, 1)
}

function addLabel() {
  formState.labels.push({ key: '', value: '' })
}

function removeLabel(i: number) {
  formState.labels.splice(i, 1)
}


const DIAGRAM_BOXES = [
  {
    key: 'general',
    label: 'General info',
    hint: 'Configure basic information used to identify and manage this principal.',
  },
  {
    key: 'identity',
    label: 'Authentication',
    hint: 'Manage the credentials and linked identities used to identify and authenticate this principal.',
  },
  {
    key: 'metadata',
    label: 'Metadata',
    hint: 'Add custom metadata to store additional information about this principal.',
  },
]

const removeConfirmLabel = computed(() => {
  if (removeConfirmIndex.value === null) return ''
  const source = formState.identitySources[removeConfirmIndex.value]
  return source ? getSourceLabel(source) : ''
})


function stepHasContent(step: number): boolean {
  if (step === 1) return formState.name.trim().length > 0
  if (step === 2) return formState.identitySources.length > 0
  return formState.metadata.some(m => m.key.trim().length > 0)
}

function nextStep() {
  if (stepHasContent(currentStep.value)) {
    skippedSteps.value = skippedSteps.value.filter(s => s !== currentStep.value)
  } else {
    if (!skippedSteps.value.includes(currentStep.value)) {
      skippedSteps.value = [...skippedSteps.value, currentStep.value]
    }
  }
  currentStep.value++
}

function goBack() {
  currentStep.value--
  skippedSteps.value = skippedSteps.value.filter(s => s !== currentStep.value)
}

function skip() {
  if (!skippedSteps.value.includes(currentStep.value)) {
    skippedSteps.value = [...skippedSteps.value, currentStep.value]
  }
  currentStep.value++
}

function exitSetup() {
  showExitConfirm.value = true
}

function confirmExit() {
  router.push({ name: 'principals-list' })
}

function handleSubmit() {
  const labelsRecord: Record<string, string> = {}
  formState.labels.forEach(l => {
    if (l.key) labelsRecord[l.key] = l.value
  })

  const principal = store.create({
    name: formState.name.trim(),
    description: formState.description.trim() || undefined,
    labels: Object.keys(labelsRecord).length ? labelsRecord : undefined,
    metadata: formState.metadata.filter(m => m.key).map(m => ({
      key: m.key,
      value: m.value_type === 'list' ? m.listValues.join(',') : m.value,
      value_type: m.value_type,
    })),
    identity_sources: formState.identitySources.map((s, i) => ({
      id: `is-new-${i}`,
      ...s,
    })),
  })

  router.push({ name: 'principal-detail', params: { id: principal.id } })
}
</script>

<style scoped lang="scss">
@use "@kong/design-tokens/tokens/scss/variables" as *;

// ─── Page shell ───────────────────────────────────────────────────────────────

.principal-create-form {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

// ─── Stepper bar ──────────────────────────────────────────────────────────────

.wizard-stepper {
  align-items: center;
  background-color: $kui-color-background;
  border-bottom: $kui-border-width-10 solid $kui-color-border;
  display: flex;
  gap: $kui-space-50;
  padding: $kui-space-80 $kui-space-90;
}

.wizard-step {
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: $kui-space-40;
  padding: $kui-space-0 $kui-space-20;
}

.wizard-step-circle {
  align-items: center;
  background-color: $kui-color-background;
  border: $kui-border-width-10 solid $kui-color-border;
  border-radius: $kui-border-radius-circle;
  color: $kui-color-text-neutral;
  display: flex;
  flex-shrink: 0;
  font-size: $kui-font-size-20;
  font-weight: $kui-font-weight-semibold;
  height: 24px;
  justify-content: center;
  width: 24px;

  .wizard-step--active & {
    background-color: $kui-color-background-primary;
    border-color: $kui-color-border-primary;
    color: $kui-color-text-inverse;
  }

  .wizard-step--completed & {
    background-color: #afb7c5;
    border-color: transparent;
    color: $kui-color-text-inverse;
  }
}

.wizard-step-checkmark {
  font-size: 11px;
  font-weight: $kui-font-weight-bold;
  line-height: 1;
}

.wizard-step-label {
  color: $kui-color-text-neutral;
  font-size: $kui-font-size-40;
  font-weight: $kui-font-weight-semibold;
  white-space: nowrap;

  .wizard-step--active & {
    color: $kui-color-text-neutral-stronger;
  }

  .wizard-step--completed & {
    color: $kui-color-text-neutral-stronger;
  }
}

.wizard-connector {
  border-top: $kui-border-width-10 solid $kui-color-border;
  flex: 1;
  min-width: $kui-space-60;

  &--done {
    border-color: $kui-color-border-primary;
  }
}

// ─── Body ────────────────────────────────────────────────────────────────────

.wizard-body {
  flex: 1;
  overflow-y: auto;
}

.wizard-inner {
  display: flex;
  flex-direction: column;
  gap: $kui-space-80;
  padding: $kui-space-80 $kui-space-90;
}

// ─── Top section (header + diagram) ──────────────────────────────────────────

.top-section {
  display: flex;
  flex-direction: column;
  gap: $kui-space-80;
}


.top-header {
  display: flex;
  flex-direction: column;
  gap: $kui-space-40;
}

.top-heading {
  color: $kui-color-text;
  font-size: $kui-font-size-60;
  font-weight: $kui-font-weight-bold;
  letter-spacing: -0.018em;
  line-height: $kui-line-height-50;
  margin: $kui-space-0;
}

.top-desc {
  color: $kui-color-text-neutral-stronger;
  font-size: $kui-font-size-40;
  line-height: $kui-line-height-30;
  margin: $kui-space-0;
}

.top-desc-link {
  color: $kui-color-text-primary;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}


// ─── Principal model diagram ──────────────────────────────────────────────────

.diagram-area {
  align-items: center;
  background-color: $kui-color-background-neutral-weakest;
  border: $kui-border-width-10 solid $kui-color-border;
  border-radius: $kui-border-radius-20;
  display: flex;
  min-height: 240px;
  justify-content: center;
  overflow: hidden;
  padding: $kui-space-60 $kui-space-0;
  position: relative;
  width: 100%;
}

.diagram-dots {
  background-image: radial-gradient(circle, #9ba3b2 1.2px, transparent 1.2px);
  background-size: 9.9px 9.9px;
  inset: 0;
  opacity: 0.2;
  position: absolute;
}

.diagram-card {
  background-color: $kui-color-background;
  border: $kui-border-width-10 solid $kui-color-border;
  border-radius: 5.6px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: $kui-space-60;
  position: relative;
}

.diagram-card-header {
  align-items: center;
  display: flex;
  gap: $kui-space-30;
}

.diagram-key-icon {
  color: $kui-color-text-neutral-stronger;
  flex-shrink: 0;
}

.diagram-card-title {
  color: $kui-color-text-neutral-strongest;
  font-size: $kui-font-size-40;
  font-weight: $kui-font-weight-semibold;
  white-space: nowrap;
}

.diagram-principal {
  background-color: $kui-color-background-neutral-weakest;
  border: $kui-border-width-10 solid $kui-color-border;
  border-radius: $kui-border-radius-20;
  display: flex;
  flex-direction: column;
  gap: $kui-space-30;
  padding: 12px;
}

.diagram-principal-label {
  color: $kui-color-text-neutral-strongest;
  font-size: $kui-font-size-40;
  font-weight: $kui-font-weight-semibold;
  white-space: nowrap;
}

// ─── Diagram steps (matches Figma .explore-diagram step) ─────────────────────

.diagram-steps {
  display: flex;
  gap: $kui-space-50;
  width: fit-content;
}

// Outer wrapper — active step gets the light-blue highlight border
.diagram-step-outer {
  flex-shrink: 0;
  border: 2px solid transparent;
  border-radius: $kui-border-radius-20;

  &--flex {
    flex: 1 0 0;
    flex-shrink: unset;
    min-width: 0;
  }

  &--active {
    border-color: #bee2ff;
    border-radius: 4px;
  }
}

// Inner box — white with dashed border, 56px tall, content centered
.diagram-step-inner {
  align-items: center;
  background-color: $kui-color-background;
  border: $kui-border-width-10 dashed $kui-color-border;
  border-radius: $kui-border-radius-20;
  display: flex;
  gap: $kui-space-30;
  height: 56px;
  justify-content: center;
  padding: $kui-space-50 $kui-space-70;
  width: 100%;

  &--completed {
    background-color: $kui-color-background-success-weakest;
  }

  &--skipped {
    border-color: $kui-color-border;
    border-style: solid;
  }
}

// 12px circle dot — filled + pulsing for active, empty ring for inactive
.diagram-step-dot {
  border: 1.5px solid $kui-color-border-neutral-weaker;
  border-radius: $kui-border-radius-circle;
  flex-shrink: 0;
  height: 12px;
  position: relative;
  width: 12px;

  &--active {
    background-color: transparent;
    border-color: $kui-color-border-primary-weak;
  }

}



.diagram-step-label {
  font-size: $kui-font-size-30;
  font-weight: $kui-font-weight-semibold;
  line-height: $kui-line-height-20;
  white-space: nowrap;

  &--active {
    color: $kui-color-text;
  }

  &--inactive {
    color: $kui-color-text-neutral;
  }
}

// ─── Bottom section ───────────────────────────────────────────────────────────

.bottom-section {
  display: flex;
  flex-direction: column;
  gap: $kui-space-60;
}

.section-heading {
  color: $kui-color-text;
  font-size: $kui-font-size-60;
  font-weight: $kui-font-weight-bold;
  letter-spacing: -0.018em;
  line-height: $kui-line-height-50;
  margin: $kui-space-0;
}

.section-card {
  background-color: $kui-color-background-neutral-weakest;
  border: $kui-border-width-10 solid $kui-color-border;
  border-radius: $kui-border-radius-30;
  overflow: hidden;

  &--form {
    display: flex;
    flex-direction: column;
    gap: $kui-space-0;
  }

  &--padded {
    padding: $kui-space-80 $kui-space-80;
  }
}

// ─── Authentication (step 1) ────────────────────────────────────────────────

.sources-table {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.sources-row {
  align-items: center;
  border-bottom: $kui-border-width-10 solid $kui-color-border;
  display: flex;
  gap: $kui-space-50;
  min-height: 39px;
  padding: $kui-space-0 $kui-space-70;

  &--header {
    min-height: 41px;

    .sources-col {
      color: $kui-color-text-neutral-stronger;
      font-size: $kui-font-size-30;
      font-weight: $kui-font-weight-semibold;
      line-height: $kui-line-height-30;
    }
  }

  &:last-child {
    border-bottom: none;
  }
}

.sources-col {
  font-size: $kui-font-size-30;
  line-height: $kui-line-height-30;
  min-width: 0;

  &--type {
    flex: 1;
  }

  &--details {
    flex: 2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &--actions {
    flex-shrink: 0;
    width: 32px;
  }
}

.sources-type-label {
  color: $kui-color-text;
  font-weight: $kui-font-weight-semibold;
}

.sources-details {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sources-detail-key {
  color: $kui-color-text-neutral;
}

.sources-detail-value {
  color: $kui-color-text;
}

.sources-detail-sep {
  color: $kui-color-text-neutral;
}

.identity-empty {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: $kui-space-60;
  justify-content: center;
  padding: $kui-space-90;
  text-align: center;
}

.empty-icon {
  color: $kui-color-text-neutral;
}

.empty-title {
  color: $kui-color-text;
  font-size: $kui-font-size-60;
  font-weight: $kui-font-weight-bold;
  letter-spacing: -0.018em;
  line-height: $kui-line-height-50;
  margin: $kui-space-0;
}

.empty-desc {
  color: $kui-color-text-neutral-stronger;
  font-size: $kui-font-size-40;
  line-height: $kui-line-height-30;
  margin: $kui-space-0;
  max-width: 520px;
}

.sources-list {
  display: flex;
  flex-direction: column;
}

.source-row {
  align-items: center;
  border-bottom: $kui-border-width-10 solid $kui-color-border;
  display: flex;
  justify-content: space-between;
  padding: $kui-space-50 $kui-space-70;

  &:last-child {
    border-bottom: none;
  }
}

.source-info {
  align-items: center;
  color: $kui-color-text;
  display: flex;
  font-size: $kui-font-size-30;
  font-weight: $kui-font-weight-semibold;
  gap: $kui-space-40;

  svg {
    color: $kui-color-text-neutral;
  }
}

.card-actions {
  display: flex;
  gap: $kui-space-50;
  padding: $kui-space-60 $kui-space-70;

  &--space-between {
    justify-content: space-between;
  }
}

// ─── Metadata rows (step 2) ───────────────────────────────────────────────────

.metadata-rows {
  display: flex;
  flex-direction: column;
  gap: $kui-space-60;
  padding: $kui-space-70;
  padding-bottom: $kui-space-0;
}

.metadata-row {
  align-items: flex-end;
  display: flex;
  gap: $kui-space-40;
}

.meta-key-col {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: $kui-space-20;
  min-width: 0;
}

.meta-colon {
  color: $kui-color-text;
  flex-shrink: 0;
  font-size: $kui-font-size-40;
  font-weight: $kui-font-weight-semibold;
  line-height: 36px;
}

.meta-value-group {
  align-items: flex-end;
  display: flex;
  flex: 1;
  gap: $kui-space-40;
  min-width: 0;
}

.meta-type-col {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: $kui-space-20;
  min-width: 120px;
}

.meta-value-input {
  flex: 1;
  min-width: 0;
}

.meta-bool-radios {
  align-items: center;
  display: flex;
  flex: 1;
  gap: $kui-space-60;
  min-width: 0;
}

.meta-list-input {
  display: flex;
  flex-direction: column;
  gap: $kui-space-40;
}

.meta-list-tags {
  display: flex;
  flex-wrap: wrap;
  gap: $kui-space-30;
}

.meta-list-tag {
  align-items: center;
  background-color: $kui-color-background-neutral-weaker;
  border: $kui-border-width-10 solid $kui-color-border;
  border-radius: $kui-border-radius-20;
  color: $kui-color-text;
  display: inline-flex;
  font-size: $kui-font-size-20;
  gap: $kui-space-20;
  line-height: $kui-line-height-20;
  padding: $kui-space-10 $kui-space-30;
}

.meta-list-tag-remove {
  align-items: center;
  background: none;
  border: none;
  color: $kui-color-text-neutral;
  cursor: pointer;
  display: flex;
  padding: 0;

  &:hover {
    color: $kui-color-text;
  }
}

.meta-list-add-row {
  align-items: center;
  display: flex;
  gap: $kui-space-40;
}

.meta-list-add-input {
  flex: 1;
  min-width: 0;
}

.meta-remove {
  flex-shrink: 0;
  line-height: 36px;
}

// ─── General information form (step 3) ───────────────────────────────────────

.general-fields {
  display: flex;
  flex-direction: column;
  gap: $kui-space-70;
}

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

.labels-toggle-row {
  align-items: center;
  display: flex;
  gap: $kui-space-50;
  justify-content: space-between;
}

.labels-chevron {
  transition: transform 0.15s ease;

  &--open {
    transform: rotate(90deg);
  }
}

.labels-content {
  display: flex;
  flex-direction: column;
  gap: $kui-space-40;
  margin-top: $kui-space-20;
}

.add-label-btn {
  align-self: flex-start;
}

.label-pair-row {
  align-items: center;
  display: flex;
  gap: $kui-space-70;
}

.label-key-col {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: $kui-space-20;
  min-width: 0;
}

.label-colon {
  color: $kui-color-text-neutral-stronger;
  flex-shrink: 0;
  font-size: $kui-font-size-40;
  line-height: 36px;
}

.label-value-input {
  flex: 1;
  min-width: 0;
}

// ─── Footer ───────────────────────────────────────────────────────────────────

.wizard-footer {
  align-items: center;
  background-color: $kui-color-background;
  border-top: $kui-border-width-10 solid $kui-color-border;
  bottom: 0;
  display: flex;
  gap: $kui-space-50;
  justify-content: space-between;
  padding: $kui-space-70 $kui-space-90;
  position: sticky;
}

.wizard-footer-right {
  align-items: center;
  display: flex;
  gap: $kui-space-50;
}
</style>
