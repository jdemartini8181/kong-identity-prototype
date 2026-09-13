<template>
  <div class="oauth-bearer-config">
    <KInput
      v-if="showExternalValidateFields"
      :model-value="auth.jwks?.endpoint ?? auth.jwks_url ?? ''"
      data-testid="input-jwks-url"
      help="URL used to validate JWT signatures from the external authentication server."
      label="JWKS URL"
      placeholder="e.g., https://example.com/.well-known/jwks.json"
      required
      @update:model-value="value => updateJwks('endpoint', value as string)"
    />

    <KCollapse
      class="advanced-collapse"
      :model-value="isAdvancedCollapsed"
      @update:model-value="isAdvancedCollapsed = $event"
    >
      <template #trigger="{ isCollapsed, toggle }">
        <KButton
          appearance="tertiary"
          class="advanced-trigger"
          type="button"
          @click="toggle()"
        >
          {{ isCollapsed ? 'Show advanced configuration' : 'Hide advanced configuration' }}
        </KButton>
      </template>

      <div class="advanced-config">
        <section class="advanced-section">
          <h3 class="advanced-section-title">
            Principal resolution
          </h3>

          <div class="principal-lookup-row">
            <KInputSwitch
              :model-value="principalLookupEnabled"
              :data-testid="`toggle-principal-lookup-${authIndex}`"
              aria-label="Use principal lookup"
              @update:model-value="value => { auth.principal_lookup = value as boolean }"
            />
            <KLabel info="Match connecting clients to principals in Kong Identity.">
              Use principal lookup
            </KLabel>
          </div>

          <KSelect
            :model-value="auth.principal_match_method"
            :disabled="!principalLookupEnabled"
            :items="matchMethodItems"
            label="Match method"
            @update:model-value="value => onMatchMethodChange(value as VirtualClusterAuthItem['principal_match_method'])"
          >
            <template #item-template="{ item }">
              <div class="select-item">
                <div class="select-item-title">{{ item.label }}</div>
                <div class="select-item-description">{{ item.description }}</div>
              </div>
            </template>
          </KSelect>

          <template v-if="auth.auth_server_type === 'kong_managed' && auth.principal_match_method === 'custom_claim'">
            <KInput
              :model-value="auth.jwt_claim_name ?? ''"
              :disabled="!principalLookupEnabled"
              data-testid="input-jwt-claim-name"
              help="JWT claim used to identify the principal."
              label="JWT claim name"
              placeholder="e.g., cust_id"
              @update:model-value="value => { auth.jwt_claim_name = (value as string) || undefined }"
            />
            <KInput
              :model-value="auth.custom_identity_name ?? ''"
              :disabled="!principalLookupEnabled"
              data-testid="input-identity-name"
              help="Name of the custom identity to match against."
              label="Identity name"
              placeholder="e.g., Customer_ID"
              @update:model-value="value => { auth.custom_identity_name = (value as string) || undefined }"
            />
          </template>

          <template v-if="auth.auth_server_type === 'external' && auth.principal_match_method === 'custom_jwt_claim'">
            <KInput
              :model-value="auth.jwt_claim_name ?? ''"
              :disabled="!principalLookupEnabled"
              data-testid="input-jwt-claim-name"
              help="JWT claim used to identify the principal."
              label="JWT claim name"
              placeholder="e.g., cust_id"
              @update:model-value="value => { auth.jwt_claim_name = (value as string) || undefined }"
            />

            <KSelect
              :model-value="auth.match_against"
              :disabled="!principalLookupEnabled"
              :items="matchAgainstItems"
              label="Match against"
              @update:model-value="value => onMatchAgainstChange(value as 'oidc_identity' | 'custom_identity')"
            >
              <template #item-template="{ item }">
                <div class="select-item">
                  <div class="select-item-title">{{ item.label }}</div>
                  <div class="select-item-description">{{ item.description }}</div>
                </div>
              </template>
            </KSelect>

            <KInput
              v-if="auth.match_against === 'custom_identity'"
              :model-value="auth.custom_identity_name ?? ''"
              :disabled="!principalLookupEnabled"
              data-testid="input-custom-identity-name"
              label="Custom identity name"
              placeholder="e.g., Customer_ID"
              @update:model-value="value => { auth.custom_identity_name = (value as string) || undefined }"
            />
          </template>

          <div class="lookup-failure-group">
            <KLabel>If principal lookup fails</KLabel>
            <KRadio
              :model-value="auth.principal_lookup_failure ?? 'reject_request'"
              :disabled="!principalLookupEnabled"
              description="Fail authentication if Kong Identity cannot resolve the principal."
              label="Reject the request"
              selected-value="reject_request"
              @update:model-value="value => { auth.principal_lookup_failure = value as VirtualClusterAuthItem['principal_lookup_failure'] }"
            />
            <KRadio
              :model-value="auth.principal_lookup_failure ?? 'reject_request'"
              :disabled="!principalLookupEnabled"
              description="Allow the request to continue without principal enrichment."
              label="Continue without a principal"
              selected-value="continue_without_principal"
              @update:model-value="value => { auth.principal_lookup_failure = value as VirtualClusterAuthItem['principal_lookup_failure'] }"
            />
          </div>
        </section>

        <template v-if="showExternalValidateFields">
          <hr class="advanced-divider">

          <section class="advanced-section">
            <h3 class="advanced-section-title">
              Token claims and discovery
            </h3>

            <KInput
              :model-value="auth.claims_mapping?.sub ?? ''"
              :label-attributes="{ info: 'Token field containing the subject claim.' }"
              label="Sub claim field"
              placeholder="e.g., sub"
              @update:model-value="value => updateClaimsMapping('sub', value as string)"
            />

            <KInput
              :model-value="auth.claims_mapping?.scope ?? ''"
              :label-attributes="{ info: 'Token field containing the scope claim.' }"
              label="Scope claim field"
              placeholder="e.g., scope"
              @update:model-value="value => updateClaimsMapping('scope', value as string)"
            />

            <div class="two-column-fields">
              <KInput
                :model-value="auth.jwks?.timeout ?? ''"
                :label-attributes="{ info: 'Total time from establishing connection to wait for a response from the JWKS endpoint.' }"
                label="JWKS endpoint timeout"
                placeholder="e.g., 10s"
                @update:model-value="value => updateJwks('timeout', value as string)"
              />

              <KInput
                :model-value="auth.jwks?.cache_expiration ?? ''"
                :label-attributes="{ info: 'Duration after which the gateway will fetch and cache the JWKS.' }"
                label="JWKS cache expiration"
                placeholder="e.g., 10s"
                @update:model-value="value => updateJwks('cache_expiration', value as string)"
              />
            </div>
          </section>

          <hr class="advanced-divider">

          <section class="advanced-section">
            <h3 class="advanced-section-title">
              Validation rules
            </h3>

            <KInput
              :model-value="auth.validate?.issuer ?? ''"
              :label-attributes="{ info: 'Accepted authentication server that created and signed the OAuth token.' }"
              label="Token issuer"
              placeholder="Enter an issuer"
              @update:model-value="value => updateValidateIssuer(value as string)"
            />

            <div class="audience-group">
              <KLabel info="Intended recipient of the token.">
                Audience
              </KLabel>

              <div
                v-for="(_, audienceIndex) in audiences"
                :key="audienceIndex"
                class="audience-row"
              >
                <KInput
                  :model-value="auth.validate?.audiences?.[audienceIndex]?.name ?? ''"
                  :data-testid="`input-audience-${authIndex}-${audienceIndex}`"
                  placeholder="Enter an audience"
                  @update:model-value="value => updateAudience(audienceIndex, value as string)"
                />
                <KButton
                  :aria-label="`Remove audience ${audienceIndex + 1}`"
                  appearance="tertiary"
                  class="remove-audience-btn"
                  type="button"
                  @click="removeAudience(audienceIndex)"
                >
                  <CloseIcon decorative />
                </KButton>
              </div>

              <KButton
                appearance="tertiary"
                class="add-audience-btn"
                type="button"
                @click="addAudience"
              >
                <AddIcon decorative />
                Add an audience
              </KButton>
            </div>
          </section>
        </template>
      </div>
    </KCollapse>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { AddIcon, CloseIcon } from '@kong/icons'
