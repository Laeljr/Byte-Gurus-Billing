<template>
  <!-- Full page container with background image -->
  <div
    class="min-h-screen w-full bg-cover bg-center flex justify-center items-start p-8"
    :style="{ backgroundImage: `url(${bgImage})` }"
  >
    <!-- White translucent card container -->
    <div class="w-full max-w-4xl bg-white/90 backdrop-blur-sm rounded shadow-lg p-6">
      
      <!-- Header: Receipt title + Paid badge -->
      <div class="mb-6 text-center flex justify-center items-center space-x-4">
        <h2 class="text-3xl font-bold text-blue-800">Receipt</h2>
        <span
          class="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-semibold select-none"
        >
          Paid
        </span>
      </div>

      <!-- Receipt content area that can be printed or exported -->
      <div
        id="print-area"
        ref="printArea"
        class="p-6 bg-white/0 rounded shadow print:p-0 print:bg-white print:shadow-none"
      >
        <!-- Company Info -->
        <div class="text-center mb-4">
          <h1 class="text-2xl font-bold text-blue-900">Byte Gurus Billing Ltd.</h1>
          <p class="text-blue-700 text-sm">
            21 Lilongwe, Nkana East, Kitwe · +260 969 291412 ·
            bytegurus98@gmail.com
          </p>
        </div>

        <!-- Info section with receipt and customer details -->
        <div class="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p><strong>Receipt No:</strong> {{ receiptNumber }}</p>
            <p><strong>Date:</strong> {{ today }}</p>
          </div>
          <div class="text-right space-y-1">
            <p><strong>Customer:</strong> {{ customer.name }}</p>
            <p>{{ customer.address }}</p>
            <p>Phone: {{ customer.phone }}</p>
            <p>Email: {{ customer.email }}</p>
          </div>
        </div>

        <!-- Paid badge shown only in print version -->
        <div class="mb-4 text-right print:block hidden">
          <span
            class="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-semibold select-none"
          >
            Paid
          </span>
        </div>

        <!-- Items Table -->
        <table class="w-full border text-sm mb-4">
          <thead class="bg-blue-200 text-blue-900">
            <tr>
              <th class="p-2 text-left">Item</th>
              <th class="p-2 text-right">Qty</th>
              <th class="p-2 text-right">Price</th>
              <th class="p-2 text-right">Total</th>
              <!-- Actions column hidden in print -->
              <th class="p-2 text-center print-hidden">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="items.length === 0">
              <td colspan="5" class="p-2 text-center text-gray-500">No items added yet.</td>
            </tr>
            <tr v-for="(item, i) in items" :key="i" class="border-t">
              <td class="p-2">{{ item.name }}</td>
              <td class="p-2 text-right">{{ item.qty }}</td>
              <td class="p-2 text-right">{{ item.price.toFixed(2) }}</td>
              <td class="p-2 text-right">{{ (item.qty * item.price).toFixed(2) }}</td>
              <td class="p-2 text-center space-x-1 print-hidden">
                <button
                  @click.stop="editItem(i)"
                  class="text-blue-700 hover:underline text-xs"
                >
                  Edit
                </button>
                <button
                  @click.stop="deleteItem(i)"
                  class="text-red-600 hover:underline text-xs"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Total paid amount -->
        <div class="text-right font-semibold text-lg text-blue-800 mb-6">
          Total Paid: ZMW {{ total.toFixed(2) }}
        </div>

        <!-- Footer with payment info -->
        <div class="border-t pt-4 mt-6 text-sm">
          <div class="max-w-md mx-auto space-y-1">
            <p><strong>Payment Method:</strong> {{ paymentMethod || 'N/A' }}</p>
            <p><strong>Amount Received By:</strong> {{ amountReceiver || 'N/A' }}</p>
          </div>
        </div>
      </div>

      <!-- Action buttons hidden when printing -->
      <div class="text-center mt-6 space-x-3 print:hidden">
        <button
          @click="addItem"
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Item
        </button>
        <button
          @click="openClientModal"
          class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Edit Client
        </button>
        <button
          @click="saveReceipt"
          class="bg-[#103355] text-white px-6 py-2 rounded hover:bg-[#0e2a4d]"
        >
          Save Receipt
        </button>

        <router-link
          to="/receipt/list"
          class="inline-block px-6 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          View Saved Receipts
        </router-link>
      </div>

      <!-- Modals -->
      <ItemFormModal
        v-if="showModal"
        :item="editableItem"
        :index="editIndex"
        @save="saveItem"
        @close="showModal = false"
      />

      <ClientAndPaymentModal
        v-if="showClientModal"
        :client="editableClient"
        :paymentMethod="paymentMethod"
        :receiver="amountReceiver"
        @save="saveClient"
        @close="showClientModal = false"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import ItemFormModal from "../components/ItemFormModal.vue";
