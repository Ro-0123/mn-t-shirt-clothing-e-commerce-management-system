<template>
  <div class="space-y-6">
    
    <!-- Page Header / Breadcrumb -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-display text-[var(--text)]">E-Commerce Management Dashboard</h1>
        <p class="text-xs text-[var(--text-muted)] mt-0.5">AdminLTE 3.2 Backoffice • Real-time sales, inventory, and order dispatch</p>
      </div>

      <div class="flex items-center gap-3">
        <!-- Sync DummyJSON button -->
        <button
          @click="syncDummy"
          class="px-3.5 py-2 bg-[var(--surface)] hover:bg-[var(--bg-alt)] text-[var(--text)] border border-[var(--border)] rounded-sm font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
        >
          <i class="fa-solid fa-rotate text-[var(--accent)]"></i>
          <span>Sync DummyJSON API</span>
        </button>

        <router-link
          to="/admin/products"
          class="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-sm font-bold text-xs flex items-center gap-2 transition-colors"
        >
          <i class="fa-solid fa-plus"></i>
          <span>Add New Product</span>
        </router-link>
      </div>
    </div>

    <!-- AdminLTE 3 Info Boxes (4 Metric Cards) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

      <!-- Metric 1: Total Revenue -->
      <div class="bg-[var(--surface)] rounded-sm border border-[var(--border)] p-5 flex items-center justify-between">
        <div class="space-y-1">
          <span class="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Total Sales</span>
          <p class="text-2xl font-display text-[var(--text)]">${{ metrics.totalRevenue?.toFixed(2) || '0.00' }}</p>
          <span class="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
            <i class="fa-solid fa-arrow-trend-up"></i> +18.4% from last month
          </span>
        </div>
        <div class="w-12 h-12 rounded-sm bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-xl flex-shrink-0">
          <i class="fa-solid fa-dollar-sign"></i>
        </div>
      </div>

      <!-- Metric 2: Total Orders -->
      <div class="bg-[var(--surface)] rounded-sm border border-[var(--border)] p-5 flex items-center justify-between">
        <div class="space-y-1">
          <span class="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Orders Processed</span>
          <p class="text-2xl font-display text-[var(--text)]">{{ metrics.totalOrdersCount || 0 }}</p>
          <span class="text-[11px] font-semibold text-[var(--accent)] flex items-center gap-1">
            <i class="fa-solid fa-clock"></i> {{ pendingOrdersCount }} pending fulfillment
          </span>
        </div>
        <div class="w-12 h-12 rounded-sm bg-[var(--accent-soft)] border border-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center text-xl flex-shrink-0">
          <i class="fa-solid fa-cart-shopping"></i>
        </div>
      </div>

      <!-- Metric 3: Active Products -->
      <div class="bg-[var(--surface)] rounded-sm border border-[var(--border)] p-5 flex items-center justify-between">
        <div class="space-y-1">
          <span class="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">T-Shirt Catalog</span>
          <p class="text-2xl font-display text-[var(--text)]">{{ products.length }}</p>
          <span class="text-[11px] font-semibold text-purple-700 flex items-center gap-1">
            <i class="fa-solid fa-tags"></i> {{ categories.length }} categories active
          </span>
        </div>
        <div class="w-12 h-12 rounded-sm bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center text-xl flex-shrink-0">
          <i class="fa-solid fa-shirt"></i>
        </div>
      </div>

      <!-- Metric 4: Low Stock Alert -->
      <div class="bg-[var(--surface)] rounded-sm border border-[var(--border)] p-5 flex items-center justify-between">
        <div class="space-y-1">
          <span class="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Low Stock SKUs</span>
          <p class="text-2xl font-display" :class="lowStockCount > 0 ? 'text-amber-700' : 'text-[var(--text)]'">
            {{ lowStockCount }}
          </p>
          <router-link to="/admin/stocks" class="text-[11px] font-bold text-amber-700 hover:underline flex items-center gap-1">
            <i class="fa-solid fa-triangle-exclamation"></i> Action required
          </router-link>
        </div>
        <div class="w-12 h-12 rounded-sm bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center text-xl flex-shrink-0">
          <i class="fa-solid fa-boxes-stacked"></i>
        </div>
      </div>

    </div>

    <!-- Main Grid: Recent Orders & Stock Watchlist -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

      <!-- Recent Orders Table (8 cols) -->
      <div class="lg:col-span-8 bg-[var(--surface)] rounded-sm border border-[var(--border)] overflow-hidden">
        <div class="p-4 sm:p-5 border-b border-[var(--border)] flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-clipboard-list text-[var(--accent)]"></i>
            <h2 class="font-bold text-sm text-[var(--text)]">Recent Customer Orders</h2>
          </div>
          <router-link to="/admin/orders" class="text-xs text-[var(--accent)] hover:underline font-bold">
            View All Orders
          </router-link>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-[var(--border)] text-[var(--text-muted)] uppercase tracking-wider text-[10px] bg-[var(--bg-alt)]">
                <th class="py-3 px-4 font-bold">Order ID</th>
                <th class="py-3 px-4 font-bold">Customer</th>
                <th class="py-3 px-4 font-bold">Garments</th>
                <th class="py-3 px-4 font-bold">Total</th>
                <th class="py-3 px-4 font-bold">Status</th>
                <th class="py-3 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--border)]">
              <tr v-for="order in recentOrders" :key="order.id" class="hover:bg-[var(--bg-alt)] transition-colors">
                <td class="py-3 px-4 font-mono font-bold text-[var(--accent)]">{{ order.id }}</td>
                <td class="py-3 px-4">
                  <p class="font-bold text-[var(--text)]">{{ order.customerName }}</p>
                  <span class="text-[10px] text-[var(--text-muted)]">{{ order.shippingAddress.city }}</span>
                </td>
                <td class="py-3 px-4 text-[var(--text)]">
                  {{ order.items.length }} items
                </td>
                <td class="py-3 px-4 font-bold text-[var(--text)]">${{ order.total.toFixed(2) }}</td>
                <td class="py-3 px-4">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" :class="getStatusBadgeClass(order.orderStatus)">
                    {{ order.orderStatus }}
                  </span>
                </td>
                <td class="py-3 px-4 text-right">
                  <router-link
                    to="/admin/orders"
                    class="px-2.5 py-1 rounded-sm bg-[var(--bg-alt)] hover:bg-[var(--border)] text-[var(--text)] font-semibold text-[11px] transition-colors border border-[var(--border)]"
                  >
                    Manage
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Quick Inventory Alert Watchlist (4 cols) -->
      <div class="lg:col-span-4 bg-[var(--surface)] rounded-sm border border-[var(--border)] p-5 space-y-4">
        <div class="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-triangle-exclamation text-amber-700"></i>
            <h2 class="font-bold text-sm text-[var(--text)]">Inventory Alerts</h2>
          </div>
          <router-link to="/admin/stocks" class="text-xs text-[var(--accent)] hover:underline font-bold">
            Restock
          </router-link>
        </div>

        <div class="space-y-3">
          <div
            v-for="p in lowStockProducts.slice(0, 5)"
            :key="p.id"
            class="p-3 rounded-sm bg-[var(--bg-alt)] border border-[var(--border)] flex items-center justify-between gap-3 text-xs"
          >
            <img :src="p.images[0]" class="w-10 h-10 rounded-sm object-cover bg-[var(--bg-alt)] flex-shrink-0" />
            <div class="flex-1 min-w-0">
              <h4 class="font-bold text-[var(--text)] truncate">{{ p.name }}</h4>
              <p class="text-[11px] text-[var(--text-muted)]">SKU: {{ p.sku }}</p>
            </div>
            <div class="text-right">
              <span class="px-2 py-0.5 rounded font-black text-[11px] bg-amber-50 border border-amber-200 text-amber-700">
                {{ p.stock }} left
              </span>
            </div>
          </div>

          <div v-if="lowStockProducts.length === 0" class="py-8 text-center text-[var(--text-muted)] text-xs">
            <i class="fa-solid fa-circle-check text-emerald-600 text-lg block mb-1"></i>
            All inventory levels are healthy!
          </div>
        </div>

        <div class="pt-2">
          <button
            @click="quickRestockAll"
            class="w-full py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-sm font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <i class="fa-solid fa-dolly"></i>
            <span>Quick Reorder Low Stock</span>
          </button>
        </div>
      </div>

    </div>

    <!-- Quick Operations Ribbon -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

      <!-- Card 1: Suppliers summary -->
      <div class="bg-[var(--surface)] rounded-sm border border-[var(--border)] p-5 space-y-3">
        <div class="flex items-center justify-between">
          <span class="font-bold text-xs text-[var(--text)] uppercase tracking-wider">Garment Suppliers</span>
          <router-link to="/admin/suppliers" class="text-xs text-[var(--accent)] hover:underline font-bold">Manage</router-link>
        </div>
        <p class="text-xs text-[var(--text-muted)]">
          Connected to <strong class="text-[var(--text)]">{{ suppliers.length }} verified fabric mills</strong> in Phnom Penh and Kampong Cham.
        </p>
        <div class="flex gap-2">
          <span v-for="s in suppliers.slice(0, 2)" :key="s.id" class="px-2 py-1 bg-[var(--bg-alt)] border border-[var(--border)] text-[var(--text)] rounded-sm text-[10px] font-semibold truncate">
            {{ s.name }}
          </span>
        </div>
      </div>

      <!-- Card 2: Deliveries summary -->
      <div class="bg-[var(--surface)] rounded-sm border border-[var(--border)] p-5 space-y-3">
        <div class="flex items-center justify-between">
          <span class="font-bold text-xs text-[var(--text)] uppercase tracking-wider">Delivery Fleet</span>
          <router-link to="/admin/deliveries" class="text-xs text-[var(--accent)] hover:underline font-bold">Track</router-link>
        </div>
        <p class="text-xs text-[var(--text-muted)]">
          MN Express Dispatch & J&T active with <strong class="text-[var(--text)]">98.6% on-time delivery rate</strong>.
        </p>
        <router-link to="/admin/deliveries" class="inline-block text-xs text-[var(--accent)] font-bold hover:underline">
          View Dispatch Queue &rarr;
        </router-link>
      </div>

      <!-- Card 3: User Role Management -->
      <div class="bg-[var(--surface)] rounded-sm border border-[var(--border)] p-5 space-y-3">
        <div class="flex items-center justify-between">
          <span class="font-bold text-xs text-[var(--text)] uppercase tracking-wider">Access Control</span>
          <router-link to="/admin/users" class="text-xs text-[var(--accent)] hover:underline font-bold">Users</router-link>
        </div>
        <p class="text-xs text-[var(--text-muted)]">
          Granular permission matrix for Admins, Warehouse Staff, and Storefront Customers.
        </p>
        <div class="flex items-center gap-2 text-xs font-semibold">
          <span class="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700">Admin</span>
          <span class="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700">Staff</span>
          <span class="px-2 py-0.5 rounded bg-[var(--accent-soft)] border border-[var(--accent)]/20 text-[var(--accent)]">Customer</span>
        </div>
      </div>

    </div>

  </div>
