<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { messagesService } from '@/services/messagesService'
import Modal from '@/components/Modal.vue'
import Pagination from '@/components/Pagination.vue'
import PageHeader from '@/components/PageHeader.vue'
import AppButton from '@/components/AppButton.vue'
import { useClientTable } from '@/composables/useClientTable'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { useNotifications } from '@/composables/useNotifications'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const toast = useToast()
const { confirm } = useConfirm()
const { notify } = useNotifications()

const messages = ref([])
const isLoading = ref(true)
const errorMessage = ref('')
const selectedMessage = ref(null)
const deletingId = ref(null)

const TABS = [
  { value: 'inbox', label: 'Inbox' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
  { value: 'archived', label: 'Archived' }
]
// Allows a deep link like { name: 'admin-messages', query: { tab: 'unread' } }
// (used by the Dashboard's "Unread messages" card) to land on that tab.
const route = useRoute()
const VALID_TABS = ['inbox', 'unread', 'read', 'archived']
const tab = ref(VALID_TABS.includes(route.query.tab) ? route.query.tab : 'inbox')
const unreadCount = computed(() => messages.value.filter((m) => m.status === 'unread').length)

// Archived messages never show up in the default Inbox tab — Inbox means
// "everything still active" (unread + read), matching a normal mail client.
const tabFiltered = computed(() => {
  if (tab.value === 'unread') return messages.value.filter((m) => m.status === 'unread')
  if (tab.value === 'read') return messages.value.filter((m) => m.status === 'read')
  if (tab.value === 'archived') return messages.value.filter((m) => m.status === 'archived')
  return messages.value.filter((m) => m.status !== 'archived')
})

const { search, page, filtered, paged } = useClientTable(
  tabFiltered,
  (m, q) =>
    m.name.toLowerCase().includes(q) ||
    m.email.toLowerCase().includes(q) ||
    (m.subject || '').toLowerCase().includes(q) ||
    (m.message || '').toLowerCase().includes(q)
)

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

function buildReplyUrl(message) {
  const subject = `Re: ${message.subject || 'Yntra Sparks enquiry'}`
  const body = [
    '',
    '',
    '--- Original enquiry ---',
    `From: ${message.name} <${message.email}>`,
    `Received: ${formatDate(message.createdAt)}`,
    '',
    message.message || ''
  ].join('\n')

  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: message.email,
    su: subject,
    body
  })

  return `https://mail.google.com/mail/?${params.toString()}`
}

async function loadMessages() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await messagesService.list({ size: 500 })
    messages.value = res.content || []
  } catch (err) {
    errorMessage.value = err.message
  } finally {
    isLoading.value = false
  }
}

function patchLocalStatus(messageId, status) {
  const target = messages.value.find((m) => m.id === messageId)
  if (target) target.status = status
}

function viewMessage(message) {
  selectedMessage.value = message
  if (message.status === 'unread') {
    messagesService.markRead(message)
    patchLocalStatus(message.id, 'read')
  }
}

function markRead(message) {
  messagesService.markRead(message)
  patchLocalStatus(message.id, 'read')
  toast.success('Marked as read.')
}

function markUnread(message) {
  messagesService.markUnread(message)
  patchLocalStatus(message.id, 'unread')
  toast.success('Marked as unread.')
}

function archiveMessage(message) {
  messagesService.archive(message)
  patchLocalStatus(message.id, 'archived')
  if (selectedMessage.value?.id === message.id) selectedMessage.value = null
  toast.success('Message archived.')
  notify(auth.user?.id, {
    type: 'message-archived',
    title: 'Message archived',
    message: `The message from ${message.name} was archived.`,
    to: { name: 'admin-messages' }
  })
}

function restoreMessage(message) {
  messagesService.restore(message)
  patchLocalStatus(message.id, 'read')
  toast.success('Message restored to inbox.')
  notify(auth.user?.id, {
    type: 'message-restored',
    title: 'Message restored',
    message: `The message from ${message.name} was restored to the inbox.`,
    to: { name: 'admin-messages' }
  })
}

