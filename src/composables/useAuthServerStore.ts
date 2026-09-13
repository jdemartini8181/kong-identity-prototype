import { ref } from 'vue'
import { nanoid } from 'nanoid'
import type { AuthServer, AuthServerClient, AuthServerScope, AuthServerClaim } from '@/types'

const AS_1 = 'as-prod-01'
const AS_2 = 'as-dev-02'
const AS_3 = 'as-partner-03'

const SEED_SERVERS: AuthServer[] = [
  {
    id: AS_1,
    name: 'Production Auth Server',
    description: 'Primary authentication server for production workloads.',
    audience: 'https://api.example.com',
    issuer: `https://auth.example.com/oauth2/${AS_1}`,
    metadata_uri: `https://auth.example.com/oauth2/${AS_1}/.well-known/openid-configuration`,
    trusted_origins: ['https://app.example.com', 'https://portal.example.com'],
    labels: { env: 'production', team: 'platform' },
    clients_count: 5,
    claims_count: 4,
    scopes_count: 5,
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-11-20T14:30:00Z',
  },
  {
    id: AS_2,
    name: 'Development Auth Server',
    description: 'Authentication server for development and testing environments.',
    audience: 'https://api.dev.example.com',
    issuer: `https://auth.dev.example.com/oauth2/${AS_2}`,
    metadata_uri: `https://auth.dev.example.com/oauth2/${AS_2}/.well-known/openid-configuration`,
    trusted_origins: ['https://localhost:3000', 'https://dev.example.com'],
    labels: { env: 'development', team: 'platform' },
    clients_count: 3,
    claims_count: 3,
    scopes_count: 3,
    created_at: '2024-01-20T14:30:00Z',
    updated_at: '2025-01-10T09:00:00Z',
  },
  {
    id: AS_3,
    name: 'Partner Portal Auth Server',
    description: 'Dedicated authentication server for partner integrations and portal access.',
    audience: 'https://partners.example.com',
    issuer: `https://auth.example.com/oauth2/${AS_3}`,
    metadata_uri: `https://auth.example.com/oauth2/${AS_3}/.well-known/openid-configuration`,
    trusted_origins: ['https://partners.example.com'],
    labels: { env: 'production', team: 'partnerships' },
    clients_count: 2,
    claims_count: 2,
    scopes_count: 3,
    created_at: '2024-03-10T11:15:00Z',
    updated_at: '2024-10-05T16:00:00Z',
  },
]

const SEED_CLIENTS: Record<string, AuthServerClient[]> = {
  [AS_1]: [
    { id: 'client-001', name: 'Kong Gateway Plugin', auth_server_id: AS_1, created_at: '2024-01-20T10:00:00Z' },
    { id: 'client-002', name: 'Admin Dashboard', auth_server_id: AS_1, created_at: '2024-01-22T11:00:00Z' },
    { id: 'client-003', name: 'Mobile App (iOS)', auth_server_id: AS_1, created_at: '2024-02-01T09:30:00Z' },
    { id: 'client-004', name: 'Mobile App (Android)', auth_server_id: AS_1, created_at: '2024-02-01T09:45:00Z' },
    { id: 'client-005', name: 'Developer Portal', auth_server_id: AS_1, created_at: '2024-02-15T14:00:00Z' },
  ],
  [AS_2]: [
    { id: 'client-006', name: 'Dev Test Client', auth_server_id: AS_2, created_at: '2024-01-25T09:00:00Z' },
    { id: 'client-007', name: 'CI Pipeline Client', auth_server_id: AS_2, created_at: '2024-01-25T09:00:00Z' },
    { id: 'client-008', name: 'Local Dev App', auth_server_id: AS_2, created_at: '2024-02-01T10:00:00Z' },
  ],
  [AS_3]: [
    { id: 'client-009', name: 'Partner A Integration', auth_server_id: AS_3, created_at: '2024-03-15T09:00:00Z' },
    { id: 'client-010', name: 'Partner B Integration', auth_server_id: AS_3, created_at: '2024-04-01T10:00:00Z' },
  ],
}

