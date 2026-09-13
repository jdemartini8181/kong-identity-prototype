<template>
  <div class="principal-view">
    <div v-if="!principal" class="principal-loading">
      <KSkeletonBox height="2" width="10" />
      <KSkeleton />
    </div>
    <template v-else>

      <AppPageHeader
        :title="principal.name"
        :breadcrumbs="breadcrumbs"
      >
        <template #actions>
          <LaunchLearningHubThroughBookIcon learning-hub-path="/global/learning-hub/identity" />

          <!-- Dev portal principal: fixed action set, no add-auth, no delete -->
          <template v-if="isDevPortal">
            <KDropdown
              v-if="activeTab !== '#principal-metadata'"
              data-testid="principal-actions-dropdown"
              :kpop-attributes="{ placement: 'bottom-end' }"
            >
              <KButton appearance="primary" data-testid="principal-actions-dropdown-trigger">
                Actions
                <ChevronDownIcon decorative />
              </KButton>
              <template #items>
                <KDropdownItem @click="viewInDevPortal">View in Dev Portal</KDropdownItem>
                <KDropdownItem @click="openEditLabels">Edit labels</KDropdownItem>
              </template>
            </KDropdown>
          </template>

          <!-- Regular principal -->
          <template v-else>
            <KButton
              v-if="activeTab === '#principal-authentication'"
              appearance="primary"
              @click="authTabRef?.openSlideout()"
            >
              <AddIcon decorative />
              Add authentication
            </KButton>
            <KDropdown
              v-else-if="activeTab !== '#principal-metadata'"
              data-testid="principal-actions-dropdown"
              :kpop-attributes="{ placement: 'bottom-end' }"
            >
              <KButton appearance="primary" data-testid="principal-actions-dropdown-trigger">
                Actions
                <ChevronDownIcon decorative />
              </KButton>
              <template #items>
                <KDropdownItem danger has-divider data-testid="delete-principal" @click="deleteModalVisible = true">
                  Delete
                </KDropdownItem>
              </template>
            </KDropdown>
          </template>
        </template>
      </AppPageHeader>

      <!-- Sub-navigation tabs -->
      <KTabs v-model="activeTab" :tabs="tabs" />

      <!-- Overview -->
      <div v-if="activeTab === '#principal-overview'" class="tab-content">

        <!-- Welcome card -->
        <div v-if="showWelcomeCard && !isDevPortal" class="welcome-card">
          <div class="welcome-header">
            <div class="welcome-header-text">
              <p class="welcome-title">Welcome to your principal</p>
              <p class="welcome-subtitle">Complete these steps to finish setup</p>
            </div>
            <button class="welcome-close" aria-label="Dismiss" @click="showWelcomeCard = false">
              <CloseIcon :size="16" decorative />
            </button>
          </div>
          <div class="welcome-steps">
            <div class="welcome-step-card">
              <div class="welcome-step-icon welcome-step-icon--green">
                <SecurityIcon :size="24" decorative />
              </div>
              <div class="welcome-step-content">
                <p class="welcome-step-title">Learn how to configure authentication</p>
                <p class="welcome-step-desc">Read the documentation to understand how authentication works and how to configure it.</p>
              </div>
            </div>
            <div class="welcome-step-card">
              <div class="welcome-step-icon welcome-step-icon--purple">
                <CogIcon :size="24" decorative />
              </div>
              <div class="welcome-step-content">
                <p class="welcome-step-title">Configure authentication on the API gateway</p>
                <p class="welcome-step-desc">Apply an authentication plugin to your API gateway to start enforcing identity.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- About this principal -->
        <div class="about-card">
          <div class="about-title-row">
            <h2 class="about-title">About this principal</h2>
            <span v-if="formattedCreatedAt" class="about-created">Created: {{ formattedCreatedAt }}</span>
          </div>
          <p v-if="principal.description" class="about-description">{{ principal.description }}</p>
          <div class="about-info-row">
            <div class="about-id">
              <span class="about-info-label">ID:</span>
              <KCopy badge :text="principal.id" />
            </div>
            <div class="about-labels">
              <span class="about-info-label">Labels:</span>
              <template v-if="principalLabels.length">
                <KBadge
                  v-for="label in principalLabels"
                  :key="label.key"
                  appearance="neutral"
                >{{ label.key }}: {{ label.value }}</KBadge>
              </template>
              <span v-else class="about-labels-empty">–</span>
            </div>
          </div>

          <template v-if="isDevPortal">
            <div class="about-info-row">
              <div class="about-id">
                <span class="about-info-label">Dev Portal ID:</span>
                <KCopy badge :text="principal.dev_portal_id || ''" />
              </div>
            </div>
            <hr class="about-divider">
            <div class="about-managed-by">
              <span>This principal is managed by </span>
              <a href="#" class="about-managed-link" @click.prevent>
                {{ principal.dev_portal_name }}<ExternalLinkIcon :size="12" decorative />
              </a>
            </div>
          </template>
        </div>

        <PrincipalOverviewTab
          :principal="principal"
          @navigate="navigateToTab"
        />

      </div>

      <!-- Authentication -->
      <div v-else-if="activeTab === '#principal-authentication'" class="tab-content">
        <PrincipalAuthenticationTab ref="authTabRef" :principal="principal" />
      </div>

      <!-- Metadata -->
      <div v-else-if="activeTab === '#principal-metadata'" class="tab-content">
        <PrincipalMetadataTab :principal="principal" />
      </div>

    </template>

    <!-- Edit labels modal -->
    <KModal
      v-if="editLabelsVisible"
      title="Edit labels"
      action-button-text="Save"
      cancel-button-text="Cancel"
      @proceed="saveLabels"
      @cancel="editLabelsVisible = false"
    >
      <div class="edit-labels-form">
        <div
          v-for="(label, index) in localLabels"
          :key="index"
          class="edit-labels-row"
        >
          <KInput v-model="label.key" placeholder="Key" />
          <KInput v-model="label.value" placeholder="Value" />
          <KButton appearance="tertiary" size="small" @click="removeLabel(index)">
            <CloseIcon :size="16" decorative />
          </KButton>
        </div>
        <KButton appearance="tertiary" @click="addLabel">
          <AddIcon decorative />
          Add label
        </KButton>
      </div>
    </KModal>

    <!-- Delete modal -->
    <KModal
      v-if="deleteModalVisible"
      title="Delete principal"
      action-button-text="Delete"
      action-button-appearance="danger"
      cancel-button-text="Cancel"
      @proceed="handleDelete"
      @cancel="deleteModalVisible = false"
    >
      <p>
        Are you sure you want to delete <strong>{{ principal?.name }}</strong>?
        This action cannot be undone.
      </p>
    </KModal>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  AddIcon,
  ChevronDownIcon,
  CloseIcon,
  SecurityIcon,
  CogIcon,
  ExternalLinkIcon,
} from '@kong/icons'
import {
  KButton,
  KDropdown,
  KDropdownItem,
  KInput,
  KSkeleton,
  KSkeletonBox,
  KTabs,
  KCopy,
  KBadge,
  KModal,
} from '@kong/kongponents'
import type { Tab } from '@kong/kongponents'
import { format } from 'date-fns'
import AppPageHeader from '@/components/AppPageHeader.vue'
import PrincipalOverviewTab from '@/components/principals/PrincipalOverviewTab.vue'
import PrincipalAuthenticationTab from '@/components/principals/PrincipalAuthenticationTab.vue'
import PrincipalMetadataTab from '@/components/principals/PrincipalMetadataTab.vue'
import LaunchLearningHubThroughBookIcon from '@/components/LaunchLearningHubThroughBookIcon.vue'
import { usePrincipalStore } from '@/composables/usePrincipalStore'

