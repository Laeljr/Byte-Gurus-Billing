<template>
  <div class="min-h-screen w-full p-8 bg-gray-50 flex justify-center">
    <div class="w-full max-w-5xl bg-white rounded shadow p-6 flex flex-col">
      <h1 class="text-3xl font-bold text-[#103355] mb-6 select-none">Saved Invoices</h1>

      <!-- Return & Create New Buttons -->
      <div class="mb-6 flex justify-between">
        <button @click="goBack" class="btn-return px-4 py-2 rounded transition-colors duration-200">
          ← Return
        </button>
        <button @click="createNew" class="btn-create px-4 py-2 rounded transition-colors duration-200">
          + Create New
        </button>
      </div>

      <!-- Search Bar -->
      <div class="mb-4">
        <input
          v-model="searchQuery"
          type="search"
          aria-label="Search invoices"
          placeholder="Search by Invoice No., Client, or Date..."
          class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#103355]"
        />
      </div>

      <!-- Table of Invoices -->
      <table class="w-full border-collapse border border-gray-300 text-sm" role="grid" aria-label="Saved Invoices Table">
        <thead class="bg-gray-100 text-[#103355]">
          <tr>
            <th class="border border-gray-300 p-2 text-left" scope="col">Invoice No.</th>
            <th class="border border-gray-300 p-2 text-left" scope="col">Client</th>
            <th class="border border-gray-300 p-2 text-left" scope="col">Date</th>
            <th class="border border-gray-300 p-2 text-right" scope="col">Total (ZMW)</th>
            <th class="border border-gray-300 p-2 text-center" scope="col">Actions</th>
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
            <td class="border border-gray-300 p-2 text-right">{{ invoice.total.toFixed(2) }}</td>
            <td class="border border-gray-300 p-2 text-center space-x-1">
              <button @click="viewInvoice(index)" class="btn-view px-2 py-1 rounded">View</button>
              <button @click="downloadInvoice(index)" class="btn-download px-2 py-1 rounded">Download</button>
              <button @click="printInvoice(index)" class="btn-print px-2 py-1 rounded">Print</button>
              <button @click="deleteInvoice(index)" class="btn-delete px-2 py-1 rounded">Delete</button>
            </td>
          </tr>
          <tr v-if="filteredInvoices.length === 0">
            <td colspan="5" class="p-4 text-center text-gray-500 italic">No invoices match your search.</td>
          </tr>
        </tbody>
      </table>

      <!-- Invoice Preview Modal -->
      <transition name="fade">
        <div
          v-if="showModal"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="invoice-modal-title"
        >
          <div
            class="bg-white rounded shadow-lg max-w-4xl w-full p-8 overflow-auto max-h-[80vh]"
            style="min-width: 600px;"
          >
            <!-- Header with Close button on right top -->
            <header class="border-b-2 border-[#103355] pb-3 mb-6 flex justify-between items-start">
              <h2 id="invoice-modal-title" class="text-3xl font-bold text-[#103355]">
                Invoice #{{ selectedInvoice.number }}
              </h2>
              <button
                @click="closeModal"
                aria-label="Close invoice preview"
                class="text-gray-500 hover:text-gray-700 font-bold text-3xl leading-none"
              >
                &times;
              </button>
            </header>

            <!-- Bill To -->
            <section class="mb-6">
              <h3 class="text-xl font-semibold text-[#103355] mb-2">Bill To:</h3>
              <p class="text-gray-800 font-medium">{{ selectedInvoice.customerName }}</p>
              <p class="text-gray-700">{{ selectedInvoice.customerAddress }}</p>
              <p class="text-gray-700">Phone: {{ selectedInvoice.customerPhone }}</p>
              <p class="text-gray-700">Email: {{ selectedInvoice.customerEmail }}</p>
            </section>

            <!-- Items Table -->
            <table class="w-full border-collapse border border-gray-300 text-sm" aria-label="Invoice Items Table">
              <thead class="bg-gray-100 text-[#103355]">
                <tr>
                  <th class="border border-gray-300 p-3 text-left">Description</th>
                  <th class="border border-gray-300 p-3 text-right">Quantity</th>
                  <th class="border border-gray-300 p-3 text-right">Unit Price (ZMW)</th>
                  <th class="border border-gray-300 p-3 text-right">Subtotal (ZMW)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, i) in selectedInvoice.items" :key="i">
                  <td class="border border-gray-300 p-3">{{ item.description }}</td>
                  <td class="border border-gray-300 p-3 text-right">{{ item.quantity }}</td>
                  <td class="border border-gray-300 p-3 text-right">{{ item.unitPrice.toFixed(2) }}</td>
                  <td class="border border-gray-300 p-3 text-right">{{ (item.quantity * item.unitPrice).toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>

            <!-- Total -->
            <div class="text-right mt-6 font-semibold text-2xl text-[#103355]">
              Total: ZMW {{ selectedInvoice.total.toFixed(2) }}
            </div>

            <!-- Footer -->
            <footer class="mt-10 text-center text-gray-500 text-sm select-none">
              Thank you for your business — Byte Gurus Billing Ltd.
            </footer>
          </div>
        </div>
      </transition>
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

const filteredInvoices = computed(() => {
  if (!searchQuery.value) return invoices.value
  const query = searchQuery.value.toLowerCase()
  return invoices.value.filter(inv =>
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
  const doc = new jsPDF('p', 'pt', 'a4')
  const margin = 40
  let y = margin

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor('#103355')
  doc.text('Byte Gurus Billing Ltd.', margin, y)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  y += 20
  doc.setTextColor('#000000')
  doc.text('21 Lilongwe, Nkana East, Kitwe', margin, y)
  y += 15
  doc.text('Phone: +260 969 291412 · Email: bytegurus98@gmail.com', margin, y)

  y += 30
  doc.setFontSize(12)
  doc.setTextColor('#103355')
  doc.text(`Invoice #: ${invoice.number}`, margin, y)
  y += 15
  doc.text(`Date: ${invoice.date}`, margin, y)
  y += 15
  doc.text(`Due Date: ${invoice.dueDate}`, margin, y)

  y += 25
  doc.setTextColor('#000000')
  doc.setFont('helvetica', 'bold')
  doc.text('Bill To:', margin, y)
  y += 15
  doc.setFont('helvetica', 'normal')
  doc.text(invoice.customerName, margin, y)
  y += 15
  doc.text(invoice.customerAddress, margin, y)
  y += 15
  doc.text(`Phone: ${invoice.customerPhone}`, margin, y)
  y += 15
  doc.text(`Email: ${invoice.customerEmail}`, margin, y)

  y += 30
  doc.autoTable({
    head: [['Description', 'Qty', 'Unit Price', 'Amount']],
    body: invoice.items.map(item => [
      item.description,
      item.quantity,
      item.unitPrice.toFixed(2),
      (item.quantity * item.unitPrice).toFixed(2)
    ]),
    startY: y,
    theme: 'grid',
    headStyles: {
      fillColor: [16, 51, 85],
      textColor: 255,
      halign: 'center',
    },
    styles: {
      fontSize: 10,
      halign: 'right',
      cellPadding: 6,
    },
    columnStyles: {
      0: { halign: 'left' },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
    }
  })

  const finalY = doc.lastAutoTable.finalY
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor('#103355')
  doc.text(`Total: ZMW ${invoice.total.toFixed(2)}`, doc.internal.pageSize.getWidth() - margin, finalY + 30, { align: 'right' })

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor('#999999')
  doc.text('Thank you for your business — Byte Gurus Billing Ltd.', doc.internal.pageSize.getWidth() / 2, finalY + 60, { align: 'center' })

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
        body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #333; }
        header { border-bottom: 2px solid #103355; margin-bottom: 20px; }
        h1 { color: #103355; margin: 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: right; }
        th { background-color: #103355; color: #fff; }
        td:first-child, th:first-child { text-align: left; }
        .total { margin-top: 20px; font-weight: bold; text-align: right; }
        footer { margin-top: 40px; font-size: 12px; text-align: center; color: #999; }
      </style>
    </head>
    <body>
      <header>
        <h1>Byte Gurus Billing Ltd.</h1>
        <p>21 Lilongwe, Nkana East, Kitwe<br/>Phone: +260 969 291412 · Email: bytegurus98@gmail.com</p>
      </header>
      <section>
        <p><strong>Invoice #:</strong> ${invoice.number}</p>
        <p><strong>Date:</strong> ${invoice.date}</p>
        <p><strong>Due Date:</strong> ${invoice.dueDate}</p>
        <p><strong>Bill To:</strong><br/>
          ${invoice.customerName}<br/>
          ${invoice.customerAddress}<br/>
          Phone: ${invoice.customerPhone}<br/>
          Email: ${invoice.customerEmail}
        </p>
      </section>
      <table>
        <thead>
          <tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr>
        </thead>
        <tbody>
          ${invoice.items.map(i => `
            <tr>
              <td>${i.description}</td>
              <td>${i.quantity}</td>
              <td>${i.unitPrice.toFixed(2)}</td>
              <td>${(i.quantity * i.unitPrice).toFixed(2)}</td>
            </tr>`).join('')}
        </tbody>
      </table>
      <p class="total">Total: ZMW ${invoice.total.toFixed(2)}</p>
      <footer>Thank you for your business — Byte Gurus Billing Ltd.</footer>
    </body>
    </html>
  `
  win.document.write(html)
  win.document.close()
  win.focus()
  win.print()
  win.close()
}

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
  transition: background-color 0.2s ease;
}
.btn-view:hover {
  background: #2563eb;
}
.btn-download {
  background: #10b981;
  color: #fff;
  transition: background-color 0.2s ease;
}
.btn-download:hover {
  background: #059669;
}
.btn-print {
  background: #6366f1;
  color: #fff;
  transition: background-color 0.2s ease;
}
.btn-print:hover {
  background: #4f46e5;
}
.btn-delete {
  color: #dc2626;
  background: transparent;
  transition: color 0.2s ease;
}
.btn-delete:hover {
  color: #b91c1c;
}
.btn-return {
  background: #64748b;
  color: #fff;
  transition: background-color 0.2s ease;
}
.btn-return:hover {
  background: #475569;
}
.btn-create {
  background: #22c55e;
  color: #fff;
  transition: background-color 0.2s ease;
}
.btn-create:hover {
  background: #16a34a;
}

/* Modal fade transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