async function deleteMessage(message) {
  const confirmed = await confirm({
    title: 'Delete message?',
    message: `Permanently delete the message from ${message.name}? This can't be undone.`,
    confirmLabel: 'Delete',
    danger: true
  })
  if (!confirmed) return

  deletingId.value = message.id
  errorMessage.value = ''
  try {
    await messagesService.delete(message)
    if (selectedMessage.value?.id === message.id) {
      selectedMessage.value = null
    }
    toast.success('Message deleted.')
    await loadMessages()
  } catch (err) {
    errorMessage.value = err.message
    toast.error(err.message)
  } finally {
    deletingId.value = null
  }
}

onMounted(loadMessages)
</script>

<template>
  <div>
    <PageHeader eyebrow="Inbox" title="Contact Messages" subtitle="Review enquiries submitted from the public contact form.">
      <AppButton @click="loadMessages" :loading="isLoading">{{ isLoading ? 'Refreshing…' : 'Refresh' }}</AppButton>
    </PageHeader>

    <p v-if="errorMessage" role="alert" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
      {{ errorMessage }}
    </p>

    <div class="flex flex-wrap gap-2 mb-4" role="tablist" aria-label="Message filters">
      <button
        v-for="t in TABS"
        :key="t.value"
        type="button"
        role="tab"
        :aria-selected="tab === t.value"
        class="px-3.5 py-1.5 rounded-full text-sm font-semibold transition"
        :class="tab === t.value ? 'bg-navy-800 text-white' : 'bg-white border border-navy-100 text-ink-600 hover:border-navy-300'"
        @click="tab = t.value"
      >
        {{ t.label }}
        <span v-if="t.value === 'unread' && unreadCount > 0" class="ml-1 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-spark-500 text-white text-xs">{{ unreadCount }}</span>
      </button>
    </div>

    <div class="mb-4">
      <input
        v-model="search"
        type="search"
        class="app-input sm:max-w-xs"
        placeholder="Search by name, email, subject, or message"
        aria-label="Search messages"
      >
    </div>

    <div class="app-surface rounded-[22px] overflow-hidden">
      <div class="px-5 py-3 border-b border-slate-100 text-sm text-slate-500">
        {{ filtered.length }} message{{ filtered.length === 1 ? '' : 's' }}
      </div>
      <div class="overflow-x-auto">
      <table class="app-data-table w-full min-w-[980px] text-sm">
        <thead class="bg-slate-50 text-left text-slate-500">
          <tr>
            <th class="px-5 py-3 font-medium">Name</th>
            <th class="px-5 py-3 font-medium">Email</th>
            <th class="px-5 py-3 font-medium">Subject</th>
            <th class="px-5 py-3 font-medium">Source</th>
            <th class="px-5 py-3 font-medium">Status</th>
            <th class="px-5 py-3 font-medium">Received</th>
            <th class="px-5 py-3 font-medium text-right w-[280px]">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="isLoading">
            <td colspan="7" class="px-5 py-6 text-center text-slate-400">Loading...</td>
          </tr>
          <tr v-else-if="paged.content.length === 0">
            <td colspan="7" class="px-5 py-6 text-center text-slate-400">{{ search ? 'No messages match your search.' : 'Nothing here.' }}</td>
          </tr>
          <tr v-for="message in paged.content" :key="message.id" class="hover:bg-slate-50" :class="{ 'font-semibold': message.status === 'unread' }">
            <td class="px-5 py-3 text-slate-800">
              <span v-if="message.status === 'unread'" class="inline-block w-1.5 h-1.5 rounded-full bg-spark-500 mr-1.5 align-middle" aria-hidden="true"></span>{{ message.name }}
            </td>
            <td class="px-5 py-3 text-slate-500 font-normal">
              <a :href="`mailto:${message.email}`" class="hover:text-navy-700">{{ message.email }}</a>
            </td>
            <td class="px-5 py-3 text-slate-700 font-normal max-w-xs truncate">{{ message.subject }}</td>
            <td class="px-5 py-3 font-normal">
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                :class="message.source === 'web3forms' ? 'bg-spark-50 text-spark-700' : 'bg-emerald-50 text-emerald-700'"
              >
                {{ message.source === 'web3forms' ? 'Web3Forms' : 'Backend' }}
              </span>
            </td>
            <td class="px-5 py-3 font-normal">
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                :class="{
                  'bg-spark-50 text-spark-700': message.status === 'unread',
                  'bg-slate-100 text-slate-600': message.status === 'read',
                  'bg-slate-200 text-slate-500': message.status === 'archived'
                }"
              >
                {{ message.status === 'unread' ? 'Unread' : message.status === 'archived' ? 'Archived' : 'Read' }}
              </span>
            </td>
            <td class="px-5 py-3 text-slate-500 font-normal whitespace-nowrap">{{ formatDate(message.createdAt) }}</td>
            <td class="px-5 py-3 font-normal">
              <div class="flex items-center justify-end gap-3 whitespace-nowrap flex-wrap">
              <button @click="viewMessage(message)" class="text-navy-600 hover:text-navy-800 font-medium">
                View
              </button>
              <button v-if="message.status === 'unread'" @click="markRead(message)" class="text-slate-600 hover:text-slate-800 font-medium">
                Mark read
              </button>
              <button v-else-if="message.status === 'read'" @click="markUnread(message)" class="text-slate-600 hover:text-slate-800 font-medium">
                Mark unread
              </button>
              <button v-if="message.status !== 'archived'" @click="archiveMessage(message)" class="text-slate-600 hover:text-slate-800 font-medium">
                Archive
              </button>
              <button v-else @click="restoreMessage(message)" class="text-emerald-600 hover:text-emerald-700 font-medium">
                Restore
              </button>
              <a
                :href="buildReplyUrl(message)"
                target="_blank"
                rel="noopener noreferrer"
                class="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Reply
              </a>
              <button
                @click="deleteMessage(message)"
                :disabled="deletingId === message.id"
                class="text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
              >
                {{ deletingId === message.id ? 'Deleting...' : 'Delete' }}
              </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>

    <Pagination :page="page" :total-pages="paged.totalPages" @change="page = $event" />

    <Modal :show="!!selectedMessage" title="Contact Message" @close="selectedMessage = null">
      <div class="space-y-4 text-sm">
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Name</p>
            <p class="font-medium text-slate-800">{{ selectedMessage.name }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Email</p>
            <a :href="`mailto:${selectedMessage.email}`" class="font-medium text-navy-700 hover:text-navy-900">
              {{ selectedMessage.email }}
            </a>
          </div>
        </div>
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Subject</p>
          <p class="font-medium text-slate-800">{{ selectedMessage.subject }}</p>
        </div>
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Received</p>
          <p class="text-slate-600">{{ formatDate(selectedMessage.createdAt) }}</p>
        </div>
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Source</p>
          <p class="text-slate-600">{{ selectedMessage.source === 'web3forms' ? 'Web3Forms (synced from public Contact form)' : 'Backend' }}</p>
        </div>
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Message</p>
          <p class="whitespace-pre-wrap text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3">{{ selectedMessage.message }}</p>
        </div>
        <div class="flex flex-wrap justify-end gap-2 pt-2">
          <AppButton
            v-if="selectedMessage.status !== 'archived'"
            variant="quiet"
            @click="archiveMessage(selectedMessage)"
          >
            Archive
          </AppButton>
          <AppButton
            v-else
            variant="quiet"
            @click="restoreMessage(selectedMessage)"
          >
            Restore
          </AppButton>
          <AppButton
            as="a"
            :href="buildReplyUrl(selectedMessage)"
            target="_blank"
            rel="noopener noreferrer"
          >
            Reply
          </AppButton>
          <AppButton variant="quiet" @click="selectedMessage = null">
            Close
          </AppButton>
          <AppButton
            variant="destructive"
            @click="deleteMessage(selectedMessage)"
            :loading="deletingId === selectedMessage.id"
          >
            {{ deletingId === selectedMessage.id ? 'Deleting...' : 'Delete' }}
          </AppButton>
        </div>
      </div>
    </Modal>
  </div>
</template>
