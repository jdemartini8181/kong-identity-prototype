<template>
  <div class="need-help-content">
    <h2>Need more help?</h2>

    <KExternalLink
      class="docs-card"
      data-testid="explore-kong-docs"
      hide-icon
      :href="docsLink"
    >
      <div class="docs-card-icon">
        <BookIcon
          :color="KUI_COLOR_TEXT_PRIMARY"
          :size="KUI_ICON_SIZE_40"
          decorative
        />
      </div>
      <div class="docs-card-content">
        <div class="docs-card-title">Explore Kong Docs</div>
        <p class="docs-card-description">Discover Kong's tools, APIs, and tutorials.</p>
      </div>
      <ExternalLinkIcon :size="KUI_ICON_SIZE_30" decorative />
    </KExternalLink>

    <KExternalLink
      class="docs-card"
      data-testid="learn-through-kong-demos"
      hide-icon
      href="https://konghq.com/products/kong-konnect/demo"
    >
      <div class="docs-card-icon">
        <BrainIcon
          :color="KUI_COLOR_TEXT_PRIMARY"
          :size="KUI_ICON_SIZE_40"
          decorative
        />
      </div>
      <div class="docs-card-content">
        <div class="docs-card-title">Learn through Kong Demos</div>
        <p class="docs-card-description">Explore interactive demos to see Kong in action and understand how to set up, configure, and manage your APIs effectively.</p>
      </div>
      <ExternalLinkIcon :size="KUI_ICON_SIZE_30" decorative />
    </KExternalLink>
  </div>
</template>

<script setup lang="ts">
import { BookIcon, BrainIcon, ExternalLinkIcon } from '@kong/icons'
import { KUI_COLOR_TEXT_PRIMARY, KUI_ICON_SIZE_30, KUI_ICON_SIZE_40 } from '@kong/design-tokens'
import { KExternalLink } from '@kong/kongponents'

withDefaults(defineProps<{
  docsLink?: string
}>(), {
  docsLink: 'https://developer.konghq.com/kong-identity/',
})
</script>

<style lang="scss" scoped>
@use "@kong/design-tokens/tokens/scss/variables" as *;

.need-help-content {
  border-top: $kui-border-width-10 solid $kui-color-border;
  padding-top: $kui-space-70;

  h2 {
    font-size: $kui-font-size-40;
    font-weight: $kui-font-weight-semibold;
    margin-bottom: $kui-space-50;
    margin-top: $kui-space-0;
  }
}

.docs-card {
  align-items: flex-start;
  background-color: $kui-color-background-neutral-weakest;
  border: $kui-border-width-10 solid $kui-color-border;
  border-radius: $kui-border-radius-20;
  color: $kui-color-text;
  display: flex;
  gap: $kui-space-50;
  margin-bottom: $kui-space-50;
  padding: $kui-space-50 $kui-space-60;
  text-decoration: none;
  width: 100%;

  &:hover {
    color: $kui-color-text-primary;
  }

  .docs-card-icon {
    align-items: center;
    background-color: $kui-color-background-primary-weakest;
    display: flex;
    flex-shrink: 0;
    height: 40px;
    justify-content: center;
    width: 40px;
  }

  .docs-card-content {
    display: flex;
    flex: 1;
    flex-direction: column;

    .docs-card-title {
      font-size: $kui-font-size-30;
      font-weight: $kui-font-weight-semibold;
    }

    .docs-card-description {
      color: $kui-color-text-neutral;
      font-size: $kui-font-size-20;
      margin: $kui-space-0;
    }
  }
}
</style>
