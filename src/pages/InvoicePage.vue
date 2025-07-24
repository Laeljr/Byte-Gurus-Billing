<template>
  <div
    class="min-h-screen w-full bg-cover bg-center flex justify-center items-start p-6"
    :style="{ backgroundImage: `url(${bgImage})` }"
  >
    <div class="max-w-5xl w-full bg-white/90 rounded shadow p-6">
      <!-- Printable Area -->
      <div ref="printArea">
        <!-- Company Info -->
        <div class="text-center mb-6">
          <h1 class="text-2xl font-bold text-[#103355]">Byte Gurus Billing Ltd.</h1>
          <p class="text-sm text-gray-600">
            21 Lilongwe, Nkana East, Kitwe · +260969291412 · bytegurus98@gmail.com
          </p>
        </div>

        <!-- Invoice Header -->
        <div class="mb-6 text-center">
          <h2 class="text-3xl font-bold text-[#103355]">Invoice</h2>
          <p class="text-sm text-gray-600">
            Thank you for your business. Please find below the details of your invoice.
          </p>
        </div>

        <!-- Invoice Metadata and Client Details -->
        <div class="flex justify-between mb-6 text-sm">
          <div>
            <p><strong>Invoice No:</strong> {{ invoice.number }}</p>
            <p><strong>Invoice Date:</strong> {{ invoice.date }}</p>
            <p><strong>Due Date:</strong> {{ invoice.dueDate }}</p>
          </div>
          <div class="text-right max-w-xs">
            <p><strong>Billed To:</strong></p>
            <p>{{ invoice.customerName }}</p>
            <p>{{ invoice.customerAddress }}</p>
            <p>{{ invoice.customerPhone }}</p>
            <p>{{ invoice.customerEmail }}</p>
          </div>
        </div>

        <!-- Items Table -->
        <table class="w-full border text-sm mb-4">
          <thead class="bg-gray-100 text-[#103355]">
            <tr>
              <th class="p-2 text-left">Description</th>
              <th class="p-2 text-right">Qty</th>
              <th class="p-2 text-right">Unit Price</th>
              <th class="p-2 text-right">Amount</th>
              <th class="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, i) in items"
              :key="i"
              class="border-t hover:bg-gray-50 cursor-pointer"
              @click="openEditDialog(i)"
            >
              <td class="p-2">{{ item.description }}</td>
              <td class="p-2 text-right">{{ item.quantity }}</td>
              <td class="p-2 text-right">{{ item.unitPrice.toFixed(2) }}</td>
              <td class="p-2 text-right">{{ (item.quantity * item.unitPrice).toFixed(2) }}</td>
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
              <td colspan="5" class="text-center p-4 text-gray-500">
                No items added.
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Total -->
        <div class="text-right text-lg font-semibold text-[#103355] mb-6">
          Total: ZMW {{ total.toFixed(2) }}
        </div>

        <!-- Payment Details -->
        <div class="border-t pt-4 mt-4 text-sm text-[#103355] flex justify-between">
          <div class="max-w-xs">
            <h3 class="font-semibold mb-2">Bank Details</h3>
            <p><strong>Bank:</strong> Standard Chartered Bank Zambia</p>
            <p><strong>Account:</strong> 0104309451400</p>
            <p><strong>Branch:</strong> Lusaka Main Branch</p>
          </div>
          <div class="max-w-xs text-right">
            <h3 class="font-semibold mb-2">Mobile Money</h3>
            <p><strong>Lael Mulenga:</strong> +260 969 291412</p>
            <p><strong>Lael Mulenga:</strong> +260 777 873514</p>
          </div>
        </div>
      </div>

      <!-- ACTION BUTTONS -->
      <div class="flex flex-wrap justify-between items-center mb-4 gap-2 mt-6">
        <div class="flex gap-2">
          <button @click="openAddDialog" class="bg-[#103355] text-white px-4 py-2 rounded hover:bg-[#0e2a4d]">
            Add Item
          </button>
          <button @click="openClientDialog" class="bg-[#103355] text-white px-4 py-2 rounded hover:bg-[#0e2a4d]">
            Edit Client
          </button>
        </div>
        <div class="flex gap-2">
          <button @click="saveInvoice" class="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">
            Save Invoice
          </button>
          <button @click="saveAndDownload" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Download PDF
          </button>
          <button @click="printInvoice" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            Print Invoice
          </button>
          <button @click="clearInvoice" class="bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200 text-sm">
            Clear Invoice
          </button>
        </div>
      </div>

      <!-- MODALS -->
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
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import bgImage from '@/images/back.jpg'

const showDialog = ref(false)
const dialogMode = ref('Add')
const selectedItem = ref(null)
const editIndex = ref(null)
const items = ref([])

const showClientDialog = ref(false)
const clientData = ref({ name: '', address: '', phone: '', email: '' })

