import { ref } from 'vue'
import { nanoid } from 'nanoid'
import type {
  ApiGateway,
  ApiGatewayDataPlaneNode,
  ApiGatewayService,
  ApiGatewayRoute,
  ApiGatewayConsumer,
  ApiGatewayPlugin,
  GatewayPluginName,
} from '@/types'

const GW_1 = 'ag-prod-01'

const SEED_GATEWAYS: ApiGateway[] = [
  {
    id: GW_1,
    name: 'Production API Gateway',
    description: 'Primary API gateway for production traffic.',
    labels: { env: 'production', team: 'platform' },
    cluster_type: 'CLUSTER_TYPE_HYBRID',
    nodes_total: 3,
    services_total: 4,
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2025-03-10T14:30:00Z',
  },
]

const SEED_DATA_PLANE_NODES: Record<string, ApiGatewayDataPlaneNode[]> = {
  [GW_1]: [
    { id: 'agn-001', gateway_id: GW_1, hostname: 'dp-node-1.prod.example.com', version: '3.9.1', status: 'connected', last_seen: '2025-03-10T14:30:00Z' },
    { id: 'agn-002', gateway_id: GW_1, hostname: 'dp-node-2.prod.example.com', version: '3.9.1', status: 'connected', last_seen: '2025-03-10T14:28:00Z' },
    { id: 'agn-003', gateway_id: GW_1, hostname: 'dp-node-3.prod.example.com', version: '3.9.0', status: 'disconnected', last_seen: '2025-02-28T08:00:00Z' },
  ],
}

const SEED_SERVICES: Record<string, ApiGatewayService[]> = {
  [GW_1]: [
    { id: 'svc-001', gateway_id: GW_1, name: 'payments-service', host: 'payments.internal', port: 8080, protocol: 'http', path: '/payments', enabled: true, tags: ['payments', 'critical'], created_at: '2024-02-01T09:00:00Z', updated_at: '2025-01-10T11:00:00Z' },
    { id: 'svc-002', gateway_id: GW_1, name: 'user-service', host: 'users.internal', port: 8081, protocol: 'http', path: '/users', enabled: true, tags: ['identity'], created_at: '2024-02-15T10:00:00Z', updated_at: '2024-12-01T09:00:00Z' },
    { id: 'svc-003', gateway_id: GW_1, name: 'catalog-service', host: 'catalog.internal', port: 8082, protocol: 'https', path: '/catalog', enabled: true, tags: [], created_at: '2024-03-01T12:00:00Z' },
    { id: 'svc-004', gateway_id: GW_1, name: 'legacy-auth-service', host: 'auth-legacy.internal', port: 9090, protocol: 'http', enabled: false, tags: ['deprecated'], created_at: '2023-06-01T08:00:00Z', updated_at: '2024-08-15T16:00:00Z' },
  ],
}

const SEED_ROUTES: Record<string, ApiGatewayRoute[]> = {
  [GW_1]: [
    { id: 'rt-001', gateway_id: GW_1, service_id: 'svc-001', name: 'payments-api', protocols: ['https'], methods: ['GET', 'POST'], paths: ['/api/v1/payments'], enabled: true, created_at: '2024-02-01T09:30:00Z' },
    { id: 'rt-002', gateway_id: GW_1, service_id: 'svc-002', name: 'users-api', protocols: ['https'], methods: ['GET', 'POST', 'PUT', 'DELETE'], paths: ['/api/v1/users'], enabled: true, created_at: '2024-02-15T10:30:00Z' },
    { id: 'rt-003', gateway_id: GW_1, service_id: 'svc-003', name: 'catalog-api', protocols: ['http', 'https'], methods: ['GET'], paths: ['/api/v1/catalog', '/api/v2/catalog'], enabled: true, created_at: '2024-03-01T12:30:00Z' },
    { id: 'rt-004', gateway_id: GW_1, service_id: 'svc-001', name: 'payments-webhooks', protocols: ['https'], methods: ['POST'], paths: ['/webhooks/payments'], enabled: true, created_at: '2024-04-01T10:00:00Z' },
  ],
}

