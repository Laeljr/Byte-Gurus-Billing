<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
    role="dialog"
    aria-modal="true"
    @keydown.esc="closeModal"
  >
    <div class="bg-white rounded shadow-lg p-6 w-full max-w-md">
      <h3 class="text-xl font-semibold mb-4 text-blue-900">
        {{ index !== null ? 'Edit' : 'Add' }} Item
      </h3>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="name" class="block font-medium mb-1 text-gray-700">Item Name</label>
          <input
            id="name"
            v-model="localItem.name"
            type="text"
            required
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div>
          <label for="qty" class="block font-medium mb-1 text-gray-700">Quantity</label>
          <input
            id="qty"
            v-model.number="localItem.qty"
            type="number"
            min="1"
            required
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div>
          <label for="price" class="block font-medium mb-1 text-gray-700">Price (ZMW)</label>
          <input
            id="price"
            v-model.number="localItem.price"
            type="number"
            min="0"
            step="0.01"
            required
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 rounded border border-gray-400 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, toRefs, watch, defineProps, defineEmits } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    default: null,
  },
})

const emit = defineEmits(['save', 'close'])

// Create a local reactive copy of item to edit without mutating prop directly
const localItem = reactive({
  name: '',
  qty: 1,
  price: 0,
})

// Sync props.item into localItem when modal opens or item changes
watch(
  () => props.item,
  (newItem) => {
    localItem.name = newItem.name || ''
    localItem.qty = newItem.qty || 1
    localItem.price = newItem.price || 0
  },
  { immediate: true }
)

function handleSubmit() {
  // Emit save event with updated item and index
  emit('save', { item: { ...localItem }, index: props.index })
}

function closeModal() {
  emit('close')
}
</script>
