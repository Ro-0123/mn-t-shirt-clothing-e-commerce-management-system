<template>
  <div class="min-h-screen flex flex-col antialiased bg-[#0a0a0c] text-zinc-200 selection:bg-indigo-600 selection:text-white">
    <!-- Condition 1: Admin Routes (Managed by AdminLayout) -->
    <div v-if="isAdminRoute" class="admin-panel flex-1 flex flex-col">
      <router-view />
    </div>

    <!-- Condition 2: Auth Routes (Login / Register without full customer header) -->
    <div v-else-if="isAuthRoute" class="storefront flex-1 flex flex-col">
      <CustomerNavbar />
      <main class="flex-1">
        <router-view />
      </main>
      <CustomerFooter />
    </div>

    <!-- Condition 3: Customer Storefront Routes -->
    <div v-else class="storefront flex-1 flex flex-col">
      <!-- Top Customer Navigation -->
      <CustomerNavbar />

      <!-- Main Storefront Content -->
      <main class="flex-1">
        <router-view />
      </main>

      <!-- Customer Footer -->
      <CustomerFooter />

      <!-- Slide-over interactive Shopping Bag Drawer -->
      <CartDrawer />

      <!-- Floating back-to-top button for long product listings -->
      <ScrollToTop />
    </div>
  </div>
</template>


<script>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import CustomerNavbar from './components/includes/CustomerNavbar.vue';
import CustomerFooter from './components/includes/CustomerFooter.vue';
import CartDrawer from './components/includes/CartDrawer.vue';
import ScrollToTop from './components/includes/ScrollToTop.vue';

export default {
  name: 'App',
  components: {
    CustomerNavbar,
    CustomerFooter,
    CartDrawer,
    ScrollToTop
  },
  setup() {
    const route = useRoute();
    const store = useStore();

    const isAdminRoute = computed(() => route.path.startsWith('/admin'));
    const isAuthRoute = computed(() => route.path === '/login' || route.path === '/register');

    onMounted(async () => {
      store.dispatch('products/fetchProducts');
      store.dispatch('products/fetchCategories');

      await store.dispatch('auth/initAuth');
      if (store.getters['auth/isAuthenticated']) {
        store.dispatch('cart/fetchCart');
        store.dispatch('wishlist/fetchWishlist');
      }
    });

    return {
      isAdminRoute,
      isAuthRoute
    };
  }
};
</script>
