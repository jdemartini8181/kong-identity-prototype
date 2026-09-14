import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'

const routes = [
  {
    path: '/',
    redirect: '/identity/principals',
  },
  {
    path: '/overview',
    name: 'home',
    component: HomePage,
  },

  // Event Gateway
  {
    path: '/event-gateway',
    name: 'event-gateway-list',
    component: () => import('../views/event-gateway/EventGatewayList.vue'),
  },
  {
    path: '/event-gateway/create',
    name: 'event-gateway-create',
    component: () => import('../views/event-gateway/EventGatewayForm.vue'),
  },
  {
    path: '/event-gateway/:id/edit',
    name: 'event-gateway-edit',
    component: () => import('../views/event-gateway/EventGatewayForm.vue'),
  },
  {
    path: '/event-gateway/:id',
    name: 'event-gateway-overview',
    component: () => import('../views/event-gateway/EventGatewayView.vue'),
  },
  {
    path: '/event-gateway/:id/data-plane-nodes',
    name: 'event-gateway-data-plane-nodes',
    component: () => import('../views/event-gateway/EventGatewayView.vue'),
  },
  {
    path: '/event-gateway/:id/backend-clusters',
    name: 'event-gateway-backend-clusters',
    component: () => import('../views/event-gateway/EventGatewayView.vue'),
  },
  {
    path: '/event-gateway/:id/virtual-clusters',
    name: 'event-gateway-virtual-clusters',
    component: () => import('../views/event-gateway/EventGatewayView.vue'),
  },
  {
    path: '/event-gateway/:id/listeners',
    name: 'event-gateway-listeners',
    component: () => import('../views/event-gateway/EventGatewayView.vue'),
  },
  {
    path: '/event-gateway/:id/resources',
    name: 'event-gateway-resources',
    component: () => import('../views/event-gateway/EventGatewayView.vue'),
  },
  {
    path: '/event-gateway/:id/virtual-clusters/create',
    name: 'virtual-cluster-create',
    component: () => import('../views/event-gateway/VirtualClusterForm.vue'),
  },
  {
    path: '/event-gateway/:id/virtual-clusters/:vcId/edit',
    name: 'virtual-cluster-edit',
    component: () => import('../views/event-gateway/VirtualClusterForm.vue'),
  },

  // API Gateway
  {
    path: '/api-gateway',
    name: 'api-gateway-list',
    component: () => import('../views/api-gateway/ApiGatewayList.vue'),
  },
  {
    path: '/api-gateway/create',
    name: 'api-gateway-create',
    component: () => import('../views/api-gateway/ApiGatewayForm.vue'),
  },
  {
    path: '/api-gateway/:id/edit',
    name: 'api-gateway-edit',
    component: () => import('../views/api-gateway/ApiGatewayForm.vue'),
  },
  {
    path: '/api-gateway/:id',
    name: 'api-gateway-overview',
    component: () => import('../views/api-gateway/ApiGatewayView.vue'),
  },
  {
    path: '/api-gateway/:id/data-plane-nodes',
    name: 'api-gateway-data-plane-nodes',
    component: () => import('../views/api-gateway/ApiGatewayView.vue'),
  },
  {
    path: '/api-gateway/:id/services',
    name: 'api-gateway-services',
    component: () => import('../views/api-gateway/ApiGatewayView.vue'),
  },
  {
    path: '/api-gateway/:id/routes',
    name: 'api-gateway-routes',
    component: () => import('../views/api-gateway/ApiGatewayView.vue'),
  },
  {
    path: '/api-gateway/:id/consumers',
    name: 'api-gateway-consumers',
    component: () => import('../views/api-gateway/ApiGatewayView.vue'),
  },
  {
    path: '/api-gateway/:id/plugins',
    name: 'api-gateway-plugins',
    component: () => import('../views/api-gateway/ApiGatewayView.vue'),
  },
  {
    path: '/api-gateway/:id/services/create',
    name: 'gateway-service-create',
    component: () => import('../views/api-gateway/GatewayServiceForm.vue'),
  },
  {
    path: '/api-gateway/:id/services/:serviceId/edit',
    name: 'gateway-service-edit',
    component: () => import('../views/api-gateway/GatewayServiceForm.vue'),
  },
  {
    path: '/api-gateway/:id/routes/create',
    name: 'gateway-route-create',
    component: () => import('../views/api-gateway/RouteForm.vue'),
  },
  {
    path: '/api-gateway/:id/routes/:routeId/edit',
    name: 'gateway-route-edit',
    component: () => import('../views/api-gateway/RouteForm.vue'),
  },
  {
    path: '/api-gateway/:id/consumers/create',
    name: 'gateway-consumer-create',
    component: () => import('../views/api-gateway/ConsumerForm.vue'),
  },
  {
    path: '/api-gateway/:id/consumers/:consumerId/edit',
    name: 'gateway-consumer-edit',
    component: () => import('../views/api-gateway/ConsumerForm.vue'),
  },
  {
    path: '/api-gateway/:id/plugins/select',
    name: 'gateway-plugin-select',
    component: () => import('../views/api-gateway/GatewayPluginSelect.vue'),
  },
  {
    path: '/api-gateway/:id/plugins/new/:pluginType',
    name: 'gateway-plugin-create',
    component: () => import('../views/api-gateway/GatewayPluginForm.vue'),
  },
  {
    path: '/api-gateway/:id/plugins/:pluginId/edit',
    name: 'gateway-plugin-edit',
    component: () => import('../views/api-gateway/GatewayPluginForm.vue'),
  },

  // Dev Portal
  {
    path: '/dev-portal/applications/:principalId',
    name: 'dev-portal-application',
    component: () => import('../views/dev-portal/DevPortalApplicationView.vue'),
  },

  // Identity
  {
    path: '/identity',
    redirect: '/identity/principals',
  },
  {
    path: '/identity/principals',
    name: 'principals-list',
    component: () => import('../views/identity/PrincipalsList.vue'),
  },
  {
    path: '/identity/principals/create',
    name: 'principal-create',
    component: () => import('../views/identity/PrincipalCreateForm.vue'),
  },
  {
    path: '/identity/principals/:id',
    name: 'principal-detail',
    component: () => import('../views/identity/PrincipalView.vue'),
  },
  {
    path: '/identity/auth-servers',
    name: 'auth-servers-list',
    component: () => import('../views/identity/AuthServersList.vue'),
  },
  {
    path: '/identity/auth-servers/create',
    name: 'auth-server-create',
    component: () => import('../views/identity/AuthServerForm.vue'),
  },
  {
    path: '/identity/auth-servers/:id',
    name: 'auth-server-overview',
    component: () => import('../views/identity/AuthServerView.vue'),
  },
  {
    path: '/identity/auth-servers/:id/configuration',
    name: 'auth-server-configuration',
    component: () => import('../views/identity/AuthServerView.vue'),
  },
  {
    path: '/identity/auth-servers/:id/edit',
    name: 'auth-server-edit',
    component: () => import('../views/identity/AuthServerForm.vue'),
  },
  {
    path: '/identity/auth-servers/:id/scopes',
    name: 'auth-server-scopes',
    component: () => import('../views/identity/AuthServerEntitiesList.vue'),
  },
  {
    path: '/identity/auth-servers/:id/scopes/create',
    name: 'auth-server-scope-create',
    component: () => import('../views/identity/AuthServerEntityForm.vue'),
  },
  {
    path: '/identity/auth-servers/:id/scopes/:entityId/edit',
    name: 'auth-server-scope-edit',
    component: () => import('../views/identity/AuthServerEntityForm.vue'),
  },
  {
    path: '/identity/auth-servers/:id/claims',
    name: 'auth-server-claims',
    component: () => import('../views/identity/AuthServerEntitiesList.vue'),
  },
  {
    path: '/identity/auth-servers/:id/claims/create',
    name: 'auth-server-claim-create',
    component: () => import('../views/identity/AuthServerEntityForm.vue'),
  },
  {
    path: '/identity/auth-servers/:id/claims/:entityId/edit',
    name: 'auth-server-claim-edit',
    component: () => import('../views/identity/AuthServerEntityForm.vue'),
  },
  {
    path: '/identity/auth-servers/:id/clients',
    name: 'auth-server-clients',
    component: () => import('../views/identity/AuthServerEntitiesList.vue'),
  },
  {
    path: '/identity/auth-servers/:id/clients/create',
    name: 'auth-server-client-create',
    component: () => import('../views/identity/AuthServerEntityForm.vue'),
  },
  {
    path: '/identity/auth-servers/:id/clients/:entityId/edit',
    name: 'auth-server-client-edit',
    component: () => import('../views/identity/AuthServerEntityForm.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
