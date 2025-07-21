<template>
  <div
    class="min-h-screen w-full bg-cover bg-center flex items-center justify-center p-8"
    :style="{ backgroundImage: `url(${bgImage})` }"
  >
    <!-- Content container with a subtle white background and some transparency -->
    <div
      class="bg-white bg-opacity-80 rounded-lg p-8 shadow-md max-w-xl w-full text-center"
    >
      <h2
        class="text-4xl font-extrabold mb-6 text-blue-900 tracking-tight"
      >
        Welcome to Byte Gurus Billing Ltd
      </h2>
      <p class="text-gray-700 mb-8 max-w-md mx-auto">
        Create, manage, and customize invoices, receipts, and quotations easily.
      </p>

      <div
        class="bg-white rounded-lg p-8 shadow-md border border-blue-200
               transition-transform duration-300 hover:scale-[1.03] cursor-default mx-auto max-w-sm"
      >
        <!-- Animated logo text -->
        <h3
          class="logo-text mb-6 select-none drop-shadow-md tracking-wider text-2xl sm:text-3xl text-blue-700"
        >
          Byte Gurus Billing Ltd.
        </h3>
        <p class="mb-2 text-gray-600">21 Lilongwe, Nkana East, KITWE</p>
        <p class="mb-2 text-gray-600">Phone: +260 969 291 412</p>
        <p class="mb-2 text-gray-600">Email: bytegurus98@gmail.com</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import bgImage from '../images/back.jpg' // adjust path
</script>

<style>
.logo-text {
  font-weight: 800;
  font-size: 1.75rem;
  user-select: none;
  animation: colorfade 4s ease-in-out infinite;
  color: #2563eb; /* fallback */
}

@keyframes colorfade {
  0%,
  100% {
    color: #2563eb; /* Tailwind blue-600 */
  }
  25% {
    color: #3b82f6; /* Tailwind blue-500 */
  }
  50% {
    color: #1e40af; /* Tailwind blue-900 */
  }
  75% {
    color: #60a5fa; /* Tailwind blue-400 */
  }
}
</style>
