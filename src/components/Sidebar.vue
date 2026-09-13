<template>
  <aside class="kong-ui-app-sidebar" data-testid="kong-ui-app-sidebar">
    <div class="sidebar-content-container">
      <nav aria-label="Main menu">
        <!-- Ungrouped: Overview -->
        <div class="ungrouped-items-container">
          <router-link v-slot="{ navigate, href }" custom :to="{ name: 'home' }">
            <a class="sidebar-item" :class="{ active: isHomeActive }" :href="href" @click="navigate">
              <HomeIcon class="sidebar-item-icon" decorative :size="KUI_ICON_SIZE_40" />
              <span class="sidebar-item-label">Overview</span>
            </a>
          </router-link>
        </div>

        <!-- Connectivity group -->
        <div class="sidebar-items-group">
          <span class="sidebar-items-group-label">Connectivity</span>
          <ul class="sidebar-items-list">
            <li>
              <details class="sidebar-item-details" :open="isApiGatewayExpanded" @toggle="(e: ToggleEvent) => onToggleExpanded('api-gateway', (e.target as HTMLDetailsElement).open)">
                <summary class="sidebar-item" :class="{ active: !isApiGatewayExpanded && isApiGatewayActive }">
                  <RouteIcon class="sidebar-item-icon" decorative :size="KUI_ICON_SIZE_40" />
                  <span class="sidebar-item-label">API Gateway</span>
                  <ChevronRightIcon class="sidebar-item-chevron-icon" :class="{ expanded: isApiGatewayExpanded }" decorative :size="KUI_ICON_SIZE_40" />
                </summary>
                <ul class="sidebar-item-details-list">
                  <router-link v-slot="{ navigate, href }" custom :to="{ name: 'api-gateway-list' }">
                    <li>
                      <a
                        class="sidebar-item"
                        :class="{ active: isApiGatewayGatewaysActive }"
                        :href="href"
                        @click="navigate"
                      >
                        <span class="sidebar-item-label">Gateways</span>
                      </a>
                    </li>
                  </router-link>
                </ul>
              </details>
            </li>

            <li>
              <router-link v-slot="{ navigate, href }" custom :to="{ name: 'event-gateway-list' }">
                <a class="sidebar-item" :class="{ active: isEventGatewayActive }" :href="href" @click="navigate">
                  <SyncAltIcon class="sidebar-item-icon" decorative :size="KUI_ICON_SIZE_40" />
                  <span class="sidebar-item-label">Event Gateway</span>
                </a>
              </router-link>
            </li>

            <li>
              <a class="sidebar-item" href="#">
                <BotIcon class="sidebar-item-icon" decorative :size="KUI_ICON_SIZE_40" />
                <span class="sidebar-item-label">AI Gateway</span>
              </a>
            </li>

            <li>
              <a class="sidebar-item" href="#">
                <DeviceHubIcon class="sidebar-item-icon" decorative :size="KUI_ICON_SIZE_40" />
                <span class="sidebar-item-label">Service Mesh</span>
              </a>
            </li>
          </ul>
        </div>

        <!-- Applications group -->
        <div class="sidebar-items-group">
          <span class="sidebar-items-group-label">Applications</span>
          <ul class="sidebar-items-list">
            <li>
              <a class="sidebar-item" href="#">
                <LibraryBooksOutlineIcon class="sidebar-item-icon" decorative :size="KUI_ICON_SIZE_40" />
                <span class="sidebar-item-label">Catalog</span>
              </a>
            </li>

            <li>
              <a class="sidebar-item" href="#">
                <WebIcon class="sidebar-item-icon" decorative :size="KUI_ICON_SIZE_40" />
                <span class="sidebar-item-label">Dev Portal</span>
              </a>
            </li>

            <li>
              <a class="sidebar-item" href="#">
                <ConnectionsIcon class="sidebar-item-icon" decorative :size="KUI_ICON_SIZE_40" />
                <span class="sidebar-item-label">API Products</span>
              </a>
            </li>

            <li>
              <a class="sidebar-item" href="#">
                <BarChartIcon class="sidebar-item-icon" decorative :size="KUI_ICON_SIZE_40" />
                <span class="sidebar-item-label">Observability</span>
              </a>
            </li>

            <!-- Identity — expandable, wired to prototype routes -->
            <li>
              <details
                class="sidebar-item-details"
                :open="isIdentityExpanded"
                @toggle="(e: ToggleEvent) => onToggleExpanded('identity', (e.target as HTMLDetailsElement).open)"
              >
                <summary
                  ref="identitySummaryRef"
                  class="sidebar-item"
                  :class="{ active: !isIdentityExpanded && isIdentityActive }"
                  @mouseenter="showIdentityPopover = true"
                  @mouseleave="showIdentityPopover = false"
                >
                  <router-link v-slot="{ navigate, href }" custom :to="{ name: 'principals-list' }">
                    <a class="sidebar-item-link-inner" :href="href" @click.stop="navigate">
                      <KeyIcon class="sidebar-item-icon" decorative :size="KUI_ICON_SIZE_40" />
                      <span class="sidebar-item-label-group">
                        <span class="sidebar-item-label">Identity</span>
                        <span v-if="!isIdentityExpanded" class="identity-pulse-dot" />
                      </span>
                    </a>
                  </router-link>
                  <ChevronRightIcon
                    class="sidebar-item-chevron-icon"
                    :class="{ expanded: isIdentityExpanded }"
                    decorative
                    :size="KUI_ICON_SIZE_40"
                  />
                </summary>

                <ul class="sidebar-item-details-list">
                  <li>
                    <router-link v-slot="{ navigate, href }" custom :to="{ name: 'principals-list' }">
                      <a
                        class="sidebar-item"
                        :class="{ active: isIdentityPrincipalsActive }"
                        :href="href"
                        @click="navigate"
                      >
                        <span class="sidebar-item-label">Principals</span>
                      </a>
                    </router-link>
                  </li>
                  <li>
                    <router-link v-slot="{ navigate, href }" custom :to="{ name: 'auth-servers-list' }">
                      <a
                        class="sidebar-item"
                        :class="{ active: isAuthServersActive }"
                        :href="href"
                        @click="navigate"
                      >
                        <span class="sidebar-item-label">Authorization servers</span>
                      </a>
                    </router-link>
                  </li>
                </ul>
              </details>

              <Teleport to="body">
                <div
                  v-if="showIdentityPopover && !isIdentityExpanded"
                  class="identity-hover-popover"
                  :style="identityPopoverStyle"
                >
                  <p class="identity-hover-popover-title">Identity is evolving</p>
                  <p class="identity-hover-popover-body">Meet principals, a new way to manage identities across Kong products—not just a single gateway. Explore the new experience.</p>
                </div>
              </Teleport>
            </li>
          </ul>
        </div>
      </nav>
    </div>

    <div class="sidebar-footer">
      <button class="collapse-btn" aria-label="Collapse sidebar" type="button">
        <PanelCloseLeftIcon decorative :size="KUI_ICON_SIZE_30" />
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  HomeIcon,
  RouteIcon,
  SyncAltIcon,
  BotIcon,
  DeviceHubIcon,
  LibraryBooksOutlineIcon,
  WebIcon,
  ConnectionsIcon,
  BarChartIcon,
  KeyIcon,
  ChevronRightIcon,
  PanelCloseLeftIcon,
} from '@kong/icons'

