<template>
  <!-- Full page container with background image -->
  <div
    class="min-h-screen w-full bg-cover bg-center flex justify-center items-start p-8"
    :style="{ backgroundImage: `url(${bgImage})` }"
  >
    <!-- White translucent card container -->
    <div class="w-full max-w-4xl bg-white/90 backdrop-blur-sm rounded shadow-lg p-6">
      <!-- Header: Invoice title -->
      <div class="mb-6 text-center">
        <h2 class="text-3xl font-bold text-blue-800">Invoice</h2>
        <p class="text-sm text-blue-700">Thank you for your business.</p>
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

        <!-- Info section with invoice and client details -->
        <div class="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p><strong>Invoice No:</strong> {{ invoice.number }}</p>
            <p><strong>Invoice Date:</strong> {{ invoice.date }}</p>
            <p><strong>Due Date:</strong> {{ invoice.dueDate }}</p>
          </div>
          <div class="text-right space-y-1">
            <p><strong>Customer:</strong> {{ invoice.customerName }}</p>
            <p>{{ invoice.customerAddress }}</p>
            <p>Phone: {{ invoice.customerPhone }}</p>
            <p>Email: {{ invoice.customerEmail }}</p>
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
              <th class="p-2 text-center print-hidden">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="items.length === 0">
              <td colspan="5" class="p-2 text-center text-gray-500">No items added.</td>
            </tr>
            <tr v-for="(item, i) in items" :key="i" class="border-t">
              <td class="p-2">{{ item.description }}</td>
              <td class="p-2 text-right">{{ item.quantity }}</td>
              <td class="p-2 text-right">{{ item.unitPrice.toFixed(2) }}</td>
              <td class="p-2 text-right">{{ (item.quantity * item.unitPrice).toFixed(2) }}</td>
              <td class="p-2 text-center space-x-1 print-hidden">
                <button @click.stop="openEditDialog(i)" class="text-blue-700 hover:underline text-xs">Edit</button>
                <button @click.stop="deleteItem(i)" class="text-red-600 hover:underline text-xs">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Total -->
        <div class="text-right font-semibold text-lg text-blue-800 mb-6">
          Total: ZMW {{ total.toFixed(2) }}
        </div>

        <!-- Payment Details -->
        <div class="border-t pt-4 mt-6 text-sm">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <p><strong>Bank:</strong> Standard Chartered Bank Zambia</p>
              <p><strong>Account:</strong> 0104309451400</p>
              <p><strong>Branch:</strong> Lusaka Main Branch</p>
            </div>
            <div class="space-y-1 text-right">
              <p><strong>Mobile Money:</strong></p>
              <p>Lael Mulenga: +260 969 291412</p>
              <p>Lael Mulenga: +260 777 873514</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="text-center mt-6 space-x-3 print:hidden">
        <button @click="openAddDialog" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Item</button>
        <button @click="openClientDialog" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Edit Client</button>
        <button @click="saveInvoice" class="bg-[#103355] text-white px-6 py-2 rounded hover:bg-[#0e2a4d]">Save Invoice</button>
        <router-link to="/invoices" class="inline-block px-6 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">View Saved Invoices</router-link>
      </div>

      <!-- Modals -->
      <DialogForm :show="showDialog" :mode="dialogMode" :item="selectedItem" @close="showDialog = false" @save="handleSave" />
      <ClientForm :show="showClientDialog" mode="Edit" :clientData="clientData" @close="showClientDialog = false" @save="saveClientDetails" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import DialogForm from '@/components/DialogForm.vue';
import ClientForm from '@/components/ClientForm.vue';
import bgImage from '@/images/back.jpg';

const showDialog = ref(false);
const dialogMode = ref('Add');
const selectedItem = ref(null);
const editIndex = ref(null);
const items = ref([]);

const showClientDialog = ref(false);
const clientData = ref({});

const invoice = ref({
  number: '',
  date: '',
  dueDate: '',
  customerName: 'Andrew Mwale',
  customerAddress: '123 Main Street, Lusaka',
  customerPhone: '+260 977 000000',
  customerEmail: 'andrewmwale@example.com',
});

onMounted(() => {
  const today = new Date();
  invoice.value.date = today.toISOString().split('T')[0];
  invoice.value.number = generateInvoiceNumber(today);
  const due = new Date(today);
  due.setDate(today.getDate() + 30);
  invoice.value.dueDate = due.toISOString().split('T')[0];
});

function generateInvoiceNumber(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  const datePart = `${y}${m}${d}`;

  const savedInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');

  // Filter invoices from today only
  const todaysInvoices = savedInvoices.filter(inv => inv.number.includes(`INV-${datePart}`));
  const counter = todaysInvoices.length + 1;

  return `INV-${datePart}-${String(counter).padStart(3, '0')}`;
}

const total = computed(() =>
  items.value.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
);

function openAddDialog() {
  dialogMode.value = 'Add';
  selectedItem.value = { description: '', quantity: 1, unitPrice: 0 };
  showDialog.value = true;
}

function openEditDialog(index) {
  dialogMode.value = 'Edit';
  selectedItem.value = { ...items.value[index] };
  editIndex.value = index;
  showDialog.value = true;
}

function handleSave(data) {
  if (dialogMode.value === 'Add') {
    items.value.push(data);
  } else {
    items.value[editIndex.value] = data;
  }
  showDialog.value = false;
}

function deleteItem(index) {
  if (confirm('Are you sure?')) items.value.splice(index, 1);
}

function saveInvoice() {
  const savedInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
  savedInvoices.push({ ...invoice.value, items: items.value, total: total.value });
  localStorage.setItem('invoices', JSON.stringify(savedInvoices));
  alert('Invoice saved!');

  // Generate new number for next invoice immediately
  const today = new Date();
  invoice.value.number = generateInvoiceNumber(today);
  items.value = [];
}
function openClientDialog() {
  clientData.value = {
    name: invoice.value.customerName,
    address: invoice.value.customerAddress,
    phone: invoice.value.customerPhone,
    email: invoice.value.customerEmail,
  };
  showClientDialog.value = true;
}

function saveClientDetails(data) {
  invoice.value.customerName = data.name;
  invoice.value.customerAddress = data.address;
  invoice.value.customerPhone = data.phone;
  invoice.value.customerEmail = data.email;
  showClientDialog.value = false;
}
</script>


<style scoped>
@media print {
  .print-hidden {
    display: none !important;
  }
}
</style>
