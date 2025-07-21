<template>
  <!--
    Main container with a full-screen background image.
    Uses Tailwind classes for layout and centering.
  -->
  <div
    class="min-h-screen flex items-center justify-center bg-cover bg-center relative"
    :style="{ backgroundImage: `url(${backgroundImage})` }"
  >
    <!--
      Login form.
      Uses backdrop blur, semi-transparent background, and fade-in animation.
    -->
    <form
      @submit.prevent="login" <!-- Call login() on submit -->
      class="relative z-10 bg-white/20 backdrop-blur-lg p-10 rounded-3xl shadow-xl max-w-md w-full
             text-white flex flex-col gap-6 animate-fadeIn"
      novalidate
    >
      <h2 class="text-4xl font-extrabold mb-6 text-center tracking-wide">
        Admin Login
      </h2>

      <!-- Username Field -->
      <div class="flex flex-col gap-1 relative">
        <label for="username" class="font-semibold text-white/90">Username</label>
        <div class="relative">
          <input
            id="username"
            v-model="username"
            type="text"
            required
            placeholder="Enter username"
            class="rounded-lg p-4 pl-12 outline-none border border-transparent focus:border-blue-400
                   shadow-sm text-black transition w-full"
          />
          <!-- User icon inside input -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M5.121 17.804A9 9 0 1118.879 6.196M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      </div>

      <!-- Password Field -->
      <div class="flex flex-col gap-1 relative">
        <label for="password" class="font-semibold text-white/90">Password</label>
        <div class="relative">
          <!-- Toggle show/hide password -->
          <input
            :type="showPassword ? 'text' : 'password'" 
            id="password"
            v-model="password"
            required
            placeholder="Enter password"
            class="rounded-lg p-4 pl-12 pr-12 outline-none border border-transparent focus:border-blue-400
                   shadow-sm text-black transition w-full"
          />
          <!-- Lock icon inside input -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 11c1.38 0 2.5 1.12 2.5 2.5v1a2.5 2.5 0 01-5 0v-1c0-1.38 1.12-2.5 2.5-2.5z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M16 11V7a4 4 0 10-8 0v4" />
          </svg>

          <!-- Toggle password visibility button -->
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label="Toggle password visibility"
          >
            <!-- Open eye icon if visible -->
            <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.99 9.99 0 011.175-4.625M15 15l5 5m-9-9l4 4m1.5-6a3 3 0 013 3" />
            </svg>
            <!-- Closed eye icon if hidden -->
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Error message if login fails -->
      <p v-if="error" class="text-red-400 text-center font-semibold">{{ error }}</p>

      <!-- Submit Button -->
      <button
        type="submit"
        class="bg-[#103355] hover:bg-[#0d2a44] py-4 rounded-xl font-semibold tracking-wide
               shadow-lg hover:shadow-xl transition duration-300"
      >
        Login
      </button>
    </form>
  </div>
</template>

<script setup>
// Import Vue tools, router, and Axios for API calls
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import backgroundImage from '../images/back.jpg'

// Reactive state variables
const username = ref('') // Stores username input
const password = ref('') // Stores password input
const error = ref('')    // Stores error message
const showPassword = ref(false) // Controls show/hide password toggle

const router = useRouter() // Router for navigation

// Login function: sends POST request to backend and handles result
const login = async () => {
  error.value = '' // Clear any previous error
  try {
    const res = await axios.post('/api/login', {
      username: username.value,
      password: password.value
    })

    // If backend returns success, save token and navigate to home
    if (res.data.success) {
      localStorage.setItem('adminToken', res.data.token)
      router.push('/')
    } else {
      // If login fails
      error.value = 'Invalid username or password'
    }
  } catch (err) {
    console.error(err)
    error.value = 'Login failed. Please check your connection.'
  }
}
</script>

<style scoped>
/* Fade in animation for the form container */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.6s ease forwards;
}
</style>
