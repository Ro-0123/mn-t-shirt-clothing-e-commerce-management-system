<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-display text-[var(--text)]">Manage Customer Orders</h1>
        <p class="text-xs text-[var(--text-muted)] mt-0.5">Fulfill incoming clothing orders, update delivery statuses, and assign tracking numbers</p>
      </div>
    </div>

    <!-- Orders Filter Tabs -->
    <div class="bg-[var(--surface)] rounded-sm border border-[var(--border)] p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        <button
          v-for="status in ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']"
          :key="status"
          @click="selectedStatus = status"
          :class="selectedStatus === status ? 'bg-[var(--accent)] text-white font-bold' : 'bg-[var(--bg-alt)] text-[var(--text-muted)] hover:bg-[var(--border)] border border-[var(--border)]'"
          class="px-3 py-1.5 rounded-sm transition-colors cursor-pointer"
        >
          {{ status }}
        </button>
      </div>

      <div class="text-[var(--text-muted)] font-medium">
        Showing <strong class="text-[var(--text)]">{{ filteredOrders.length }}</strong> orders
      </div>
    </div>

    <!-- Orders Table -->
    <div class="bg-[var(--surface)] rounded-sm border border-[var(--border)] overflow-hidden">
      <div class="overflow-auto max-h-[65vh]">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="sticky top-0 z-10">
            <tr class="border-b border-[var(--border)] text-[var(--text-muted)] uppercase tracking-wider text-[10px] bg-[var(--surface)]">
              <th class="py-3 px-4 font-bold">Order ID</th>
              <th class="py-3 px-4 font-bold">Customer & Phone</th>
              <th class="py-3 px-4 font-bold">Destination</th>
              <th class="py-3 px-4 font-bold">Courier</th>
              <th class="py-3 px-4 font-bold">Garments</th>
              <th class="py-3 px-4 font-bold">Total</th>
              <th class="py-3 px-4 font-bold">Payment</th>
              <th class="py-3 px-4 font-bold">Status</th>
              <th class="py-3 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--border)]">
            <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-[var(--bg-alt)] transition-colors">
              <td class="py-3.5 px-4 font-mono font-bold text-[var(--accent)]">
                {{ order.id }}
              </td>

              <td class="py-3.5 px-4">
                <p class="font-bold text-[var(--text)]">{{ order.customerName }}</p>
                <span class="text-[10px] text-[var(--text-muted)] font-mono">{{ order.customerPhone }}</span>
              </td>

              <td class="py-3.5 px-4 text-[var(--text)]">
                <p class="truncate max-w-[160px]">{{ order.shippingAddress.street }}</p>
                <span class="text-[10px] font-semibold text-[var(--text-muted)]">{{ order.shippingAddress.city }}</span>
              </td>

              <td class="py-3.5 px-4">
                <span class="px-2 py-0.5 rounded bg-[var(--bg-alt)] border border-[var(--border)] text-[var(--text)] text-[10px] font-semibold whitespace-nowrap">
                  <i class="fa-solid fa-truck-fast text-[var(--accent)] mr-1"></i>{{ order.carrier }}
                </span>
              </td>

              <td class="py-3.5 px-4">
                <!-- What exactly to pack: product, size, colour, quantity -->
                <ul class="space-y-0.5 min-w-[160px]">
                  <li v-for="(item, i) in order.items" :key="i" class="text-[11px] leading-snug">
                    <span class="font-semibold text-[var(--text)]">{{ item.quantity }}× {{ item.name }}</span>
                    <span class="text-[var(--text-muted)]">
                      &middot; {{ [item.size, item.color].filter(Boolean).join(' / ') || '—' }}
                    </span>
                  </li>
                </ul>
              </td>

              <td class="py-3.5 px-4 font-black text-[var(--text)]">
                ${{ order.total.toFixed(2) }}
              </td>

              <td class="py-3.5 px-4">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                  {{ order.paymentStatus || 'Paid' }}
                </span>
                <p class="text-[10px] text-[var(--text-faint)] mt-0.5">{{ order.paymentMethod }}</p>
              </td>

              <!-- Status Dropdown for instant staff editing -->
              <td class="py-3.5 px-4">
                <select
                  :value="order.orderStatus"
                  @change="updateStatus(order.id, $event.target.value)"
                  class="px-2 py-1 rounded-sm text-[11px] font-bold border border-[var(--border)] bg-[var(--bg-alt)] focus:bg-[var(--surface)] focus:outline-none"
                  :class="getStatusSelectClass(order.orderStatus)"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </td>

              <!-- Action buttons -->
              <td class="py-3.5 px-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <router-link
                    :to="`/order-success/${order.id}`"
                    class="p-1.5 rounded-sm bg-[var(--bg-alt)] hover:bg-[var(--border)] text-[var(--text)] text-xs font-semibold border border-[var(--border)]"
                    title="View Invoice"
                  >
                    <i class="fa-solid fa-receipt"></i>
                  </router-link>
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
  name: 'AdminOrders',
  setup() {
    const store = useStore();
    const selectedStatus = ref('All');

    const orders = computed(() => store.getters['orders/allOrders']);

    const filteredOrders = computed(() => {
      if (selectedStatus.value === 'All') return orders.value;
      return orders.value.filter(o => o.orderStatus === selectedStatus.value);
    });

    onMounted(() => {
      store.dispatch('orders/fetchOrders');
    });

    const updateStatus = async (orderId, status) => {
      await store.dispatch('orders/updateOrderStatus', { orderId, orderStatus: status });
      SuccessToast('Status Updated', `Order ${orderId} updated to ${status}`);
    };

    const getStatusSelectClass = (status) => {
      switch (status) {
        case 'Delivered': return 'text-emerald-700 font-bold';
        case 'Shipped': return 'text-[var(--accent)] font-bold';
        case 'Processing': return 'text-purple-700 font-bold';
        case 'Cancelled': return 'text-rose-700 font-bold';
        default: return 'text-amber-700 font-bold';
      }
    };

    return {
      selectedStatus,
      orders,
      filteredOrders,
      updateStatus,
      getStatusSelectClass
    };
  }
};
</script>
