<template>
  <div class="gateway-plugin-form-page">
    <AppPageHeader
      :title="pluginType === 'openid-connect' ? 'Configure plugin: openid connect' : (isEdit ? `Edit ${pluginLabel}` : `New ${pluginLabel}`)"
      :breadcrumbs="breadcrumbs"
    >
      <template v-if="pluginType === 'openid-connect'" #actions>
        <KButton appearance="tertiary" size="small">
          View docs
          <ExternalLinkIcon decorative />
        </KButton>
      </template>
    </AppPageHeader>

    <EntityBaseForm
      :is-editing="isEdit"
      :can-submit="isFormValid"
      :entity-type="pluginLabel"
      :error-message="errorMessage"
      :save-button-text="pluginType === 'openid-connect' || isEdit ? 'Save' : 'Enable'"
      @submit="handleSubmit"
      @cancel="handleCancel"
    >

      <!-- ── OpenID Connect: flat layout matching production ─────── -->
      <template v-if="pluginType === 'openid-connect'">
        <div class="oidc-form">

          <!-- Plugin enabled -->
          <KInputSwitch
            v-model="form.enabled"
            data-testid="switch-enabled"
            :label="form.enabled ? 'This plugin is enabled' : 'This plugin is disabled'"
          />

          <!-- Scope -->
          <div class="oidc-scope-row">
            <KRadio
              v-model="form.scopeType"
              card
              card-orientation="horizontal"
              description="All services, routes, and consumers"
              label="Global"
              selected-value="global"
            />
            <KRadio
              v-model="form.scopeType"
              card
              card-orientation="horizontal"
              description="Specific Gateway services and/or Routes"
              label="Scoped"
              selected-value="scoped"
            />
          </div>

          <template v-if="form.scopeType === 'scoped'">
            <KSelect
              v-model="form.entityType"
              data-testid="select-entity-type"
              :items="entityTypeItems"
              label="Scope"
              required
            />
            <KSelect
              v-if="form.entityType === 'service'"
              v-model="form.service_id"
              data-testid="select-service"
              :items="serviceItems"
              label="Select a gateway service"
              :label-attributes="{ info: 'The gateway service to which this plugin configuration will apply.' }"
              placeholder="Search by name or UUID"
              required
            />
            <KSelect
              v-else-if="form.entityType === 'route'"
              v-model="form.route_id"
              data-testid="select-route"
              :items="routeItems"
              label="Select a route"
              :label-attributes="{ info: 'The route that this plugin configuration will target.' }"
              placeholder="Search by name or UUID"
              required
            />
            <KSelect
              v-else-if="form.entityType === 'consumer'"
              v-model="form.consumer_id"
              data-testid="select-consumer"
              :items="consumerItems"
              label="Select a consumer"
              :label-attributes="{ info: 'The consumer that this plugin configuration will target.' }"
              placeholder="Search by name or UUID"
              required
            />
          </template>

          <!-- Protocols -->
          <div class="field-group">
            <KLabel info="A list of the request protocols that will trigger this plugin. The default value, as well as the possible values allowed on this field, may change depending on the plugin type.">
              Protocols
              <template #tooltip>
                A list of the request protocols that will trigger this plugin.
              </template>
            </KLabel>
            <KMultiselect
              v-model="form.oidc.protocols"
              data-testid="multiselect-protocols"
              :items="protocolItems"
              placeholder="Select protocols"
            />
          </div>

          <!-- Name -->
          <KInput
            v-model.trim="form.instance_name"
            data-testid="input-name"
            label="Name"
            :label-attributes="{ info: 'A custom name for this plugin instance to help with identifying it from the list view.' }"
            placeholder=""
          />

          <!-- Execution Condition -->
          <KInput
            v-model.trim="form.oidc.execution_condition"
            data-testid="input-execution-condition"
            label="Execution Condition"
            :label-attributes="{ info: 'A Kong expression that is evaluated when the plugin is invoked. The plugin is only executed when the expression evaluates to true. Leaving this blank means the plugin always runs.' }"
            placeholder="Enter an expression"
          />

          <!-- Tabs -->
          <KTabs v-model="activeOidcTab" :tabs="oidcTabs" />

          <!-- Common tab -->
          <template v-if="activeOidcTab === '#common'">
            <div class="oidc-config-section">
              <div class="oidc-section-header">
                <span class="oidc-section-title">Common Configuration Settings</span>
                <ExternalLinkIcon class="oidc-section-link-icon" decorative />
              </div>
              <p class="oidc-section-description">
                Parameters for enabling the OpenID Connect plugin. Set these parameters before adding authorization, authentication, or other advanced configuration details.
              </p>

              <!-- Auth manager -->
              <div class="field-group">
                <KLabel>Who should manage authentication and credentials?</KLabel>
                <p class="help-text">Use Consumers for Consumer-based authentication. Use Kong Identity for principal-based authentication and advanced integrations. <a href="#" @click.prevent="openLearningHub('identity')">Learn more.</a></p>
                <div class="radio-options auth-manager-options">
                  <KRadio
                    v-model="form.oidc.authManager"
                    card
                    card-orientation="horizontal"
                    data-testid="radio-auth-manager-kong-identity"
                    description="Use Kong Identity to authenticate OpenID Connect tokens and map requests to a Kong Identity principal. The authenticated principal is added to the request context for advanced integrations."
                    label="Kong Identity"
                    selected-value="kong-identity"
                  >
                    <KeyIcon decorative />
                  </KRadio>
                  <KRadio
                    v-model="form.oidc.authManager"
                    card
                    card-orientation="horizontal"
                    data-testid="radio-auth-manager-external"
                    description="Connect to your existing identity provider to manage authentication outside of Kong."
                    label="External auth server"
                    selected-value="external"
                  >
                    <NetworkIcon decorative />
                  </KRadio>
                </div>
              </div>

              <template v-if="form.oidc.authManager === 'kong-identity'">
                <KSelect
                  v-model="form.oidc.authServerId"
                  data-testid="select-auth-server"
                  filter
                  :items="authServerSelectItems"
                  label="Authorization server"
                  :label-attributes="{ info: 'The Kong Identity auth server that will act as the OpenID Connect provider for this plugin.' }"
                  placeholder="Select an authorization server"
                  @change="handleAuthServerChange"
                >
                  <template #item-template="{ item }">
                    <div v-if="item.isCreate" class="auth-server-create-item">
                      <AddIcon class="auth-server-create-icon" decorative />
                      <div class="auth-server-create-content">
                        <span class="auth-server-create-label">Create auth server</span>
                        <span class="auth-server-create-description">You'll need to return here after creating an auth server. Your progress won't be saved.</span>
                      </div>
                    </div>
                    <span v-else>{{ item.label }}</span>
                  </template>
                </KSelect>

                <div class="field-group">
                  <div class="client-pair-header">
                    <KLabel>Client</KLabel>
                    <KLabel>Client secret</KLabel>
                    <span class="client-pair-header-spacer" />
                  </div>
                  <div
                    v-for="(pair, pi) in form.oidc.clients"
                    :key="pi"
                    class="client-pair-row"
                  >
                    <KSelect
                      v-model="pair.clientId"
                      :items="getKiClientItems(pi)"
                      :data-testid="`select-ki-client-${pi}`"
                      placeholder="Select a client"
                      :disabled="!form.oidc.authServerId"
                    >
                      <template #item-template="{ item }">
                        <div v-if="item.isCreate" class="auth-server-create-item">
                          <AddIcon class="auth-server-create-icon" decorative />
                          <div class="auth-server-create-content">
                            <span class="auth-server-create-label">Create client</span>
                            <span class="auth-server-create-description">You’ll need to return here after creating a client. Your progress won’t be saved.</span>
                          </div>
                        </div>
                        <span v-else>{{ item.label }}</span>
                      </template>
                    </KSelect>
                    <div class="client-pair-col">
                      <KInput
                        v-model.trim="pair.clientSecret"
                        :data-testid="`input-ki-client-secret-${pi}`"
                        placeholder="Enter client secret"
                        type="password"
                        :disabled="!form.oidc.authServerId"
                      />
                      <span class="vault-link">Look up <a href="#" @click.prevent>key in vault</a></span>
                    </div>
                    <KButton
                      appearance="tertiary"
                      size="small"
                      :disabled="form.oidc.clients.length === 1"
                      :data-testid="`remove-ki-client-${pi}`"
                      @click="removeKiClient(pi)"
                    >
                      <CloseIcon decorative />
                    </KButton>
                  </div>
                  <KButton
                    appearance="tertiary"
                    class="array-add-btn"
                    data-testid="add-ki-client"
                    :disabled="!form.oidc.authServerId"
                    @click="addKiClient"
                  >
                    <AddIcon decorative />
                    Add client
                  </KButton>
                </div>

                <KCollapse :model-value="true" trigger-label="Show additional settings">
                  <div class="additional-settings">

                    <!-- Principal lookup method -->
                    <KSelect
                      v-model="form.oidc.principalLookup.matchMethod"
                      data-testid="select-oidc-match-method"
                      :items="getOidcMatchMethodItems('kong-identity')"
                      label="Principal lookup method"
                    >
                      <template #item-template="{ item }">
                        <div class="mediation-item">
                          <div class="mediation-item-title">{{ item.label }}</div>
                          <div class="mediation-item-description">{{ item.description }}</div>
                        </div>
                      </template>
                    </KSelect>

                    <template v-if="form.oidc.principalLookup.matchMethod === 'custom_claim'">
                      <KInput
                        v-model.trim="form.oidc.principalLookup.identityName"
                        data-testid="input-oidc-identity-name"
                        label="Custom identity name"
                        placeholder="e.g., employee_id"
                        help="Enter the custom identity name used to look up the principal. Kong matches the value from the token claim to a principal with the same custom identity name and value."
                      />
                      <KInput
                        v-model.trim="form.oidc.principalLookup.jwtClaimName"
                        data-testid="input-oidc-jwt-claim-name"
                        label="Identifier claim"
                        placeholder="e.g., user.employee_id"
                        help="Enter the token claim used to look up the principal. Use dot notation for nested claims (for example, user.name.first). Escape periods in claim names with \ (for example, user.name\.first)."
                      />
                    </template>

                    <!-- If principal lookup fails -->
                    <div class="field-group">
                      <KLabel>If principal lookup fails</KLabel>
                      <div class="radio-option">
                        <KRadio
                          :model-value="form.oidc.principalLookupFailure"
                          selected-value="reject_request"
                          label="Reject the request"
                          @update:model-value="() => (form.oidc.principalLookupFailure = 'reject_request')"
                        />
                        <span class="radio-help-text">Treat the request as unauthenticated if Kong Identity cannot resolve the principal.</span>
                      </div>
                      <div class="radio-option">
                        <KRadio
                          :model-value="form.oidc.principalLookupFailure"
                          selected-value="continue_without_principal"
                          label="Continue without a principal"
                          @update:model-value="() => (form.oidc.principalLookupFailure = 'continue_without_principal')"
                        />
                        <span class="radio-help-text">Allow the request to continue without resolving a principal.</span>
                      </div>
                    </div>

                    <!-- Linked consumer settings -->
                    <div class="field-group">
                      <KLabel>Linked consumer settings</KLabel>
                      <div class="checkbox-option">
                        <KCheckbox
                          v-model="form.oidc.useLinkedConsumers"
                          data-testid="check-linked-consumers"
                          label="Use linked consumers"
                        />
                        <span class="checkbox-help-text">
                          Use the consumer linked to the authenticated principal so existing consumer-based plugins and policies continue to work.
                          <a href="#" @click.prevent>Learn how to link a consumer.</a>
                        </span>
                      </div>
                      <div class="checkbox-option">
                        <KCheckbox
                          v-model="form.oidc.useLinkedConsumerGroups"
                          data-testid="check-linked-consumer-groups"
                          label="Use linked consumer groups"
                        />
                        <span class="checkbox-help-text">
                          Use consumer groups linked to the authenticated principal so existing consumer group policies and plugins continue to work. Consumer groups can be linked through principal metadata.
                          <a href="#" @click.prevent>Learn how to link a consumer group.</a>
                        </span>
                      </div>
                    </div>

                    <!-- Authentication methods -->
                    <KMultiselect
                      v-model="form.oidc.authFeatures"
                      data-testid="multiselect-auth-features"
                      :items="getAuthMethodItems(form.oidc.authManager)"
                      label="Authentication methods"
                      help="Configure which OAuth and OpenID Connect features are supported."
                      placeholder="Select methods"
                    />

                    <!-- Session management -->
                    <div class="field-group">
                      <KLabel>Session management</KLabel>
                      <div class="radio-option">
                        <KRadio
                          v-model="form.oidc.sessionMode"
                          selected-value="use_sessions"
                          label="Use sessions"
                        />
                        <span class="radio-help-text">Issue a session cookie after successful authentication. Subsequent requests use the session instead of re-authenticating with the identity provider.</span>
                      </div>
                      <div class="radio-option">
                        <KRadio
                          v-model="form.oidc.sessionMode"
                          selected-value="no_sessions"
                          label="Do not use sessions"
                        />
                        <span class="radio-help-text">Authenticate each request using the configured authentication flow.</span>
                      </div>
                    </div>

                  </div>
                </KCollapse>
              </template>

              <!-- External: client credentials + issuer -->
              <template v-else-if="form.oidc.authManager === 'external'">
                <!-- Client ID + Secret paired rows -->
                <div class="field-group">
                  <div class="client-pair-header">
                    <KLabel>Client ID</KLabel>
                    <KLabel>Client secret</KLabel>
                    <span class="client-pair-header-spacer" />
                  </div>
                  <div
                    v-for="(pair, pi) in form.oidc.client_pairs"
                    :key="pi"
                    class="client-pair-row"
                  >
                    <div class="client-pair-col">
                      <KInput
                        v-model.trim="pair.clientId"
                        :data-testid="`input-client-id-${pi}`"
                        placeholder="Enter a client ID"
                      />
                      <span class="vault-link">Look up <a href="#" @click.prevent>key in vault</a></span>
                    </div>
                    <div class="client-pair-col">
                      <KInput
                        v-model.trim="pair.clientSecret"
                        :data-testid="`input-client-secret-${pi}`"
                        placeholder="Enter a client secret"
                        type="password"
                      />
                      <span class="vault-link">Look up <a href="#" @click.prevent>key in vault</a></span>
                    </div>
                    <KButton
                      appearance="tertiary"
                      size="small"
                      :disabled="form.oidc.client_pairs.length === 1"
                      :data-testid="`remove-client-pair-${pi}`"
                      @click="removeClientPair(pi)"
                    >
                      <CloseIcon decorative />
                    </KButton>
                  </div>
                  <KButton
                    appearance="tertiary"
                    class="array-add-btn"
                    data-testid="add-client-pair"
                    @click="addClientPair"
                  >
                    <AddIcon decorative />
                    Add client
                  </KButton>
                </div>

                <!-- Issuer URL -->
                <div class="field-group">
                  <KInput
                    v-model.trim="form.oidc.issuer"
                    data-testid="input-issuer"
                    label="Issuer"
                    :label-attributes="{ info: 'The URL of the OpenID Connect provider discovery endpoint, used to fetch provider metadata including authorization, token, and JWKS endpoints.' }"
                    required
                  />
                  <span class="vault-link">Look up <a href="#" @click.prevent>key in vault</a></span>
                </div>

                <KCollapse :model-value="true" trigger-label="Show additional settings">
                  <div class="additional-settings">

                    <!-- Authentication methods -->
                    <KMultiselect
                      v-model="form.oidc.authFeatures"
                      data-testid="multiselect-auth-features"
                      :items="getAuthMethodItems(form.oidc.authManager)"
                      label="Authentication methods"
                      help="Configure which OAuth and OpenID Connect features are supported."
                      placeholder="Select methods"
                    />

                    <!-- Session management -->
                    <div class="field-group">
                      <KLabel>Session management</KLabel>
                      <div class="radio-option">
                        <KRadio
                          v-model="form.oidc.sessionMode"
                          selected-value="use_sessions"
                          label="Use sessions"
                        />
                        <span class="radio-help-text">Issue a session cookie after successful authentication. Subsequent requests use the session instead of re-authenticating with the identity provider.</span>
                      </div>
                      <div class="radio-option">
                        <KRadio
                          v-model="form.oidc.sessionMode"
                          selected-value="no_sessions"
                          label="Do not use sessions"
                        />
                        <span class="radio-help-text">Authenticate each request using the configured authentication flow.</span>
                      </div>
                    </div>

                  </div>
                </KCollapse>
              </template>

            </div>
          </template>

          <!-- Authorization tab -->
          <template v-else-if="activeOidcTab === '#authorization'">
            <div class="oidc-config-section oidc-config-section--empty">
              Authorization configuration is not shown in this prototype.
            </div>
          </template>

          <!-- Advanced tab -->
          <template v-else-if="activeOidcTab === '#advanced'">
            <div class="oidc-config-section oidc-config-section--empty">
              Advanced configuration is not shown in this prototype.
            </div>
          </template>

        </div>
      </template>

      <!-- ── Non-OIDC: stepped layout ────────────────────────────── -->
      <template v-else>

        <!-- Section 1: Plugin scope -->
        <EntityFormBlock
          :step="1"
          title="Plugin scope"
          description="Choose whether this plugin applies to all traffic (global) or is scoped to a specific service, route, or consumer."
        >
          <div class="field-group">
            <KLabel>Applied to</KLabel>
            <div class="radio-options">
              <KRadio
                v-model="form.scopeType"
                card
                card-orientation="horizontal"
                description="All services, routes, and consumers"
                label="Global"
                selected-value="global"
              />
              <KRadio
                v-model="form.scopeType"
                card
                card-orientation="horizontal"
                description="Apply to a specific service, route, or consumer"
                label="Scoped"
                selected-value="scoped"
              />
            </div>
          </div>

          <template v-if="form.scopeType === 'scoped'">
            <KSelect
              v-model="form.entityType"
              data-testid="select-entity-type"
              :items="entityTypeItems"
              label="Scope"
              required
            />
            <KSelect
              v-if="form.entityType === 'service'"
              v-model="form.service_id"
              data-testid="select-service"
              :items="serviceItems"
              label="Select a gateway service"
              :label-attributes="{ info: 'The gateway service to which this plugin configuration will apply.' }"
              placeholder="Search by name or UUID"
              required
            />
            <KSelect
              v-else-if="form.entityType === 'route'"
              v-model="form.route_id"
              data-testid="select-route"
              :items="routeItems"
              label="Select a route"
              :label-attributes="{ info: 'The route that this plugin configuration will target.' }"
              placeholder="Search by name or UUID"
              required
            />
            <KSelect
              v-else-if="form.entityType === 'consumer'"
              v-model="form.consumer_id"
              data-testid="select-consumer"
              :items="consumerItems"
              label="Select a consumer"
              :label-attributes="{ info: 'The consumer that this plugin configuration will target.' }"
              placeholder="Search by name or UUID"
              required
            />
          </template>
        </EntityFormBlock>

        <!-- Section 2: Plugin configuration -->
        <EntityFormBlock
          :step="2"
          title="Plugin configuration"
          description="Set the plugin's behavior by defining its configuration settings."
        >

          <!-- Key Auth config -->
          <template v-if="pluginType === 'key-auth'">
            <KInput
              v-model.trim="form.keyAuth.key_names"
              data-testid="input-key-names"
              help="Describes an array of parameter names where the plugin will look for a key. The key names may only contain [a-z], [A-Z], [0-9], [_] underscore, and [-] hyphen."
              label="Key names"
              placeholder="e.g., apikey, x-api-key"
            />

            <KCheckbox
              v-model="form.keyAuth.hide_credentials"
              data-testid="checkbox-hide-credentials"
              label="Hide credentials"
              :label-attributes="{ info: 'Strip the credential from the request before forwarding to the upstream service. If enabled, the plugin strips the credential from the request.' }"
            />

            <KCheckbox
              v-model="form.keyAuth.key_in_header"
              data-testid="checkbox-key-in-header"
              label="Key in header"
              :label-attributes="{ info: 'If enabled (default), the plugin reads the request header and tries to find the key in it.' }"
            />

            <KCheckbox
              v-model="form.keyAuth.key_in_query"
              data-testid="checkbox-key-in-query"
              label="Key in query"
              :label-attributes="{ info: 'If enabled (default), the plugin reads the query parameter in the request and tries to find the key in it.' }"
            />

            <KCheckbox
              v-model="form.keyAuth.key_in_body"
              data-testid="checkbox-key-in-body"
              label="Key in body"
              :label-attributes="{ info: 'If enabled, the plugin reads the request body. Supported MIME types: application/www-form-urlencoded, application/json, and multipart/form-data.' }"
            />

            <KCheckbox
              v-model="form.keyAuth.run_on_preflight"
              data-testid="checkbox-run-on-preflight"
              label="Run on preflight"
              :label-attributes="{ info: 'A boolean value that indicates whether the plugin should run (and try to authenticate) on OPTIONS preflight requests. If set to false, then OPTIONS requests are always allowed.' }"
            />

            <div class="field-group">
              <KLabel>Who should manage authentication and issue API keys?</KLabel>
              <p class="help-text">Use Consumers or centrally managed consumers for Consumer-based authentication. Use Kong Identity for principal-based authentication and advanced integrations. <a href="#" @click.prevent="openLearningHub('identity')">Learn more.</a></p>

              <div class="radio-options auth-manager-options">
                <KRadio
                  v-model="form.keyAuth.authManager"
                  card
                  card-orientation="horizontal"
                  data-testid="radio-auth-manager-consumers"
                  description="Use consumer-managed API keys. Consumers provide their API key in a request header, query parameter, or request body to authenticate requests."
                  label="Consumers"
                  selected-value="consumers"
                >
                  <BadgeIcon decorative />
                </KRadio>
                <KRadio
                  v-model="form.keyAuth.authManager"
                  card
                  card-orientation="horizontal"
                  data-testid="radio-auth-manager-centrally-managed"
                  description="Authenticate centrally managed consumers in Konnect using identity realms. Identity realms are scoped to the control plane by default."
                  label="Centrally managed consumers"
                  selected-value="centrally-managed"
                >
                  <LinkedServicesIcon decorative />
                </KRadio>
                <KRadio
                  v-model="form.keyAuth.authManager"
                  card
                  card-orientation="horizontal"
                  data-testid="radio-auth-manager-kong-identity"
                  description="Use Kong Identity to authenticate API keys and map requests to a Kong Identity principal. The authenticated principal is added to the request context for advanced integrations."
                  label="Kong Identity"
                  selected-value="kong-identity"
                >
                  <KeyIcon decorative />
                </KRadio>
              </div>
            </div>

                <button
                  class="additional-settings-toggle"
                  :class="{ expanded: keyAuthAdditionalSettingsExpanded }"
                  type="button"
                  @click="keyAuthAdditionalSettingsExpanded = !keyAuthAdditionalSettingsExpanded"
                >
                  <ChevronDownIcon decorative />
                  <strong>Show additional settings</strong>
                </button>

                <div v-if="keyAuthAdditionalSettingsExpanded" class="field-group">
                  <KInput
                    v-model.trim="form.keyAuth.anonymous"
                    data-testid="input-anonymous"
                    help="An optional string (consumer UUID or username) value to use as an anonymous consumer if authentication fails. If empty (default null), the request will fail with an authentication failure 4xx."
                    label="Anonymous"
                    placeholder="e.g., 00000000-0000-0000-0000-000000000001"
                  />

                  <KInput
                    v-model.trim="form.keyAuth.realm"
                    data-testid="input-realm"
                    help="When authentication fails the plugin sends WWW-Authenticate header with this realm attribute value."
                    label="Realm"
                    placeholder="e.g., my-api"
                  />

                  <div v-if="form.keyAuth.authManager === 'centrally-managed'">
                    <KLabel>
                      Identity realms
                      <template #tooltip>
                        Select one or more identity realms used to authenticate API consumers. Available in Konnect only.
                      </template>
                    </KLabel>
                    <KMultiselect
                      v-model="form.keyAuth.identity_realms"
                      data-testid="multiselect-identity-realms"
                      :items="identityRealmItems"
                      placeholder="Select identity realms"
                    />
                  </div>
                </div>
          </template>

          <!-- Basic Auth config -->
          <template v-else-if="pluginType === 'basic-auth'">
            <KCheckbox
              v-model="form.basicAuth.hide_credentials"
              data-testid="checkbox-hide-credentials"
              label="Hide credentials"
              :label-attributes="{ info: 'An optional boolean value telling the plugin to show or hide the credential from the upstream service. If enabled, the plugin will strip the credential from the request (i.e. the Authorization header) before proxying it.' }"
            />

            <hr class="additional-settings-divider">

            <KCollapse :model-value="false" trigger-label="Brute force protection">
              <div class="brute-force-fields">
                <KSelect
                  v-model="form.basicAuth.bruteForceStrategy"
                  data-testid="select-brute-force-strategy"
                  :items="bruteForceStrategyItems"
                  label="Strategy"
                  :label-attributes="{ info: 'The brute force protection strategy to use for retrieving and incrementing the limits.' }"
                  required
                />

                <template v-if="form.basicAuth.bruteForceStrategy === 'redis'">
                  <div class="nested-config">
                    <div class="nested-config-header">
                      <KLabel>Redis connection</KLabel>
                    </div>

                    <KInput
                      v-model.trim="form.basicAuth.redis.host"
                      data-testid="input-redis-host"
                      label="Host"
                      :label-attributes="{ info: 'The host of the Redis server.' }"
                      placeholder="e.g., redis.example.com"
                    />

                    <KInput
                      v-model.trim="form.basicAuth.redis.port"
                      data-testid="input-redis-port"
                      label="Port"
                      :label-attributes="{ info: 'The port of the Redis server.' }"
                      placeholder="6379"
                      type="number"
                    />

                    <KInput
                      v-model.trim="form.basicAuth.redis.timeout"
                      data-testid="input-redis-timeout"
                      help="An integer representing a timeout in milliseconds."
                      label="Timeout (ms)"
                      placeholder="2000"
                      type="number"
                    />

                    <KInput
                      v-model.trim="form.basicAuth.redis.username"
                      data-testid="input-redis-username"
                      help="Username to use for Redis connections. If undefined, ACL authentication won't be performed. This requires Redis v6.0.0+."
                      label="Username"
                      placeholder="e.g., default"
                    />

                    <KInput
                      v-model.trim="form.basicAuth.redis.password"
                      data-testid="input-redis-password"
                      help="Password to use for Redis connections. If undefined, no AUTH commands are sent to Redis."
                      label="Password"
                      type="password"
                    />
                  </div>
                </template>
              </div>
            </KCollapse>

            <div class="field-group">
              <KLabel>Who should manage authentication and credentials?</KLabel>
              <p class="help-text">Use Consumers for Consumer-based authentication. Use Kong Identity for principal-based authentication and advanced integrations. <a href="#" @click.prevent="openLearningHub('identity')">Learn more.</a></p>

