<template>
  <!-- Full page container with background image -->
  <div
    class="min-h-screen w-full bg-cover bg-center flex justify-center items-start p-8"
    :style="{ backgroundImage: `url(${bgImage})` }"
  >
    <!-- White translucent card container -->
    <div class="w-full max-w-4xl bg-white/90 backdrop-blur-sm rounded shadow-lg p-6">
      <!-- Header: Quotation title -->
      <div class="mb-6 text-center">
        <h2 class="text-3xl font-bold text-blue-800">Quotation</h2>
        <p class="text-sm text-blue-700">Estimated cost for requested services</p>
      </div>

      <!-- Printable Area -->
      <div id="print-area" ref="printArea" class="p-6 bg-white/0 rounded shadow print:p-0 print:bg-white print:shadow-none">
        <!-- Company Info -->
        <div class="text-center mb-4">
          <h1 class="text-2xl font-bold text-blue-900">Byte Gurus Billing Ltd.</h1>
          <p class="text-blue-700 text-sm">
            21 Lilongwe, Nkana East, Kitwe · +260 969 291412 · bytegurus98@gmail.com
          </p>
        </div>

        <!-- Info section with quote and client details -->
        <div class="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p><strong>Quote No:</strong> {{ quote.number }}</p>
            <p><strong>Date:</strong> {{ quote.date }}</p>
            <p><strong>Valid Until:</strong> {{ quote.expiry }}</p>
          </div>
          <div class="text-right space-y-1">
            <p><strong>Customer:</strong> {{ clientData.name }}</p>
            <p>{{ clientData.address }}</p>
            <p>Phone: {{ clientData.phone }}</p>
            <p>Email: {{ clientData.email }}</p>
          </div>
        </div>

        <!-- Items Table -->
        <table class="w-full border text-sm mb-4">
          <thead class="bg-blue-200 text-blue-900">
            <tr>
              <th class="p-2 text-left">Description</th>
              <th class="p-2 text-right">Qty</th>
              <th class="p-2 text-right">Unit Price</th>
              <th class="p-2 text-right">Amount</th>
              <th class="p-2 text-center print:hidden">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="items.length === 0">
              <td colspan="5" class="p-2 text-center text-gray-500">No items added.</td>
            </tr>
            <tr v-for="(item, i) in items" :key="i" class="border-t">
              <td class="p-2">{{ item.name }}</td>
              <td class="p-2 text-right">{{ item.qty }}</td>
              <td class="p-2 text-right">{{ item.price.toFixed(2) }}</td>
              <td class="p-2 text-right">{{ (item.qty * item.price).toFixed(2) }}</td>
              <td class="p-2 text-center space-x-1 print:hidden">
                <button @click.stop="openEditItemDialog(i)" class="text-blue-700 hover:underline text-xs">Edit</button>
                <button @click.stop="deleteItem(i)" class="text-red-600 hover:underline text-xs">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Total -->
        <div class="text-right font-semibold text-lg text-blue-800 mb-6">
          Estimated Total: ZMW {{ total.toFixed(2) }}
        </div>

        <!-- Notes -->
        <div v-if="notes.trim()" class="border-t pt-4 mt-6 text-sm text-gray-700">
          <strong>Notes:</strong>
          <pre class="whitespace-pre-wrap">{{ notes }}</pre>
        </div>
      </div>

      <!-- Notes Input -->
      <div class="mb-6">
        <label class="block mb-1 text-sm font-medium text-blue-900">Additional Notes</label>
        <textarea
          v-model="notes"
          rows="4"
          class="w-full border rounded p-2 text-sm"
          placeholder="Enter any additional notes, payment terms, or remarks..."
        ></textarea>
      </div>

      <!-- Action buttons -->
      <div class="text-center mt-6 space-x-3 print:hidden">
        <button @click="openAddItemDialog" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Item</button>
        <button @click="openClientDialog" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Edit Client</button>
        <button @click="saveQuote" class="bg-[#103355] text-white px-6 py-2 rounded hover:bg-[#0e2a4d]">Save Quotation</button>
        <router-link to="/quotation/list" class="inline-block px-6 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">View Saved Quotes</router-link>
      </div>

      <!-- Modals -->
      <DialogForm
        :show="showDialog"
        :mode="dialogMode"
        :item="selectedItem"
        @close="showDialog = false"
        @save="handleSave"
      />
      <ClientForm
        :show="showClientDialog"
        mode="Edit"
        :clientData="clientData"
        @close="showClientDialog = false"
        @save="saveClientDetails"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DialogForm from '@/components/DialogForm.vue'
