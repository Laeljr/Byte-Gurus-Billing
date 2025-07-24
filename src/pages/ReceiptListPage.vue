<template>
  <div class="min-h-screen w-full p-8 bg-gray-50 flex justify-center">
    <div class="w-full max-w-5xl bg-white rounded shadow p-6">
      <h1 class="text-3xl font-bold text-[#103355] mb-6">Saved Receipts</h1>

      <table class="w-full border-collapse border border-gray-300 text-sm">
        <thead class="bg-gray-100 text-[#103355]">
          <tr>
            <th class="border border-gray-300 p-2 text-left">Receipt No.</th>
            <th class="border border-gray-300 p-2 text-left">Customer</th>
            <th class="border border-gray-300 p-2 text-left">Date</th>
            <th class="border border-gray-300 p-2 text-right">Total Paid (ZMW)</th>
            <th class="border border-gray-300 p-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(receipt, index) in receipts" :key="receipt.number || index" class="hover:bg-gray-50">
            <td class="border border-gray-300 p-2">{{ receipt.number }}</td>
            <td class="border border-gray-300 p-2">{{ receipt.customer.name }}</td>
            <td class="border border-gray-300 p-2">{{ receipt.date }}</td>
            <td class="border border-gray-300 p-2 text-right">{{ receipt.total.toFixed(2) }}</td>
            <td class="border border-gray-300 p-2 text-center space-x-1">
              <button @click="viewReceipt(index)" class="btn-view px-2 py-1 rounded">View</button>
              <button @click="downloadReceipt(index)" class="btn-download px-2 py-1 rounded">Download</button>
              <button @click="printReceipt(index)" class="btn-print px-2 py-1 rounded">Print</button>
              <button @click="deleteReceipt(index)" class="btn-delete px-2 py-1 rounded">Delete</button>
            </td>
          </tr>
          <tr v-if="receipts.length === 0">
            <td colspan="5" class="p-4 text-center text-gray-500 italic">No saved receipts found.</td>
          </tr>
        </tbody>
      </table>

      <!-- Modal for viewing receipt details -->
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded shadow-lg max-w-4xl w-full p-6 overflow-auto max-h-[80vh]">
          <button @click="closeModal" class="mb-4 text-right text-gray-500 hover:text-gray-700 font-bold text-xl">&times;</button>

          <h2 class="text-2xl font-bold text-[#103355] mb-4">Receipt Details - {{ selectedReceipt.number }}</h2>

          <p><strong>Date:</strong> {{ selectedReceipt.date }}</p>

          <div class="mt-4">
            <h3 class="font-semibold">Customer Information:</h3>
            <p>{{ selectedReceipt.customer.name }}</p>
            <p>{{ selectedReceipt.customer.address }}</p>
            <p>Phone: {{ selectedReceipt.customer.phone }}</p>
            <p>Email: {{ selectedReceipt.customer.email }}</p>
          </div>

          <table class="w-full border-collapse border border-gray-300 text-sm mt-6">
            <thead class="bg-gray-100 text-[#103355]">
              <tr>
                <th class="border border-gray-300 p-2 text-left">Item</th>
                <th class="border border-gray-300 p-2 text-right">Qty</th>
                <th class="border border-gray-300 p-2 text-right">Price</th>
                <th class="border border-gray-300 p-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in selectedReceipt.items" :key="i" class="border-t">
                <td class="border border-gray-300 p-2">{{ item.name }}</td>
                <td class="border border-gray-300 p-2 text-right">{{ item.qty }}</td>
                <td class="border border-gray-300 p-2 text-right">{{ item.price.toFixed(2) }}</td>
                <td class="border border-gray-300 p-2 text-right">{{ (item.qty * item.price).toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>

          <div class="text-right font-semibold text-lg text-[#103355] mt-4">
            Total Paid: ZMW {{ selectedReceipt.total.toFixed(2) }}
          </div>

          <div class="text-sm text-gray-700 mt-4 whitespace-pre-wrap">
            <p><strong>Payment Method:</strong> {{ selectedReceipt.paymentMethod }}</p>
            <p><strong>Amount Received By:</strong> {{ selectedReceipt.amountReceiver }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const receipts = ref([])
const showModal = ref(false)
const selectedReceipt = ref({})

onMounted(() => {
  const saved = JSON.parse(localStorage.getItem('receipts') || '[]')
  receipts.value = saved
})

function viewReceipt(index) {
  selectedReceipt.value = receipts.value[index]
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedReceipt.value = {}
}

function deleteReceipt(index) {
  if (confirm('Are you sure you want to delete this receipt?')) {
    receipts.value.splice(index, 1)
    localStorage.setItem('receipts', JSON.stringify(receipts.value))
  }
}

function downloadReceipt(index) {
  const receipt = receipts.value[index]
  const doc = new jsPDF()

  doc.setFontSize(16)
  doc.text('Byte Gurus Billing Ltd.', 14, 15)
  doc.setFontSize(10)
  doc.text('21 Lilongwe, Nkana East, Kitwe', 14, 21)
  doc.text('Phone: +260 969 291412 · Email: bytegurus98@gmail.com', 14, 26)

  doc.setFontSize(12)
  doc.text(`Receipt #: ${receipt.number}`, 14, 36)
  doc.text(`Date: ${receipt.date}`, 14, 42)
  doc.text(`Customer: ${receipt.customer.name}`, 14, 48)
  doc.text(`${receipt.customer.address}`, 14, 54)
  doc.text(`Phone: ${receipt.customer.phone}`, 14, 60)
  doc.text(`Email: ${receipt.customer.email}`, 14, 66)

  doc.autoTable({
    head: [['Item', 'Qty', 'Price', 'Total']],
    body: receipt.items.map(item => [
      item.name,
      item.qty,
      item.price.toFixed(2),
      (item.qty * item.price).toFixed(2)
    ]),
    startY: 75
  })

  const finalY = doc.lastAutoTable.finalY || 75

  doc.text(`Total Paid: ZMW ${receipt.total.toFixed(2)}`, 14, finalY + 10)
  doc.text(`Payment Method: ${receipt.paymentMethod}`, 14, finalY + 18)
  doc.text(`Received By: ${receipt.amountReceiver}`, 14, finalY + 26)

  doc.save(`${receipt.number}.pdf`)
}

function printReceipt(index) {
  const receipt = receipts.value[index]
  const win = window.open('', '', 'width=800,height=600')
  const html = `
    <html>
    <head>
      <title>Print Receipt</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background-color: #f0f0f0; }
        .text-right { text-align: right; }
      </style>
    </head>
    <body>
      <h1>Byte Gurus Billing Ltd.</h1>
      <p>21 Lilongwe, Nkana East, Kitwe</p>
      <p>Phone: +260 969 291412 · Email: bytegurus98@gmail.com</p>
      <h2>Receipt #: ${receipt.number}</h2>
      <p><strong>Date:</strong> ${receipt.date}</p>
      <h3>Customer:</h3>
      <p>${receipt.customer.name}</p>
      <p>${receipt.customer.address}</p>
      <p>Phone: ${receipt.customer.phone}</p>
      <p>Email: ${receipt.customer.email}</p>
      <table>
        <thead>
          <tr>
            <th>Item</th><th>Qty</th><th>Price</th><th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${receipt.items.map(i => `
            <tr>
              <td>${i.name}</td>
              <td class="text-right">${i.qty}</td>
              <td class="text-right">${i.price.toFixed(2)}</td>
              <td class="text-right">${(i.qty * i.price).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <p style="text-align:right; font-weight:bold; margin-top:20px;">
        Total Paid: ZMW ${receipt.total.toFixed(2)}
      </p>
      <p><strong>Payment Method:</strong> ${receipt.paymentMethod}</p>
      <p><strong>Amount Received By:</strong> ${receipt.amountReceiver}</p>
    </body>
    </html>
  `
  win.document.write(html)
  win.document.close()
  win.focus()
  win.print()
  win.close()
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
</style>