const SEED_CONSUMERS: Record<string, ApiGatewayConsumer[]> = {
  [GW_1]: [
    { id: 'con-001', gateway_id: GW_1, username: 'mobile-app', custom_id: 'app-mobile-001', tags: ['mobile', 'production'], created_at: '2024-02-10T09:00:00Z' },
    { id: 'con-002', gateway_id: GW_1, username: 'partner-acme', custom_id: 'partner-acme-corp', tags: ['partner'], created_at: '2024-03-15T11:00:00Z', updated_at: '2024-11-01T10:00:00Z' },
    { id: 'con-003', gateway_id: GW_1, username: 'analytics-pipeline', tags: ['internal', 'data'], created_at: '2024-04-01T08:00:00Z' },
  ],
}

const SEED_PLUGINS: Record<string, ApiGatewayPlugin[]> = {
  [GW_1]: [
    {
      id: 'plg-001',
      gateway_id: GW_1,
      name: 'key-auth',
      config: { key_names: ['apikey'], key_in_header: true, key_in_query: true, key_in_body: false, hide_credentials: false },
      enabled: true,
      service_id: 'svc-001',
      created_at: '2024-02-05T09:00:00Z',
    },
{
      id: 'plg-003',
      gateway_id: GW_1,
      name: 'basic-auth',
      config: { hide_credentials: false },
      enabled: false,
      service_id: 'svc-004',
      created_at: '2023-06-10T08:00:00Z',
    },
  ],
}

const gateways = ref<ApiGateway[]>([...SEED_GATEWAYS])
const dataPlaneNodesMap = ref<Record<string, ApiGatewayDataPlaneNode[]>>({ ...SEED_DATA_PLANE_NODES })
const servicesMap = ref<Record<string, ApiGatewayService[]>>({ ...SEED_SERVICES })
const routesMap = ref<Record<string, ApiGatewayRoute[]>>({ ...SEED_ROUTES })
const consumersMap = ref<Record<string, ApiGatewayConsumer[]>>({ ...SEED_CONSUMERS })
const pluginsMap = ref<Record<string, ApiGatewayPlugin[]>>({ ...SEED_PLUGINS })