import ClientForm from '@/components/ClientForm.vue'
import bgImage from '@/images/back.jpg'

const showDialog = ref(false)
const dialogMode = ref('Add')
const selectedItem = ref(null)
const editIndex = ref(null)
const showClientDialog = ref(false)

const items = ref([])

const clientData = ref({
  name: 'AndyProff Innovations Ltd.',
  address: '123 Main Street, Lusaka',
  phone: '+260 977 654321',
  email: 'contact@andyproff.co.zm',
})

const quote = ref({
  number: '',
  date: '',
  expiry: '',
})

const notes = ref('')

onMounted(() => {
  const today = new Date()
  quote.value.date = today.toISOString().split('T')[0]
  quote.value.number = generateQuotationNumber(today)
  const expiry = new Date(today)
  expiry.setDate(today.getDate() + 30)
  quote.value.expiry = expiry.toISOString().split('T')[0]
})

function generateQuotationNumber(dateObj) {
  const y = dateObj.getFullYear()
  const m = String(dateObj.getMonth() + 1).padStart(2, '0')
  const d = String(dateObj.getDate()).padStart(2, '0')
  const datePart = `${y}${m}${d}`
  const saved = JSON.parse(localStorage.getItem('quotes') || '[]')

  // Count only today’s quotes
  const todaysQuotes = saved.filter(q => q.number.includes(`QT-${datePart}`))
  const counter = todaysQuotes.length + 1

  return `QT-${datePart}-${String(counter).padStart(3, '0')}`
}

const total = computed(() =>
  items.value.reduce((sum, item) => sum + item.qty * item.price, 0)
)

function openAddItemDialog() {
  dialogMode.value = 'Add'
  selectedItem.value = { description: '', quantity: 1, unitPrice: 0 }
  showDialog.value = true
}

function openEditItemDialog(index) {
  dialogMode.value = 'Edit'
  editIndex.value = index
  const item = items.value[index]
  selectedItem.value = {
    description: item.name,
    quantity: item.qty,
    unitPrice: item.price,
  }
  showDialog.value = true
}

function handleSave(data) {
  if (dialogMode.value === 'Add') {
    items.value.push({ name: data.description, qty: data.quantity, price: data.unitPrice })
  } else {
    items.value[editIndex.value] = { name: data.description, qty: data.quantity, price: data.unitPrice }
  }
  showDialog.value = false
}

function deleteItem(index) {
  if (confirm('Are you sure?')) {
    items.value.splice(index, 1)
  }
}

function openClientDialog() {
  showClientDialog.value = true
}

function saveClientDetails(data) {
  clientData.value = { ...data }
  showClientDialog.value = false
}

function saveQuote() {
  if (items.value.length === 0) {
    alert('Cannot save an empty quotation.')
    return
  }
  const saved = JSON.parse(localStorage.getItem('quotes') || '[]')
  saved.push({
    number: quote.value.number,
    date: quote.value.date,
    expiry: quote.value.expiry,
    client: clientData.value,
    items: JSON.parse(JSON.stringify(items.value)),
    notes: notes.value,
    total: total.value,
  })
  localStorage.setItem('quotes', JSON.stringify(saved))
  alert('Quotation saved!')

  // Reset for new quote immediately
  const today = new Date()
  quote.value.number = generateQuotationNumber(today)
  items.value = []
  notes.value = ''
}
</script>


<style scoped>
@media print {
  .print\:hidden, .print-hidden { display: none !important; }
  body { background: white; }
}
</style>