const invoice = ref({
  number: '',
  date: '',
  dueDate: '',
  customerName: 'Andrew Mwale',
  customerAddress: '123 Main Street, Lusaka',
  customerPhone: '+260 977 000000',
  customerEmail: 'andrewmwale@example.com',
})

const printArea = ref(null)

// Generate invoice number with counter
function generateInvoiceNumber() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const savedInvoices = JSON.parse(localStorage.getItem('invoices') || '[]')
  const counter = savedInvoices.length + 1
  return `INV-${y}${m}${d}-${String(counter).padStart(3, '0')}`
}

onMounted(() => {
  const today = new Date()
  invoice.value.number = generateInvoiceNumber()
  invoice.value.date = today.toISOString().split('T')[0]
  const due = new Date(today)
  due.setDate(today.getDate() + 30)
  invoice.value.dueDate = due.toISOString().split('T')[0]
})

const total = computed(() =>
  items.value.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
)

function openAddDialog() {
  dialogMode.value = 'Add'
  selectedItem.value = { description: '', quantity: 1, unitPrice: 0 }
  showDialog.value = true
}

function openEditDialog(index) {
  dialogMode.value = 'Edit'
  selectedItem.value = { ...items.value[index] }
  editIndex.value = index
  showDialog.value = true
}

function handleSave(data) {
  if (dialogMode.value === 'Add') {
    items.value.push(data)
  } else if (dialogMode.value === 'Edit') {
    items.value[editIndex.value] = data
  }
  showDialog.value = false
}

function deleteItem(index) {
  if (confirm('Are you sure you want to delete this item?')) {
    items.value.splice(index, 1)
  }
}

function clearInvoice() {
  if (confirm('Are you sure you want to clear the invoice?')) {
    items.value = []
    invoice.value.customerName = ''
    invoice.value.customerAddress = ''
    invoice.value.customerPhone = ''
    invoice.value.customerEmail = ''
  }
}

function saveInvoice() {
  const savedInvoices = JSON.parse(localStorage.getItem('invoices') || '[]')
  savedInvoices.push({
    number: invoice.value.number,
    date: invoice.value.date,
    dueDate: invoice.value.dueDate,
    customerName: invoice.value.customerName,
    customerAddress: invoice.value.customerAddress,
    customerPhone: invoice.value.customerPhone,
    customerEmail: invoice.value.customerEmail,
    items: items.value,
    total: total.value,
  })
  localStorage.setItem('invoices', JSON.stringify(savedInvoices))
  alert('Invoice saved!')
}

function saveAndDownload() {
  saveInvoice()
  generatePDF()
}

function generatePDF() {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text('Byte Gurus Billing Ltd.', 14, 15)
  doc.setFontSize(10)
  doc.text('21 Lilongwe, Nkana East, Kitwe', 14, 21)
  doc.text('Phone: +260 969 291412 · Email: bytegurus98@gmail.com', 14, 26)
  doc.setFontSize(12)
  doc.text(`Invoice #: ${invoice.value.number}`, 14, 36)
  doc.text(`Invoice Date: ${invoice.value.date}`, 14, 42)
  doc.text(`Due Date: ${invoice.value.dueDate}`, 14, 48)
  doc.text(`Billed To: ${invoice.value.customerName}`, 14, 54)
  doc.text(`${invoice.value.customerAddress}`, 14, 60)
  doc.text(`${invoice.value.customerPhone}`, 14, 66)
  doc.text(`${invoice.value.customerEmail}`, 14, 72)

  doc.autoTable({
    head: [['Description', 'Qty', 'Unit Price', 'Amount']],
    body: items.value.map((item) => [
      item.description,
      item.quantity,
      item.unitPrice.toFixed(2),
      (item.quantity * item.unitPrice).toFixed(2),
    ]),
    startY: 80,
  })

  doc.text(`Total: ZMW ${total.value.toFixed(2)}`, 150, doc.autoTable.previous.finalY + 10)
  doc.save(`${invoice.value.number}.pdf`)
}

function openClientDialog() {
  clientData.value = {
    name: invoice.value.customerName,
    address: invoice.value.customerAddress,
    phone: invoice.value.customerPhone,
    email: invoice.value.customerEmail,
  }
  showClientDialog.value = true
}

function saveClientDetails(data) {
  invoice.value.customerName = data.name
  invoice.value.customerAddress = data.address
  invoice.value.customerPhone = data.phone
  invoice.value.customerEmail = data.email
  showClientDialog.value = false
}

function printInvoice() {
  if (!printArea.value) return
  const printWindow = window.open('', '', 'width=800,height=600')
  printWindow.document.write(`
    <html>
      <head>
        <title>Print Invoice</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; }
          th { background-color: #f3f3f3; color: #103355; }
        </style>
      </head>
      <body>${printArea.value.innerHTML}</body>
    </html>
  `)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
  printWindow.close()
}
</script>

<style scoped>
@media print {
  body {
    background: white !important;
  }
  div[class*='bg-cover'] {
    background: white !important;
  }
}
</style>