import { KButton, KCollapse, KInput, KInputSwitch, KLabel, KRadio, KSelect } from '@kong/kongponents'
import type { VirtualClusterAuthItem } from '@/types'

defineProps<{
  authIndex: number
}>()

const auth = defineModel<VirtualClusterAuthItem>({ required: true })

const isAdvancedCollapsed = ref(true)

const showExternalValidateFields = computed(() =>
  auth.value.auth_server_type === 'external' && auth.value.mediation === 'validate_forward',
)

const principalLookupEnabled = computed(() => auth.value.principal_lookup !== false)

const matchMethodItems = computed(() =>
  auth.value.auth_server_type === 'external'
    ? [
        { label: 'Token subject', value: 'token_subject', description: 'Match principals using the issuer and subject (sub) claims from the token.' },
        { label: 'Custom JWT claim', value: 'custom_jwt_claim', description: 'JWT claim used to identify the principal.' },
      ]
    : [
        { label: 'Match Kong Identity client', value: 'kong_identity_client', description: 'Match principals using the client ID from the token subject (sub) claim.' },
        { label: 'Match custom claim', value: 'custom_claim', description: 'Match principals using a custom JWT claim.' },
      ],
)

const matchAgainstItems = [
  { label: 'OIDC identity', value: 'oidc_identity', description: 'Match principals using an external OAuth client identity.' },
  { label: 'Custom identity', value: 'custom_identity', description: 'Select the custom identity to match against.' },
]

