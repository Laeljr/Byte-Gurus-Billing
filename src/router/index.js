import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/components/Dashboard.vue'
import InvoicePage from '@/pages/InvoicePage.vue'
import ReceiptPage from '@/pages/ReceiptPage.vue'
import ReceiptListPage from '@/pages/ReceiptListPage.vue'  // Added for listing saved receipts
import QuotationPage from '@/pages/QuotationPage.vue'
import QuotationListPage from '@/pages/QuotationListPage.vue' // Added for listing saved quotes
import Login from '@/pages/Login.vue'
import InvoiceListPage from '@/pages/InvoiceListPage.vue'

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
    path: '/invoices', 
    component: InvoiceListPage,
    meta: { requiresAuth: true } 
  },
  { 
    path: '/receipt', 
    component: ReceiptPage, 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/receipt/list',  // New route for saved receipts
    component: ReceiptListPage,
    meta: { requiresAuth: true }
  },
  { 
    path: '/quotation', // Quote Editor Page
    component: QuotationPage, 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/quotation/list', // Quote List Page
    component: QuotationListPage, 
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

// Uncomment below to enable authentication guard
/*
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true'
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})
*/

export default router
