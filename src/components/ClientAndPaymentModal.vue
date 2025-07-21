<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded shadow max-w-md w-full">
      <h2 class="text-xl font-semibold mb-4">Edit Client & Payment</h2>
      <form @submit.prevent="handleSave" class="space-y-4">
        <div>
          <label class="block mb-1 font-medium">Client Name</label>
          <input v-model="localClient.name" type="text" required class="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label class="block mb-1 font-medium">Address</label>
          <input v-model="localClient.address" type="text" class="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label class="block mb-1 font-medium">Phone</label>
          <input v-model="localClient.phone" type="text" class="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label class="block mb-1 font-medium">Email</label>
          <input v-model="localClient.email" type="email" class="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label class="block mb-1 font-medium">Payment Method</label>
          <select v-model="localPaymentMethod" class="w-full border rounded px-3 py-2">
            <option value="" disabled>Select payment method</option>
            <option value="Cash Transfer">Cash Transfer</option>
            <option value="Mobile Transfer">Mobile Transfer</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>

        <div>
          <label class="block mb-1 font-medium">Amount Receiver</label>
          <input v-model="localReceiver" type="text" class="w-full border rounded px-3 py-2" />
        </div>

        <div class="flex justify-end space-x-3 pt-4 border-t">
          <button type="button" @click="$emit('close')" class="px-4 py-2 border rounded">Cancel</button>
          <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch, defineProps, defineEmits } from 'vue'

const props = defineProps({
  client: Object,
  paymentMethod: String,
  receiver: String,
})

const emit = defineEmits(['save', 'close'])

const localClient = reactive({ name: '', address: '', phone: '', email: '' })
const localPaymentMethod = ref('')
const localReceiver = ref('')

watch(
  () => props.client,
  (val) => {
    if (val) {
      localClient.name = val.name || ''
      localClient.address = val.address || ''
      localClient.phone = val.phone || ''
      localClient.email = val.email || ''
    }
  },
  { immediate: true }
)

watch(
  () => props.paymentMethod,
  (val) => (localPaymentMethod.value = val || ''),
  { immediate: true }
)

watch(
  () => props.receiver,
  (val) => (localReceiver.value = val || ''),
  { immediate: true }
)

function handleSave() {
  emit('save', {
    client: { ...localClient },
    paymentMethod: localPaymentMethod.value,
    receiver: localReceiver.value,
  })
}
</script>
