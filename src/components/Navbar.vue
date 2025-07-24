<template>
  <nav class="bg-[#103355] text-white px-6 py-4 shadow flex justify-between items-center">
    <h1 class="text-2xl font-bold">Byte Gurus Billing</h1>
    <div class="space-x-4 flex items-center">
      <router-link
        to="/"
        class="hover:underline"
        active-class="underline font-semibold"
        exact
      >
        Dashboard
      </router-link>
      <router-link
        to="/invoice"
        class="hover:underline"
        active-class="underline font-semibold"
      >
        Invoice
      </router-link>
      <router-link
        to="/invoices"
        class="hover:underline"
        active-class="underline font-semibold"
      >
        Saved Invoices
      </router-link>
      <router-link
        to="/receipt"
        class="hover:underline"
        active-class="underline font-semibold"
      >
        Receipt
      </router-link>
      <router-link
        to="/receipt/list"
        class="hover:underline"
        active-class="underline font-semibold"
      >
        Saved Receipts
      </router-link>
      <router-link
        to="/quotation"
        class="hover:underline"
        active-class="underline font-semibold"
      >
        Quotation
      </router-link>
      <router-link
        to="/quotation/list"
        class="hover:underline"
        active-class="underline font-semibold"
      >
        Saved Quotes
      </router-link>

      <span class="mx-2">|</span>

      <router-link v-if="!isLoggedIn" to="/login" class="hover:underline">
        Login
      </router-link>

      <button v-else @click="logout" class="hover:underline">
        Logout
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const isLoggedIn = ref(false)
const router = useRouter()

onMounted(() => {
  isLoggedIn.value = localStorage.getItem('adminAuthenticated') === 'true'
})

window.addEventListener('storage', () => {
  isLoggedIn.value = localStorage.getItem('adminAuthenticated') === 'true'
})

const logout = () => {
  localStorage.removeItem('adminAuthenticated')
  isLoggedIn.value = false
  router.push('/login')
}
</script>