const route = useRoute()
const router = useRouter()
const store = usePrincipalStore()

const id = computed(() => route.params.id as string)
const principal = computed(() => store.getById(id.value))

const breadcrumbs = computed(() => [
  { key: 'identity', text: 'Identity', to: { name: 'principals-list' } },
  { key: 'principals', text: 'Principals', to: { name: 'principals-list' } },
  { key: 'current', text: principal.value?.name || id.value },
])

const formattedCreatedAt = computed(() => {
  if (!principal.value?.created_at) return ''
  try {
    return format(new Date(principal.value.created_at), 'MMM d, yyyy, h:mm a')
  } catch {
    return principal.value.created_at
  }
})

const principalLabels = computed(() => {
  const labels = principal.value?.labels || {}
  return Object.entries(labels).map(([key, value]) => ({ key, value }))
})

const tabs: Tab[] = [
  { hash: '#principal-overview', title: 'Overview' },
  { hash: '#principal-authentication', title: 'Authentication' },
  { hash: '#principal-metadata', title: 'Metadata' },
]

const isDevPortal = computed(() => principal.value?.source === 'dev_portal')

const activeTab = ref('#principal-overview')
const showWelcomeCard = ref(true)
const deleteModalVisible = ref(false)
const authTabRef = ref<{ openSlideout(): void } | null>(null)

