import { ref } from 'vue'
import type { Principal } from '@/types'

const SEED_PRINCIPALS: Principal[] = [
  {
    id: 'p-payments-01',
    name: 'payments-service',
    description: 'Principal for the payments processing service.',
    labels: { env: 'production', team: 'payments' },
    metadata: [
      { key: 'tier', value: 'critical', value_type: 'string' },
      { key: 'version', value: '2', value_type: 'number' },
    ],
    identity_sources: [
      { id: 'is-001', type: 'key', key_id: '019d747d-9efa-7a9e-81d9-15564e7edb10', key_generation: 'auto' },
    ],
    created_at: '2024-06-10T09:00:00Z',
    updated_at: '2025-01-15T14:30:00Z',
  },
  {
    id: 'p-analytics-02',
    name: 'analytics-pipeline',
    description: 'Automated data pipeline for analytics ingestion.',
    labels: { env: 'production', team: 'data' },
    metadata: [
      { key: 'schedule', value: 'hourly', value_type: 'string' },
    ],
    identity_sources: [
      { id: 'is-002', type: 'key', key_id: 'a3f91c2e-4d05-4b8a-b321-f7e0c3d92a81', key_generation: 'manual', key_value: 'ak-7e3f1b9c' },
    ],
    created_at: '2024-08-22T11:00:00Z',
  },
  {
    id: 'p-partner-03',
    name: 'partner-integration-acme',
    description: 'External integration principal for Acme Corp partner.',
    labels: { env: 'production', team: 'partnerships' },
    metadata: [],
    identity_sources: [
      { id: 'is-003', type: 'external_identifier', ext_name: 'acme_partner_id', ext_value: 'acme-corp-001' },
    ],
    created_at: '2024-10-05T16:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: 'p-payments-oauth-04',
    name: 'checkout-service',
    description: 'Service handling checkout flows and payment processing.',
    labels: { env: 'production', team: 'payments' },
    metadata: [],
    identity_sources: [
      { id: 'is-004', type: 'oauth', oauth_server_type: 'kong', auth_server: 'as-prod-01', oauth_client: 'client-001' },
    ],
    created_at: '2024-07-01T09:00:00Z',
    updated_at: '2025-01-20T11:00:00Z',
  },
  {
    id: 'p-analytics-oauth-05',
    name: 'analytics-worker',
    description: 'Background worker for analytics data ingestion and processing.',
    labels: { env: 'production', team: 'data' },
    metadata: [],
    identity_sources: [
      { id: 'is-005', type: 'oauth', oauth_server_type: 'external', issuer: 'https://accounts.example.com', client_id: 'analytics-pipeline-123' },
    ],
    created_at: '2024-09-10T11:00:00Z',
  },
  {
    id: 'p-devportal-07',
    name: 'developer-portal-app',
    description: 'Handles authentication and access for applications using the developer portal.',
    source: 'dev_portal',
    dev_portal_id: 'b7c4e2f1-8d3a-4f6b-9a21-c5d8e7f2a4b6',
    dev_portal_name: 'Developer Portal',
    labels: { env: 'production', team: 'portal' },
    metadata: [
      { key: 'tier', value: 'standard', value_type: 'string' },
    ],
    identity_sources: [
      { id: 'is-dp-001', type: 'consumer', control_plane: 'prod-us-west-control-plane', consumer_id: 'c-portal-west-001', api_name: 'Payments API' },
      { id: 'is-dp-002', type: 'consumer', control_plane: 'prod-us-east-control-plane', consumer_id: 'c-portal-east-002', api_name: 'Analytics API' },
    ],
    created_at: '2026-04-02T09:19:00Z',
    updated_at: '2026-04-10T14:30:00Z',
  },
  {
    id: 'p-devportal-09',
    name: 'portal-dashboard-app',
    description: 'Manages access for the analytics dashboard via the developer portal.',
    source: 'dev_portal',
    dev_portal_id: 'c3f7a1e2-9b4d-4e8c-b123-d6f2e3a7c5b8',
    dev_portal_name: 'Developer Portal',
    labels: { env: 'staging', team: 'portal' },
    metadata: [
      { key: 'env', value: 'staging', value_type: 'string' },
    ],
    identity_sources: [],
    created_at: '2026-05-14T11:22:00Z',
    updated_at: '2026-05-14T11:22:00Z',
  },
  {
    id: 'p-platform-oauth-06',
    name: 'platform-api',
    description: 'Internal API service powering core platform operations.',
    labels: { env: 'production', team: 'platform' },
    metadata: [],
    identity_sources: [
      { id: 'is-006', type: 'oauth', oauth_server_type: 'kong', auth_server: 'as-prod-01', oauth_client: 'client-002' },
      { id: 'is-007', type: 'key', key_id: 'b9e4d2f1-3a07-4c9b-a512-e8f1c4d83b90', key_generation: 'auto' },
    ],
    created_at: '2024-11-01T14:00:00Z',
    updated_at: '2025-03-05T09:30:00Z',
  },
]

const principals = ref<Principal[]>([])

export function usePrincipalStore() {
  const getAll = (): Principal[] => principals.value

  const getById = (id: string): Principal | undefined =>
    principals.value.find(p => p.id === id)

  const filter = (query: string): Principal[] =>
    principals.value.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))

  const create = (data: Omit<Principal, 'id' | 'created_at' | 'updated_at'>): Principal => {
    const principal: Principal = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    }
    principals.value = [...principals.value, principal]
    return principal
  }

  const update = (id: string, data: Partial<Omit<Principal, 'id' | 'created_at'>>): Principal | undefined => {
    const index = principals.value.findIndex(p => p.id === id)
    if (index === -1) return undefined
    const updated: Principal = {
      ...principals.value[index],
      ...data,
      updated_at: new Date().toISOString(),
    }
    principals.value = principals.value.map((p, i) => (i === index ? updated : p))
    return updated
  }

  const remove = (id: string): void => {
    principals.value = principals.value.filter(p => p.id !== id)
  }

  const seed = (): void => {
    principals.value = [...SEED_PRINCIPALS]
  }

  const clear = (): void => {
    principals.value = []
  }

  return {
    principals,
    getAll,
    getById,
    filter,
    create,
    update,
    remove,
    seed,
    clear,
  }
}