import { KUI_ICON_SIZE_30, KUI_ICON_SIZE_40 } from '@kong/design-tokens'

const route = useRoute()

const isHomeActive = computed(() => route.name === 'home')

const API_GATEWAY_ROUTES = [
  'api-gateway-list', 'api-gateway-create', 'api-gateway-edit',
  'api-gateway-overview', 'api-gateway-data-plane-nodes',
  'api-gateway-services', 'api-gateway-routes', 'api-gateway-consumers', 'api-gateway-plugins',
  'gateway-service-create', 'gateway-service-edit',
  'gateway-route-create', 'gateway-route-edit',
  'gateway-consumer-create', 'gateway-consumer-edit',
  'gateway-plugin-select', 'gateway-plugin-create', 'gateway-plugin-edit',
]
const isApiGatewayActive = computed(() => API_GATEWAY_ROUTES.includes(route.name as string))
const isApiGatewayGatewaysActive = computed(() => API_GATEWAY_ROUTES.includes(route.name as string))

const EVENT_GATEWAY_ROUTES = [
  'event-gateway-list', 'event-gateway-create', 'event-gateway-edit',
  'event-gateway-overview', 'event-gateway-data-plane-nodes', 'event-gateway-backend-clusters',
  'event-gateway-virtual-clusters', 'event-gateway-listeners', 'event-gateway-resources',
  'virtual-cluster-create', 'virtual-cluster-edit',
]
const isEventGatewayActive = computed(() => EVENT_GATEWAY_ROUTES.includes(route.name as string))


