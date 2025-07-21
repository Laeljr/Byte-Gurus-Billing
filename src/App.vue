<template>
  <div class="min-h-screen flex flex-col">
    <Navbar v-if="showNav" />
    <router-view class="flex-grow" />
    <Footer v-if="showNav" />
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

// Get current route
const route = useRoute()

// ✅ Hide Navbar and Footer on the login page
const showNav = computed(() => route.path !== '/login')
</script>
