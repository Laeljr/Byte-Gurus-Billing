<template>
  <div class="min-h-screen w-full p-8 bg-gray-50 flex justify-center">
    <div class="w-full max-w-5xl bg-white rounded shadow p-6">
      <h1 class="text-3xl font-bold text-[#103355] mb-6">Saved Invoices</h1>

      <!-- Return & Create New Buttons -->
      <div class="mb-6 flex justify-between">
        <button @click="goBack" class="btn-return px-4 py-2 rounded">
          ← Return
        </button>
        <button @click="createNew" class="btn-create px-4 py-2 rounded">
          + Create New
        </button>
      </div>

      <!-- Search Bar -->
      <div class="mb-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by Invoice No., Client, or Date..."
          class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#103355]"
        />
      </div>

      <table class="w-full border-collapse border border-gray-300 text-sm">
        <thead class="bg-gray-100 text-[#103355]">
          <tr>
            <th class="border border-gray-300 p-2 text-left">Invoice No.</th>
            <th class="border border-gray-300 p-2 text-left">Client</th>
            <th class="border border-gray-300 p-2 text-left">Date</th>
            <th class="border border-gray-300 p-2 text-right">Total (ZMW)</th>
            <th class="border border-gray-300 p-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(invoice, index) in filteredInvoices"
            :key="invoice.number"
            class="hover:bg-gray-50"
          >
            <td class="border border-gray-300 p-2">{{ invoice.number }}</td>
            <td class="border border-gray-300 p-2">{{ invoice.customerName }}</td>
            <td class="border border-gray-300 p-2">{{ invoice.date }}</td>
            <td class="border border-gray-300 p-2 text-right">
              {{ invoice.total.toFixed(2) }}
            </td>
            <td class="border border-gray-300 p-2 text-center space-x-1">
              <button @click="viewInvoice(index)" class="btn-view px-2 py-1 rounded">View</button>
              <button @click="downloadInvoice(index)" class="btn-download px-2 py-1 rounded">Download</button>
              <button @click="printInvoice(index)" class="btn-print px-2 py-1 rounded">Print</button>
              <button @click="deleteInvoice(index)" class="btn-delete px-2 py-1 rounded">Delete</button>
            </td>
          </tr>
          <tr v-if="filteredInvoices.length === 0">
            <td colspan="5" class="p-4 text-center text-gray-500 italic">
              No invoices match your search.
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Modal for viewing invoice details -->
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div
          class="bg-white rounded shadow-lg max-w-4xl w-full p-6 overflow-auto max-h-[80vh]"
        >
          <button
            @click="closeModal"
            class="mb-4 text-right text-gray-500 hover:text-gray-700 font-bold text-xl"
          >
            &times;
          </button>

          <h2 class="text-2xl font-bold text-[#103355] mb-4">
            Invoice Details - {{ selectedInvoice.number }}
          </h2>

          <p><strong>Date:</strong> {{ selectedInvoice.date }}</p>
          <p><strong>Due Date:</strong> {{ selectedInvoice.dueDate }}</p>

          <div class="mt-4">
            <h3 class="font-semibold">Client Information:</h3>
            <p>{{ selectedInvoice.customerName }}</p>
            <p>{{ selectedInvoice.customerAddress }}</p>
            <p>Phone: {{ selectedInvoice.customerPhone }}</p>
            <p>Email: {{ selectedInvoice.customerEmail }}</p>
          </div>

          <table
            class="w-full border-collapse border border-gray-300 text-sm mt-6"
          >
            <thead class="bg-gray-100 text-[#103355]">
              <tr>
                <th class="border border-gray-300 p-2 text-left">Item</th>
                <th class="border border-gray-300 p-2 text-right">Qty</th>
                <th class="border border-gray-300 p-2 text-right">Unit Price</th>
                <th class="border border-gray-300 p-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, i) in selectedInvoice.items"
                :key="i"
                class="border-t"
              >
                <td class="border border-gray-300 p-2">{{ item.description }}</td>
                <td class="border border-gray-300 p-2 text-right">{{ item.quantity }}</td>
                <td class="border border-gray-300 p-2 text-right">{{ item.unitPrice.toFixed(2) }}</td>
                <td class="border border-gray-300 p-2 text-right">{{ (item.quantity * item.unitPrice).toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>

          <div class="text-right font-semibold text-lg text-[#103355] mt-4">
            Total: ZMW {{ selectedInvoice.total.toFixed(2) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const router = useRouter()

const invoices = ref([])
const showModal = ref(false)
const selectedInvoice = ref({})
const searchQuery = ref('')

onMounted(() => {
  const saved = JSON.parse(localStorage.getItem('invoices') || '[]')
  invoices.value = saved
})

// Computed filtered list
const filteredInvoices = computed(() => {
  if (!searchQuery.value) {
    return invoices.value
  }
  const query = searchQuery.value.toLowerCase()
  return invoices.value.filter(
    inv =>
      inv.number.toLowerCase().includes(query) ||
      inv.customerName.toLowerCase().includes(query) ||
      inv.date.toLowerCase().includes(query)
  )
})

function viewInvoice(index) {
  selectedInvoice.value = invoices.value[index]
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedInvoice.value = {}
}

function deleteInvoice(index) {
  if (confirm('Are you sure you want to delete this invoice?')) {
    invoices.value.splice(index, 1)
    localStorage.setItem('invoices', JSON.stringify(invoices.value))
  }
}

function downloadInvoice(index) {
  const invoice = invoices.value[index]
  const doc = new jsPDF()

  doc.setFontSize(16)
  doc.text('Byte Gurus Billing Ltd.', 14, 15)
  doc.setFontSize(10)
  doc.text('21 Lilongwe, Nkana East, Kitwe', 14, 21)
  doc.text('Phone: +260 969 291412 · Email: bytegurus98@gmail.com', 14, 26)

  doc.setFontSize(12)
  doc.text(`Invoice #: ${invoice.number}`, 14, 36)
  doc.text(`Date: ${invoice.date}`, 14, 42)
  doc.text(`Due Date: ${invoice.dueDate}`, 14, 48)
  doc.text(`To: ${invoice.customerName}`, 14, 54)
  doc.text(`${invoice.customerAddress}`, 14, 60)
  doc.text(`Phone: ${invoice.customerPhone}`, 14, 66)
  doc.text(`Email: ${invoice.customerEmail}`, 14, 72)

  doc.autoTable({
    head: [['Description', 'Qty', 'Unit Price', 'Amount']],
    body: invoice.items.map(item => [
      item.description,
      item.quantity,
      item.unitPrice.toFixed(2),
      (item.quantity * item.unitPrice).toFixed(2)
    ]),
    startY: 80
  })

  doc.text(
    `Total: ZMW ${invoice.total.toFixed(2)}`,
    150,
    doc.autoTable.previous.finalY + 10
  )
  doc.save(`${invoice.number}.pdf`)
}

function printInvoice(index) {
  const invoice = invoices.value[index]
  const win = window.open('', '', 'width=800,height=600')
  const html = `
    <html>
    <head>
      <title>Print Invoice</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background-color: #f0f0f0; }
      </style>
    </head>
    <body>
      <h1>Byte Gurus Billing Ltd.</h1>
      <p>21 Lilongwe, Nkana East, Kitwe</p>
      <p>Phone: +260 969 291412 · Email: bytegurus98@gmail.com</p>
      <h2>Invoice #: ${invoice.number}</h2>
      <p><strong>Date:</strong> ${invoice.date}</p>
      <p><strong>Due Date:</strong> ${invoice.dueDate}</p>
      <h3>Client:</h3>
      <p>${invoice.customerName}</p>
      <p>${invoice.customerAddress}</p>
      <p>Phone: ${invoice.customerPhone}</p>
      <p>Email: ${invoice.customerEmail}</p>
      <table>
        <thead>
          <tr>
            <th>Description</th><th>Qty</th><th>Unit Price</th><th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items
            .map(
              i => `
            <tr>
              <td>${i.description}</td>
              <td>${i.quantity}</td>
              <td>${i.unitPrice.toFixed(2)}</td>
              <td>${(i.quantity * i.unitPrice).toFixed(2)}</td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>
      <p style="text-align:right; font-weight:bold; margin-top:20px;">
        Total: ZMW ${invoice.total.toFixed(2)}
      </p>
    </body>
    </html>
  `
  win.document.write(html)
  win.document.close()
  win.focus()
  win.print()
  win.close()
}

// Navigation handlers
function goBack() {
  router.push('/invoice')
}
function createNew() {
  router.push('/invoice')
}
</script>

<style scoped>
.btn-view {
  background: #3b82f6;
  color: #fff;
}
.btn-view:hover {
  background: #2563eb;
}
.btn-download {
  background: #10b981;
  color: #fff;
}
.btn-download:hover {
  background: #059669;
}
.btn-print {
  background: #6366f1;
  color: #fff;
}
.btn-print:hover {
  background: #4f46e5;
}
.btn-delete {
  color: #dc2626;
  background: transparent;
}
.btn-delete:hover {
  color: #b91c1c;
}
.btn-return {
  background: #64748b;
  color: #fff;
}
.btn-return:hover {
  background: #475569;
}
.btn-create {
  background: #22c55e;
  color: #fff;
}
.btn-create:hover {
  background: #16a34a;
}
</style>