// ── Identity nav state ──
const PRINCIPAL_ROUTES = ['principals-list', 'principal-create', 'principal-detail']
const AUTH_SERVER_ROUTES = [
  'auth-servers-list', 'auth-server-overview', 'auth-server-configuration',
  'auth-server-scopes', 'auth-server-claims', 'auth-server-clients',
  'auth-server-create', 'auth-server-edit',
]

const isIdentityActive = computed(() =>
  [...PRINCIPAL_ROUTES, ...AUTH_SERVER_ROUTES].includes(route.name as string),
)

const isIdentityPrincipalsActive = computed(() =>
  ['principals-list', 'principal-create', 'principal-detail'].includes(route.name as string),
)

const isAuthServersActive = computed(() =>
  ['auth-servers-list', 'auth-server-overview', 'auth-server-configuration',
    'auth-server-scopes', 'auth-server-claims', 'auth-server-clients',
    'auth-server-create', 'auth-server-edit'].includes(route.name as string),
)

// ── Identity hover popover ──
const identitySummaryRef = ref<HTMLElement | null>(null)
const showIdentityPopover = ref(false)

const identityPopoverStyle = computed(() => {
  if (!identitySummaryRef.value || !showIdentityPopover.value) return {}
  const rect = identitySummaryRef.value.getBoundingClientRect()
  return {
    top: `${rect.top + rect.height / 2}px`,
    left: `${rect.right + 10}px`,
  }
})

// ── Expanded state for <details> sections ──
const expandedItems = reactive<Record<string, boolean>>({
  'api-gateway': false,
  identity: false,
})

const isApiGatewayExpanded = computed(() => expandedItems['api-gateway'] ?? false)
const isIdentityExpanded = computed(() => expandedItems.identity ?? false)

const onToggleExpanded = (key: string, open: boolean): void => {
  expandedItems[key] = open
}

watch(
  () => route.name,
  () => {
    if (isApiGatewayActive.value) expandedItems['api-gateway'] = true
    if (isIdentityActive.value) expandedItems.identity = true
  },
  { immediate: true },
)
</script>

<style lang="scss" scoped>
@use "@kong/design-tokens/tokens/scss/variables" as *;

$sidebar-width: 192px;
$navbar-height: 60px;

$scrollbar-width: 8px;
$scrollbar-foreground-color: $kui-color-background-neutral;
$scrollbar-background-color: $kui-color-background-transparent;

.kong-ui-app-sidebar {
  background: $kui-color-background-neutral-weakest;
  border-right: $kui-border-width-10 solid $kui-color-border;
  bottom: 0;
  display: flex;
  flex-direction: column;
  left: 0;
  position: fixed;
  top: $navbar-height;
  width: $sidebar-width;
  z-index: 3;
}

