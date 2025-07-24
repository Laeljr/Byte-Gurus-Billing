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
            <p><strong>Receipt No:</strong> REC-{{ today.replace(/-/g, '') }}</p>
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
          @click="openPreview"
          class="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800"
        >
          Preview & Print
        </button>
        <button
          @click="exportPdf"
          class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Export PDF
        </button>
        <button
          @click="saveReceipt"
          class="bg-[#103355] text-white px-6 py-2 rounded hover:bg-[#0e2a4d]"
        >
          Save Receipt
        </button>
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

      <!-- Receipt Preview Modal -->
      <div
        v-if="showPreview"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @keydown.esc="closePreview"
      >
        <div
          class="bg-white w-full max-w-3xl max-h-[90vh] overflow-auto rounded shadow-lg p-6 relative"
        >
          <h3 class="text-2xl font-bold mb-4 text-center">Receipt Preview</h3>
          <div
            class="border p-4 overflow-auto max-h-[70vh]"
            ref="previewContent"
            v-html="printContent"
          ></div>

          <div class="mt-6 text-center space-x-4">
            <button
              @click="printFromPreview"
              class="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800"
            >
              Print
            </button>
            <button
              @click="closePreview"
              class="bg-gray-400 text-gray-800 px-6 py-2 rounded hover:bg-gray-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import ItemFormModal from "../components/ItemFormModal.vue";
import ClientAndPaymentModal from "../components/ClientAndPaymentModal.vue";
import bgImage from "../images/back.jpg";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const today = new Date().toISOString().split("T")[0];

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

const showPreview = ref(false);
const printContent = ref("");

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

function getCleanPrintHtml() {
  const printArea = document.getElementById("print-area");
  if (!printArea) return "";
  const clone = printArea.cloneNode(true);
  const ths = clone.querySelectorAll("th");
  let actionIndex = -1;
  ths.forEach((th, idx) => {
    if (th.classList.contains("print-hidden")) actionIndex = idx;
  });
  if (actionIndex > -1) {
    ths[actionIndex].remove();
    clone.querySelectorAll("tbody tr").forEach((tr) => {
      const tds = tr.querySelectorAll("td");
      if (tds.length > actionIndex) tds[actionIndex].remove();
    });
  }
  clone.querySelectorAll(".print-hidden").forEach((el) => el.remove());
  return `<div style="text-align:center; margin-bottom:20px;"><h1 style="font-size:24px; font-weight:bold;">Receipt</h1></div>${clone.innerHTML}`;
}

function openPreview() {
  printContent.value = getCleanPrintHtml();
  showPreview.value = true;
}

function closePreview() {
  showPreview.value = false;
}

function printFromPreview() {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.document.write(`
    <html>
      <head>
        <title>Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; }
          th { background-color: #cbd5e1; color: #1e40af; text-align: left; }
          .status-paid { background-color: #bbf7d0; color: #166534; padding: 6px 12px; border-radius: 9999px; font-weight: 600; display: inline-block; }
          .text-right { text-align: right; }
          .print-hidden { display: none !important; }
        </style>
      </head>
      <body>
        <h1 style="text-align:center;">Receipt</h1>
        ${getCleanPrintHtml()}
        <script>
          window.onload = function() { window.print(); window.close(); }
        <\/script>
      </body>
    </html>
  `);
  printWindow.document.close();
  showPreview.value = false;
}

async function exportPdf() {
  const printArea = document.getElementById("print-area");
  if (!printArea) return;
  const clone = printArea.cloneNode(true);
  const ths = clone.querySelectorAll("th");
  let actionIndex = -1;
  ths.forEach((th, idx) => {
    if (th.classList.contains("print-hidden")) actionIndex = idx;
  });
  if (actionIndex > -1) {
    ths[actionIndex].remove();
    clone.querySelectorAll("tbody tr").forEach((tr) => {
      const tds = tr.querySelectorAll("td");
      if (tds.length > actionIndex) tds[actionIndex].remove();
    });
  }
  clone.querySelectorAll(".print-hidden").forEach((el) => el.remove());

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "-10000px";
  container.style.left = "-10000px";
  container.style.background = "white";
  container.appendChild(clone);
  document.body.appendChild(container);

  const canvas = await html2canvas(clone, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");

  document.body.removeChild(container);

  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const imgProps = pdf.getImageProperties(imgData);
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save(`Receipt_${today.replace(/-/g, "")}.pdf`);
}

// Updated saveReceipt with validation, reset and correct key & property names
function saveReceipt() {
  if (items.value.length === 0) {
    alert("Please add at least one item before saving the receipt.");
    return;
  }

  const receiptData = {
    customer: customer.value,
    items: items.value,
    paymentMethod: paymentMethod.value,
    amountReceiver: amountReceiver.value,
    total: total.value,
    date: today,
    number: `REC-${today.replace(/-/g, "")}`,
  };

  // Load existing receipts or initialize empty array
  let savedReceipts = JSON.parse(localStorage.getItem("receipts") || "[]");

  savedReceipts.push(receiptData);

  localStorage.setItem("receipts", JSON.stringify(savedReceipts));

  alert("Receipt saved successfully!");

  // Reset form data (optional)
  customer.value = {
    name: "",
    address: "",
    phone: "",
    email: "",
  };
  items.value = [];
  paymentMethod.value = "";
  amountReceiver.value = "";
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
