import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/components/Dashboard.vue'
import InvoicePage from '@/pages/InvoicePage.vue'
import ReceiptPage from '@/pages/ReceiptPage.vue'
import QuotationPage from '@/pages/QuotationPage.vue'
import Login from '@/pages/Login.vue' // Make sure you create this file!

const routes = [
  { 
    path: '/', 
    component: Dashboard, 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/invoice', 
    component: InvoicePage, 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/receipt', 
    component: ReceiptPage, 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/quotation', 
    component: QuotationPage, 
    meta: { requiresAuth: true } 
  },
  {
    path: '/login',
    component: Login
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ✅ Add a global navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true'
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