.sidebar-content-container {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: $kui-space-40;
  width: 100%;

  @supports(overflow: overlay) {
    /* stylelint-disable-next-line declaration-property-value-keyword-no-deprecated */
    overflow-y: overlay;
  }

  &::-webkit-scrollbar {
    height: $scrollbar-width;
    width: $scrollbar-width;
  }

  &::-webkit-scrollbar-thumb {
    background: $kui-color-background-transparent;
    border-radius: $kui-border-radius-40;
  }

  &::-webkit-scrollbar-track {
    background: $kui-color-background-transparent;
  }

  scrollbar-color: $kui-color-background-transparent $kui-color-background-transparent;
  scrollbar-width: thin;

  &:hover {
    &::-webkit-scrollbar-thumb {
      background: $scrollbar-foreground-color;
    }

    &::-webkit-scrollbar-track {
      background: $scrollbar-background-color;
    }

    scrollbar-color: $scrollbar-foreground-color $scrollbar-background-color;
  }

  nav {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: $kui-space-60;
    width: 100%;
  }
}

.ungrouped-items-container,
.sidebar-items-group {
  color: $kui-color-text-neutral-strong;
  display: flex;
  flex-direction: column;
  gap: $kui-space-40;
}

.sidebar-items-group-label {
  font-size: $kui-font-size-10;
  font-weight: $kui-font-weight-medium;
  letter-spacing: 1%;
  line-height: $kui-line-height-30;
  padding: $kui-space-0 $kui-space-40;
  text-transform: uppercase;
  user-select: none;
}

.sidebar-items-list {
  display: flex;
  flex-direction: column;
  gap: $kui-space-40;
  list-style: none;
  margin: $kui-space-0;
  padding: $kui-space-0;
}

.sidebar-item {
  align-items: center;
  background-color: $kui-color-background-transparent;
  border: none;
  border-radius: $kui-border-radius-20;
  color: $kui-color-text-neutral-strong;
  cursor: pointer;
  display: flex;
  font-family: inherit;
  font-size: inherit;
  gap: $kui-space-30;
  outline: none;
  padding: $kui-space-30;
  text-decoration: none;
  transition: background-color 0.2s ease-in, color 0.2s ease-in, box-shadow 0.2s ease-in;
  user-select: none;
  width: 100%;

  .sidebar-item-icon {
    color: $kui-color-text-neutral;
    flex-shrink: 0;
    transition: color 0.2s ease-in;

    path {
      fill: $kui-color-text-neutral;
      transition: fill 0.2s ease-in;
    }
  }

  .sidebar-item-label {
    color: $kui-color-text-neutral-strong;
    flex: 1;
    font-size: $kui-font-size-20;
    font-weight: $kui-font-weight-medium;
    line-height: $kui-line-height-30;
    overflow: hidden;
    text-decoration: none;
    text-overflow: ellipsis;
    transition: color 0.2s ease-in, font-weight 0.2s ease-in;
    white-space: nowrap;
  }

  .sidebar-item-chevron-icon {
    color: $kui-color-text-neutral-strong;
    flex-shrink: 0;
    margin-left: auto;
    transition: color 0.2s ease-in, transform 0.2s ease-in;

    &.expanded {
      transform: rotate(90deg);
    }
  }

  &:hover {
    background-color: $kui-color-background-neutral-weaker;
    color: $kui-color-text;

    .sidebar-item-icon {
      color: $kui-color-text;
      path { fill: $kui-color-text; }
    }

    .sidebar-item-label,
    .sidebar-item-chevron-icon {
      color: $kui-color-text;
    }
  }

  &:focus-visible {
    box-shadow: $kui-shadow-focus;
  }

  &.active {
    color: $kui-color-text-primary;

    .sidebar-item-icon {
      color: $kui-color-text-primary;
      path { fill: $kui-color-text-primary; }
    }

    .sidebar-item-label {
      color: $kui-color-text-primary;
      font-weight: $kui-font-weight-semibold;
    }
  }
}

// The inner <a> inside the Identity summary (handles click-to-navigate separately from chevron toggle)
.sidebar-item-link-inner {
  align-items: center;
  color: inherit;
  display: flex;
  flex: 1;
  gap: $kui-space-30;
  min-width: 0;
  text-decoration: none;
}

