<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
    role="dialog"
    aria-modal="true"
    aria-labelledby="clientFormTitle"
  >
    <div
      class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative"
      tabindex="-1"
      ref="modal"
    >
      <h2
        id="clientFormTitle"
        class="text-xl font-semibold text-[#103355] mb-4"
      >
        {{ mode }} Client Details
      </h2>
      <form @submit.prevent="handleSave" novalidate>
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium" for="name">Name</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            class="w-full border px-3 py-2 rounded"
            required
            autofocus
          />
        </div>
        <div class="mb-4">
          <label
            class="block mb-1 text-sm font-medium"
            for="address"
          >Address</label>
          <textarea
            id="address"
            v-model="form.address"
            class="w-full border px-3 py-2 rounded"
            rows="3"
            required
          ></textarea>
        </div>
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium" for="phone">Phone</label>
          <input
            id="phone"
            v-model="form.phone"
            type="tel"
            class="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium" for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div class="flex justify-end space-x-2 mt-6">
          <button
            type="button"
            class="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-[#103355] text-white rounded hover:bg-[#0e2a4d]"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  show: Boolean,
  mode: {
    type: String,
    default: 'Edit',
  },
  clientData: {
    type: Object,
    default: () => ({ name: '', address: '', phone: '', email: '' }),
  },
})

const emit = defineEmits(['close', 'save'])

const form = ref({ ...props.clientData })

watch(
  () => props.show,
  async (val) => {
    if (val) {
      form.value = { ...props.clientData }
      await nextTick()
    }
  }
)

watch(
  () => props.clientData,
  (newData) => {
    if (props.show) {
      form.value = { ...newData }
    }
  },
  { deep: true }
)

function handleSave() {
  if (!form.value.name.trim()) {
    alert('Name is required')
    return
  }
  if (!form.value.address.trim()) {
    alert('Address is required')
    return
  }
  if (!form.value.phone.trim()) {
    alert('Phone is required')
    return
  }
  if (!form.value.email.trim()) {
    alert('Email is required')
    return
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.value.email)) {
    alert('Email format is invalid')
    return
  }

  emit('save', { ...form.value })
  emit('close')
}
</script>