const SEED_SCOPES: Record<string, AuthServerScope[]> = {
  [AS_1]: [
    { id: 'scope-001', name: 'openid', description: 'OpenID Connect scope', auth_server_id: AS_1, created_at: '2024-01-15T09:00:00Z' },
    { id: 'scope-002', name: 'profile', description: 'Access to user profile information', auth_server_id: AS_1, created_at: '2024-01-15T09:00:00Z' },
    { id: 'scope-003', name: 'email', description: 'Access to user email address', auth_server_id: AS_1, created_at: '2024-01-15T09:00:00Z' },
    { id: 'scope-004', name: 'read:services', description: 'Read access to services', auth_server_id: AS_1, created_at: '2024-01-20T10:00:00Z' },
    { id: 'scope-005', name: 'write:services', description: 'Write access to services', auth_server_id: AS_1, created_at: '2024-01-20T10:00:00Z' },
  ],
  [AS_2]: [
    { id: 'scope-006', name: 'openid', description: 'OpenID Connect scope', auth_server_id: AS_2, created_at: '2024-01-20T09:00:00Z' },
    { id: 'scope-007', name: 'profile', description: 'Access to user profile information', auth_server_id: AS_2, created_at: '2024-01-20T09:00:00Z' },
    { id: 'scope-008', name: 'read:all', description: 'Read-all scope for testing', auth_server_id: AS_2, created_at: '2024-01-20T09:00:00Z' },
  ],
  [AS_3]: [
    { id: 'scope-009', name: 'openid', description: 'OpenID Connect scope', auth_server_id: AS_3, created_at: '2024-03-10T11:15:00Z' },
    { id: 'scope-010', name: 'partner:read', description: 'Read access to partner resources', auth_server_id: AS_3, created_at: '2024-03-10T11:15:00Z' },
    { id: 'scope-011', name: 'partner:write', description: 'Write access to partner resources', auth_server_id: AS_3, created_at: '2024-03-15T09:00:00Z' },
  ],
}

const SEED_CLAIMS: Record<string, AuthServerClaim[]> = {
  [AS_1]: [
    { id: 'claim-001', name: 'user.email', claim_type: 'string', auth_server_id: AS_1, created_at: '2024-01-15T09:00:00Z' },
    { id: 'claim-002', name: 'user.role', claim_type: 'string', auth_server_id: AS_1, created_at: '2024-01-15T09:00:00Z' },
    { id: 'claim-003', name: 'org.name', claim_type: 'string', auth_server_id: AS_1, created_at: '2024-01-15T09:00:00Z' },
    { id: 'claim-004', name: 'user.groups', claim_type: 'array', auth_server_id: AS_1, created_at: '2024-01-20T10:00:00Z' },
  ],
  [AS_2]: [
    { id: 'claim-005', name: 'user.email', claim_type: 'string', auth_server_id: AS_2, created_at: '2024-01-20T09:00:00Z' },
    { id: 'claim-006', name: 'user.role', claim_type: 'string', auth_server_id: AS_2, created_at: '2024-01-20T09:00:00Z' },
    { id: 'claim-007', name: 'test.flag', claim_type: 'boolean', auth_server_id: AS_2, created_at: '2024-01-20T09:00:00Z' },
  ],
  [AS_3]: [
    { id: 'claim-008', name: 'partner.id', claim_type: 'string', auth_server_id: AS_3, created_at: '2024-03-10T11:15:00Z' },
    { id: 'claim-009', name: 'partner.tier', claim_type: 'string', auth_server_id: AS_3, created_at: '2024-03-10T11:15:00Z' },
  ],
}

// Module-level singleton state
const authServers = ref<AuthServer[]>([...SEED_SERVERS])
const clientsMap = ref<Record<string, AuthServerClient[]>>({ ...SEED_CLIENTS })
const scopesMap = ref<Record<string, AuthServerScope[]>>({ ...SEED_SCOPES })
const claimsMap = ref<Record<string, AuthServerClaim[]>>({ ...SEED_CLAIMS })

