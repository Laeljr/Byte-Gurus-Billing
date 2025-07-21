<template>
  <footer class="bg-gray-100 py-4 text-center mt-auto border-t">
    <p class="text-sm text-gray-600">
      &copy; 2025 Byte Gurus Billing Ltd. All rights reserved.
    </p>
    <p class="text-sm text-gray-600">
      Designed by
      <a
        href="https://bytegurus.site"
        target="_blank"
        rel="noopener noreferrer"
        class="designer-link"
      >
        Byte Gurus 
      </a>
    </p>
  </footer>
</template>

<style scoped>
.designer-link {
  font-weight: 500;
  color: #2563eb;
  transition: all 0.3s ease;
  animation: pulse 3s infinite;
}

.designer-link:hover {
  color: #1e40af;
  text-decoration: underline;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
</style>
