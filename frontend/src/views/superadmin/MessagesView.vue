<script setup>
import { computed, onMounted, ref } from 'vue'
import { contactService } from '@/api/contactService'
import Modal from '@/components/Modal.vue'
import Pagination from '@/components/Pagination.vue'

const messages = ref([])
const page = ref(0)
const totalPages = ref(0)
const totalElements = ref(0)
const isLoading = ref(true)
const errorMessage = ref('')
const selectedMessage = ref(null)
const deletingId = ref(null)

const messageCountLabel = computed(() => {
  if (totalElements.value === 1) return '1 message'
  return `${totalElements.value} messages`
})

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
    const res = await contactService.list({ page: page.value })
    messages.value = res.content || []
    totalPages.value = res.totalPages || 0
    totalElements.value = res.totalElements || 0
  } catch (err) {
    errorMessage.value = err.message
  } finally {
    isLoading.value = false
  }
}

function onPageChange(newPage) {
  page.value = newPage
  loadMessages()
}

async function deleteMessage(message) {
  const shouldDelete = window.confirm(`Delete the message from ${message.name}?`)
  if (!shouldDelete) return

  deletingId.value = message.id
  errorMessage.value = ''
  try {
    await contactService.delete(message.id)
    if (selectedMessage.value?.id === message.id) {
      selectedMessage.value = null
    }
    await loadMessages()
  } catch (err) {
    errorMessage.value = err.message
  } finally {
    deletingId.value = null
  }
}

onMounted(loadMessages)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="font-display text-xl font-bold text-navy-900">Contact Messages</h1>
        <p class="text-slate-500 text-sm">Review enquiries submitted from the public contact form.</p>
      </div>
      <button
        @click="loadMessages"
        :disabled="isLoading"
        class="px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-navy-800 to-navy-600 hover:from-navy-900 hover:to-navy-700 disabled:opacity-60 transition text-sm"
      >
        {{ isLoading ? 'Refreshing...' : 'Refresh' }}
      </button>
    </div>

    <p v-if="errorMessage" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
      {{ errorMessage }}
    </p>

    <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div class="px-5 py-3 border-b border-slate-100 text-sm text-slate-500">
        {{ messageCountLabel }}
      </div>
      <table class="w-full text-sm">
        <thead class="bg-slate-50 text-left text-slate-500">
          <tr>
            <th class="px-5 py-3 font-medium">Name</th>
            <th class="px-5 py-3 font-medium">Email</th>
            <th class="px-5 py-3 font-medium">Subject</th>
            <th class="px-5 py-3 font-medium">Received</th>
            <th class="px-5 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="isLoading">
            <td colspan="5" class="px-5 py-6 text-center text-slate-400">Loading...</td>
          </tr>
          <tr v-else-if="messages.length === 0">
            <td colspan="5" class="px-5 py-6 text-center text-slate-400">No contact messages yet.</td>
          </tr>
          <tr v-for="message in messages" :key="message.id" class="hover:bg-slate-50">
            <td class="px-5 py-3 font-medium text-slate-800">{{ message.name }}</td>
            <td class="px-5 py-3 text-slate-500">
              <a :href="`mailto:${message.email}`" class="hover:text-navy-700">{{ message.email }}</a>
            </td>
            <td class="px-5 py-3 text-slate-700 max-w-xs truncate">{{ message.subject }}</td>
            <td class="px-5 py-3 text-slate-500 whitespace-nowrap">{{ formatDate(message.createdAt) }}</td>
            <td class="px-5 py-3 text-right space-x-3">
              <button @click="selectedMessage = message" class="text-navy-600 hover:text-navy-800 font-medium">
                View
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
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination :page="page" :total-pages="totalPages" @change="onPageChange" />

    <Modal v-if="selectedMessage" title="Contact Message" @close="selectedMessage = null">
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
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Message</p>
          <p class="whitespace-pre-wrap text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3">{{ selectedMessage.message }}</p>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <a
            :href="buildReplyUrl(selectedMessage)"
            target="_blank"
            rel="noopener noreferrer"
            class="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-navy-800 to-navy-600 hover:from-navy-900 hover:to-navy-700"
          >
            Reply
          </a>
          <button @click="selectedMessage = null" class="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">
            Close
          </button>
          <button
            @click="deleteMessage(selectedMessage)"
            :disabled="deletingId === selectedMessage.id"
            class="px-4 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {{ deletingId === selectedMessage.id ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>