.sidebar-item-details {
  summary {
    list-style: none;

    &::-webkit-details-marker { display: none; }
    &::marker { content: ''; display: none; }
  }

  .sidebar-item-details-list {
    list-style: none;
    margin: $kui-space-0 $kui-space-0 $kui-space-40;
    padding: $kui-space-0;

    .sidebar-item {
      padding-left: $kui-space-90;
    }
  }
}

.sidebar-footer {
  align-items: center;
  border-top: $kui-border-width-10 solid $kui-color-border;
  display: flex;
  flex-shrink: 0;
  justify-content: flex-end;
  padding: $kui-space-40;
  width: 100%;
}

.collapse-btn {
  align-items: center;
  background: transparent;
  border: none;
  border-radius: $kui-border-radius-20;
  color: $kui-color-text-neutral;
  cursor: pointer;
  display: flex;
  padding: $kui-space-40;
  transition: background-color 0.15s ease-in-out, color 0.15s ease-in-out;

  &:hover {
    background-color: $kui-color-background-neutral-weaker;
    color: $kui-color-text;
  }

  &:focus-visible {
    box-shadow: $kui-shadow-focus;
    outline: none;
  }
}

@keyframes identity-pulse {
  0% { box-shadow: 0 0 0 0 rgba($kui-color-text-decorative-aqua, 0.6); }
  70% { box-shadow: 0 0 0 6px rgba($kui-color-text-decorative-aqua, 0); }
  100% { box-shadow: 0 0 0 0 rgba($kui-color-text-decorative-aqua, 0); }
}

.sidebar-item-label-group {
  align-items: center;
  display: flex;
  flex: 1;
  gap: $kui-space-40;
  min-width: 0;

  .sidebar-item-label {
    flex: 0 0 auto;
  }
}

.identity-pulse-dot {
  animation: identity-pulse 2s ease-in-out infinite;
  background-color: $kui-color-text-decorative-aqua;
  border-radius: 50%;
  cursor: pointer;
  display: inline-block;
  flex-shrink: 0;
  height: 7px;
  width: 7px;
}

.identity-popover-content {
  display: flex;
  flex-direction: column;
  gap: $kui-space-30;
  padding: $kui-space-20;

  .identity-popover-title {
    color: $kui-color-text;
    font-size: $kui-font-size-30;
    font-weight: $kui-font-weight-semibold;
    margin: $kui-space-0;
  }

  .identity-popover-body {
    color: $kui-color-text-neutral;
    font-size: $kui-font-size-20;
    line-height: $kui-line-height-30;
    margin: $kui-space-0;
  }
}


</style>

<style lang="scss">
@use "@kong/design-tokens/tokens/scss/variables" as *;

.identity-hover-popover {
  background-color: $kui-color-background;
  border: $kui-border-width-10 solid $kui-color-border;
  border-radius: $kui-border-radius-30;
  box-shadow: $kui-shadow;
  display: flex;
  flex-direction: column;
  gap: $kui-space-30;
  max-width: 260px;
  padding: $kui-space-50;
  pointer-events: none;
  position: fixed;
  transform: translateY(-50%);
  z-index: 1000;

  &::before {
    border: 7px solid transparent;
    border-right-color: $kui-color-border;
    content: '';
    position: absolute;
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
  }

  &::after {
    border: 6px solid transparent;
    border-right-color: $kui-color-background;
    content: '';
    position: absolute;
    right: calc(100% - 1px);
    top: 50%;
    transform: translateY(-50%);
  }
}

.identity-hover-popover-title {
  color: $kui-color-text;
  font-family: $kui-font-family-text;
  font-size: $kui-font-size-30;
  font-weight: $kui-font-weight-semibold;
  line-height: $kui-line-height-20;
  margin: 0;
}

.identity-hover-popover-body {
  color: $kui-color-text-neutral;
  font-family: $kui-font-family-text;
  font-size: $kui-font-size-20;
  line-height: $kui-line-height-30;
  margin: 0;
}
</style>