export function useAuthServerStore() {
  const getAll = (): AuthServer[] => authServers.value

  const getById = (id: string): AuthServer | undefined =>
    authServers.value.find(s => s.id === id)

  const filter = (query: string): AuthServer[] =>
    authServers.value.filter(s => s.name.toLowerCase().includes(query.toLowerCase()))

  const create = (data: Omit<AuthServer, 'id' | 'created_at' | 'updated_at' | 'clients_count' | 'claims_count' | 'scopes_count'>): AuthServer => {
    const server: AuthServer = {
      ...data,
      id: nanoid(10),
      created_at: new Date().toISOString(),
      clients_count: 0,
      claims_count: 0,
      scopes_count: 0,
    }
    authServers.value = [...authServers.value, server]
    clientsMap.value[server.id] = []
    scopesMap.value[server.id] = []
    claimsMap.value[server.id] = []
    return server
  }

  const update = (id: string, data: Partial<Omit<AuthServer, 'id' | 'created_at'>>): AuthServer | undefined => {
    const index = authServers.value.findIndex(s => s.id === id)
    if (index === -1) return undefined
    const updated: AuthServer = {
      ...authServers.value[index],
      ...data,
      updated_at: new Date().toISOString(),
    }
    authServers.value = authServers.value.map((s, i) => (i === index ? updated : s))
    return updated
  }

  const remove = (id: string): void => {
    authServers.value = authServers.value.filter(s => s.id !== id)
    delete clientsMap.value[id]
    delete scopesMap.value[id]
    delete claimsMap.value[id]
  }

  const getClients = (authServerId: string): AuthServerClient[] =>
    clientsMap.value[authServerId] || []

  const getScopes = (authServerId: string): AuthServerScope[] =>
    scopesMap.value[authServerId] || []

  const getClaims = (authServerId: string): AuthServerClaim[] =>
    claimsMap.value[authServerId] || []

  const getScopeById = (authServerId: string, scopeId: string) =>
    scopesMap.value[authServerId]?.find(s => s.id === scopeId)

  const getClaimById = (authServerId: string, claimId: string) =>
    claimsMap.value[authServerId]?.find(c => c.id === claimId)

  const getClientById = (authServerId: string, clientId: string) =>
    clientsMap.value[authServerId]?.find(c => c.id === clientId)

  const createScope = (authServerId: string, data: Omit<AuthServerScope, 'id' | 'created_at' | 'auth_server_id'>): AuthServerScope => {
    const scope: AuthServerScope = { ...data, id: nanoid(10), auth_server_id: authServerId, created_at: new Date().toISOString() }
    scopesMap.value[authServerId] = [...(scopesMap.value[authServerId] || []), scope]
    const server = authServers.value.find(s => s.id === authServerId)
    if (server) server.scopes_count = scopesMap.value[authServerId].length
    return scope
  }

  const updateScope = (authServerId: string, scopeId: string, data: Partial<Omit<AuthServerScope, 'id' | 'created_at' | 'auth_server_id'>>): AuthServerScope | undefined => {
    const list = scopesMap.value[authServerId] || []
    const idx = list.findIndex(s => s.id === scopeId)
    if (idx === -1) return undefined
    const updated = { ...list[idx], ...data }
    scopesMap.value[authServerId] = list.map((s, i) => (i === idx ? updated : s))
    return updated
  }

  const removeScope = (authServerId: string, scopeId: string): void => {
    scopesMap.value[authServerId] = (scopesMap.value[authServerId] || []).filter(s => s.id !== scopeId)
    const server = authServers.value.find(s => s.id === authServerId)
    if (server) server.scopes_count = scopesMap.value[authServerId].length
  }

  const createClaim = (authServerId: string, data: Omit<AuthServerClaim, 'id' | 'created_at' | 'auth_server_id'>): AuthServerClaim => {
    const claim: AuthServerClaim = { ...data, id: nanoid(10), auth_server_id: authServerId, created_at: new Date().toISOString() }
    claimsMap.value[authServerId] = [...(claimsMap.value[authServerId] || []), claim]
    const server = authServers.value.find(s => s.id === authServerId)
    if (server) server.claims_count = claimsMap.value[authServerId].length
    return claim
  }

  const updateClaim = (authServerId: string, claimId: string, data: Partial<Omit<AuthServerClaim, 'id' | 'created_at' | 'auth_server_id'>>): AuthServerClaim | undefined => {
    const list = claimsMap.value[authServerId] || []
    const idx = list.findIndex(c => c.id === claimId)
    if (idx === -1) return undefined
    const updated = { ...list[idx], ...data }
    claimsMap.value[authServerId] = list.map((c, i) => (i === idx ? updated : c))
    return updated
  }

  const removeClaim = (authServerId: string, claimId: string): void => {
    claimsMap.value[authServerId] = (claimsMap.value[authServerId] || []).filter(c => c.id !== claimId)
    const server = authServers.value.find(s => s.id === authServerId)
    if (server) server.claims_count = claimsMap.value[authServerId].length
  }

  const createClient = (authServerId: string, data: Omit<AuthServerClient, 'id' | 'created_at' | 'auth_server_id'>): AuthServerClient => {
    const client: AuthServerClient = { ...data, id: nanoid(10), auth_server_id: authServerId, created_at: new Date().toISOString() }
    clientsMap.value[authServerId] = [...(clientsMap.value[authServerId] || []), client]
    const server = authServers.value.find(s => s.id === authServerId)
    if (server) server.clients_count = clientsMap.value[authServerId].length
    return client
  }

  const updateClient = (authServerId: string, clientId: string, data: Partial<Omit<AuthServerClient, 'id' | 'created_at' | 'auth_server_id'>>): AuthServerClient | undefined => {
    const list = clientsMap.value[authServerId] || []
    const idx = list.findIndex(c => c.id === clientId)
    if (idx === -1) return undefined
    const updated = { ...list[idx], ...data }
    clientsMap.value[authServerId] = list.map((c, i) => (i === idx ? updated : c))
    return updated
  }

  const removeClient = (authServerId: string, clientId: string): void => {
    clientsMap.value[authServerId] = (clientsMap.value[authServerId] || []).filter(c => c.id !== clientId)
    const server = authServers.value.find(s => s.id === authServerId)
    if (server) server.clients_count = clientsMap.value[authServerId].length
  }

  return {
    authServers,
    getAll,
    getById,
    filter,
    create,
    update,
    remove,
    getClients,
    getScopes,
    getClaims,
    getScopeById,
    getClaimById,
    getClientById,
    createScope,
    updateScope,
    removeScope,
    createClaim,
    updateClaim,
    removeClaim,
    createClient,
    updateClient,
    removeClient,
  }
}
