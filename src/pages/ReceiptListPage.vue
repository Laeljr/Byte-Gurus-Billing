<template>
  <div class="min-h-screen w-full p-8 bg-gray-50 flex justify-center">
    <div class="w-full max-w-5xl bg-white rounded shadow p-6">
      <h1 class="text-3xl font-bold text-[#103355] mb-6">Saved Receipts</h1>

      <!-- Return & Create New Buttons -->
      <div class="mb-6 flex justify-between">
        <button
          @click="goBack"
          class="btn-return px-4 py-2 rounded"
          aria-label="Return to Receipt List"
        >
          ← Return
        </button>
        <button
          @click="createNew"
          class="btn-create px-4 py-2 rounded"
          aria-label="Create New Receipt"
        >
          + Create New
        </button>
      </div>

      <!-- Search Bar -->
      <div class="mb-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by Receipt No., Customer, or Date..."
          class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#103355]"
          aria-label="Search Receipts"
        />
      </div>

      <table class="w-full border-collapse border border-gray-300 text-sm">
        <thead class="bg-[#103355] text-white">
          <tr>
            <th class="border border-gray-300 p-2 text-left">Receipt No.</th>
            <th class="border border-gray-300 p-2 text-left">Customer</th>
            <th class="border border-gray-300 p-2 text-left">Date</th>
            <th class="border border-gray-300 p-2 text-right">Total Paid (ZMW)</th>
            <th class="border border-gray-300 p-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(receipt, index) in filteredReceipts"
            :key="receipt.number || index"
            class="hover:bg-gray-100 transition"
          >
            <td class="border border-gray-300 p-2 font-mono">{{ receipt.number }}</td>
            <td class="border border-gray-300 p-2">{{ receipt.customer.name }}</td>
            <td class="border border-gray-300 p-2">{{ receipt.date }}</td>
            <td class="border border-gray-300 p-2 text-right font-semibold">
              ZMW {{ receipt.total.toFixed(2) }}
            </td>
            <td class="border border-gray-300 p-2 text-center space-x-1">
              <button
                @click="viewReceipt(index)"
                class="btn-view px-2 py-1 rounded"
                aria-label="View Receipt Details"
              >
                View
              </button>
              <button
                @click="downloadReceipt(index)"
                class="btn-download px-2 py-1 rounded"
                aria-label="Download Receipt PDF"
              >
                Download
              </button>
              <button
                @click="printReceipt(index)"
                class="btn-print px-2 py-1 rounded"
                aria-label="Print Receipt"
              >
                Print
              </button>
              <button
                @click="deleteReceipt(index)"
                class="btn-delete px-2 py-1 rounded"
                aria-label="Delete Receipt"
              >
                Delete
              </button>
            </td>
          </tr>
          <tr v-if="filteredReceipts.length === 0">
            <td colspan="5" class="p-6 text-center text-gray-500 italic">
              No receipts match your search.
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Modal for viewing receipt details -->
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div
          class="bg-white rounded shadow-lg max-w-4xl w-full p-8 overflow-auto max-h-[80vh]"
          tabindex="0"
        >
          <button
            @click="closeModal"
            class="mb-6 text-right text-gray-500 hover:text-gray-700 font-bold text-3xl leading-none"
            aria-label="Close Receipt Details"
          >
            &times;
          </button>

          <h2
            id="modal-title"
            class="text-3xl font-bold text-[#103355] mb-6 tracking-wide"
          >
            Receipt Details - <span class="font-mono">{{ selectedReceipt.number }}</span>
          </h2>

          <p class="text-lg mb-2">
            <strong>Date:</strong> {{ selectedReceipt.date }}
          </p>

          <section class="mt-6 mb-6">
            <h3 class="font-semibold text-xl mb-2 border-b border-[#103355]/50 pb-1">
              Customer Information
            </h3>
            <p>{{ selectedReceipt.customer.name }}</p>
            <p>{{ selectedReceipt.customer.address }}</p>
            <p>Phone: {{ selectedReceipt.customer.phone }}</p>
            <p>Email: {{ selectedReceipt.customer.email }}</p>
          </section>

          <table class="w-full border-collapse border border-gray-300 text-sm mt-6">
            <thead class="bg-[#103355] text-white">
              <tr>
                <th class="border border-gray-300 p-2 text-left">Item</th>
                <th class="border border-gray-300 p-2 text-right">Qty</th>
                <th class="border border-gray-300 p-2 text-right">Price (ZMW)</th>
                <th class="border border-gray-300 p-2 text-right">Total (ZMW)</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, i) in selectedReceipt.items"
                :key="i"
                class="border-t"
              >
                <td class="border border-gray-300 p-2">{{ item.name }}</td>
                <td class="border border-gray-300 p-2 text-right">{{ item.qty }}</td>
                <td class="border border-gray-300 p-2 text-right">
                  {{ item.price.toFixed(2) }}
                </td>
                <td class="border border-gray-300 p-2 text-right">
                  {{ (item.qty * item.price).toFixed(2) }}
                </td>
              </tr>
            </tbody>
          </table>

          <div
            class="text-right font-semibold text-xl text-[#103355] mt-6 tracking-wide"
          >
            Total Paid: ZMW {{ selectedReceipt.total.toFixed(2) }}
          </div>

          <div
            class="text-sm text-gray-700 mt-6 whitespace-pre-wrap border-t border-[#103355]/40 pt-4"
          >
            <p><strong>Payment Method:</strong> {{ selectedReceipt.paymentMethod }}</p>
            <p><strong>Amount Received By:</strong> {{ selectedReceipt.amountReceiver }}</p>
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

