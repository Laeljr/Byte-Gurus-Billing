<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="modalTitleId"
    @keydown.esc.prevent="handleClose"
  >
    <div
      class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative"
      ref="modal"
      tabindex="-1"
    >
      <h2 :id="modalTitleId" class="text-xl font-semibold text-[#103355] mb-4">
        {{ mode }} Invoice Item
      </h2>

      <form @submit.prevent="handleSave" novalidate>
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium" for="description">Description</label>
          <input
            id="description"
            v-model.trim="form.description"
            type="text"
            class="w-full border px-3 py-2 rounded"
            required
            autofocus
          />
        </div>

        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium" for="quantity">Quantity</label>
          <input
            id="quantity"
            v-model.number="form.quantity"
            type="number"
            min="1"
            class="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium" for="unitPrice">Unit Price</label>
          <input
            id="unitPrice"
            v-model.number="form.unitPrice"
            type="number"
            min="0"
            step="0.01"
            class="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div class="flex justify-end space-x-2 mt-6">
          <button
            type="button"
            class="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            @click="handleClose"
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
  show: { type: Boolean, required: true },
  mode: { type: String, default: 'Add' },
  item: {
    type: Object,
    default: () => ({ description: '', quantity: 1, unitPrice: 0 }),
  },
})

const emit = defineEmits(['close', 'save'])

const form = ref({ ...props.item })
const modal = ref(null)
const modalTitleId = `modal-title-${Math.random().toString(36).slice(2)}`

// Reset form and focus modal when opened
watch(
  () => props.show,
  async (val) => {
    if (val) {
      form.value = { ...props.item }
      await nextTick()
      modal.value?.focus()
    }
  }
)

// Keep form in sync if item changes while modal is open
watch(
  () => props.item,
  (newItem) => {
    if (props.show) {
      form.value = { ...newItem }
    }
  },
  { deep: true }
)

function handleSave() {
  // Validation
  if (!form.value.description.trim()) {
    alert('Description cannot be empty.')
    return
  }
  if (form.value.quantity < 1 || isNaN(form.value.quantity)) {
    alert('Quantity must be a number greater than or equal to 1.')
    return
  }
  if (form.value.unitPrice < 0 || isNaN(form.value.unitPrice)) {
    alert('Unit Price cannot be negative.')
    return
  }

  emit('save', { ...form.value })
  emit('close')
}

function handleClose() {
  emit('close')
}
</script>

<style scoped>
/* Optional: Add focus outline for accessibility */
:focus {
  outline: 2px solid #103355;
  outline-offset: 2px;
}
</style>
