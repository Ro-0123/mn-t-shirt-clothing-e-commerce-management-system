<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-display text-[var(--text)]">Manage Inventory & Stocks</h1>
        <p class="text-xs text-[var(--text-muted)] mt-0.5">Type how many new units arrived and click Add. Stock goes down automatically when customers buy.</p>
      </div>
    </div>

    <!-- Stock KPI summary -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div class="bg-[var(--surface)] rounded-sm border border-[var(--border)] p-5 space-y-1">
        <span class="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Total Warehouse Units</span>
        <p class="text-2xl font-display text-[var(--text)]">{{ totalUnits }} units</p>
        <span class="text-[11px] text-[var(--text-muted)]">Across {{ products.length }} products</span>
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
              <th class="py-3 px-4 font-bold text-right">Add Stock</th>
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

              <!-- Add stock: admin types how many new units arrived.
                   Sales take stock out automatically when an order is placed. -->
              <td class="py-3 px-4 text-right">
                <form @submit.prevent="addStock(product)" class="flex items-center justify-end gap-1.5">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    v-model.number="addAmounts[product.id]"
                    placeholder="Qty"
                    :aria-label="`Units to add for ${product.name}`"
                    class="w-20 px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded-sm text-xs text-[var(--text)] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--accent)]"
                  />
                  <button
                    type="submit"
                    :disabled="!(addAmounts[product.id] > 0) || savingId === product.id"
                    class="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed text-emerald-700 border border-emerald-200 rounded-sm font-bold text-xs transition-colors cursor-pointer"
                  >
                    {{ savingId === product.id ? 'Saving…' : 'Add' }}
                  </button>
                </form>
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

    const addAmounts = ref({});
    const savingId = ref(null);

    const addStock = async (product) => {
      const qty = Math.floor(Number(addAmounts.value[product.id]));
      if (!(qty > 0)) return;
      savingId.value = product.id;
      try {
        await store.dispatch('admin/updateStock', { productId: product.id, quantity: qty, operation: 'add' });
        addAmounts.value[product.id] = null;
        SuccessToast('Stock Added', `+${qty} units added to ${product.name}`);
      } catch {
        // restockProduct already shows the error
      } finally {
        savingId.value = null;
      }
    };

    return {
      search,
      products,
      lowStockProducts,
      totalUnits,
      inventoryValue,
      filteredProducts,
      addAmounts,
      savingId,
      addStock
    };
  }
};
</script>
