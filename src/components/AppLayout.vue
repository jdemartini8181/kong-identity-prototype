<template>
  <!-- New nav -->
  <div v-if="isNewNav" class="kong-ui-app-layout new-nav">
    <Navbar />
    <Sidebar />
    <main
      class="kong-ui-app-layout-main"
      data-testid="kong-ui-app-layout-main"
    >
      <div class="kong-ui-app-layout-content">
        <div class="kong-ui-app-layout-content-inner">
          <slot name="default" />
        </div>
      </div>
    </main>
  </div>

  <!-- Legacy nav -->
  <div v-else class="kong-ui-app-layout legacy-nav">
    <LegacyNavbar :left-offset="240" />
    <LegacySidebar />
    <main
      class="kong-ui-app-layout-main"
      data-testid="kong-ui-app-layout-main"
    >
      <div class="kong-ui-app-layout-content">
        <div class="kong-ui-app-layout-content-inner">
          <slot name="default" />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import Sidebar from './Sidebar.vue'
import Navbar from './Navbar.vue'
import LegacySidebar from './LegacySidebar.vue'
import LegacyNavbar from './LegacyNavbar.vue'
import { useNavVersion } from '@/composables'

const { isNewNav } = useNavVersion()
</script>

<style lang="scss">
@use "@kong/design-tokens/tokens/scss/variables" as *;

html, body {
  height: 100%;
  height: 100vh;
  margin: $kui-space-0;
  overflow: hidden;
  overscroll-behavior-y: none;
  padding: $kui-space-0;
  width: 100%;
}

body {
  background-color: $kui-color-background;
  color: $kui-color-text;
  font-family: $kui-font-family-text;
  font-size: $kui-font-size-40;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-weight: $kui-font-weight-regular;
  line-height: $kui-line-height-40;
}

#app {
  height: 100%;
}
</style>

<style scoped lang="scss">
@use "@kong/design-tokens/tokens/scss/variables" as *;

$new-sidebar-width: 192px;
$legacy-sidebar-width: 240px;
$navbar-height: 60px;

.kong-ui-app-layout {
  bottom: 0;
  display: flex;
  flex-direction: column;
  font-family: $kui-font-family-text;
  height: 100%;
  left: 0;
  overflow: hidden;
  position: fixed;
  right: 0;
  top: 0;
  width: 100%;

  &.new-nav {
    background: $kui-color-background-neutral-weakest;

    .kong-ui-app-layout-main {
      align-items: stretch;
      background-color: $kui-color-background;
      color: $kui-color-text;
      display: flex;
      flex-grow: 1;
      height: 100%;
      margin-top: #{$navbar-height};
      margin-left: $new-sidebar-width;
      overflow: auto;
      position: relative;
      width: calc(100% - #{$new-sidebar-width});
    }
  }

  &.legacy-nav {
    background: $kui-color-background-inverse;

    .kong-ui-app-layout-main {
      align-items: stretch;
      background-color: $kui-color-background;
      border-top-left-radius: $kui-border-radius-20;
      box-shadow: var(--kong-ui-app-layout-main-box-shadow, -30px 174px 250px #0023db);
      color: $kui-color-text;
      display: flex;
      flex-grow: 1;
      height: 100%;
      margin-left: $legacy-sidebar-width;
      margin-top: #{$navbar-height};
      overflow: auto;
      position: relative;
      width: calc(100% - #{$legacy-sidebar-width});
    }
  }

  .kong-ui-app-layout-content {
    position: relative;
    width: 100%;

    &-inner {
      padding: var(--kong-ui-app-layout-content-padding-top, $kui-space-70) var(--kong-ui-app-layout-content-padding-x, $kui-space-70) var(--kong-ui-app-layout-content-padding-bottom, $kui-space-130);
    }
  }
}
</style>