const audiences = computed(() => auth.value.validate?.audiences ?? [])

const isCustomClaim = (method?: string): boolean =>
  method === 'custom_claim' || method === 'custom_jwt_claim'

const trimNestedAuthField = (field: 'jwks' | 'claims_mapping' | 'validate'): void => {
  if (Object.keys(auth.value[field] || {}).length === 0) {
    delete auth.value[field]
  }
}

const updateJwks = (
  field: keyof NonNullable<VirtualClusterAuthItem['jwks']>,
  value: string,
): void => {
  delete auth.value.jwks_url

  if (value) {
    auth.value.jwks ??= {}
    auth.value.jwks[field] = value
  } else {
    delete auth.value.jwks?.[field]
    trimNestedAuthField('jwks')
  }
}

const updateClaimsMapping = (
  field: keyof NonNullable<VirtualClusterAuthItem['claims_mapping']>,
  value: string,
): void => {
  if (value) {
    auth.value.claims_mapping ??= {}
    auth.value.claims_mapping[field] = value
  } else {
    delete auth.value.claims_mapping?.[field]
    trimNestedAuthField('claims_mapping')
  }
}

const updateValidateIssuer = (value: string): void => {
  if (value) {
    auth.value.validate ??= {}
    auth.value.validate.issuer = value
  } else {
    delete auth.value.validate?.issuer
    trimNestedAuthField('validate')
  }
}

const addAudience = (): void => {
  auth.value.validate ??= {}
  auth.value.validate.audiences ??= []
  auth.value.validate.audiences.push({ name: '' })
}

const updateAudience = (index: number, value: string): void => {
  auth.value.validate ??= {}
  auth.value.validate.audiences ??= []
  auth.value.validate.audiences[index] = { name: value }
}

const removeAudience = (index: number): void => {
  auth.value.validate?.audiences?.splice(index, 1)
  if (auth.value.validate?.audiences?.length === 0) {
    delete auth.value.validate.audiences
  }
  trimNestedAuthField('validate')
}

const onMatchMethodChange = (value: VirtualClusterAuthItem['principal_match_method']): void => {
  auth.value.principal_match_method = value
  if (!isCustomClaim(value)) {
    delete auth.value.jwt_claim_name
    delete auth.value.match_against
    delete auth.value.custom_identity_name
  } else if (value === 'custom_jwt_claim') {
    auth.value.match_against ??= 'oidc_identity'
  }
}

const onMatchAgainstChange = (value: 'oidc_identity' | 'custom_identity'): void => {
  auth.value.match_against = value
  if (value !== 'custom_identity') {
    delete auth.value.custom_identity_name
  }
}
</script>

<style scoped lang="scss">
@use "@kong/design-tokens/tokens/scss/variables" as *;

.oauth-bearer-config,
.advanced-config,
.advanced-section,
.lookup-failure-group,
.audience-group {
  display: flex;
  flex-direction: column;
}

.oauth-bearer-config,
.advanced-config {
  gap: $kui-space-70;
}

.advanced-collapse {
  margin-top: $kui-space-40;
}

.advanced-trigger {
  color: $kui-color-text-primary !important;
  font-weight: $kui-font-weight-semibold;
  padding-left: $kui-space-0 !important;
}

.advanced-section {
  gap: $kui-space-70;
}

.advanced-section-title {
  color: $kui-color-text;
  font-size: $kui-font-size-40;
  font-weight: $kui-font-weight-bold;
  line-height: $kui-line-height-40;
  margin: $kui-space-0;
}

.principal-lookup-row {
  align-items: center;
  display: flex;
  gap: $kui-space-40;

  :deep(.k-label) {
    margin-bottom: $kui-space-0;
  }
}

.lookup-failure-group {
  gap: $kui-space-40;
}

.advanced-divider {
  border: none;
  border-top: $kui-border-width-10 solid $kui-color-border;
  margin: $kui-space-0;
}

.two-column-fields,
.audience-row {
  display: flex;
  gap: $kui-space-60;
}

.two-column-fields > *,
.audience-row .k-input {
  flex: 1;
}

.audience-group {
  gap: $kui-space-40;
}

.add-audience-btn {
  align-self: flex-start;
  color: $kui-color-text-primary !important;
  font-weight: $kui-font-weight-semibold;
  padding-left: $kui-space-0 !important;
}

.remove-audience-btn {
  align-self: flex-end;
}

.select-item {
  display: flex;
  flex-direction: column;
  gap: $kui-space-10;
}

.select-item-title {
  font-weight: $kui-font-weight-medium;
}

.select-item-description {
  color: $kui-color-text-neutral;
  font-size: $kui-font-size-20;
  line-height: $kui-line-height-30;
}
</style>