const editLabelsVisible = ref(false)
const localLabels = ref<Array<{ key: string; value: string }>>([])

function navigateToTab(tab: string) {
  activeTab.value = `#principal-${tab}`
}

function handleDelete() {
  store.remove(id.value)
  router.push({ name: 'principals-list' })
}

function viewInDevPortal() {
  const { href } = router.resolve({ name: 'dev-portal-application', params: { principalId: id.value } })
  window.open(href, '_blank')
}

function openEditLabels() {
  const labels = principal.value?.labels || {}
  localLabels.value = Object.entries(labels).map(([key, value]) => ({ key, value }))
  editLabelsVisible.value = true
}

function addLabel() {
  localLabels.value = [...localLabels.value, { key: '', value: '' }]
}

function removeLabel(index: number) {
  localLabels.value = localLabels.value.filter((_, i) => i !== index)
}

function saveLabels() {
  const labels = Object.fromEntries(
    localLabels.value
      .filter(l => l.key.trim())
      .map(l => [l.key.trim(), l.value]),
  )
  store.update(id.value, { labels })
  editLabelsVisible.value = false
}
</script>

<style scoped lang="scss">
@use "@kong/design-tokens/tokens/scss/variables" as *;

.principal-loading {
  display: flex;
  flex-direction: column;
  gap: $kui-space-70;
}

// ─── Welcome card ─────────────────────────────────────────────────────────────

.welcome-card {
  background-color: $kui-color-background-neutral-weakest;
  border: $kui-border-width-10 solid $kui-color-border;
  border-radius: $kui-border-radius-30;
  display: flex;
  flex-direction: column;
  gap: $kui-space-70;
  margin-bottom: $kui-space-70;
  padding: $kui-space-70;
}

.welcome-header {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
}

.welcome-header-text {
  display: flex;
  flex-direction: column;
  gap: $kui-space-10;
}

.welcome-title {
  color: $kui-color-text;
  font-size: $kui-font-size-50;
  font-weight: $kui-font-weight-bold;
  letter-spacing: -0.015em;
  line-height: $kui-line-height-40;
  margin: $kui-space-0;
}

.welcome-subtitle {
  color: $kui-color-text-neutral-stronger;
  font-size: $kui-font-size-40;
  line-height: $kui-line-height-30;
  margin: $kui-space-0;
}

.welcome-close {
  align-items: center;
  background: none;
  border: none;
  color: $kui-color-text-neutral;
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  padding: $kui-space-0;

  &:hover {
    color: $kui-color-text;
  }
}

.welcome-steps {
  display: flex;
  gap: $kui-space-60;
}