</template>

<script>
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { SuccessToast } from '@/functions/sweetalert';

export default {
  name: 'AdminDashboard',
  setup() {
    const store = useStore();

    const metrics = computed(() => store.getters['admin/analyticsData'] || {});
    const products = computed(() => store.getters['products/allProducts']);
    const categories = computed(() => store.getters['products/allCategories']);
    const lowStockCount = computed(() => store.getters['admin/lowStockCount']);
    const lowStockProducts = computed(() => products.value.filter(product => product.stock <= product.minStockLevel));
    const suppliers = computed(() => store.getters['admin/suppliersList'] || []);
    const recentOrders = computed(() => (store.getters['orders/allOrders'] || []).slice(0, 5));
    const pendingOrdersCount = computed(() => store.getters['orders/pendingOrdersCount']);

    onMounted(() => {
      store.dispatch('admin/fetchAnalytics');
      store.dispatch('products/fetchProducts');
      store.dispatch('products/fetchCategories');
      store.dispatch('admin/fetchSuppliers');
      store.dispatch('orders/fetchOrders');
    });

    const syncDummy = () => {
      store.dispatch('admin/syncDummyJson');
    };

    const quickRestockAll = async () => {
      for (const p of lowStockProducts.value) {
        await store.dispatch('admin/updateStock', {
          productId: p.id,
          quantity: 25,
          operation: 'add'
        });
      }
      SuccessToast('Restocked', 'Low stock items boosted by +25 units each.');
      store.dispatch('products/fetchProducts');
    };

    const getStatusBadgeClass = (status) => {
      switch (status) {
        case 'Delivered': return 'bg-emerald-50 border border-emerald-200 text-emerald-700';
        case 'Shipped': return 'bg-[var(--accent-soft)] border border-[var(--accent)]/20 text-[var(--accent)]';
        case 'Processing': return 'bg-purple-50 border border-purple-200 text-purple-700';
        case 'Cancelled': return 'bg-rose-50 border border-rose-200 text-rose-700';
        default: return 'bg-amber-50 border border-amber-200 text-amber-700';
      }
    };

    return {
      metrics,
      products,
      categories,
      lowStockCount,
      lowStockProducts,
      suppliers,
      recentOrders,
      pendingOrdersCount,
      syncDummy,
      quickRestockAll,
      getStatusBadgeClass
    };
  }
};
</script>
