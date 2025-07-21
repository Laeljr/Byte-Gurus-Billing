<template>
  <!-- Main container with background image and padding -->
  <div
    class="min-h-screen w-full bg-cover bg-center flex justify-center items-start p-8"
    :style="{ backgroundImage: `url(${bgImage})` }"
  >
    <!-- White semi-transparent card container -->
    <div class="w-full max-w-5xl bg-white/90 backdrop-blur-sm rounded shadow-lg p-6">
      
      <!-- Printable area: content inside this div is used for printing -->
      <div ref="printArea">
        
        <!-- Company Info section -->
        <div class="text-center mb-6">
          <h1 class="text-2xl font-bold text-[#103355]">Byte Gurus Billing Ltd.</h1>
          <p class="text-gray-600 text-sm">
            21 Lilongwe, Nkana East, Kitwe · +260 969 291412 · bytegurus98@gmail.com
          </p>
        </div>

        <!-- Quotation Header with title and description -->
        <div class="mb-6 text-center">
          <h2 class="text-3xl font-bold text-[#103355]">Quotation</h2>
          <p class="text-sm text-gray-600">Estimated cost for requested services</p>
        </div>

        <!-- Quote details: left side quote info, right side client info -->
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

        <!-- Items Table: lists all quoted items -->
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
            <!-- Loop through items, show each row -->
            <tr
              v-for="(item, i) in items"
              :key="i"
              class="border-t hover:bg-gray-50 cursor-pointer"
              @click="openEditItemDialog(i)" <!-- Open edit modal on row click -->
            >
              <td class="p-2">{{ item.name }}</td>
              <td class="p-2 text-right">{{ item.qty }}</td>
              <td class="p-2 text-right">{{ item.price.toFixed(2) }}</td>
              <td class="p-2 text-right">{{ (item.qty * item.price).toFixed(2) }}</td>
              <td class="p-2 text-center">
                <!-- Delete button with stop propagation to prevent row click -->
                <button
                  @click.stop="deleteItem(i)"
                  class="text-red-600 hover:text-red-800"
                  aria-label="Delete item"
                >
                  &times;
                </button>
              </td>
            </tr>
            <!-- Show message if no items -->
            <tr v-if="items.length === 0">
              <td colspan="5" class="p-4 text-center text-gray-500 italic">
                No items added yet.
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Total summary displayed right-aligned -->
        <div class="text-right font-semibold text-lg text-[#103355] mb-6">
          Estimated Total: ZMW {{ total.toFixed(2) }}
        </div>
      </div>

      <!-- Action buttons below printable area -->
      <div class="flex flex-wrap justify-between items-center gap-2 mt-6">
        <div class="flex gap-2 items-center">
          <!-- Open modal to add new item -->
          <button
            @click="openAddItemDialog"
            class="bg-[#103355] text-white px-4 py-2 rounded hover:bg-[#0e2a4d]"
          >
            Add Item
          </button>
          <!-- Open modal to edit client info -->
          <button
            @click="openClientDialog"
            class="bg-[#103355] text-white px-4 py-2 rounded hover:bg-[#0e2a4d]"
          >
            Edit Client Details
          </button>
        </div>
        <div class="flex gap-2">
          <!-- Generate and download quote as PDF -->
          <button
            @click="generatePDF"
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Download Quote
          </button>
          <!-- Open print dialog for quote -->
          <button
            @click="printQuote"
            class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Print Quote
          </button>
          <!-- Clear all quote data -->
          <button
            @click="clearQuote"
            class="bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200 text-sm"
          >
            Clear Quote
          </button>
        </div>
      </div>

      <!-- Dialog for adding/editing quote items -->
      <DialogForm
        :show="showDialog"
        :mode="dialogMode"
        :item="selectedItem"
        @close="showDialog = false"
        @save="handleSave"
      />

      <!-- Dialog for editing client details -->
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
import DialogForm from '@/components/DialogForm.vue' // Item add/edit modal component
import ClientForm from '@/components/ClientForm.vue' // Client details modal component
import bgImage from '@/images/back.jpg' // Background image for the page
import jsPDF from 'jspdf' // Library to generate PDFs
import 'jspdf-autotable' // Plugin for tables in PDF

// Controls visibility and mode for the item dialog (add/edit)
const showDialog = ref(false)
const dialogMode = ref('Add') 
const selectedItem = ref(null) // Currently selected item data
const editIndex = ref(null) // Index of the item being edited

// Controls visibility for the client detail dialog
const showClientDialog = ref(false)

// List of items in the quote
const items = ref([])

