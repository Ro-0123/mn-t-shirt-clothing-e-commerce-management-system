<template>
  <!-- AdminLTE 3 Main Sidebar -->
  <aside
    class="bg-[var(--surface)] text-[var(--text-muted)] w-64 min-h-screen flex flex-col flex-shrink-0 border-r border-[var(--border)] transition-all duration-300 z-40"
    :class="{ '-ml-64 lg:ml-0': isCollapsed }"
  >
    <!-- Brand Logo -->
    <div class="h-16 flex items-center gap-3 px-5 border-b border-[var(--border)]">
      <div class="w-8 h-8 bg-[var(--text)] text-white flex items-center justify-center font-display text-sm">
        MN
      </div>
      <div>
        <span class="font-bold text-sm text-[var(--text)] tracking-tight block">MN T-SHIRT</span>
        <span class="text-[10px] text-[var(--accent)] font-semibold tracking-wider uppercase block">Management System</span>
      </div>
    </div>

    <!-- User Panel -->
    <div class="p-4 border-b border-[var(--border)] flex items-center gap-3 bg-[var(--bg-alt)]">
      <img
        :src="user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80'"
        alt="User Avatar"
        class="w-10 h-10 rounded-full object-cover ring-2 ring-[var(--accent-soft)]"
      />
      <div class="min-w-0 flex-1">
        <p class="text-xs font-bold text-[var(--text)] truncate leading-tight">{{ user?.name }}</p>
        <div class="flex items-center gap-1.5 mt-0.5">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span class="text-[11px] text-[var(--text-muted)] font-medium capitalize">{{ userRole }}</span>
        </div>
      </div>
    </div>

    <!-- Sidebar Menu Navigation -->
    <div class="flex-1 overflow-y-auto py-4 px-3 space-y-6">
      <!-- Main Group -->
      <div class="space-y-1">
        <p class="px-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-faint)]">Core Modules</p>

        <router-link
          to="/admin/dashboard"
          class="flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-medium transition-colors"
          :class="$route.path === '/admin/dashboard' ? 'bg-[var(--accent)] text-white font-semibold' : 'text-[var(--text-muted)] hover:bg-[var(--bg-alt)] hover:text-[var(--text)]'"
        >
          <i class="fa-solid fa-gauge-high w-4 text-center"></i>
          <span>Dashboard</span>
        </router-link>

        <router-link
          to="/admin/products"
          class="flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-medium transition-colors"
          :class="$route.path === '/admin/products' ? 'bg-[var(--accent)] text-white font-semibold' : 'text-[var(--text-muted)] hover:bg-[var(--bg-alt)] hover:text-[var(--text)]'"
        >
          <i class="fa-solid fa-shirt w-4 text-center"></i>
          <span>Manage Products</span>
        </router-link>

        <router-link
          to="/admin/stocks"
          class="flex items-center justify-between px-3 py-2.5 rounded-sm text-xs font-medium transition-colors"
          :class="$route.path === '/admin/stocks' ? 'bg-[var(--accent)] text-white font-semibold' : 'text-[var(--text-muted)] hover:bg-[var(--bg-alt)] hover:text-[var(--text)]'"
        >
          <div class="flex items-center gap-3">
            <i class="fa-solid fa-boxes-stacked w-4 text-center"></i>
            <span>Manage Stocks</span>
          </div>
          <span
            v-if="lowStockCount > 0"
            class="px-1.5 py-0.5 rounded-sm text-[10px] font-bold bg-amber-500 text-black"
          >
            {{ lowStockCount }} low
          </span>
        </router-link>

        <router-link
          to="/admin/categories"
          class="flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-medium transition-colors"
          :class="$route.path === '/admin/categories' ? 'bg-[var(--accent)] text-white font-semibold' : 'text-[var(--text-muted)] hover:bg-[var(--bg-alt)] hover:text-[var(--text)]'"
        >
          <i class="fa-solid fa-tags w-4 text-center"></i>
          <span>Manage Categories</span>
        </router-link>

        <router-link
          to="/admin/suppliers"
          class="flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-medium transition-colors"
          :class="$route.path === '/admin/suppliers' ? 'bg-[var(--accent)] text-white font-semibold' : 'text-[var(--text-muted)] hover:bg-[var(--bg-alt)] hover:text-[var(--text)]'"
        >
          <i class="fa-solid fa-truck-field w-4 text-center"></i>
          <span>Manage Suppliers</span>
        </router-link>
      </div>

      <!-- Fulfillment Group -->
      <div class="space-y-1">
        <p class="px-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-faint)]">Sales & Fulfillment</p>

        <router-link
          to="/admin/orders"
          class="flex items-center justify-between px-3 py-2.5 rounded-sm text-xs font-medium transition-colors"
          :class="$route.path === '/admin/orders' ? 'bg-[var(--accent)] text-white font-semibold' : 'text-[var(--text-muted)] hover:bg-[var(--bg-alt)] hover:text-[var(--text)]'"
        >
          <div class="flex items-center gap-3">
            <i class="fa-solid fa-cart-flatbed w-4 text-center"></i>
            <span>Manage Orders</span>
          </div>
          <span class="px-1.5 py-0.5 rounded-sm text-[10px] font-bold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/20">
            {{ pendingOrdersCount }} pending
          </span>
        </router-link>

        <router-link
          to="/admin/deliveries"
          class="flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-medium transition-colors"
          :class="$route.path === '/admin/deliveries' ? 'bg-[var(--accent)] text-white font-semibold' : 'text-[var(--text-muted)] hover:bg-[var(--bg-alt)] hover:text-[var(--text)]'"
        >
          <i class="fa-solid fa-route w-4 text-center"></i>
          <span>Manage Deliveries</span>
        </router-link>
      </div>

      <!-- Administration Group -->
      <div class="space-y-1">
        <p class="px-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-faint)]">Administration</p>

        <!-- Admin Only: Users -->
        <router-link
          v-if="userRole === 'Admin'"
          to="/admin/users"
          class="flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-medium transition-colors"
          :class="$route.path === '/admin/users' ? 'bg-[var(--accent)] text-white font-semibold' : 'text-[var(--text-muted)] hover:bg-[var(--bg-alt)] hover:text-[var(--text)]'"
        >
          <i class="fa-solid fa-users-gear w-4 text-center"></i>
          <span>Manage Users</span>
        </router-link>

        <!-- Admin Only: Reports -->
        <router-link
          v-if="userRole === 'Admin'"
          to="/admin/reports"
          class="flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-medium transition-colors"
          :class="$route.path === '/admin/reports' ? 'bg-[var(--accent)] text-white font-semibold' : 'text-[var(--text-muted)] hover:bg-[var(--bg-alt)] hover:text-[var(--text)]'"
        >
          <i class="fa-solid fa-chart-line w-4 text-center"></i>
          <span>Reports & Analytics</span>
        </router-link>

        <router-link
          to="/admin/store-info"
          class="flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-medium transition-colors"
          :class="$route.path === '/admin/store-info' ? 'bg-[var(--accent)] text-white font-semibold' : 'text-[var(--text-muted)] hover:bg-[var(--bg-alt)] hover:text-[var(--text)]'"
        >
          <i class="fa-solid fa-gears w-4 text-center"></i>
          <span>Manage Store Info</span>
        </router-link>
      </div>
    </div>

    <!-- Sidebar Footer -->
    <div class="p-3 border-t border-[var(--border)]">
      <router-link
        to="/"
        class="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-sm bg-[var(--bg-alt)] hover:bg-[var(--border)] text-[var(--text)] text-xs font-semibold transition-colors border border-[var(--border)]"
      >
        <i class="fa-solid fa-store text-[var(--accent)]"></i>
        <span>Return to Storefront</span>
      </router-link>
    </div>
  </aside>
</template>


<script>
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'MainSidebar',
  props: {
    isCollapsed: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const store = useStore();

    const user = computed(() => store.getters['auth/currentUser']);
    const userRole = computed(() => store.getters['auth/userRole']);
    const lowStockCount = computed(() => store.getters['admin/lowStockCount']);
    const pendingOrdersCount = computed(() => store.getters['orders/pendingOrdersCount']);

    return {
      user,
      userRole,
      lowStockCount,
      pendingOrdersCount
    };
  }
};
</script>
