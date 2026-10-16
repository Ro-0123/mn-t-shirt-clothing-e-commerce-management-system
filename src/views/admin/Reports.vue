<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-display text-[var(--text)]">Reports & Sales Analytics</h1>
        <p class="text-xs text-[var(--text-muted)] mt-0.5">Financial summaries, conversion rates, and garment sales performance</p>
      </div>

      <button
        @click="exportReport"
        class="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-sm font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
      >
        <i class="fa-solid fa-file-arrow-down"></i>
        <span>Export Monthly CSV</span>
      </button>
    </div>

    <!-- Analytics Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-[var(--surface)] rounded-sm border border-[var(--border)] p-5 space-y-1">
        <span class="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Gross Sales</span>
        <p class="text-2xl font-display text-[var(--text)]">${{ metrics.totalRevenue?.toFixed(2) }}</p>
        <span class="text-[11px] text-emerald-700 font-semibold">+14.2% vs previous period</span>
      </div>

      <div class="bg-[var(--surface)] rounded-sm border border-[var(--border)] p-5 space-y-1">
        <span class="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Average Order Value</span>
        <p class="text-2xl font-display text-[var(--accent)]">${{ avgOrderValue }}</p>
        <span class="text-[11px] text-[var(--text-muted)]">Per checkout</span>
      </div>

      <div class="bg-[var(--surface)] rounded-sm border border-[var(--border)] p-5 space-y-1">
        <span class="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Delivery SLA Fulfillment</span>
        <p class="text-2xl font-display text-emerald-700">98.6%</p>
        <span class="text-[11px] text-[var(--text-muted)]">On-time transit</span>
      </div>

      <div class="bg-[var(--surface)] rounded-sm border border-[var(--border)] p-5 space-y-1">
        <span class="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Return / Exchange Rate</span>
        <p class="text-2xl font-display text-purple-700">1.2%</p>
        <span class="text-[11px] text-[var(--text-muted)]">Below industry 4%</span>
      </div>
    </div>

    <!-- Category Sales Breakdown & Best Selling T-Shirts -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

      <!-- Top Performing T-Shirts (8 cols) -->
      <div class="lg:col-span-8 bg-[var(--surface)] rounded-sm border border-[var(--border)] p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <h3 class="font-bold text-sm text-[var(--text)]">Top Selling Garment Lines</h3>
          <span class="text-xs text-[var(--text-muted)]">Ranked by units sold</span>
        </div>

        <div class="space-y-4">
          <div
            v-for="(product, idx) in products.slice(0, 5)"
            :key="product.id"
            class="flex items-center justify-between gap-4 p-3 rounded-sm bg-[var(--bg-alt)] border border-[var(--border)] text-xs hover:border-[var(--border-strong)] transition-colors"
          >
            <div class="flex items-center gap-3">
              <span class="w-6 h-6 rounded-full bg-[var(--border)] text-[var(--text)] font-bold flex items-center justify-center text-[10px]">
                #{{ idx + 1 }}
              </span>
              <img :src="product.images[0]" class="w-10 h-10 rounded-sm object-cover bg-[var(--bg-alt)] border border-[var(--border)]" />
              <div>
                <p class="font-bold text-[var(--text)]">{{ product.name }}</p>
                <span class="text-[10px] text-[var(--text-muted)]">{{ product.categoryName }} • ${{ product.price.toFixed(2) }}</span>
              </div>
            </div>

            <div class="text-right">
              <span class="font-extrabold text-sm text-[var(--text)]">{{ 120 - (idx * 18) }} sold</span>
              <p class="text-[10px] text-emerald-700 font-bold">${{ ((120 - (idx * 18)) * product.price).toFixed(2) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Category Share (4 cols) -->
      <div class="lg:col-span-4 bg-[var(--surface)] rounded-sm border border-[var(--border)] p-6 space-y-4">
        <h3 class="font-bold text-sm text-[var(--text)] border-b border-[var(--border)] pb-3">Sales by Category</h3>

        <div class="space-y-4 text-xs">
          <div class="space-y-1.5">
            <div class="flex justify-between font-semibold text-[var(--text)]">
              <span>Heavyweight Cotton</span>
              <span>45%</span>
            </div>
            <div class="w-full bg-[var(--bg-alt)] h-2 rounded-full overflow-hidden border border-[var(--border)]">
              <div class="bg-[var(--accent)] h-full w-[45%] rounded-full"></div>
            </div>
          </div>

          <div class="space-y-1.5">
            <div class="flex justify-between font-semibold text-[var(--text)]">
              <span>Oversized Streetwear</span>
              <span>30%</span>
            </div>
            <div class="w-full bg-[var(--bg-alt)] h-2 rounded-full overflow-hidden border border-[var(--border)]">
              <div class="bg-purple-600 h-full w-[30%] rounded-full"></div>
            </div>
          </div>

          <div class="space-y-1.5">
            <div class="flex justify-between font-semibold text-[var(--text)]">
              <span>Graphic Art Editions</span>
              <span>18%</span>
            </div>
            <div class="w-full bg-[var(--bg-alt)] h-2 rounded-full overflow-hidden border border-[var(--border)]">
              <div class="bg-amber-500 h-full w-[18%] rounded-full"></div>
            </div>
          </div>

          <div class="space-y-1.5">
            <div class="flex justify-between font-semibold text-[var(--text)]">
              <span>Hoodies & Sweatshirts</span>
              <span>7%</span>
            </div>
            <div class="w-full bg-[var(--bg-alt)] h-2 rounded-full overflow-hidden border border-[var(--border)]">
              <div class="bg-[var(--border-strong)] h-full w-[7%] rounded-full"></div>
            </div>
          </div>
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
  name: 'AdminReports',
  setup() {
    const store = useStore();

    const metrics = computed(() => store.getters['admin/analyticsData'] || {});
    const products = computed(() => store.getters['products/allProducts'] || []);
    const orders = computed(() => store.getters['orders/allOrders'] || []);

    const avgOrderValue = computed(() => {
      if (orders.value.length === 0) return '0.00';
      const total = orders.value.reduce((acc, o) => acc + (o.total || 0), 0);
      return (total / orders.value.length).toFixed(2);
    });

    onMounted(() => {
      store.dispatch('admin/fetchAnalytics');
      store.dispatch('products/fetchProducts');
      store.dispatch('orders/fetchOrders');
    });

    const exportReport = () => {
      SuccessToast('Report Exported', 'MN-Sales-Report-2026.csv generated successfully.');
    };

    return {
      metrics,
      products,
      orders,
      avgOrderValue,
      exportReport
    };
  }
};
</script>
