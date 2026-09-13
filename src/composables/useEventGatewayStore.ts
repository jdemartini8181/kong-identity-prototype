import { ref } from 'vue'
import { nanoid } from 'nanoid'
import type {
  EventGateway,
  EventGatewayDataPlaneNode,
  EventGatewayVirtualCluster,
  EventGatewayBackendCluster,
  EventGatewayListener,
  VirtualClusterAuthItem,
} from '@/types'

const GW_1 = 'eg-prod-01'

const SEED_GATEWAYS: EventGateway[] = [
  {
    id: GW_1,
    name: 'Production Event Gateway',
    description: 'Primary event gateway for production workloads.',
    labels: { env: 'production', team: 'platform' },
    min_runtime_version: '3.10',
    nodes_total: 3,
    virtual_clusters_total: 2,
    created_at: '2024-03-01T09:00:00Z',
    updated_at: '2024-11-15T14:30:00Z',
  },
]

const SEED_DATA_PLANE_NODES: Record<string, EventGatewayDataPlaneNode[]> = {
  [GW_1]: [
    { id: 'dpn-001', gateway_id: GW_1, hostname: 'dp-node-1.prod.example.com', version: '3.10.1', status: 'connected', last_seen: '2024-11-15T14:30:00Z' },
    { id: 'dpn-002', gateway_id: GW_1, hostname: 'dp-node-2.prod.example.com', version: '3.10.1', status: 'connected', last_seen: '2024-11-15T14:28:00Z' },
    { id: 'dpn-003', gateway_id: GW_1, hostname: 'dp-node-3.prod.example.com', version: '3.10.0', status: 'disconnected', last_seen: '2024-11-10T08:00:00Z' },
  ],
}

const SEED_VIRTUAL_CLUSTERS: Record<string, EventGatewayVirtualCluster[]> = {
  [GW_1]: [
    { id: 'vc-001', gateway_id: GW_1, name: 'payments-cluster', labels: { team: 'payments' }, created_at: '2024-03-05T10:00:00Z', updated_at: '2024-10-20T11:00:00Z' },
    { id: 'vc-002', gateway_id: GW_1, name: 'analytics-cluster', labels: {}, created_at: '2024-03-10T14:00:00Z', updated_at: '2024-11-01T09:30:00Z' },
  ],
}

const SEED_BACKEND_CLUSTERS: Record<string, EventGatewayBackendCluster[]> = {
  [GW_1]: [
    { id: 'bc-001', gateway_id: GW_1, name: 'kafka-prod', labels: { env: 'production' }, created_at: '2024-03-05T10:00:00Z', updated_at: '2024-10-20T11:00:00Z' },
    { id: 'bc-002', gateway_id: GW_1, name: 'kafka-analytics', labels: {}, created_at: '2024-03-10T14:00:00Z', updated_at: '2024-11-01T09:30:00Z' },
  ],
}

const SEED_LISTENERS: Record<string, EventGatewayListener[]> = {
  [GW_1]: [
    { id: 'ls-001', gateway_id: GW_1, name: 'public-kafka-listener', labels: {}, created_at: '2024-03-05T10:00:00Z', updated_at: '2024-10-20T11:00:00Z' },
    { id: 'ls-002', gateway_id: GW_1, name: 'internal-kafka-listener', labels: { network: 'internal' }, created_at: '2024-03-10T14:00:00Z', updated_at: '2024-11-01T09:30:00Z' },
  ],
}

const gateways = ref<EventGateway[]>([...SEED_GATEWAYS])
const dataPlaneNodesMap = ref<Record<string, EventGatewayDataPlaneNode[]>>({ ...SEED_DATA_PLANE_NODES })
const virtualClustersMap = ref<Record<string, EventGatewayVirtualCluster[]>>({ ...SEED_VIRTUAL_CLUSTERS })
const backendClustersMap = ref<Record<string, EventGatewayBackendCluster[]>>({ ...SEED_BACKEND_CLUSTERS })
const listenersMap = ref<Record<string, EventGatewayListener[]>>({ ...SEED_LISTENERS })

