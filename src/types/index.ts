export interface AuthServer {
  id: string
  name: string
  description?: string
  audience: string
  issuer: string
  metadata_uri?: string
  trusted_origins?: string[]
  labels?: Record<string, string>
  clients_count: number
  claims_count: number
  scopes_count: number
  created_at: string
  updated_at?: string
}

export interface AuthServerClient {
  id: string
  name: string
  auth_server_id: string
  created_at: string
}

export interface AuthServerScope {
  id: string
  name: string
  description?: string
  auth_server_id: string
  created_at: string
}

export interface AuthServerClaim {
  id: string
  name: string
  claim_type?: string
  auth_server_id: string
  created_at: string
}

export interface PrincipalMetadata {
  key: string
  value: string
  value_type: 'string' | 'number' | 'boolean' | 'date_time' | 'list'
}

export type IdentitySourceMethod = 'key' | 'basic_auth' | 'oauth' | 'consumer' | 'external_identifier'

export interface PrincipalIdentitySource {
  id: string
  type: IdentitySourceMethod
  // Key method
  key_id?: string
  key_generation?: 'auto' | 'manual'
  key_value?: string
  expires_at?: string
  // Basic auth method
  username?: string
  password_generation?: 'auto' | 'manual'
  // OAuth method - Kong
  oauth_server_type?: 'kong' | 'external'
  auth_server?: string
  oauth_client?: string
  // OAuth method - External
  issuer?: string
  client_id?: string
  // Consumer method
  control_plane?: string
  consumer_id?: string
  api_name?: string
  // External identifier method
  ext_name?: string
  ext_value?: string
}


export interface EventGateway {
  id: string
  name: string
  description?: string
  labels?: Record<string, string>
  min_runtime_version?: string
  nodes_total: number
  virtual_clusters_total: number
  created_at: string
  updated_at?: string
}

export interface EventGatewayDataPlaneNode {
  id: string
  gateway_id: string
  hostname: string
  version: string
  status: 'connected' | 'disconnected'
  last_seen: string
}

export interface VirtualClusterAuthItem {
  type: 'anonymous' | 'sasl_plain' | 'sasl_oauthbearer' | 'sasl_scram_sha256' | 'sasl_scram_sha512' | 'client_certificate'
  mediation?: 'passthrough' | 'validate_forward' | 'terminate'
  principal_id?: string
  auth_server_type?: 'kong_managed' | 'external'
  auth_server_id?: string
  // SASL/PLAIN credentials
  sasl_plain_credentials?: Array<{ username: string; password: string }>
  // UI-only state (stripped before submit)
  _showAdvanced?: boolean
  jwks_url?: string
  jwks?: {
    endpoint?: string
    timeout?: string
    cache_expiration?: string
  }
  claims_mapping?: {
    sub?: string
    scope?: string
  }
  validate?: {
    issuer?: string
    audiences?: Array<{ name: string }>
  }
  principal_lookup?: boolean
  principal_lookup_failure?: 'reject_request' | 'continue_without_principal'
  principal_match_method?: 'kong_identity_client' | 'custom_claim' | 'token_subject' | 'custom_jwt_claim'
  jwt_claim_name?: string
  match_against?: 'oidc_identity' | 'custom_identity'
  custom_identity_name?: string
}

export interface EventGatewayVirtualCluster {
  id: string
  gateway_id: string
  name: string
  description?: string
  labels?: Record<string, string>
  acl_mode?: 'enforce_on_gateway' | 'passthrough'
  dns_label?: string
  destination_id?: string
  authentication?: VirtualClusterAuthItem[]
  created_at: string
  updated_at: string
}

export interface EventGatewayBackendCluster {
  id: string
  gateway_id: string
  name: string
  labels?: Record<string, string>
  created_at: string
  updated_at: string
}

export interface EventGatewayListener {
  id: string
  gateway_id: string
  name: string
  labels?: Record<string, string>
  created_at: string
  updated_at: string
}

export interface Principal {
  id: string
  name: string
  description?: string
  labels?: Record<string, string>
  metadata?: PrincipalMetadata[]
  identity_sources?: PrincipalIdentitySource[]
  source?: 'dev_portal'
  dev_portal_id?: string
  dev_portal_name?: string
  created_at: string
  updated_at?: string
}

// ── API Gateway ──────────────────────────────────────────────────────

export type ApiGatewayClusterType =
  | 'CLUSTER_TYPE_HYBRID'
  | 'CLUSTER_TYPE_K8S_INGRESS_CONTROLLER'
  | 'CLUSTER_TYPE_SERVERLESS'

export interface ApiGateway {
  id: string
  name: string
  description?: string
  labels?: Record<string, string>
  cluster_type: ApiGatewayClusterType
  nodes_total: number
  services_total: number
  created_at: string
  updated_at?: string
}

export interface ApiGatewayDataPlaneNode {
  id: string
  gateway_id: string
  hostname: string
  version: string
  status: 'connected' | 'disconnected'
  last_seen: string
}

export interface ApiGatewayService {
  id: string
  gateway_id: string
  name: string
  host: string
  port: number
  protocol: 'http' | 'https' | 'grpc' | 'grpcs' | 'tcp' | 'tls'
  path?: string
  enabled: boolean
  tags?: string[]
  created_at: string
  updated_at?: string
}

export interface ApiGatewayRoute {
  id: string
  gateway_id: string
  service_id?: string
  name: string
  protocols: ('http' | 'https')[]
  methods?: string[]
  hosts?: string[]
  paths?: string[]
  enabled: boolean
  tags?: string[]
  created_at: string
  updated_at?: string
}

export interface ApiGatewayConsumer {
  id: string
  gateway_id: string
  username?: string
  custom_id?: string
  tags?: string[]
  created_at: string
  updated_at?: string
}

export type GatewayPluginName = 'key-auth' | 'basic-auth' | 'openid-connect'

export interface ApiGatewayPlugin {
  id: string
  gateway_id: string
  name: GatewayPluginName
  config: Record<string, unknown>
  enabled: boolean
  service_id?: string
  route_id?: string
  consumer_id?: string
  tags?: string[]
  created_at: string
  updated_at?: string
}
