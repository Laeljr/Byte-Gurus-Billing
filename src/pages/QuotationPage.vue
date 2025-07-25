<template>
  <!--  Main container with background image -->
  <div
    class="min-h-screen w-full bg-cover bg-center flex justify-center items-start p-8"
    :style="{ backgroundImage: `url(${bgImage})` }"
  >
    <!-- Main card container -->
    <div class="w-full max-w-5xl bg-white/90 backdrop-blur-sm rounded shadow-lg p-6">
      <!--  Printable area -->
      <div ref="printArea">
        <!--  Company Info -->
        <div class="text-center mb-6">
          <h1 class="text-2xl font-bold text-[#103355]">Byte Gurus Billing Ltd.</h1>
          <p class="text-gray-600 text-sm">
            21 Lilongwe, Nkana East, Kitwe · +260 969 291412 · bytegurus98@gmail.com
          </p>
        </div>

        <!--  Quote Header -->
        <div class="mb-6 text-center">
          <h2 class="text-3xl font-bold text-[#103355]">Quotation</h2>
          <p class="text-sm text-gray-600">Estimated cost for requested services</p>
        </div>

        <!--  Quote metadata & client -->
        <div class="flex justify-between text-sm mb-6">
          <div>
            <p><strong>Quote No:</strong> {{ quote.number }}</p>
            <p><strong>Date:</strong> {{ quote.date }}</p>
            <p><strong>Expiry:</strong> {{ quote.expiry }}</p>
          </div>
          <div class="text-right max-w-xs">
            <p><strong>To:</strong></p>
            <p>{{ clientData.name }}</p>
            <p>{{ clientData.address }}</p>
            <p>Contact: {{ clientData.phone }}</p>
            <p>Email: {{ clientData.email }}</p>
          </div>
        </div>

        <!-- ✅ Items Table -->
        <table class="w-full border text-sm mb-4">
          <thead class="bg-gray-100 text-[#103355]">
            <tr>
              <th class="p-2 text-left">Item</th>
              <th class="p-2 text-right">Qty</th>
              <th class="p-2 text-right">Price</th>
              <th class="p-2 text-right">Subtotal</th>
              <th class="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, i) in items"
              :key="i"
              class="border-t hover:bg-gray-50 cursor-pointer"
              @click="openEditItemDialog(i)"
            >
              <td class="p-2">{{ item.name }}</td>
              <td class="p-2 text-right">{{ item.qty }}</td>
              <td class="p-2 text-right">{{ item.price.toFixed(2) }}</td>
              <td class="p-2 text-right">{{ (item.qty * item.price).toFixed(2) }}</td>
              <td class="p-2 text-center">
                <button
                  @click.stop="deleteItem(i)"
                  class="text-red-600 hover:text-red-800"
                  aria-label="Delete item"
                >
                  &times;
                </button>
              </td>
            </tr>
            <tr v-if="items.length === 0">
              <td colspan="5" class="p-4 text-center text-gray-500 italic">
                No items added yet.
              </td>
            </tr>
          </tbody>
        </table>

        <!-- ✅ Total -->
        <div class="text-right font-semibold text-lg text-[#103355] mb-4">
          Estimated Total: ZMW {{ total.toFixed(2) }}
        </div>

        <!-- ✅ Notes display -->
        <div v-if="notes.trim()" class="text-sm text-gray-700 mt-4">
          <strong>Notes:</strong>
          <p>{{ notes }}</p>
        </div>
      </div>

      <!-- ✅ Notes input -->
      <div class="mb-6">
        <label class="block mb-1 text-sm font-medium text-[#103355]">Additional Notes</label>
        <textarea
          v-model="notes"
          rows="4"
          class="w-full border rounded p-2 text-sm"
          placeholder="Enter any additional notes, payment terms, or remarks..."
        ></textarea>
      </div>

      <!-- ✅ Action buttons -->
      <div class="flex flex-wrap justify-between items-center gap-2 mt-6">
        <div class="flex gap-2 items-center">
          <button
            @click="openAddItemDialog"
            class="bg-[#103355] text-white px-4 py-2 rounded hover:bg-[#0e2a4d]"
          >
            Add Item
          </button>
          <button
            @click="openClientDialog"
            class="bg-[#103355] text-white px-4 py-2 rounded hover:bg-[#0e2a4d]"
          >
            Edit Client 
          </button>
        </div>
        <div class="flex gap-2">
          <button
            @click="saveQuote"
            class="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
          >
            Save Quote
          </button>
          
         
        </div>
      </div>

      <!-- ✅ Modals -->
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
import jsPDF from 'jspdf'
import 'jspdf-autotable'

