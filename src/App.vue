<template>
  <AppLayout>
    <router-view />
  </AppLayout>
  <StateSwitcher />
  <LearningHubSlideout />
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import StateSwitcher from '@/components/StateSwitcher.vue'
import LearningHubSlideout from '@/components/LearningHubSlideout.vue'
import { useStateSwitcher } from '@/composables/useStateSwitcher'
import { usePrincipalStore } from '@/composables/usePrincipalStore'

const route = useRoute()
const router = useRouter()
const { switchers, unregister } = useStateSwitcher()
const principalStore = usePrincipalStore()

const isIdentityRoute = computed(() => String(route.path).startsWith('/identity'))

const subState = () => principalStore.principals.value.length > 0 ? 'existing' : 'new'

const STATES = [
  { key: 'new', label: 'First-time experience' },
  { key: 'existing', label: 'Manage principals' },
]

watch(isIdentityRoute, (isActive) => {
  if (isActive) {
    if (route.query.principals === 'existing' && principalStore.principals.value.length === 0) {
      principalStore.seed()
    }
    switchers.set('default', {
      states: STATES,
      currentValue: subState(),
      callback: (value) => {
        value === 'existing' ? principalStore.seed() : principalStore.clear()
        router.push({ name: 'principals-list' })
      },
    })
  } else {
    unregister('default')
  }
}, { immediate: true })

</script>
