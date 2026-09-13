<template>
  <KModal
    :title="`Delete ${authServer.name}?`"
    :action-button-text="isDeleting ? 'Deleting...' : 'Delete'"
    action-button-appearance="danger"
    :action-button-disabled="isDeleting"
    cancel-button-text="Cancel"
    data-testid="delete-auth-server-modal"
    @cancel="emit('close')"
    @proceed="handleDelete"
  >
    <p>
      This action cannot be undone.
      <template v-if="authServer.clients_count > 0">
        This auth server has {{ authServer.clients_count }} client{{ authServer.clients_count !== 1 ? 's' : '' }} that will also be deleted.
      </template>
    </p>
    <KAlert
      v-if="errorMessage"
      appearance="danger"
      :message="errorMessage"
    />
  </KModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { KModal, KAlert } from '@kong/kongponents'
import { useAuthServerStore } from '@/composables/useAuthServerStore'
import type { AuthServer } from '@/types'

const props = defineProps<{
  authServer: AuthServer
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'deleted'): void
}>()

const store = useAuthServerStore()
const isDeleting = ref(false)
const errorMessage = ref('')

const handleDelete = async () => {
  isDeleting.value = true
  errorMessage.value = ''
  try {
    store.remove(props.authServer.id)
    emit('deleted')
  } catch {
    errorMessage.value = 'An error occurred while deleting the auth server.'
    isDeleting.value = false
  }
}
</script>
