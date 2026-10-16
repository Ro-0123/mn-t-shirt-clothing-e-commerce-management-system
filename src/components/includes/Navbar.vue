<template>
  <!-- AdminLTE 3 Top Navbar -->
  <nav class="bg-[var(--surface)] border-b border-[var(--border)] px-4 py-2.5 flex items-center justify-between sticky top-0 z-30">
    <!-- Left navbar links -->
    <div class="flex items-center gap-3">
      <button
        @click="$emit('toggle-sidebar')"
        class="p-2 text-[var(--text-muted)] hover:text-[var(--text)] rounded-sm hover:bg-[var(--bg-alt)] transition-colors cursor-pointer"
        title="Toggle Sidebar"
      >
        <i class="fa-solid fa-bars"></i>
      </button>

      <div class="hidden sm:flex items-center gap-4 text-xs font-medium text-[var(--text-muted)]">
        <router-link to="/admin/dashboard" class="hover:text-[var(--accent)] transition-colors" active-class="text-[var(--accent)] font-bold">
          <i class="fa-solid fa-gauge-high mr-1"></i> Dashboard
        </router-link>
        <router-link to="/admin/products" class="hover:text-[var(--accent)] transition-colors" active-class="text-[var(--accent)] font-bold">
          <i class="fa-solid fa-shirt mr-1"></i> Products
        </router-link>
        <router-link to="/admin/orders" class="hover:text-[var(--accent)] transition-colors" active-class="text-[var(--accent)] font-bold">
          <i class="fa-solid fa-clipboard-list mr-1"></i> Orders
        </router-link>
        <router-link to="/" class="text-[var(--accent)] hover:text-[var(--accent-hover)] font-semibold transition-colors flex items-center gap-1">
          <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i> View Store
        </router-link>
      </div>
    </div>

    <!-- Right navbar links -->
    <div class="flex items-center gap-3">
      <!-- Sync with DummyJSON Button -->
      <button
        @click="syncDummyJson"
        class="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[var(--text)] bg-[var(--bg-alt)] hover:bg-[var(--border)] border border-[var(--border)] rounded-sm transition-colors cursor-pointer"
        title="Fetch sample shirts from DummyJSON API"
      >
        <i class="fa-solid fa-cloud-arrow-down text-[var(--accent)]"></i>
        <span>Sync DummyJSON API</span>
      </button>

      <!-- Low stock alert notification -->
      <router-link
        to="/admin/stocks"
        class="relative p-2 text-[var(--text-muted)] hover:text-amber-600 rounded-sm hover:bg-[var(--bg-alt)] transition-colors"
        title="Stock Alerts"
      >
        <i class="fa-solid fa-bell"></i>
        <span
          v-if="lowStockCount > 0"
          class="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-black rounded-full text-[9px] font-black flex items-center justify-center animate-bounce"
        >
          {{ lowStockCount }}
        </span>
      </router-link>

      <!-- Toggle Control Sidebar (Settings panel) -->
      <button
        @click="$emit('toggle-control-sidebar')"
        class="p-2 text-[var(--text-muted)] hover:text-[var(--text)] rounded-sm hover:bg-[var(--bg-alt)] transition-colors cursor-pointer"
        title="Admin Control Panel"
      >
        <i class="fa-solid fa-sliders"></i>
      </button>

      <!-- User Profile Dropdown -->
      <div class="flex items-center gap-2 pl-2 border-l border-[var(--border)]">
        <img
          :src="user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80'"
          class="w-7 h-7 rounded-full object-cover ring-1 ring-[var(--border)]"
          alt="Avatar"
        />
        <div class="hidden lg:block text-left">
          <p class="text-xs font-bold text-[var(--text)] leading-none">{{ user?.name }}</p>
          <span class="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">{{ userRole }}</span>
        </div>
      </div>
    </div>
  </nav>
</template>


<script>
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'AdminNavbar',
  emits: ['toggle-sidebar', 'toggle-control-sidebar'],
  setup() {
    const store = useStore();

    const user = computed(() => store.getters['auth/currentUser']);
    const userRole = computed(() => store.getters['auth/userRole']);
    const lowStockCount = computed(() => store.getters['admin/lowStockCount']);

    const syncDummyJson = () => {
      store.dispatch('admin/syncDummyJson');
    };

    return {
      user,
      userRole,
      lowStockCount,
      syncDummyJson
    };
  }
};
</script>