<div class="radio-options auth-manager-options">
                <KRadio
                  v-model="form.basicAuth.authManager"
                  card
                  card-orientation="horizontal"
                  data-testid="radio-auth-manager-consumers"
                  description="Use consumer-managed Basic Auth credentials. Consumers authenticate requests using a username and password."
                  label="Consumers"
                  selected-value="consumers"
                >
                  <BadgeIcon decorative />
                </KRadio>
                <KRadio
                  v-model="form.basicAuth.authManager"
                  card
                  card-orientation="horizontal"
                  data-testid="radio-auth-manager-kong-identity"
                  description="Use Kong Identity to authenticate Basic Auth credentials and map requests to a Kong Identity principal. The authenticated principal is added to the request context for advanced integrations."
                  label="Kong Identity"
                  selected-value="kong-identity"
                >
                  <KeyIcon decorative />
                </KRadio>
              </div>
            </div>

                <button
                  class="additional-settings-toggle"
                  :class="{ expanded: basicAuthAdditionalSettingsExpanded }"
                  type="button"
                  @click="basicAuthAdditionalSettingsExpanded = !basicAuthAdditionalSettingsExpanded"
                >
                  <ChevronDownIcon decorative />
                  <strong>Show additional settings</strong>
                </button>

                <div v-if="basicAuthAdditionalSettingsExpanded" class="field-group">
                  <KInput
                    v-model.trim="form.basicAuth.anonymous"
                    data-testid="input-anonymous"
                    help="An optional string (consumer UUID or username) value to use as an anonymous consumer if authentication fails. If empty (default null), the request will fail with an authentication failure 4xx. This value must refer to the consumer id or username attribute, not its custom_id."
                    label="Anonymous"
                    placeholder="e.g., 00000000-0000-0000-0000-000000000001"
                  />

                  <KInput
                    v-model.trim="form.basicAuth.realm"
                    data-testid="input-realm-advanced"
                    help="When authentication fails the plugin sends a WWW-Authenticate header with this realm attribute value."
                    label="Realm"
                    placeholder="e.g., service"
                    required
                  />
                </div>
          </template>

        </EntityFormBlock>

        <!-- Section 3: General information -->
        <EntityFormBlock
          :step="3"
          title="General information"
          description="Add details to help identify and manage your plugin."
        >
          <KInput
            v-model.trim="form.instance_name"
            data-testid="input-instance-name"
            label="Name"
            :label-attributes="{ info: 'A custom name for this plugin instance to help with identifying from the list view.' }"
            placeholder="Enter a unique name"
          />

          <KInput
            v-model.trim="form.tags"
            data-testid="input-tags"
            help="An optional set of strings for grouping and filtering, separated by commas."
            label="Tags"
            placeholder="Tag1, Tag2, Tag3"
          />

          <div class="field-group">
            <KLabel>Plugin status</KLabel>
            <KInputSwitch
              v-model="form.enabled"
              data-testid="switch-enabled"
              :label="form.enabled ? 'This plugin is enabled' : 'This plugin is disabled'"
            />
          </div>
        </EntityFormBlock>

      </template>

    </EntityBaseForm>
  </div>