export function useEventGatewayStore() {
  const getAll = (): EventGateway[] => gateways.value

  const getById = (id: string): EventGateway | undefined =>
    gateways.value.find(g => g.id === id)

  const filter = (query: string): EventGateway[] =>
    gateways.value.filter(g => g.name.toLowerCase().includes(query.toLowerCase()))

  const create = (data: Omit<EventGateway, 'id' | 'created_at' | 'nodes_total' | 'virtual_clusters_total'>): EventGateway => {
    const gateway: EventGateway = {
      ...data,
      id: nanoid(10),
      nodes_total: 0,
      virtual_clusters_total: 0,
      created_at: new Date().toISOString(),
    }
    gateways.value = [...gateways.value, gateway]
    dataPlaneNodesMap.value[gateway.id] = []
    virtualClustersMap.value[gateway.id] = []
    backendClustersMap.value[gateway.id] = []
    listenersMap.value[gateway.id] = []
    return gateway
  }

  const update = (id: string, data: Partial<Omit<EventGateway, 'id' | 'created_at'>>): EventGateway | undefined => {
    const index = gateways.value.findIndex(g => g.id === id)
    if (index === -1) return undefined
    const updated: EventGateway = { ...gateways.value[index], ...data, updated_at: new Date().toISOString() }
    gateways.value = gateways.value.map((g, i) => (i === index ? updated : g))
    return updated
  }

  const remove = (id: string): void => {
    gateways.value = gateways.value.filter(g => g.id !== id)
    delete dataPlaneNodesMap.value[id]
    delete virtualClustersMap.value[id]
    delete backendClustersMap.value[id]
    delete listenersMap.value[id]
  }

  // Data Plane Nodes
  const getDataPlaneNodes = (gatewayId: string): EventGatewayDataPlaneNode[] =>
    dataPlaneNodesMap.value[gatewayId] || []

  // Virtual Clusters
  const getVirtualClusters = (gatewayId: string): EventGatewayVirtualCluster[] =>
    virtualClustersMap.value[gatewayId] || []

  const getVirtualClusterById = (gatewayId: string, vcId: string): EventGatewayVirtualCluster | undefined =>
    (virtualClustersMap.value[gatewayId] || []).find(vc => vc.id === vcId)

  const createVirtualCluster = (
    gatewayId: string,
    data: {
      name: string
      description?: string
      labels?: Record<string, string>
      acl_mode?: 'enforce_on_gateway' | 'passthrough'
      dns_label?: string
      destination_id?: string
      authentication?: VirtualClusterAuthItem[]
    },
  ): EventGatewayVirtualCluster => {
    const now = new Date().toISOString()
    const entity: EventGatewayVirtualCluster = { ...data, id: nanoid(10), gateway_id: gatewayId, labels: data.labels || {}, created_at: now, updated_at: now }
    virtualClustersMap.value[gatewayId] = [...(virtualClustersMap.value[gatewayId] || []), entity]
    const gw = gateways.value.find(g => g.id === gatewayId)
    if (gw) gw.virtual_clusters_total = virtualClustersMap.value[gatewayId].length
    return entity
  }

  const updateVirtualCluster = (
    gatewayId: string,
    vcId: string,
    data: Partial<Omit<EventGatewayVirtualCluster, 'id' | 'gateway_id' | 'created_at'>>,
  ): EventGatewayVirtualCluster | undefined => {
    const list = virtualClustersMap.value[gatewayId] || []
    const idx = list.findIndex(vc => vc.id === vcId)
    if (idx === -1) return undefined
    const updated: EventGatewayVirtualCluster = { ...list[idx], ...data, updated_at: new Date().toISOString() }
    virtualClustersMap.value[gatewayId] = list.map((vc, i) => (i === idx ? updated : vc))
    return updated
  }

  const removeVirtualCluster = (gatewayId: string, id: string): void => {
    virtualClustersMap.value[gatewayId] = (virtualClustersMap.value[gatewayId] || []).filter(e => e.id !== id)
    const gw = gateways.value.find(g => g.id === gatewayId)
    if (gw) gw.virtual_clusters_total = virtualClustersMap.value[gatewayId].length
  }

  // Backend Clusters
  const getBackendClusters = (gatewayId: string): EventGatewayBackendCluster[] =>
    backendClustersMap.value[gatewayId] || []

  const createBackendCluster = (gatewayId: string, data: { name: string; labels?: Record<string, string> }): EventGatewayBackendCluster => {
    const now = new Date().toISOString()
    const entity: EventGatewayBackendCluster = { ...data, id: nanoid(10), gateway_id: gatewayId, labels: data.labels || {}, created_at: now, updated_at: now }
    backendClustersMap.value[gatewayId] = [...(backendClustersMap.value[gatewayId] || []), entity]
    return entity
  }

  const removeBackendCluster = (gatewayId: string, id: string): void => {
    backendClustersMap.value[gatewayId] = (backendClustersMap.value[gatewayId] || []).filter(e => e.id !== id)
  }

  // Listeners
  const getListeners = (gatewayId: string): EventGatewayListener[] =>
    listenersMap.value[gatewayId] || []

  const createListener = (gatewayId: string, data: { name: string; labels?: Record<string, string> }): EventGatewayListener => {
    const now = new Date().toISOString()
    const entity: EventGatewayListener = { ...data, id: nanoid(10), gateway_id: gatewayId, labels: data.labels || {}, created_at: now, updated_at: now }
    listenersMap.value[gatewayId] = [...(listenersMap.value[gatewayId] || []), entity]
    return entity
  }

  const removeListener = (gatewayId: string, id: string): void => {
    listenersMap.value[gatewayId] = (listenersMap.value[gatewayId] || []).filter(e => e.id !== id)
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
    getVirtualClusters,
    getVirtualClusterById,
    createVirtualCluster,
    updateVirtualCluster,
    removeVirtualCluster,
    getBackendClusters,
    createBackendCluster,
    removeBackendCluster,
    getListeners,
    createListener,
    removeListener,
  }
}