import ClientAndPaymentModal from "../components/ClientAndPaymentModal.vue";
import bgImage from "../images/back.jpg";

const today = new Date().toISOString().split("T")[0];
const dateStr = today.replace(/-/g, "");

const customer = ref({
  name: "Andrew Mwale",
  address: "123 Main Street, Lusaka",
  phone: "+260 955 123456",
  email: "andrew.mwale@example.com",
});

const items = ref([
  { name: "Consultation Fee", qty: 1, price: 500 },
  { name: "Website Hosting", qty: 2, price: 1000 },
]);

const paymentMethod = ref("Cash");
const amountReceiver = ref("Lael Mulenga");

const total = computed(() =>
  items.value.reduce((sum, i) => sum + i.qty * i.price, 0)
);

const showModal = ref(false);
const editableItem = ref({});
const editIndex = ref(null);

const showClientModal = ref(false);
const editableClient = ref({ ...customer.value });

const receiptNumber = ref(`REC-${dateStr}-001`);

// Helper function to update receipt number based on saved receipts count
function updateReceiptNumber(savedReceipts) {
  const todaysReceipts = savedReceipts.filter(r => r.number.startsWith(`REC-${dateStr}`));
  const counter = todaysReceipts.length + 1;
  receiptNumber.value = `REC-${dateStr}-${String(counter).padStart(3, "0")}`;
}

let savedReceipts = JSON.parse(localStorage.getItem("receipts") || "[]");
updateReceiptNumber(savedReceipts);

function addItem() {
  editableItem.value = { name: "", qty: 1, price: 0 };
  editIndex.value = null;
  showModal.value = true;
}

function editItem(index) {
  editableItem.value = { ...items.value[index] };
  editIndex.value = index;
  showModal.value = true;
}

function deleteItem(index) {
  if (confirm("Are you sure you want to delete this item?")) {
    items.value.splice(index, 1);
  }
}

function saveItem({ item, index }) {
  if (index !== null && index !== undefined) {
    items.value[index] = item;
  } else {
    items.value.push(item);
  }
  showModal.value = false;
}

function openClientModal() {
  editableClient.value = { ...customer.value };
  showClientModal.value = true;
}

function saveClient({ client, paymentMethod: pm, receiver }) {
  customer.value = client;
  paymentMethod.value = pm;
  amountReceiver.value = receiver;
  showClientModal.value = false;
}

function saveReceipt() {
  if (items.value.length === 0) {
    alert("Please add at least one item before saving the receipt.");
    return;
  }

  savedReceipts = JSON.parse(localStorage.getItem("receipts") || "[]");
  updateReceiptNumber(savedReceipts);

  const receiptData = {
    customer: customer.value,
    items: items.value,
    paymentMethod: paymentMethod.value,
    amountReceiver: amountReceiver.value,
    total: total.value,
    date: today,
    number: receiptNumber.value,
  };

  savedReceipts.push(receiptData);
  localStorage.setItem("receipts", JSON.stringify(savedReceipts));

  alert(`Receipt saved successfully! Receipt No: ${receiptNumber.value}`);

  // Reset data
  customer.value = {
    name: "",
    address: "",
    phone: "",
    email: "",
  };
  items.value = [];
  paymentMethod.value = "";
  amountReceiver.value = "";

  // Update receiptNumber for next receipt
  updateReceiptNumber(savedReceipts);
}
</script>

<style>
@media print {
  body > *:not(#print-area) {
    display: none !important;
  }
  #print-area {
    display: block !important;
  }
  .print-hidden,
  th.print-hidden,
  td.print-hidden {
    display: none !important;
  }
}
</style>