// ✅ Reactive states
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

// ✅ Empty item template
const emptyItem = { description: '', quantity: 1, unitPrice: 0 }

// ✅ Generate quote number/date on mount
onMounted(() => {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  quote.value.number = `QT-${yyyy}${mm}${dd}-${Math.floor(Math.random() * 1000)}`
  quote.value.date = today.toISOString().split('T')[0]
  const expiry = new Date(today)
  expiry.setDate(today.getDate() + 30)
  quote.value.expiry = expiry.toISOString().split('T')[0]
})

// ✅ Computed total
const total = computed(() =>
  items.value.reduce((sum, item) => sum + item.qty * item.price, 0)
)

// ✅ Item CRUD handlers
function openAddItemDialog() {
  dialogMode.value = 'Add'
  selectedItem.value = { ...emptyItem }
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
  } else if (dialogMode.value === 'Edit') {
    items.value[editIndex.value] = { name: data.description, qty: data.quantity, price: data.unitPrice }
  }
  showDialog.value = false
}

function deleteItem(index) {
  if (confirm('Are you sure you want to delete this item?')) {
    items.value.splice(index, 1)
  }
}

function clearQuote() {
  if (confirm('Clear entire quote?')) {
    items.value = []
    clientData.value = { name: '', address: '', phone: '', email: '' }
    notes.value = ''
  }
}

// ✅ Client dialog
function openClientDialog() {
  showClientDialog.value = true
}

function saveClientDetails(data) {
  clientData.value = { ...data }
  showClientDialog.value = false
}

// ✅ PDF generation
function generatePDF() {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text('Byte Gurus Billing Ltd.', 14, 15)
  doc.setFontSize(10)
  doc.text('21 Lilongwe, Nkana East, Kitwe', 14, 21)
  doc.text('Phone: +260 969 291412 · Email: bytegurus98@gmail.com', 14, 26)

  doc.setFontSize(12)
  doc.text(`Quote #: ${quote.value.number}`, 14, 36)
  doc.text(`Date: ${quote.value.date}`, 14, 42)
  doc.text(`Expiry: ${quote.value.expiry}`, 14, 48)
  doc.text(`To: ${clientData.value.name}`, 14, 54)
  doc.text(`${clientData.value.address}`, 14, 60)
  doc.text(`Contact: ${clientData.value.phone}`, 14, 66)
  doc.text(`Email: ${clientData.value.email}`, 14, 72)

  doc.autoTable({
    head: [['Item', 'Qty', 'Price', 'Subtotal']],
    body: items.value.map(i => [
      i.name,
      i.qty,
      i.price.toFixed(2),
      (i.qty * i.price).toFixed(2),
    ]),
    startY: 80,
  })

  doc.text(`Estimated Total: ZMW ${total.value.toFixed(2)}`, 150, doc.autoTable.previous.finalY + 10)

  if (notes.value.trim()) {
    doc.setFontSize(10)
    doc.text('Notes:', 14, doc.autoTable.previous.finalY + 20)
    doc.text(doc.splitTextToSize(notes.value, 180), 14, doc.autoTable.previous.finalY + 26)
  }

  doc.save(`${quote.value.number}.pdf`)
}

// ✅ Save to localStorage
function saveQuote() {
  const saved = JSON.parse(localStorage.getItem('quotes') || '[]')
  saved.push({
    number: quote.value.number,
    date: quote.value.date,
    expiry: quote.value.expiry,
    client: clientData.value,
    items: items.value,
    notes: notes.value,
    total: total.value,
  })
  localStorage.setItem('quotes', JSON.stringify(saved))
  alert('Quote saved!')
}

const printArea = ref(null)
function printQuote() {
  const w = window.open('', '_blank', 'width=800,height=600')
  w.document.write(`<html><head><title>Print</title><style>
    body{font-family:Arial;padding:20px;}table{width:100%;border-collapse:collapse;}
    th,td{border:1px solid #ddd;padding:8px;}th{background:#f0f0f0;color:#103355;}
  </style></head><body>${printArea.value.innerHTML}</body></html>`)
  w.document.close()
  w.print()
  w.close()
}
</script>

<style scoped>
th, td { border: 1px solid #ddd; }
@media print { button { display: none; } body { background: white; } }
</style>