const receipts = ref([])
const showModal = ref(false)
const selectedReceipt = ref({})
const searchQuery = ref('')

onMounted(() => {
  const saved = JSON.parse(localStorage.getItem('receipts') || '[]')
  receipts.value = saved
})

const filteredReceipts = computed(() => {
  if (!searchQuery.value) return receipts.value
  const query = searchQuery.value.toLowerCase()
  return receipts.value.filter(
    receipt =>
      receipt.number.toLowerCase().includes(query) ||
      receipt.customer.name.toLowerCase().includes(query) ||
      receipt.date.toLowerCase().includes(query)
  )
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

  // Company header
  doc.setFontSize(18)
  doc.setTextColor('#103355')
  doc.text('Byte Gurus Billing Ltd.', 14, 20)
  doc.setFontSize(10)
  doc.setTextColor('#333')
  doc.text('21 Lilongwe, Nkana East, Kitwe', 14, 28)
  doc.text('Phone: +260 969 291412 · Email: bytegurus98@gmail.com', 14, 34)

  // Receipt info
  doc.setFontSize(12)
  doc.setTextColor('#103355')
  doc.text(`Receipt #: ${receipt.number}`, 14, 46)
  doc.text(`Date: ${receipt.date}`, 14, 52)

  // Customer info
  doc.setFontSize(11)
  doc.setTextColor('#444')
  doc.text(`Customer: ${receipt.customer.name}`, 14, 62)
  doc.text(receipt.customer.address, 14, 68)
  doc.text(`Phone: ${receipt.customer.phone}`, 14, 74)
  doc.text(`Email: ${receipt.customer.email}`, 14, 80)

  // Table with items
  doc.autoTable({
    headStyles: { fillColor: '#103355', textColor: '#fff' },
    startY: 90,
    head: [['Item', 'Qty', 'Price (ZMW)', 'Total (ZMW)']],
    body: receipt.items.map(item => [
      item.name,
      item.qty,
      item.price.toFixed(2),
      (item.qty * item.price).toFixed(2)
    ]),
    styles: { cellPadding: 3, fontSize: 10 },
    theme: 'grid'
  })

  const finalY = doc.lastAutoTable.finalY || 90

  // Totals & footer
  doc.setFontSize(12)
  doc.setTextColor('#103355')
  doc.text(`Total Paid: ZMW ${receipt.total.toFixed(2)}`, 14, finalY + 15)
  doc.setFontSize(10)
  doc.setTextColor('#555')
  doc.text(`Payment Method: ${receipt.paymentMethod}`, 14, finalY + 24)
  doc.text(`Received By: ${receipt.amountReceiver}`, 14, finalY + 33)

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(150)
  doc.text('© 2025 Prepared by Lael Mulenga', 14, 285)
  doc.text(
    'This is an electronically generated document, no signature is required.',
    14,
    290
  )

  doc.save(`${receipt.number}.pdf`)
}

function printReceipt(index) {
  const receipt = receipts.value[index]
  const win = window.open('', '', 'width=800,height=600')
  const html = `
    <html>
      <head>
        <title>Print Receipt ${receipt.number}</title>
        <style>
          @media print {
            body { margin: 0; -webkit-print-color-adjust: exact; }
            .page-break { page-break-after: always; }
          }
          body {
            font-family: Arial, sans-serif;
            color: #103355;
            padding: 30px 40px;
            background: white;
            line-height: 1.5;
          }
          h1 {
            color: #103355;
            font-weight: 700;
            border-bottom: 2px solid #103355;
            padding-bottom: 10px;
            margin-bottom: 10px;
            letter-spacing: 1px;
          }
          h2 {
            color: #103355;
            font-weight: 600;
            margin-top: 30px;
            margin-bottom: 5px;
          }
          p {
            margin: 4px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 13px;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 8px 10px;
          }
          th {
            background-color: #103355;
            color: white;
            text-align: left;
          }
          td.text-right {
            text-align: right;
          }
          .total {
            font-weight: 700;
            margin-top: 15px;
            text-align: right;
            font-size: 16px;
            color: #103355;
          }
          .footer {
            margin-top: 40px;
            font-size: 10px;
            color: #999;
            border-top: 1px solid #ccc;
            padding-top: 8px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <h1>Byte Gurus Billing Ltd.</h1>
        <p>21 Lilongwe, Nkana East, Kitwe</p>
        <p>Phone: +260 969 291412 · Email: bytegurus98@gmail.com</p>

        <h2>Receipt #: ${receipt.number}</h2>
        <p><strong>Date:</strong> ${receipt.date}</p>

        <h3>Customer Information</h3>
        <p>${receipt.customer.name}</p>
        <p>${receipt.customer.address}</p>
        <p>Phone: ${receipt.customer.phone}</p>
        <p>Email: ${receipt.customer.email}</p>

        <table>
          <thead>
            <tr>
              <th>Item</th><th>Qty</th><th>Price (ZMW)</th><th>Total (ZMW)</th>
            </tr>
          </thead>
          <tbody>
            ${receipt.items
              .map(
                i => `
              <tr>
                <td>${i.name}</td>
                <td class="text-right">${i.qty}</td>
                <td class="text-right">${i.price.toFixed(2)}</td>
                <td class="text-right">${(i.qty * i.price).toFixed(2)}</td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>

        <p class="total">Total Paid: ZMW ${receipt.total.toFixed(2)}</p>

        <p><strong>Payment Method:</strong> ${receipt.paymentMethod}</p>
        <p><strong>Amount Received By:</strong> ${receipt.amountReceiver}</p>

        <div class="footer">
          © 2025 Prepared by Lael Mulenga — This is an electronically generated document, no signature required.
        </div>
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
  router.push('/receipt')
}
function createNew() {
  router.push('/receipt')
}
</script>

<style scoped>
.btn-view {
  background: #3b82f6;
  color: #fff;
  transition: background-color 0.3s;
}
.btn-view:hover {
  background: #2563eb;
}
.btn-download {
  background: #10b981;
  color: #fff;
  transition: background-color 0.3s;
}
.btn-download:hover {
  background: #059669;
}
.btn-print {
  background: #6366f1;
  color: #fff;
  transition: background-color 0.3s;
}
.btn-print:hover {
  background: #4f46e5;
}
.btn-delete {
  color: #dc2626;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.3s;
}
.btn-delete:hover {
  color: #b91c1c;
}
.btn-return {
  background: #64748b;
  color: #fff;
  transition: background-color 0.3s;
}
.btn-return:hover {
  background: #475569;
}
.btn-create {
  background: #22c55e;
  color: #fff;
  transition: background-color 0.3s;
}
.btn-create:hover {
  background: #16a34a;
}
</style>