.welcome-step-card {
  align-items: center;
  background-color: $kui-color-background;
  border: $kui-border-width-10 solid $kui-color-border;
  border-radius: $kui-border-radius-30;
  cursor: pointer;
  display: flex;
  flex: 1;
  gap: $kui-space-50;
  overflow: hidden;
  padding: $kui-space-60;
  transition: border-color 0.15s ease;

  &:hover {
    border-color: $kui-color-border-primary-weak;
  }
}

.welcome-step-icon {
  align-items: center;
  border-radius: 5.6px;
  display: flex;
  flex-shrink: 0;
  height: 56px;
  justify-content: center;
  width: 56px;

  &--green {
    background-color: $kui-color-background-success-weakest;
    border: 1.4px solid $kui-color-text-success;

    svg {
      color: $kui-color-text-success;
    }
  }

  &--purple {
    background-color: $kui-color-background-decorative-purple-weakest;
    border: 1.4px solid $kui-color-border-decorative-purple;

    svg {
      color: $kui-color-text-decorative-purple;
    }
  }
}

.welcome-step-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: $kui-space-10;
  min-width: 0;
}

.welcome-step-title {
  color: $kui-color-text;
  font-size: $kui-font-size-40;
  font-weight: $kui-font-weight-semibold;
  line-height: $kui-line-height-30;
  margin: $kui-space-0;
}

.welcome-step-desc {
  color: $kui-color-text-neutral;
  font-size: $kui-font-size-20;
  line-height: $kui-line-height-20;
  margin: $kui-space-0;
}

// ─── About card ───────────────────────────────────────────────────────────────

.about-card {
  background-color: $kui-color-background;
  border: $kui-border-width-10 solid $kui-color-border;
  border-radius: $kui-border-radius-30;
  display: flex;
  flex-direction: column;
  gap: $kui-space-50;
  margin-bottom: $kui-space-70;
  padding: $kui-space-70;
}

.about-title-row {
  align-items: center;
  display: flex;
  gap: $kui-space-40;
  justify-content: space-between;
}

.about-title {
  color: $kui-color-text;
  font-size: $kui-font-size-50;
  font-weight: $kui-font-weight-bold;
  letter-spacing: -0.015em;
  line-height: $kui-line-height-40;
  margin: $kui-space-0;
}

.about-created {
  color: $kui-color-text-neutral;
  flex-shrink: 0;
  font-size: $kui-font-size-20;
  line-height: $kui-line-height-20;
}

.about-description {
  color: $kui-color-text;
  font-size: $kui-font-size-40;
  line-height: $kui-line-height-30;
  margin: $kui-space-0;
}

.about-info-row {
  align-items: center;
  display: flex;
  gap: $kui-space-60;
}

.about-id {
  align-items: center;
  display: flex;
  gap: $kui-space-40;
}

.about-labels {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: $kui-space-30;
}

.about-info-label {
  color: $kui-color-text-neutral;
  font-size: $kui-font-size-20;
  flex-shrink: 0;
  line-height: $kui-line-height-20;
}

.about-labels-empty {
  color: $kui-color-text;
  font-size: $kui-font-size-20;
}

// ─── About card: dev portal additions ─────────────────────────────────────────

.about-divider {
  border: none;
  border-top: $kui-border-width-10 solid $kui-color-border;
  margin: $kui-space-10 0;
}

.about-managed-by {
  align-items: center;
  color: $kui-color-text-neutral;
  display: flex;
  font-size: $kui-font-size-20;
  gap: $kui-space-20;
  line-height: $kui-line-height-20;
}

.about-managed-link {
  align-items: center;
  color: $kui-color-text-primary;
  display: inline-flex;
  font-size: $kui-font-size-20;
  gap: $kui-space-10;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

// ─── Edit labels modal ────────────────────────────────────────────────────────

.edit-labels-form {
  display: flex;
  flex-direction: column;
  gap: $kui-space-50;
}

.edit-labels-row {
  align-items: center;
  display: flex;
  gap: $kui-space-40;
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

.tab-content {
  margin-top: $kui-space-70;
}
</style>