export function useApiGatewayStore() {
  // ── Gateways ─────────────────────────────────────────────────────
  const getAll = (): ApiGateway[] => gateways.value
  const getById = (id: string): ApiGateway | undefined => gateways.value.find(g => g.id === id)
  const filter = (query: string): ApiGateway[] =>
    gateways.value.filter(g => g.name.toLowerCase().includes(query.toLowerCase()))

  const create = (data: Omit<ApiGateway, 'id' | 'created_at' | 'nodes_total' | 'services_total'>): ApiGateway => {
    const gateway: ApiGateway = { ...data, id: nanoid(10), nodes_total: 0, services_total: 0, created_at: new Date().toISOString() }
    gateways.value = [...gateways.value, gateway]
    servicesMap.value[gateway.id] = []
    routesMap.value[gateway.id] = []
    consumersMap.value[gateway.id] = []
    pluginsMap.value[gateway.id] = []
    dataPlaneNodesMap.value[gateway.id] = []
    return gateway
  }

  const update = (id: string, data: Partial<Omit<ApiGateway, 'id' | 'created_at' | 'nodes_total' | 'services_total'>>): ApiGateway | undefined => {
    const index = gateways.value.findIndex(g => g.id === id)
    if (index === -1) return undefined
    const updated: ApiGateway = { ...gateways.value[index], ...data, updated_at: new Date().toISOString() }
    gateways.value = gateways.value.map((g, i) => (i === index ? updated : g))
    return updated
  }

  const remove = (id: string): void => {
    gateways.value = gateways.value.filter(g => g.id !== id)
    delete servicesMap.value[id]
    delete routesMap.value[id]
    delete consumersMap.value[id]
    delete pluginsMap.value[id]
    delete dataPlaneNodesMap.value[id]
  }

  // ── Data plane nodes ─────────────────────────────────────────────
  const getDataPlaneNodes = (gatewayId: string): ApiGatewayDataPlaneNode[] =>
    dataPlaneNodesMap.value[gatewayId] ?? []

  // ── Services ─────────────────────────────────────────────────────
  const getServices = (gatewayId: string): ApiGatewayService[] =>
    servicesMap.value[gatewayId] ?? []
  const getServiceById = (gatewayId: string, serviceId: string): ApiGatewayService | undefined =>
    (servicesMap.value[gatewayId] ?? []).find(s => s.id === serviceId)

  const createService = (gatewayId: string, data: Omit<ApiGatewayService, 'id' | 'gateway_id' | 'created_at'>): ApiGatewayService => {
    const service: ApiGatewayService = { ...data, id: `svc-${nanoid(6)}`, gateway_id: gatewayId, created_at: new Date().toISOString() }
    servicesMap.value[gatewayId] = [...(servicesMap.value[gatewayId] ?? []), service]
    const gw = gateways.value.find(g => g.id === gatewayId)
    if (gw) gateways.value = gateways.value.map(g => g.id === gatewayId ? { ...g, services_total: g.services_total + 1 } : g)
    return service
  }

  const updateService = (gatewayId: string, serviceId: string, data: Partial<Omit<ApiGatewayService, 'id' | 'gateway_id' | 'created_at'>>): ApiGatewayService | undefined => {
    const list = servicesMap.value[gatewayId] ?? []
    const index = list.findIndex(s => s.id === serviceId)
    if (index === -1) return undefined
    const updated: ApiGatewayService = { ...list[index], ...data, updated_at: new Date().toISOString() }
    servicesMap.value[gatewayId] = list.map((s, i) => (i === index ? updated : s))
    return updated
  }

  const removeService = (gatewayId: string, serviceId: string): void => {
    servicesMap.value[gatewayId] = (servicesMap.value[gatewayId] ?? []).filter(s => s.id !== serviceId)
    gateways.value = gateways.value.map(g => g.id === gatewayId ? { ...g, services_total: Math.max(0, g.services_total - 1) } : g)
  }

  // ── Routes ───────────────────────────────────────────────────────
  const getRoutes = (gatewayId: string): ApiGatewayRoute[] =>
    routesMap.value[gatewayId] ?? []
  const getRouteById = (gatewayId: string, routeId: string): ApiGatewayRoute | undefined =>
    (routesMap.value[gatewayId] ?? []).find(r => r.id === routeId)

  const createRoute = (gatewayId: string, data: Omit<ApiGatewayRoute, 'id' | 'gateway_id' | 'created_at'>): ApiGatewayRoute => {
    const route: ApiGatewayRoute = { ...data, id: `rt-${nanoid(6)}`, gateway_id: gatewayId, created_at: new Date().toISOString() }
    routesMap.value[gatewayId] = [...(routesMap.value[gatewayId] ?? []), route]
    return route
  }

  const updateRoute = (gatewayId: string, routeId: string, data: Partial<Omit<ApiGatewayRoute, 'id' | 'gateway_id' | 'created_at'>>): ApiGatewayRoute | undefined => {
    const list = routesMap.value[gatewayId] ?? []
    const index = list.findIndex(r => r.id === routeId)
    if (index === -1) return undefined
    const updated: ApiGatewayRoute = { ...list[index], ...data, updated_at: new Date().toISOString() }
    routesMap.value[gatewayId] = list.map((r, i) => (i === index ? updated : r))
    return updated
  }

  const removeRoute = (gatewayId: string, routeId: string): void => {
    routesMap.value[gatewayId] = (routesMap.value[gatewayId] ?? []).filter(r => r.id !== routeId)
  }

  // ── Consumers ────────────────────────────────────────────────────
  const getConsumers = (gatewayId: string): ApiGatewayConsumer[] =>
    consumersMap.value[gatewayId] ?? []
  const getConsumerById = (gatewayId: string, consumerId: string): ApiGatewayConsumer | undefined =>
    (consumersMap.value[gatewayId] ?? []).find(c => c.id === consumerId)

  const createConsumer = (gatewayId: string, data: Omit<ApiGatewayConsumer, 'id' | 'gateway_id' | 'created_at'>): ApiGatewayConsumer => {
    const consumer: ApiGatewayConsumer = { ...data, id: `con-${nanoid(6)}`, gateway_id: gatewayId, created_at: new Date().toISOString() }
    consumersMap.value[gatewayId] = [...(consumersMap.value[gatewayId] ?? []), consumer]
    return consumer
  }

  const updateConsumer = (gatewayId: string, consumerId: string, data: Partial<Omit<ApiGatewayConsumer, 'id' | 'gateway_id' | 'created_at'>>): ApiGatewayConsumer | undefined => {
    const list = consumersMap.value[gatewayId] ?? []
    const index = list.findIndex(c => c.id === consumerId)
    if (index === -1) return undefined
    const updated: ApiGatewayConsumer = { ...list[index], ...data, updated_at: new Date().toISOString() }
    consumersMap.value[gatewayId] = list.map((c, i) => (i === index ? updated : c))
    return updated
  }

  const removeConsumer = (gatewayId: string, consumerId: string): void => {
    consumersMap.value[gatewayId] = (consumersMap.value[gatewayId] ?? []).filter(c => c.id !== consumerId)
  }

  // ── Plugins ──────────────────────────────────────────────────────
  const getPlugins = (gatewayId: string): ApiGatewayPlugin[] =>
    pluginsMap.value[gatewayId] ?? []
  const getPluginById = (gatewayId: string, pluginId: string): ApiGatewayPlugin | undefined =>
    (pluginsMap.value[gatewayId] ?? []).find(p => p.id === pluginId)

  const createPlugin = (gatewayId: string, data: Omit<ApiGatewayPlugin, 'id' | 'gateway_id' | 'created_at'>): ApiGatewayPlugin => {
    const plugin: ApiGatewayPlugin = { ...data, id: `plg-${nanoid(6)}`, gateway_id: gatewayId, created_at: new Date().toISOString() }
    pluginsMap.value[gatewayId] = [...(pluginsMap.value[gatewayId] ?? []), plugin]
    return plugin
  }

  const updatePlugin = (gatewayId: string, pluginId: string, data: Partial<Omit<ApiGatewayPlugin, 'id' | 'gateway_id' | 'created_at'>>): ApiGatewayPlugin | undefined => {
    const list = pluginsMap.value[gatewayId] ?? []
    const index = list.findIndex(p => p.id === pluginId)
    if (index === -1) return undefined
    const updated: ApiGatewayPlugin = { ...list[index], ...data, updated_at: new Date().toISOString() }
    pluginsMap.value[gatewayId] = list.map((p, i) => (i === index ? updated : p))
    return updated
  }

  const removePlugin = (gatewayId: string, pluginId: string): void => {
    pluginsMap.value[gatewayId] = (pluginsMap.value[gatewayId] ?? []).filter(p => p.id !== pluginId)
  }

  return {
    gateways,
    getAll,
    getById,
    filter,
    create,
    update,
    remove,
    getDataPlaneNodes,
    getServices,
    getServiceById,
    createService,
    updateService,
    removeService,
    getRoutes,
    getRouteById,
    createRoute,
    updateRoute,
    removeRoute,
    getConsumers,
    getConsumerById,
    createConsumer,
    updateConsumer,
    removeConsumer,
    getPlugins,
    getPluginById,
    createPlugin,
    updatePlugin,
    removePlugin,
  }
}
