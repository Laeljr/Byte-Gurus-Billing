<template>
  <div class="min-h-screen w-full p-8 bg-gray-50 flex justify-center">
    <div class="w-full max-w-5xl bg-white rounded shadow p-6">
      <h1 class="text-3xl font-bold text-[#103355] mb-6">Saved Quotes</h1>

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
          placeholder="Search by Quote No., Client, or Date..."
          class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#103355]"
        />
      </div>

      <table class="w-full border-collapse border border-gray-300 text-sm">
        <thead class="bg-gray-100 text-[#103355]">
          <tr>
            <th class="border border-gray-300 p-2 text-left">Quote No.</th>
            <th class="border border-gray-300 p-2 text-left">Client</th>
            <th class="border border-gray-300 p-2 text-left">Date</th>
            <th class="border border-gray-300 p-2 text-right">Total (ZMW)</th>
            <th class="border border-gray-300 p-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(quote, index) in filteredQuotes"
            :key="quote.number"
            class="hover:bg-gray-50"
          >
            <td class="border border-gray-300 p-2">{{ quote.number }}</td>
            <td class="border border-gray-300 p-2">{{ quote.client.name }}</td>
            <td class="border border-gray-300 p-2">{{ quote.date }}</td>
            <td class="border border-gray-300 p-2 text-right">{{ quote.total.toFixed(2) }}</td>
            <td class="border border-gray-300 p-2 text-center space-x-1">
              <button @click="viewQuote(index)" class="btn-view px-2 py-1 rounded">View</button>
              <button @click="downloadQuote(index)" class="btn-download px-2 py-1 rounded">Download</button>
              <button @click="printQuote(index)" class="btn-print px-2 py-1 rounded">Print</button>
              <button @click="deleteQuote(index)" class="btn-delete px-2 py-1 rounded">Delete</button>
            </td>
          </tr>
          <tr v-if="filteredQuotes.length === 0">
            <td colspan="5" class="p-4 text-center text-gray-500 italic">
              No quotes match your search.
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Modal for viewing quote details -->
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded shadow-lg max-w-4xl w-full p-6 overflow-auto max-h-[80vh]">
          <button
            @click="closeModal"
            class="mb-4 text-right text-gray-500 hover:text-gray-700 font-bold"
          >
            &times;
          </button>

          <h2 class="text-2xl font-bold text-[#103355] mb-4">
            Quote Details - {{ selectedQuote.number }}
          </h2>

          <p><strong>Date:</strong> {{ selectedQuote.date }}</p>
          <p><strong>Expiry:</strong> {{ selectedQuote.expiry }}</p>

          <div class="mt-4">
            <h3 class="font-semibold">Client Information:</h3>
            <p>{{ selectedQuote.client.name }}</p>
            <p>{{ selectedQuote.client.address }}</p>
            <p>Phone: {{ selectedQuote.client.phone }}</p>
            <p>Email: {{ selectedQuote.client.email }}</p>
          </div>

          <table class="w-full border-collapse border border-gray-300 text-sm mt-6">
            <thead class="bg-gray-100 text-[#103355]">
              <tr>
                <th class="border border-gray-300 p-2 text-left">Item</th>
                <th class="border border-gray-300 p-2 text-right">Qty</th>
                <th class="border border-gray-300 p-2 text-right">Price</th>
                <th class="border border-gray-300 p-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, i) in selectedQuote.items"
                :key="i"
                class="border-t"
              >
                <td class="border border-gray-300 p-2">{{ item.name }}</td>
                <td class="border border-gray-300 p-2 text-right">{{ item.qty }}</td>
                <td class="border border-gray-300 p-2 text-right">{{ item.price.toFixed(2) }}</td>
                <td class="border border-gray-300 p-2 text-right">{{ (item.qty * item.price).toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>

          <div class="text-right font-semibold text-lg text-[#103355] mt-4">
            Estimated Total: ZMW {{ selectedQuote.total.toFixed(2) }}
          </div>

          <div
            v-if="selectedQuote.notes.trim()"
            class="text-sm text-gray-700 mt-4 whitespace-pre-wrap"
          >
            <strong>Notes:</strong>
            <p>{{ selectedQuote.notes }}</p>
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

const quotes = ref([])
const showModal = ref(false)
const selectedQuote = ref(null)
const searchQuery = ref('')

// Load saved quotes on mount
onMounted(() => {
  const saved = JSON.parse(localStorage.getItem('quotes') || '[]')
  quotes.value = saved
})

// Computed filtered list
const filteredQuotes = computed(() => {
  if (!searchQuery.value) {
    return quotes.value
  }
  const query = searchQuery.value.toLowerCase()
  return quotes.value.filter(
    quote =>
      quote.number.toLowerCase().includes(query) ||
      quote.client.name.toLowerCase().includes(query) ||
      quote.date.toLowerCase().includes(query)
  )
})

function viewQuote(index) {
  selectedQuote.value = quotes.value[index]
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedQuote.value = null
}

function deleteQuote(index) {
  if (confirm('Are you sure you want to delete this quote?')) {
    quotes.value.splice(index, 1)
    localStorage.setItem('quotes', JSON.stringify(quotes.value))
  }
}

function downloadQuote(index) {
  const quote = quotes.value[index]
  const doc = new jsPDF()

  doc.setFontSize(16)
  doc.text('Byte Gurus Billing Ltd.', 14, 15)
  doc.setFontSize(10)
  doc.text('21 Lilongwe, Nkana East, Kitwe', 14, 21)
  doc.text('Phone: +260 969 291412 · Email: bytegurus98@gmail.com', 14, 26)

  doc.setFontSize(12)
  doc.text(`Quote #: ${quote.number}`, 14, 36)
  doc.text(`Date: ${quote.date}`, 14, 42)
  doc.text(`Expiry: ${quote.expiry}`, 14, 48)
  doc.text(`To: ${quote.client.name}`, 14, 54)
  doc.text(`${quote.client.address}`, 14, 60)
  doc.text(`Contact: ${quote.client.phone}`, 14, 66)
  doc.text(`Email: ${quote.client.email}`, 14, 72)

  doc.autoTable({
    head: [['Item', 'Qty', 'Price', 'Subtotal']],
    body: quote.items.map(i => [
      i.name,
      i.qty,
      i.price.toFixed(2),
      (i.qty * i.price).toFixed(2)
    ]),
    startY: 80
  })

  doc.text(
    `Estimated Total: ZMW ${quote.total.toFixed(2)}`,
    150,
    doc.autoTable.previous.finalY + 10
  )

  if (quote.notes.trim()) {
    doc.setFontSize(10)
    doc.text('Notes:', 14, doc.autoTable.previous.finalY + 20)
    doc.text(
      doc.splitTextToSize(quote.notes, 180),
      14,
      doc.autoTable.previous.finalY + 26
    )
  }
  
  doc.save(`${quote.number}.pdf`)
}

function printQuote(index) {
  const quote = quotes.value[index]
  const printWindow = window.open('', '_blank', 'width=800,height=600')
  

  const html = `
    <html>
      <head>
        <title>Print Quote ${quote.number}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #103355; }
          h1, h2, h3 { color: #103355; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; }
          th { background-color: #f0f0f0; }
          .total { text-align: right; font-weight: bold; margin-top: 10px; }
          .notes { margin-top: 20px; white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <h1>Byte Gurus Billing Ltd.</h1>
        <p>21 Lilongwe, Nkana East, Kitwe</p>
        <p>Phone: +260 969 291412 · Email: bytegurus98@gmail.com</p>

        <h2>Quotation</h2>
        <p><strong>Quote #:</strong> ${quote.number}</p>
        <p><strong>Date:</strong> ${quote.date}</p>
        <p><strong>Expiry:</strong> ${quote.expiry}</p>

        <h3>Client Information</h3>
        <p>${quote.client.name}</p>
        <p>${quote.client.address}</p>
        <p>Phone: ${quote.client.phone}</p>
        <p>Email: ${quote.client.email}</p>

        <table>
          <thead>
            <tr>
              <th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${quote.items
              .map(
                i => `
              <tr>
                <td>${i.name}</td>
                <td style="text-align: right;">${i.qty}</td>
                <td style="text-align: right;">${i.price.toFixed(2)}</td>
                <td style="text-align: right;">${(i.qty * i.price).toFixed(2)}</td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>

        <div class="total">Estimated Total: ZMW ${quote.total.toFixed(2)}</div>

        ${quote.notes.trim() ? `<div class="notes"><strong>Notes:</strong><p>${quote.notes}</p></div>` : ''}
    
        </body>
    </html>`
    

  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
  printWindow.close()
}


// Navigation handlers
function goBack() {
  router.push('/quotation')
}
function createNew() {
  router.push('/quotation')
}
</script>

<style scoped>
.btn-view {
  background-color: #3b82f6;
  color: white;
}
.btn-view:hover {
  background-color: #2563eb;
}
.btn-download {
  background-color: #10b981;
  color: white;
}
.btn-download:hover {
  background-color: #059669;
}
.btn-print {
  background-color: #4f46e5;
  color: white;
}
.btn-print:hover {
  background-color: #4338ca;
}
.btn-delete {
  background-color: transparent;
  border: none;
  color: #dc2626;
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
