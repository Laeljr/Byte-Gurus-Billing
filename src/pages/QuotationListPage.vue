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
            :key="quote.number || index"
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
            class="mb-4 text-right text-gray-500 hover:text-gray-700 font-bold text-xl"
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
            v-if="selectedQuote.notes && selectedQuote.notes.trim() !== ''"
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

onMounted(() => {
  const saved = JSON.parse(localStorage.getItem('quotes') || '[]')
  quotes.value = saved
})

const filteredQuotes = computed(() => {
  if (!searchQuery.value) {
    return quotes.value
  }
  const q = searchQuery.value.toLowerCase()
  return quotes.value.filter(
    quote =>
      (quote.number && quote.number.toLowerCase().includes(q)) ||
      (quote.client?.name && quote.client.name.toLowerCase().includes(q)) ||
      (quote.date && quote.date.toLowerCase().includes(q))
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
  doc.text(`Quote #: ${quote.number}`, margin, y)
  y += 15
  doc.text(`Date: ${quote.date}`, margin, y)
  y += 15
  doc.text(`Expiry: ${quote.expiry}`, margin, y)

  y += 25
  doc.setTextColor('#000000')
  doc.setFont('helvetica', 'bold')
  doc.text('Bill To:', margin, y)
  y += 15
  doc.setFont('helvetica', 'normal')
  doc.text(quote.client.name, margin, y)
  y += 15
  doc.text(quote.client.address, margin, y)
  y += 15
  doc.text(`Phone: ${quote.client.phone}`, margin, y)
  y += 15
  doc.text(`Email: ${quote.client.email}`, margin, y)

  y += 30
  doc.autoTable({
    head: [['Description', 'Qty', 'Price', 'Amount']],
    body: quote.items.map(item => [
      item.name,
      item.qty,
      item.price.toFixed(2),
      (item.qty * item.price).toFixed(2)
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

  const finalY = doc.lastAutoTable.finalY || y + 50
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor('#103355')
  doc.text(
    `Estimated Total: ZMW ${quote.total.toFixed(2)}`,
    doc.internal.pageSize.getWidth() - margin,
    finalY + 30,
    { align: 'right' }
  )

  if (quote.notes && quote.notes.trim() !== '') {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor('#000000')
    doc.text('Notes:', margin, finalY + 50)
    doc.setFontSize(9)
    doc.text(doc.splitTextToSize(quote.notes, doc.internal.pageSize.getWidth() - margin * 2), margin, finalY + 60)
  }

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor('#999999')
  doc.text(
    'Thank you for your business — Byte Gurus Billing Ltd.',
    doc.internal.pageSize.getWidth() / 2,
    doc.internal.pageSize.getHeight() - 30,
    { align: 'center' }
  )

  doc.save(`${quote.number}.pdf`)
}

function printQuote(index) {
  const quote = quotes.value[index]
  const win = window.open('', '', 'width=800,height=600')
  const html = `
    <html>
    <head>
      <title>Print Quote</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        header { border-bottom: 2px solid #103355; margin-bottom: 20px; }
        h1 { color: #103355; margin: 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: right; }
        th { background-color: #103355; color: #fff; }
        td:first-child, th:first-child { text-align: left; }
        .total { margin-top: 20px; font-weight: bold; text-align: right; }
        footer { margin-top: 40px; font-size: 12px; text-align: center; color: #999; }
        .notes { white-space: pre-wrap; margin-top: 20px; color: #555; }
      </style>
    </head>
    <body>
      <header>
        <h1>Byte Gurus Billing Ltd.</h1>
        <p>21 Lilongwe, Nkana East, Kitwe<br/>Phone: +260 969 291412 · Email: bytegurus98@gmail.com</p>
      </header>
      <section>
        <p><strong>Quote #:</strong> ${quote.number}</p>
        <p><strong>Date:</strong> ${quote.date}</p>
        <p><strong>Expiry:</strong> ${quote.expiry}</p>
        <p><strong>Bill To:</strong><br/>
          ${quote.client.name}<br/>
          ${quote.client.address}<br/>
          Phone: ${quote.client.phone}<br/>
          Email: ${quote.client.email}
        </p>
      </section>
      <table>
        <thead>
          <tr><th>Description</th><th>Qty</th><th>Price</th><th>Amount</th></tr>
        </thead>
        <tbody>
          ${quote.items
            .map(
              (i) => `
            <tr>
              <td>${i.name}</td>
              <td>${i.qty}</td>
              <td>${i.price.toFixed(2)}</td>
              <td>${(i.qty * i.price).toFixed(2)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
      <p class="total">Estimated Total: ZMW ${quote.total.toFixed(2)}</p>
      ${
        quote.notes && quote.notes.trim() !== ''
          ? `<div class="notes"><strong>Notes:</strong><p>${quote.notes}</p></div>`
          : ''
      }
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
  border: none;
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