// Client information
const clientData = ref({
  name: 'AndyProff Innovations Ltd.',
  address: '123 Main Street, Lusaka',
  phone: '+260 977 654321',
  email: 'contact@andyproff.co.zm',
})

// Quote metadata (number, date, expiry)
const quote = ref({
  number: '',
  date: '',
  expiry: '',
})

// Template for new empty item
const emptyItem = {
  description: '',
  quantity: 1,
  unitPrice: 0,
}

// Initialize quote number, date, and expiry on component mount
onMounted(() => {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  
  // Generate unique quote number like QT-20250721-123
  quote.value.number = `QT-${yyyy}${mm}${dd}-${Math.floor(Math.random() * 1000)}`

  // Set quote date to today
  quote.value.date = today.toISOString().split('T')[0]

  // Set expiry date 30 days from today
  const expiry = new Date(today)
  expiry.setDate(today.getDate() + 30)
  quote.value.expiry = expiry.toISOString().split('T')[0]
})

// Computed property to calculate the total quote cost
const total = computed(() =>
  items.value.reduce((sum, item) => sum + item.qty * item.price, 0)
)

// Open dialog to add a new item, reset selectedItem to empty template
function openAddItemDialog() {
  dialogMode.value = 'Add'
  selectedItem.value = { ...emptyItem }
  showDialog.value = true
}

// Open dialog to edit existing item at given index
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

// Save item data from dialog: either add new or update existing
function handleSave(data) {
  if (dialogMode.value === 'Add') {
    items.value.push({
      name: data.description,
      qty: data.quantity,
      price: data.unitPrice,
    })
  } else if (dialogMode.value === 'Edit') {
    items.value[editIndex.value] = {
      name: data.description,
      qty: data.quantity,
      price: data.unitPrice,
    }
  }
  showDialog.value = false
}

// Remove item at specified index after confirmation
function deleteItem(index) {
  if (confirm('Are you sure you want to delete this item?')) {
    items.value.splice(index, 1)
  }
}

// Clear all quote data including items and client info
function clearQuote() {
  if (confirm('Are you sure you want to clear the entire quote?')) {
    items.value = []
    clientData.value = {
      name: '',
      address: '',
      phone: '',
      email: '',
    }
  }
}

// Show client detail edit dialog
function openClientDialog() {
  showClientDialog.value = true
}

// Save updated client details from dialog
function saveClientDetails(data) {
  clientData.value = { ...data }
  showClientDialog.value = false
}

// Generate PDF file of the quote using jsPDF
function generatePDF() {
  const doc = new jsPDF()
  
  // Header info
  doc.setFontSize(16)
  doc.text('Smart Billing Ltd.', 14, 15)
  doc.setFontSize(10)
  doc.text('Plot 101, Cairo Road, Lusaka', 14, 21)
  doc.text('Phone: +260 955 123456 · Email: info@smartbilling.co.zm', 14, 26)

  // Quote meta data
  doc.setFontSize(12)
  doc.text(`Quote #: ${quote.value.number}`, 14, 36)
  doc.text(`Date: ${quote.value.date}`, 14, 42)
  doc.text(`Expiry: ${quote.value.expiry}`, 14, 48)

  // Client info
  doc.text(`To: ${clientData.value.name}`, 14, 54)
  doc.text(`${clientData.value.address}`, 14, 60)
  doc.text(`Contact: ${clientData.value.phone}`, 14, 66)
  doc.text(`Email: ${clientData.value.email}`, 14, 72)

  // Items table
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

  // Total amount below the table
  doc.text(
    `Estimated Total: ZMW ${total.value.toFixed(2)}`,
    150,
    doc.autoTable.previous.finalY + 10
  )

  // Save the generated PDF with the quote number as filename
  doc.save(`${quote.value.number}.pdf`)
}

// Reference to printable area DOM element
const printArea = ref(null)

// Open print dialog with the printable content
function printQuote() {
  if (!printArea.value) return

  const printWindow = window.open('', '_blank', 'width=800,height=600')

  printWindow.document.write(`
    <html>
      <head>
        <title>Print Quote</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; }
          th { background-color: #f0f0f0; color: #103355; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        ${printArea.value.innerHTML}
      </body>
    </html>
  `)

  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
  printWindow.close()
}
</script>

<style scoped>
/* Table cell borders for consistent look */
th,
td {
  border: 1px solid #ddd;
}

/* Hide buttons and set background white when printing */
@media print {
  button {
    display: none;
  }
  body {
    background: white;
  }
}
</style>
