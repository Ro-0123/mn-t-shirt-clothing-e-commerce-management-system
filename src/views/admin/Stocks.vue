<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-display text-[var(--text)]">Manage Inventory & Stocks</h1>
        <p class="text-xs text-[var(--text-muted)] mt-0.5">Track warehouse bin levels, restock batches, and prevent out-of-stock events</p>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="openBulkRestockModal"
          class="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-sm font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
        >
          <i class="fa-solid fa-boxes-packing"></i>
          <span>Batch Restock (+20 to all)</span>
        </button>
      </div>
    </div>

    <!-- Stock KPI summary -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div class="bg-[var(--surface)] rounded-sm border border-[var(--border)] p-5 space-y-1">
        <span class="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Total Warehouse Units</span>
        <p class="text-2xl font-display text-[var(--text)]">{{ totalUnits }} units</p>
        <span class="text-[11px] text-[var(--text-muted)]">Distributed across 8 SKUs</span>
      </div>

      <div class="bg-[var(--surface)] rounded-sm border border-[var(--border)] p-5 space-y-1">
        <span class="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Low Stock Warnings</span>
        <p class="text-2xl font-display text-amber-700">{{ lowStockProducts.length }} items</p>
        <span class="text-[11px] text-amber-700 font-semibold">Below minimum safe threshold</span>
      </div>

      <div class="bg-[var(--surface)] rounded-sm border border-[var(--border)] p-5 space-y-1">
        <span class="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Inventory Value</span>
        <p class="text-2xl font-display text-emerald-700">${{ inventoryValue.toFixed(2) }}</p>
        <span class="text-[11px] text-[var(--text-muted)]">Retail valuation</span>
      </div>
    </div>

    <!-- Stocks Management Table -->
    <div class="bg-[var(--surface)] rounded-sm border border-[var(--border)] overflow-hidden">
      <div class="p-4 border-b border-[var(--border)] bg-[var(--bg-alt)] flex items-center justify-between text-xs font-bold text-[var(--text)]">
        <span>Garment Stock Roster</span>
        <div class="flex items-center gap-2">
          <input
            type="text"
            v-model="search"
            placeholder="Search SKU or product..."
            class="px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-sm text-xs font-normal text-[var(--text)] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>
      </div>

      <div class="overflow-auto max-h-[65vh]">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="sticky top-0 z-10">
            <tr class="border-b border-[var(--border)] text-[var(--text-muted)] uppercase tracking-wider text-[10px] bg-[var(--surface)]">
              <th class="py-3 px-4 font-bold">Product</th>
              <th class="py-3 px-4 font-bold">SKU</th>
              <th class="py-3 px-4 font-bold">Safe Min</th>
              <th class="py-3 px-4 font-bold">Current Stock</th>
              <th class="py-3 px-4 font-bold">Status</th>
              <th class="py-3 px-4 font-bold text-right">Adjust Stock</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--border)]">
            <tr v-for="product in filteredProducts" :key="product.id" class="hover:bg-[var(--bg-alt)] transition-colors">
              <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <img
                    v-if="product.images?.[0]"
                    :src="product.images[0]"
                    :alt="product.name"
                    class="w-10 h-10 rounded-sm object-cover bg-[var(--bg-alt)] border border-[var(--border)]"
                  />
                  <div
                    v-else
                    class="w-10 h-10 rounded-sm bg-[var(--bg-alt)] border border-[var(--border)] flex items-center justify-center text-[var(--text-faint)]"
                    aria-hidden="true"
                  >
                    <i class="fa-solid fa-shirt"></i>
                  </div>
                  <span class="font-bold text-[var(--text)]">{{ product.name }}</span>
                </div>
              </td>

              <td class="py-3 px-4 font-mono text-[var(--text-muted)] font-semibold">{{ product.sku }}</td>

              <td class="py-3 px-4 text-[var(--text-muted)] font-semibold">{{ product.minStockLevel || 10 }} units</td>

              <td class="py-3 px-4">
                <span class="font-black text-sm text-[var(--text)]">{{ product.stock }}</span>
              </td>

              <td class="py-3 px-4">
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                  :class="product.stock <= (product.minStockLevel || 10) ? 'bg-amber-50 border border-amber-200 text-amber-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'"
                >
                  {{ product.stock <= (product.minStockLevel || 10) ? 'Low Stock' : 'Optimal' }}
                </span>
              </td>

              <!-- Stock buttons -->
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    @click="adjustStock(product.id, 5, 'add')"
                    class="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-sm font-bold text-xs transition-colors cursor-pointer"
                    title="Add 5 units"
                  >
                    +5
                  </button>
                  <button
                    @click="adjustStock(product.id, 20, 'add')"
                    class="px-2.5 py-1 bg-[var(--accent-soft)] hover:bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/20 rounded-sm font-bold text-xs transition-colors cursor-pointer"
                    title="Add 20 units"
                  >
                    +20
                  </button>
                  <button
                    @click="adjustStock(product.id, 1, 'subtract')"
                    :disabled="product.stock <= 0"
                    class="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 disabled:opacity-30 text-rose-700 border border-rose-200 rounded-sm font-bold text-xs transition-colors cursor-pointer"
                    title="Subtract 1 unit"
                  >
                    -1
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { SuccessToast } from '@/functions/sweetalert';

export default {
  name: 'AdminStocks',
  setup() {
    const store = useStore();
    const search = ref('');

    const products = computed(() => store.getters['products/allProducts']);
    const lowStockProducts = computed(() => store.getters['admin/lowStockProducts']);

    const totalUnits = computed(() => {
      return products.value.reduce((acc, p) => acc + (p.stock || 0), 0);
    });

    const inventoryValue = computed(() => {
      return products.value.reduce((acc, p) => acc + ((p.price || 0) * (p.stock || 0)), 0);
    });

    const filteredProducts = computed(() => {
      if (!search.value) return products.value;
      const q = search.value.toLowerCase();
      return products.value.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.sku.toLowerCase().includes(q)
      );
    });

    onMounted(() => {
      store.dispatch('products/fetchProducts');
    });

    const adjustStock = async (productId, quantity, operation) => {
      await store.dispatch('admin/updateStock', { productId, quantity, operation });
      store.dispatch('products/fetchProducts');
      SuccessToast('Stock Updated', `Inventory adjusted (${operation === 'add' ? '+' : '-'}${quantity})`);
    };

    const openBulkRestockModal = async () => {
      for (const p of products.value) {
        await store.dispatch('admin/updateStock', {
          productId: p.id,
          quantity: 20,
          operation: 'add'
        });
      }
      store.dispatch('products/fetchProducts');
      SuccessToast('Batch Restock Complete', '+20 units added to all clothing items.');
    };

    return {
      search,
      products,
      lowStockProducts,
      totalUnits,
      inventoryValue,
      filteredProducts,
      adjustStock,
      openBulkRestockModal
    };
  }
};
</script>
