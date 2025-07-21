<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
    role="dialog"
    aria-modal="true"
    @keydown.esc="$emit('close')"
  >
    <div class="bg-white rounded shadow-lg p-6 w-full max-w-md">
      <h3 class="text-xl font-semibold mb-4 text-blue-900">Payment Information</h3>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="paymentMethod" class="block font-medium mb-1 text-gray-700"
            >Payment Method</label
          >
          <input
            id="paymentMethod"
            v-model="localPayment.paymentMethod"
            type="text"
            required
            placeholder="e.g. Cash, Bank Transfer"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div>
          <label for="amountReceiver" class="block font-medium mb-1 text-gray-700"
            >Amount Receiver</label
          >
          <input
            id="amountReceiver"
            v-model="localPayment.amountReceiver"
            type="text"
            required
            placeholder="Name of person receiving payment"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            @click="$emit('close')"
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
import { reactive, watch, defineProps, defineEmits } from 'vue'

const props = defineProps({
  payment: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['save', 'close'])

const localPayment = reactive({
  paymentMethod: '',
  amountReceiver: '',
})

watch(
  () => props.payment,
  (newPayment) => {
    localPayment.paymentMethod = newPayment.paymentMethod || ''
    localPayment.amountReceiver = newPayment.amountReceiver || ''
  },
  { immediate: true }
)

function handleSubmit() {
  if (
    !localPayment.paymentMethod.trim() ||
    !localPayment.amountReceiver.trim()
  ) {
    alert('Please fill out all fields.')
    return
  }
  emit('save', { ...localPayment })
}
</script>