</template>

<script setup lang="ts">
import { reactive, computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { KInput, KSelect, KLabel, KCheckbox, KInputSwitch, KRadio, KMultiselect, KCollapse, KButton, KTabs } from '@kong/kongponents'
// KCheckbox retained for key-auth / basic-auth plugin config sections
import { KeyIcon, BadgeIcon, LinkedServicesIcon, ExternalLinkIcon, NetworkIcon, AddIcon, CloseIcon, ChevronDownIcon } from '@kong/icons'
import AppPageHeader from '@/components/AppPageHeader.vue'
import EntityBaseForm from '@/components/EntityBaseForm.vue'
import EntityFormBlock from '@/components/EntityFormBlock.vue'
import { useApiGatewayStore } from '@/composables/useApiGatewayStore'
import { useAuthServerStore } from '@/composables/useAuthServerStore'
import { useLearningHub } from '@/composables/useLearningHub'
import type { GatewayPluginName } from '@/types'

const route = useRoute()
const router = useRouter()
const store = useApiGatewayStore()
const authServerStore = useAuthServerStore()
const { openTo: openLearningHub } = useLearningHub()

const authServerSelectItems = computed(() => [
  ...authServerStore.getAll().map(s => ({ label: s.name, value: s.id })),
  { label: 'Create auth server', value: '__create__', isCreate: true },
])

const authServerClientItems = computed(() => {
  const clients = form.oidc.authServerId
    ? authServerStore.getClients(form.oidc.authServerId).map(client => ({ label: client.name, value: client.id }))
    : []

  return [
    ...clients,
    {
      label: 'Create client',
      value: '__create-client__',
      isCreate: true,
    },
  ]
})

// Returns items for a specific row, disabling clients already selected in other rows
const getKiClientItems = (currentIndex: number) => {
  const selectedElsewhere = new Set(
    form.oidc.clients
      .filter((_, i) => i !== currentIndex)
      .map(p => p.clientId)
      .filter(Boolean),
  )
  return authServerClientItems.value.map(item =>
    !item.isCreate && selectedElsewhere.has(item.value)
      ? { ...item, disabled: true }
      : item,
  )
}

const gatewayId = computed(() => route.params.id as string)
const pluginId = computed(() => route.params.pluginId as string | undefined)
const pluginTypeParam = computed(() => route.params.pluginType as GatewayPluginName | undefined)
const isEdit = computed(() => !!pluginId.value)

const gateway = computed(() => store.getById(gatewayId.value))
const existing = computed(() => isEdit.value ? store.getPluginById(gatewayId.value, pluginId.value!) : undefined)

const pluginType = computed<GatewayPluginName>(() =>
  existing.value?.name ?? pluginTypeParam.value ?? 'key-auth',
)

const PLUGIN_LABELS: Record<GatewayPluginName, string> = {
  'key-auth': 'Key authentication',
  'openid-connect': 'OpenID Connect',
  'basic-auth': 'Basic auth',
}

const pluginLabel = computed(() => PLUGIN_LABELS[pluginType.value])

// ── Scope selects ──────────────────────────────────────────────────

const entityTypeItems = [
  { label: 'Gateway service', value: 'service' },
  { label: 'Route', value: 'route' },
  { label: 'Consumer', value: 'consumer' },
]

const serviceItems = computed(() =>
  store.getServices(gatewayId.value).map(s => ({ label: s.name, value: s.id })),
)

const routeItems = computed(() =>
  store.getRoutes(gatewayId.value).map(r => ({ label: r.name, value: r.id })),
)

const consumerItems = computed(() =>
  store.getConsumers(gatewayId.value).map(c => ({ label: c.username ?? c.custom_id ?? c.id, value: c.id })),
)

// ── OIDC tab state ─────────────────────────────────────────────────

const activeOidcTab = ref('#common')

const oidcTabs = [
  { hash: '#common', title: 'Common' },
  { hash: '#authorization', title: 'Authorization' },
  { hash: '#advanced', title: 'Advanced' },
]

const protocolItems = [
  { label: 'grpc', value: 'grpc' },
  { label: 'grpcs', value: 'grpcs' },
  { label: 'http', value: 'http' },
  { label: 'https', value: 'https' },
]

const getOidcMatchMethodItems = (authManager: 'kong-identity' | 'external') =>
  authManager === 'external'
    ? [
        { label: 'Token subject', value: 'token_subject', description: 'Match principals using the issuer and subject (sub) claims from the token.' },
        { label: 'Custom JWT claim', value: 'custom_jwt_claim', description: 'JWT claim used to identify the principal.' },
      ]
    : [
        { label: 'Kong Identity client', value: 'kong_identity_client', description: 'Match principals using the client ID from the token subject (sub) claim.' },
        { label: 'Custom identity', value: 'custom_claim', description: 'Look up a principal using a custom identity and a value from a token claim.' },
      ]

// ── Form state ─────────────────────────────────────────────────────

const resolveScopeType = (): 'global' | 'scoped' => {
  if (!existing.value) return 'global'
  return (existing.value.service_id || existing.value.route_id || existing.value.consumer_id)
    ? 'scoped'
    : 'global'
}

const resolveEntityType = (): 'service' | 'route' | 'consumer' | '' => {
  if (!existing.value) return ''
  if (existing.value.service_id) return 'service'
  if (existing.value.route_id) return 'route'
  if (existing.value.consumer_id) return 'consumer'
  return ''
}

const existingConfig = existing.value?.config ?? {}

const KONG_IDENTITY_DEFAULT_AUTH_FEATURES = ['client_credentials', 'introspection', 'bearer', 'userinfo']
const EXTERNAL_DEFAULT_AUTH_FEATURES = ['authorization_code', 'bearer', 'client_credentials', 'password', 'introspection', 'userinfo', 'kong_oauth2', 'refresh_token']

const getAuthMethodItems = (authManager: 'kong-identity' | 'external') => [
  ...(authManager === 'external' ? [{ label: 'Authorization code flow', value: 'authorization_code' }] : []),
  { label: 'Bearer access token', value: 'bearer' },
  { label: 'Client credentials grant', value: 'client_credentials' },
  { label: 'Introspection', value: 'introspection' },
  { label: 'Kong OAuth', value: 'kong_oauth2' },
  { label: 'Password grant', value: 'password' },
  { label: 'Userinfo', value: 'userinfo' },
  ...(authManager === 'external' ? [{ label: 'Refresh token', value: 'refresh_token' }] : []),
]

const form = reactive({
  scopeType: resolveScopeType() as 'global' | 'scoped',
  entityType: resolveEntityType() as 'service' | 'route' | 'consumer' | '',
  service_id: existing.value?.service_id ?? '',
  route_id: existing.value?.route_id ?? '',
  consumer_id: existing.value?.consumer_id ?? '',
  instance_name: '',
  tags: '',
  enabled: existing.value?.enabled ?? true,
  keyAuth: {
    key_names: Array.isArray(existingConfig.key_names)
      ? (existingConfig.key_names as string[]).join(', ')
      : 'apikey',
    hide_credentials: existingConfig.hide_credentials === true,
    anonymous: (existingConfig.anonymous as string) ?? '',
    key_in_header: existingConfig.key_in_header !== false,
    key_in_query: existingConfig.key_in_query !== false,
    key_in_body: existingConfig.key_in_body === true,
    run_on_preflight: existingConfig.run_on_preflight !== false,
    realm: (existingConfig.realm as string) ?? '',
    identity_realms: (existingConfig.identity_realms as string[]) ?? [],
    authManager: 'consumers' as 'kong-identity' | 'consumers' | 'centrally-managed',
    principalLookup: {
      usePrincipalLookup: false,
      matchMethod: 'kong_identity_client' as 'kong_identity_client' | 'custom_claim',
      jwtClaimName: '',
      identityName: '',
    },
  },
  oidc: {
    issuer: (existingConfig.issuer as string) ?? '',
    protocols: Array.isArray(existingConfig.protocols)
      ? (existingConfig.protocols as string[])
      : ['grpc', 'grpcs', 'http', 'https'],
    execution_condition: '',
    authFeatures: Array.isArray(existingConfig.auth_methods)
      ? (existingConfig.auth_methods as string[]).filter(m => m !== 'session')
      : [...KONG_IDENTITY_DEFAULT_AUTH_FEATURES],
    sessionMode: (Array.isArray(existingConfig.auth_methods) && !(existingConfig.auth_methods as string[]).includes('session'))
      ? 'no_sessions' as const
      : 'use_sessions' as const,
    principalLookupFailure: (existingConfig.principal_lookup_failure as 'reject_request' | 'continue_without_principal') ?? 'reject_request',
    useLinkedConsumers: existingConfig.use_linked_consumers !== false,
    useLinkedConsumerGroups: existingConfig.use_linked_consumer_groups !== false,
    authManager: 'kong-identity' as 'kong-identity' | 'external',
    authServerId: '',
    // Kong Identity: paired client/secret rows
    clients: [{ clientId: '', clientSecret: '' }] as Array<{ clientId: string; clientSecret: string }>,
    // External: paired client ID/secret rows
    client_pairs: ((): Array<{ clientId: string; clientSecret: string }> => {
      const ids = Array.isArray(existingConfig.client_id)
        ? (existingConfig.client_id as string[])
        : typeof existingConfig.client_id === 'string' ? [existingConfig.client_id] : []
      const secrets = Array.isArray(existingConfig.client_secret)
        ? (existingConfig.client_secret as string[])
        : typeof existingConfig.client_secret === 'string' ? [existingConfig.client_secret] : []
      const len = Math.max(ids.length, secrets.length, 1)
      return Array.from({ length: len }, (_, i) => ({ clientId: ids[i] ?? '', clientSecret: secrets[i] ?? '' }))
    })(),
    principalLookup: {
      matchMethod: (existingConfig.principal_match_method as 'kong_identity_client' | 'custom_claim' | 'token_subject' | 'custom_jwt_claim') ?? 'kong_identity_client',
      matchAgainst: (existingConfig.match_against as 'oidc_identity' | 'custom_identity') ?? 'oidc_identity',
      jwtClaimName: (existingConfig.jwt_claim_name as string) ?? '',
      identityName: (existingConfig.custom_identity_name as string) ?? '',
    },
  },
  basicAuth: {
    hide_credentials: existingConfig.hide_credentials !== false,
    anonymous: (existingConfig.anonymous as string) ?? '',
    realm: (existingConfig.realm as string) ?? 'service',
    bruteForceStrategy: ((existingConfig.brute_force_protection as Record<string, unknown>)?.strategy as string) ?? 'off',
    authManager: 'consumers' as 'kong-identity' | 'consumers' | 'centrally-managed',
    principalLookup: {
      usePrincipalLookup: false,
      matchMethod: 'kong_identity_client' as 'kong_identity_client' | 'custom_claim',
      jwtClaimName: '',
      identityName: '',
    },
    identity_realms: (existingConfig.identity_realms as string[]) ?? [],
    redis: {
      host: (((existingConfig.brute_force_protection as Record<string, unknown>)?.redis as Record<string, unknown>)?.host as string) ?? '',
      port: (((existingConfig.brute_force_protection as Record<string, unknown>)?.redis as Record<string, unknown>)?.port as string) ?? '6379',
      timeout: (((existingConfig.brute_force_protection as Record<string, unknown>)?.redis as Record<string, unknown>)?.timeout as string) ?? '2000',
      username: (((existingConfig.brute_force_protection as Record<string, unknown>)?.redis as Record<string, unknown>)?.username as string) ?? '',
      password: (((existingConfig.brute_force_protection as Record<string, unknown>)?.redis as Record<string, unknown>)?.password as string) ?? '',
    },
  },
})

// ── OIDC helpers ───────────────────────────────────────────────────

const handleAuthServerChange = (item: { value?: string } | null) => {
  if (item?.value === '__create__') {
    form.oidc.authServerId = ''
    form.oidc.clients = [{ clientId: '', clientSecret: '' }]
    router.push({ name: 'auth-server-create' })
    return
  }

  if (!item?.value) {
    form.oidc.clients = [{ clientId: '', clientSecret: '' }]
  }
}

watch(() => form.oidc.authManager, (authManager) => {
  // Reset auth features to manager defaults (only for new forms)
  if (!Array.isArray(existingConfig.auth_methods)) {
    form.oidc.authFeatures = authManager === 'kong-identity'
      ? [...KONG_IDENTITY_DEFAULT_AUTH_FEATURES]
      : [...EXTERNAL_DEFAULT_AUTH_FEATURES]
  }
}, { immediate: true })

// Kong Identity client pair helpers
const addKiClient = () => { form.oidc.clients.push({ clientId: '', clientSecret: '' }) }
const removeKiClient = (index: number) => { form.oidc.clients.splice(index, 1) }

// External client pair helpers
const addClientPair = () => { form.oidc.client_pairs.push({ clientId: '', clientSecret: '' }) }
const removeClientPair = (index: number) => { form.oidc.client_pairs.splice(index, 1) }

// ── Item lists ─────────────────────────────────────────────────────

const bruteForceStrategyItems = [
  { label: 'Off', value: 'off' },
  { label: 'Memory', value: 'memory' },
  { label: 'Redis', value: 'redis' },
  { label: 'Cluster', value: 'cluster' },
]

const identityRealmItems = [
  { label: 'Current control plane', value: 'current-cp' },
]

const errorMessage = ref('')
const keyAuthAdditionalSettingsExpanded = ref(false)
const basicAuthAdditionalSettingsExpanded = ref(false)

const isScopeValid = computed(() => {
  if (form.scopeType === 'global') return true
  if (!form.entityType) return false
  if (form.entityType === 'service') return !!form.service_id
  if (form.entityType === 'route') return !!form.route_id
  if (form.entityType === 'consumer') return !!form.consumer_id
  return false
})

const isFormValid = computed(() => isScopeValid.value)

const breadcrumbs = computed(() => [
  { key: 'api-gateway', text: 'API Gateway', to: { name: 'api-gateway-list' } },
  { key: 'gateway', text: gateway.value?.name ?? gatewayId.value, to: { name: 'api-gateway-plugins', params: { id: gatewayId.value } } },
  { key: 'action', text: isEdit.value ? `Edit ${pluginLabel.value}` : `New ${pluginLabel.value}` },
])

// ── Config builder ─────────────────────────────────────────────────

const buildConfig = (): Record<string, unknown> => {
  if (pluginType.value === 'key-auth') {
    const keyNames = form.keyAuth.key_names.split(',').map(s => s.trim()).filter(Boolean)
    return {
      key_names: keyNames.length > 0 ? keyNames : ['apikey'],
      hide_credentials: form.keyAuth.hide_credentials,
      ...(form.keyAuth.anonymous ? { anonymous: form.keyAuth.anonymous } : {}),
      key_in_header: form.keyAuth.key_in_header,
      key_in_query: form.keyAuth.key_in_query,
      key_in_body: form.keyAuth.key_in_body,
      run_on_preflight: form.keyAuth.run_on_preflight,
      ...(form.keyAuth.realm ? { realm: form.keyAuth.realm } : {}),
      ...(form.keyAuth.authManager === 'kong-identity' && form.keyAuth.principalLookup.usePrincipalLookup ? {
        principal_lookup: true,
        principal_match_method: form.keyAuth.principalLookup.matchMethod,
        ...(form.keyAuth.principalLookup.matchMethod === 'custom_claim'
          ? {
              jwt_claim_name: form.keyAuth.principalLookup.jwtClaimName || undefined,
              custom_identity_name: form.keyAuth.principalLookup.identityName || undefined,
            }
          : {}),
      } : {}),
      ...(form.keyAuth.identity_realms.length > 0 ? { identity_realms: form.keyAuth.identity_realms } : {}),
    }
  }
  if (pluginType.value === 'openid-connect') {
    const authMethods: string[] = [
      ...form.oidc.authFeatures,
      ...(form.oidc.sessionMode === 'use_sessions' ? ['session'] : []),
    ]
    const clientIds = form.oidc.authManager === 'external'
      ? form.oidc.client_pairs.map(p => p.clientId).filter(Boolean)
      : form.oidc.clients.map(p => p.clientId).filter(Boolean)
    const clientSecrets = form.oidc.authManager === 'external'
      ? form.oidc.client_pairs.map(p => p.clientSecret).filter(Boolean)
      : form.oidc.clients.map(p => p.clientSecret).filter(Boolean)
    return {
      issuer: form.oidc.issuer,
      ...(clientIds.length > 0 ? { client_id: clientIds } : {}),
      ...(clientSecrets.length > 0 ? { client_secret: clientSecrets } : {}),
      auth_methods: authMethods,
      protocols: form.oidc.protocols,
      ...(form.oidc.execution_condition ? { expression: form.oidc.execution_condition } : {}),
      principal_lookup: true,
      principal_lookup_failure: form.oidc.principalLookupFailure,
      principal_match_method: form.oidc.principalLookup.matchMethod,
      ...(form.oidc.principalLookup.matchMethod === 'custom_claim' || form.oidc.principalLookup.matchMethod === 'custom_jwt_claim'
        ? {
            jwt_claim_name: form.oidc.principalLookup.jwtClaimName || undefined,
            ...(form.oidc.principalLookup.matchAgainst === 'custom_identity' ? { custom_identity_name: form.oidc.principalLookup.identityName || undefined } : {}),
          }
        : {}),
      ...(form.oidc.principalLookup.matchMethod === 'custom_jwt_claim' ? { match_against: form.oidc.principalLookup.matchAgainst } : {}),
      use_linked_consumers: form.oidc.useLinkedConsumers,
      use_linked_consumer_groups: form.oidc.useLinkedConsumerGroups,
    }
  }
  const basicAuthConfig: Record<string, unknown> = {
    hide_credentials: form.basicAuth.hide_credentials,
    realm: form.basicAuth.realm || 'service',
    ...(form.basicAuth.anonymous ? { anonymous: form.basicAuth.anonymous } : {}),
    ...(form.basicAuth.authManager === 'kong-identity' && form.basicAuth.principalLookup.usePrincipalLookup ? {
      principal_lookup: true,
      principal_match_method: form.basicAuth.principalLookup.matchMethod,
      ...(form.basicAuth.principalLookup.matchMethod === 'custom_claim'
        ? {
            jwt_claim_name: form.basicAuth.principalLookup.jwtClaimName || undefined,
            custom_identity_name: form.basicAuth.principalLookup.identityName || undefined,
          }
        : {}),
    } : {}),
    brute_force_protection: {
      strategy: form.basicAuth.bruteForceStrategy,
      ...(form.basicAuth.bruteForceStrategy === 'redis' ? {
        redis: {
          host: form.basicAuth.redis.host,
          port: parseInt(form.basicAuth.redis.port, 10) || 6379,
          timeout: parseInt(form.basicAuth.redis.timeout, 10) || 2000,
          ...(form.basicAuth.redis.username ? { username: form.basicAuth.redis.username } : {}),
          ...(form.basicAuth.redis.password ? { password: form.basicAuth.redis.password } : {}),
        },
      } : {}),
    },
  }
  return basicAuthConfig
}

// ── Submit / cancel ────────────────────────────────────────────────

const handleSubmit = () => {
  errorMessage.value = ''
  try {
    const data = {
      name: pluginType.value,
      config: buildConfig(),
      enabled: form.enabled,
      service_id: form.scopeType === 'scoped' && form.entityType === 'service' ? form.service_id || undefined : undefined,
      route_id: form.scopeType === 'scoped' && form.entityType === 'route' ? form.route_id || undefined : undefined,
      consumer_id: form.scopeType === 'scoped' && form.entityType === 'consumer' ? form.consumer_id || undefined : undefined,
    }
    if (isEdit.value && pluginId.value) {
      store.updatePlugin(gatewayId.value, pluginId.value, data)
    } else {
      store.createPlugin(gatewayId.value, data)
    }
    router.push({ name: 'api-gateway-plugins', params: { id: gatewayId.value } })
  } catch {
    errorMessage.value = 'An unexpected error occurred. Try again.'
  }
}

const handleCancel = () => {
  router.push({ name: 'api-gateway-plugins', params: { id: gatewayId.value } })
}
</script>

<style scoped lang="scss">
@use "@kong/design-tokens/tokens/scss/variables" as *;

.gateway-plugin-form-page {
  display: flex;
  flex-direction: column;
  gap: $kui-space-70;
}

// ── Non-OIDC styles ────────────────────────────────────────────────

.field-group {
  display: flex;
  flex-direction: column;
  gap: $kui-space-40;
}

.help-text {
  color: var(--kui-color-text-neutral, #6c7489);
  font-size: $kui-font-size-30;
  margin: 0;
  margin-top: calc(-1 * var(--kui-space-20, 4px));
  margin-bottom: var(--kui-space-70, 20px);
  line-height: 1.5;

  a {
    color: var(--kui-color-text-primary, #1155cb);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}


.radio-options {
  display: flex;
  gap: $kui-space-50;
}

.auth-manager-options {
  align-items: stretch;

  :deep(.card-horizontal .radio-card-wrapper.has-label) {
    align-items: flex-start !important;
    flex-direction: column !important;
    gap: var(--kui-space-40, #{$kui-space-40});
    justify-content: flex-start !important;
  }

  :deep(.card-horizontal .card-content-wrapper) {
    align-self: flex-start !important;
    height: auto !important;
  }

  :deep(.card-horizontal .radio-label) {
    justify-content: flex-start;
  }
}

.additional-settings-divider {
  border: none;
  border-top: 1px solid var(--kui-color-border, #e0e4ea);
  margin: 0;
}

.additional-settings-toggle {
  align-items: center;
  background: none;
  border: none;
  color: var(--kui-color-text-primary, #1155cb);
  cursor: pointer;
  display: flex;
  font-size: var(--kui-font-size-40);
  font-weight: normal;
  gap: var(--kui-space-30);
  padding: 0;
  text-align: left;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.8;
  }

  &:focus {
    outline: 2px solid var(--kui-color-border-primary, #1155cb);
    outline-offset: 2px;
  }

  :deep(svg) {
    flex-shrink: 0;
    transition: transform 0.2s ease;
    transform: rotate(-90deg);
  }

  &.expanded :deep(svg) {
    transform: rotate(0deg);
  }
}

.additional-settings {
  display: flex;
  flex-direction: column;
  gap: $kui-space-70;
  padding-top: $kui-space-60;
}

:deep(.k-collapse) .additional-settings {
  padding-top: 0;
}

.brute-force-fields {
  display: flex;
  flex-direction: column;
  gap: $kui-space-70;
  padding-top: $kui-space-60;
}

.nested-config {
  background-color: var(--kui-color-background-neutral-weakest, #f9f9fb);
  border: 1px solid var(--kui-color-border, #e0e4ea);
  border-radius: var(--kui-border-radius-30, 6px);
  display: flex;
  flex-direction: column;
  gap: $kui-space-70;
  padding: $kui-space-60;

  .nested-config-header {
    margin-bottom: calc(-1 * #{$kui-space-30});
  }
}

// ── OIDC flat layout styles ────────────────────────────────────────

.oidc-form {
  display: flex;
  flex-direction: column;
  gap: $kui-space-70;
}

.oidc-scope-row {
  display: flex;
  gap: $kui-space-50;
}

.oidc-config-section {
  border-top: 1px solid var(--kui-color-border, #e0e4ea);
  display: flex;
  flex-direction: column;
  gap: $kui-space-80;
  padding-top: $kui-space-80;

  &--empty {
    color: var(--kui-color-text-neutral, #6c7489);
    font-size: $kui-font-size-30;
  }
}

.oidc-section-header {
  align-items: center;
  display: flex;
  gap: $kui-space-30;
}

.oidc-section-title {
  color: var(--kui-color-text, #0a0a0a);
  font-size: $kui-font-size-50;
  font-weight: $kui-font-weight-semibold;
}

.oidc-section-link-icon {
  color: var(--kui-color-text-primary, #1155cb);
}

.oidc-section-description {
  color: var(--kui-color-text-neutral, #6c7489);
  font-size: $kui-font-size-30;
  line-height: $kui-line-height-40;
  margin: 0;
  margin-top: calc(-1 * #{$kui-space-50});
}

.array-row {
  align-items: center;
  display: flex;
  gap: $kui-space-40;

  .k-input {
    flex: 1;
  }
}

.client-pair-header {
  display: flex;
  gap: $kui-space-40;

  // Each KLabel stretches to match its input column
  :deep(.k-label) {
    flex: 1;
    min-width: 0;
  }
}

// Spacer that matches the width of the X button so labels align correctly
.client-pair-header-spacer {
  flex-shrink: 0;
  width: 32px; // matches KButton size="small" icon button width
}

.client-pair-col {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: $kui-space-20;
  min-width: 0;

  .vault-link {
    margin-top: 0;
  }
}

.client-pair-row {
  align-items: flex-start;
  display: flex;
  gap: $kui-space-40;

  // Direct KSelect (Kong Identity client col — no vault link wrapper)
  :deep(.k-select) {
    flex: 1;
    min-width: 0;
  }

  // X button stays at its natural size, nudged down to align with the input
  > .k-button {
    flex-shrink: 0;
    margin-top: 4px;
  }
}

.array-add-btn {
  align-self: flex-start;
  color: var(--kui-color-text-primary, #1155cb) !important;
  font-weight: $kui-font-weight-semibold;
  padding-left: 0 !important;
}

.vault-link {
  color: var(--kui-color-text-neutral, $kui-color-text-neutral);
  font-family: var(--kui-font-family-text, $kui-font-family-text);
  font-size: var(--kui-font-size-20, $kui-font-size-20);
  font-weight: var(--kui-font-weight-regular, $kui-font-weight-regular);
  line-height: var(--kui-line-height-20, $kui-line-height-20);
  margin-top: 0;

  a {
    color: var(--kui-color-text-primary, $kui-color-text-primary);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.auth-server-create-item {
  align-items: flex-start;
  display: flex;
  gap: $kui-space-30;
}

.auth-server-create-icon {
  color: var(--kui-color-text-primary, #1155cb);
  flex-shrink: 0;
  margin-top: 2px;
}

.auth-server-create-content {
  display: flex;
  flex-direction: column;
  gap: $kui-space-10;
}

.auth-server-create-label {
  color: var(--kui-color-text-primary, #1155cb);
  font-weight: $kui-font-weight-semibold;
}

.auth-server-create-description {
  color: var(--kui-color-text-neutral, #6c7489);
  font-size: $kui-font-size-20;
  line-height: $kui-line-height-30;
  white-space: normal;
}

// ── Radio + checkbox options with help text ────────────────────────

.radio-option {
  display: flex;
  flex-direction: column;
  gap: $kui-space-10;
}

.radio-help-text {
  color: $kui-color-text-neutral;
  font-size: $kui-font-size-20;
  line-height: $kui-line-height-30;
  padding-left: 24px; // align under radio label text
}

.checkbox-option {
  display: flex;
  flex-direction: column;
  gap: $kui-space-10;
}

.checkbox-help-text {
  color: $kui-color-text-neutral;
  font-size: $kui-font-size-20;
  line-height: $kui-line-height-30;
  padding-left: 24px; // align under checkbox label text

  a {
    color: $kui-color-text-primary;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}


.select-item-container {
  display: flex;
  flex-direction: column;
  gap: $kui-space-10;

  .select-item-label {
    font-weight: $kui-font-weight-semibold;
  }

  .select-item-description {
    color: $kui-color-text-neutral;
    font-size: $kui-font-size-20;
  }
}

.alert-container {
  align-items: center;
  display: flex;
  gap: $kui-space-40;
  justify-content: space-between;
  width: 100%;
}

</style>
