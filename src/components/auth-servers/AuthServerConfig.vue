<template>
  <div class="auth-server-config">
    <KCard>
      <ConfigCardDisplay :property-collections="propertyCollections" />
    </KCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { KCard } from '@kong/kongponents'
import ConfigCardDisplay from '@/components/ConfigCardDisplay.vue'
import type { PropertyCollection } from '@/components/ConfigCardDisplay.vue'
import type { AuthServer } from '@/types'

const props = defineProps<{
  authServer: AuthServer
}>()

const propertyCollections = computed((): PropertyCollection[] => [
  {
    title: 'Basic',
    items: [
      {
        key: 'description',
        label: 'Description',
        value: props.authServer.description || '–',
        type: 'plain',
      },
      {
        key: 'audience',
        label: 'Audience',
        value: props.authServer.audience,
        type: 'plain',
      },
    ],
  },
  {
    title: 'Advanced',
    items: [
      {
        key: 'issuer',
        label: 'Issuer URL',
        value: props.authServer.issuer,
        type: 'plain',
        tooltip: 'The base URL of the authorization server that issues tokens.',
      },
      {
        key: 'metadata_uri',
        label: 'Metadata URI',
        value: props.authServer.metadata_uri || '–',
        type: 'plain',
        tooltip: 'The well-known endpoint for OpenID Connect discovery metadata.',
      },
      {
        key: 'trusted_origins',
        label: 'Trusted origins',
        value: props.authServer.trusted_origins?.join(', ') || '–',
        type: 'plain',
        tooltip: 'Origins allowed to use tokens from this auth server.',
      },
      {
        key: 'created_at',
        label: 'Created',
        value: props.authServer.created_at,
        type: 'date',
      },
      {
        key: 'updated_at',
        label: 'Last updated',
        value: props.authServer.updated_at,
        type: 'date',
      },
    ],
  },
])
</script>

<style scoped lang="scss">
@use "@kong/design-tokens/tokens/scss/variables" as *;

.auth-server-config {
  :deep(.config-card-display) {
    padding: $kui-space-20 $kui-space-0;
  }
}
</style>
