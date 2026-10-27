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
      <!-- Low stock alerts: click to see which products are running out -->
      <div ref="bellRef" class="relative">
        <button
          type="button"
          @click="showAlerts = !showAlerts"
          :aria-expanded="showAlerts"
          class="relative p-2 text-[var(--text-muted)] hover:text-amber-600 rounded-sm hover:bg-[var(--bg-alt)] transition-colors cursor-pointer"
          title="Stock Alerts"
        >
          <i class="fa-solid fa-bell"></i>
          <span
            v-if="lowStockCount > 0"
            class="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-black rounded-full text-[9px] font-black flex items-center justify-center animate-bounce"
          >
            {{ lowStockCount }}
          </span>
        </button>

        <div
          v-if="showAlerts"
          class="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] bg-[var(--surface)] border border-[var(--border)] rounded-sm shadow-xl z-50 text-xs"
        >
          <div class="px-4 py-3 border-b border-[var(--border)] font-bold text-[var(--text)] flex items-center gap-2">
            <i class="fa-solid fa-triangle-exclamation text-amber-600"></i>
            <span>Low Stock Alerts ({{ lowStockCount }})</span>
          </div>

          <p v-if="lowStockProducts.length === 0" class="px-4 py-6 text-center text-[var(--text-muted)]">
            All products are above their safe minimum.
          </p>

          <ul v-else class="max-h-72 overflow-y-auto divide-y divide-[var(--border)]">
            <li v-for="p in lowStockProducts" :key="p.id" class="px-4 py-2.5 flex items-center gap-3">
              <img v-if="p.images?.[0]" :src="p.images[0]" :alt="p.name" class="w-8 h-8 rounded-sm object-cover border border-[var(--border)] flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <p class="font-bold text-[var(--text)] truncate">{{ p.name }}</p>
                <p class="text-[11px]" :class="Number(p.stock) === 0 ? 'text-rose-700 font-bold' : 'text-amber-700'">
                  {{ Number(p.stock) === 0 ? 'Out of stock' : `Only ${p.stock} left` }}
                  <span class="text-[var(--text-faint)] font-normal">&middot; min {{ p.minStockLevel }}</span>
                </p>
              </div>
            </li>
          </ul>

          <router-link
            to="/admin/stocks"
            @click="showAlerts = false"
            class="block px-4 py-2.5 border-t border-[var(--border)] text-center font-bold text-[var(--accent)] hover:bg-[var(--bg-alt)]"
          >
            Go to Stocks to restock
          </router-link>
        </div>
      </div>

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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'AdminNavbar',
  emits: ['toggle-sidebar', 'toggle-control-sidebar'],
  setup() {
    const store = useStore();

    const user = computed(() => store.getters['auth/currentUser']);
    const userRole = computed(() => store.getters['auth/userRole']);
    const lowStockCount = computed(() => store.getters['admin/lowStockCount']);
    // Emptiest first, so out-of-stock items are at the top
    const lowStockProducts = computed(() =>
      [...store.getters['admin/lowStockProducts']].sort((a, b) => Number(a.stock) - Number(b.stock))
    );

    const showAlerts = ref(false);
    const bellRef = ref(null);
    const closeOnOutsideClick = (e) => {
      if (showAlerts.value && bellRef.value && !bellRef.value.contains(e.target)) {
        showAlerts.value = false;
      }
    };
    onMounted(() => document.addEventListener('click', closeOnOutsideClick));
    onUnmounted(() => document.removeEventListener('click', closeOnOutsideClick));

    return {
      user,
      userRole,
      lowStockCount,
      lowStockProducts,
      showAlerts,
      bellRef
    };
  }
};
</script>
